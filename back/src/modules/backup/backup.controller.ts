import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fsSync from 'fs';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('backup')
@UseGuards(JwtAuthGuard)
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('manual')
  async manual(@Body('includeFiles') includeFiles = false) {
    const fullPath = await this.backupService.manualBackup(!!includeFiles);
    return { success: true, file: path.basename(fullPath) };
  }

  @Get('list')
  async list() {
    return this.backupService.listBackups();
  }

  @Get('download/:filename')
  async download(@Param('filename') filename: string, @Res() res: Response) {
    const full = await this.backupService.getBackupPath(filename);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(full)}"`);
    const stream = fsSync.createReadStream(full);
    stream.pipe(res);
  }
}
