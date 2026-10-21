import {
  BadRequestException,
  ConflictException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Test } from '@nestjs/testing';
import {
  AportesDepuracionService,
  GrupoDuplicado,
} from './aportes-depuracion.service';
import { DepurarAportesDto } from './dto/depurar-aportes.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('AportesDepuracionService', () => {
  let service: AportesDepuracionService;
  const query = jest.fn();
  const transaction = jest.fn();
  const registro = (id: number) => ({
    id,
    id_asociado: 28,
    fecha_aporte: '2026-04-01T00:00:00',
    monto: 50340,
    observaciones: null,
    comprobante: null,
    estado: true,
    tipo_aporte: 'MENSUAL',
    metodo_pago: 'EFECTIVO',
    fecha_creacion: null,
    fecha_modificacion: null,
    id_usuario_registro: null,
  });
  const grupo: GrupoDuplicado = {
    idAsociado: 28,
    periodo: '2026-04',
    nombres: 'Asociado prueba',
    identificacion: '123',
    version: 'a'.repeat(32),
    registros: [registro(2943), registro(2989)],
  };
  const solicitud = (): DepurarAportesDto => ({
    motivo: 'Duplicado verificado',
    grupos: [
      {
        idAsociado: 28,
        periodo: '2026-04',
        version: grupo.version,
        ids: [2989],
      },
    ],
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    transaction.mockImplementation(
      async (
        callback: (manager: Pick<EntityManager, 'query'>) => Promise<unknown>,
      ) => callback({ query }),
    );
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('to_regclass'))
        return [{ tabla: 'asoc_aportes_depuraciones' }];
      if (sql.includes('AS bloqueado')) return [{ bloqueado: false }];
      if (sql.includes('md5(')) return [grupo];
      if (sql.includes('WITH eliminados'))
        return [{ cantidad: 1, total: '50340', registros: [registro(2989)] }];
      return [];
    });
    const module = await Test.createTestingModule({
      providers: [
        AportesDepuracionService,
        { provide: DataSource, useValue: { manager: { query }, transaction } },
      ],
    }).compile();
    service = module.get(AportesDepuracionService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('lists duplicates with an optional associate filter', async () => {
    expect(await service.listar(28)).toEqual([grupo]);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('HAVING count(*) > 1'),
      [28, null],
    );
  });

  it('deletes only selected records and stores removed and retained snapshots with the actor', async () => {
    const result = await service.depurar(solicitud(), 13);
    expect(result).toEqual({
      auditoriaId: expect.any(String),
      cantidad: 1,
      montoEliminado: 50340,
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('WITH eliminados'),
      [[2989]],
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.asoc_aportes_depuraciones'),
      [
        result.auditoriaId,
        13,
        'Duplicado verificado',
        1,
        '50340',
        JSON.stringify([registro(2989)]),
        JSON.stringify([registro(2943)]),
      ],
    );
  });

  it.each([
    ['last monthly survivor', [2943, 2989]],
    ['record from another group', [123]],
  ])('rejects %s before deleting', async (_, ids) => {
    const dto = solicitud();
    dto.grupos[0].ids = ids;
    await expect(service.depurar(dto, 13)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(query.mock.calls.some(([sql]) => sql.includes('DELETE FROM'))).toBe(
      false,
    );
  });

  it('rejects stale snapshots', async () => {
    const dto = solicitud();
    dto.grupos[0].version = 'b'.repeat(32);
    await expect(service.depurar(dto, 13)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(query.mock.calls.some(([sql]) => sql.includes('DELETE FROM'))).toBe(
      false,
    );
  });

  it('rejects repeated groups and repeated IDs before a transaction', async () => {
    const dto = solicitud();
    dto.grupos.push({ ...dto.grupos[0] });
    await expect(service.depurar(dto, 13)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(transaction).not.toHaveBeenCalled();
  });

  it('requires the audit migration before any deletion', async () => {
    query.mockImplementation(async (sql: string) =>
      sql.includes('to_regclass') ? [{ tabla: null }] : [],
    );
    await expect(service.depurar(solicitud(), 13)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(query.mock.calls.some(([sql]) => sql.includes('DELETE FROM'))).toBe(
      false,
    );
  });

  it('rejects a failed audit insert instead of reporting success', async () => {
    const normal = query.getMockImplementation()!;
    query.mockImplementation(async (...args) => {
      if (String(args[0]).includes('INSERT INTO'))
        throw new Error('audit insert failed');
      return normal(...args);
    });
    await expect(service.depurar(solicitud(), 13)).rejects.toThrow(
      'audit insert failed',
    );
  });

  it('rejects an unexpected deletion count', async () => {
    const normal = query.getMockImplementation()!;
    query.mockImplementation(async (...args) =>
      String(args[0]).includes('WITH eliminados')
        ? [{ cantidad: 0, total: '0', registros: [] }]
        : normal(...args),
    );
    await expect(service.depurar(solicitud(), 13)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(query.mock.calls.some(([sql]) => sql.includes('INSERT INTO'))).toBe(
      false,
    );
  });

  it('validates input shape, periods, versions, distinct IDs and trimmed reasons', async () => {
    const dto = plainToInstance(DepurarAportesDto, solicitud());
    expect(await validate(dto)).toHaveLength(0);
    for (const change of [
      { motivo: '          ' },
      { grupos: [] },
      { grupos: [{ ...dto.grupos[0], periodo: '2026-13' }] },
      { grupos: [{ ...dto.grupos[0], version: '' }] },
      { grupos: [{ ...dto.grupos[0], ids: [2989, 2989] }] },
      { grupos: [{ ...dto.grupos[0], ids: [-1] }] },
    ]) {
      expect(
        (
          await validate(
            plainToInstance(DepurarAportesDto, { ...solicitud(), ...change }),
          )
        ).length,
      ).toBeGreaterThan(0);
    }
  });
});
