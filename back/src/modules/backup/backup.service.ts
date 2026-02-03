import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import archiver from 'archiver';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor(private readonly config: ConfigService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async dailyBackup() {
    try {
      this.logger.log('Iniciando backup diario (solo BD)');
      await this.createFullBackup(false);
      this.logger.log('Backup diario completado');
    } catch (err) {
      this.logger.error('Error en backup diario', err as any);
    }
  }

  @Cron('0 3 * * 0') // Domingos 3:00 AM
  async weeklyBackup() {
    try {
      this.logger.log('Iniciando backup semanal (BD + archivos)');
      await this.createFullBackup(true);
      this.logger.log('Backup semanal completado');
    } catch (err) {
      this.logger.error('Error en backup semanal', err as any);
    }
  }

  @Cron('0 4 1 * *') // Cada día 1 del mes a las 4:00 AM
  async monthlyCleanup() {
    try {
      const days = Number(process.env.BACKUP_RETENTION_DAYS ?? 30);
      this.logger.log(`Limpieza mensual de backups (> ${days} días)`);
      await this.cleanupOldBackups(days);
    } catch (err) {
      this.logger.error('Error en limpieza de backups', err as any);
    }
  }

  async manualBackup(includeFiles = false): Promise<string> {
    try {
      this.logger.log(`Backup manual solicitado. Archivos: ${includeFiles}`);
      return await this.createFullBackup(includeFiles);
    } catch (err) {
      this.logger.error('Error en backup manual', err as any);
      throw new InternalServerErrorException('Error creando backup');
    }
  }

  private async ensureDirs() {
    await fs.mkdir(this.backupDir, { recursive: true });
  }

  private buildTimestampName(prefix: string) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}-${ts}`;
  }

  private parseDbConfig() {
    const url = process.env.DATABASE_URL || this.config.get<string>('DATABASE_URL');
    if (url) {
      const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      if (!match) throw new Error('DATABASE_URL inválido');
      const [, user, password, host, port, database] = match;
      return { user, password, host, port, database };
    }

    const host = this.config.get<string>('DB_HOST') || process.env.DB_HOST;
    const port = String(this.config.get<number>('DB_PORT') ?? process.env.DB_PORT ?? '5432');
    const user = this.config.get<string>('DB_USERNAME') || process.env.DB_USERNAME;
    const password = this.config.get<string>('DB_PASSWORD') || process.env.DB_PASSWORD;
    const database = this.config.get<string>('DB_DATABASE') || process.env.DB_DATABASE;

    if (!host || !user || !password || !database) {
      throw new Error('Variables de BD no definidas (DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_DATABASE)');
    }
    return { user, password, host, port, database };
  }

  private async backupDatabase(outputFile: string) {
    const { user, password, host, port, database } = this.parseDbConfig();
    const pgDumpPath = this.config.get<string>('PG_DUMP_PATH') || process.env.PG_DUMP_PATH;
    const pgDump = pgDumpPath && fsSync.existsSync(pgDumpPath) ? `"${pgDumpPath}"` : 'pg_dump';
    const cmd = `${pgDump} -h ${host} -p ${port} -U ${user} -F c -b -v -f "${outputFile}" ${database}`;
    await execAsync(cmd, { env: { ...process.env, PGPASSWORD: password } });
  }

  private async zipDirectory(sourceDir: string, outputFile: string, rootName?: string) {
    await new Promise<void>((resolve, reject) => {
      const output = fsSync.createWriteStream(outputFile);
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('close', () => resolve());
      archive.on('error', reject);
      archive.pipe(output);
      archive.directory(sourceDir, rootName ?? false);
      archive.finalize();
    });
  }

  private async compressFiles(files: { path: string; name: string }[], outputFile: string) {
    await new Promise<void>((resolve, reject) => {
      const output = fsSync.createWriteStream(outputFile);
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('close', () => resolve());
      archive.on('error', reject);
      archive.pipe(output);
      for (const f of files) {
        archive.file(f.path, { name: f.name });
      }
      archive.finalize();
    });
  }

  async createFullBackup(includeFiles: boolean): Promise<string> {
    await this.ensureDirs();
    const base = this.buildTimestampName('backup');
    const dbDump = path.join(this.backupDir, `${base}-db.dump`);

    await this.backupDatabase(dbDump);

    let uploadsZip: string | undefined = undefined;
    if (includeFiles && fsSync.existsSync(this.uploadsDir)) {
      uploadsZip = path.join(this.backupDir, `${base}-uploads.zip`);
      await this.zipDirectory(this.uploadsDir, uploadsZip, 'uploads');
    }

    const finalZip = path.join(this.backupDir, `${base}.zip`);
    const files = [{ path: dbDump, name: 'database.dump' }];
    if (uploadsZip) files.push({ path: uploadsZip, name: 'uploads.zip' });
    await this.compressFiles(files, finalZip);

    // limpiar temporales
    try {
      await fs.unlink(dbDump);
      if (uploadsZip) await fs.unlink(uploadsZip);
    } catch {}

    return finalZip;
  }

  async listBackups() {
    await this.ensureDirs();
    const files = await fs.readdir(this.backupDir);
    const zips = files.filter((f) => f.endsWith('.zip'));
    const items = await Promise.all(
      zips.map(async (name) => {
        const full = path.join(this.backupDir, name);
        const st = await fs.stat(full);
        return { name, size: st.size, date: st.mtime };
      }),
    );
    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items.map((i) => ({
      name: i.name,
      sizeMB: Number((i.size / 1024 / 1024).toFixed(2)),
      date: i.date,
    }));
  }

  async getBackupPath(filename: string) {
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new InternalServerErrorException('Nombre de archivo inválido');
    }
    const full = path.join(this.backupDir, filename);
    const exists = fsSync.existsSync(full);
    if (!exists) throw new InternalServerErrorException('Archivo no encontrado');
    return full;
  }

  private async cleanupOldBackups(daysToKeep: number) {
    await this.ensureDirs();
    const files = await fs.readdir(this.backupDir);
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000;
    for (const file of files) {
      if (!file.endsWith('.zip')) continue;
      const full = path.join(this.backupDir, file);
      try {
        const st = await fs.stat(full);
        if (now - st.mtimeMs > maxAge) {
          await fs.unlink(full);
          this.logger.log(`Eliminado backup antiguo: ${file}`);
        }
      } catch {}
    }
  }
}
