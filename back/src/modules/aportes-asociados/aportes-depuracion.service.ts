import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DataSource, EntityManager, QueryFailedError } from 'typeorm';
import { DepurarAportesDto } from './dto/depurar-aportes.dto';

interface RegistroDepuracion {
  id: number;
  id_asociado: number;
  fecha_aporte: string;
  monto: number;
  observaciones: string | null;
  tipo_aporte: string | null;
  estado: boolean | null;
  metodo_pago: string | null;
  comprobante: string | null;
  fecha_creacion: string | null;
  fecha_modificacion: string | null;
  id_usuario_registro: number | null;
}

export interface GrupoDuplicado {
  idAsociado: number;
  periodo: string;
  nombres: string;
  identificacion: string | null;
  version: string;
  registros: RegistroDepuracion[];
}

@Injectable()
export class AportesDepuracionService {
  private readonly logger = new Logger(AportesDepuracionService.name);

  constructor(private readonly dataSource: DataSource) {}

  private consultarGrupos(
    manager: EntityManager,
    idAsociado?: number,
    grupos?: DepurarAportesDto['grupos'],
  ): Promise<GrupoDuplicado[]> {
    return manager.query<GrupoDuplicado[]>(
      `SELECT a.id_asociado AS "idAsociado",
              to_char(a.fecha_aporte, 'YYYY-MM') AS periodo,
              concat_ws(' ', s.nombre1, s.nombre2, s.apellido1, s.apellido2) AS nombres,
              s.numero_de_identificacion::text AS identificacion,
              md5(jsonb_agg(to_jsonb(a) ORDER BY a.id)::text) AS version,
              jsonb_agg(to_jsonb(a) ORDER BY a.id) AS registros
       FROM public.asoc_aportes_asociados a
       LEFT JOIN public.asociados s ON s.id = a.id_asociado
       WHERE a.id_asociado IS NOT NULL
         AND ($1::integer IS NULL OR a.id_asociado = $1)
         AND ($2::jsonb IS NULL OR EXISTS (
           SELECT 1 FROM jsonb_to_recordset($2::jsonb)
             AS g("idAsociado" integer, periodo text)
           WHERE g."idAsociado" = a.id_asociado
             AND g.periodo = to_char(a.fecha_aporte, 'YYYY-MM')
         ))
       GROUP BY a.id_asociado, to_char(a.fecha_aporte, 'YYYY-MM'),
                s.nombre1, s.nombre2, s.apellido1, s.apellido2, s.numero_de_identificacion
       HAVING count(*) > 1
       ORDER BY periodo DESC, a.id_asociado`,
      [idAsociado ?? null, grupos ? JSON.stringify(grupos) : null],
    );
  }

  listar(idAsociado?: number): Promise<GrupoDuplicado[]> {
    return this.consultarGrupos(this.dataSource.manager, idAsociado);
  }

  async depurar(dto: DepurarAportesDto, usuarioId: number) {
    const ids = dto.grupos.flatMap((grupo) => grupo.ids);
    const claves = dto.grupos.map(
      (grupo) => `${grupo.idAsociado}:${grupo.periodo}`,
    );
    if (
      ids.length === 0 ||
      ids.length > 500 ||
      new Set(ids).size !== ids.length ||
      new Set(claves).size !== claves.length
    ) {
      throw new BadRequestException(
        'Seleccione entre 1 y 500 aportes sin repetir grupos ni IDs',
      );
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        await manager.query(`SET LOCAL lock_timeout = '5s'`);
        await manager.query(`SET LOCAL statement_timeout = '30s'`);
        // Incluye los endpoints antiguos: el bloqueo impide cambios entre validar y borrar.
        await manager.query(
          'LOCK TABLE public.asoc_aportes_asociados IN SHARE ROW EXCLUSIVE MODE',
        );
        const [auditoria] = await manager.query<{ tabla: string | null }[]>(
          `SELECT to_regclass('public.asoc_aportes_depuraciones')::text AS tabla`,
        );
        if (!auditoria.tabla) {
          throw new ServiceUnavailableException(
            'Falta instalar la migracion de auditoria de depuracion de ahorros',
          );
        }

        const [dependencias] = await manager.query<{ bloqueado: boolean }[]>(
          `SELECT EXISTS (
             SELECT 1 FROM pg_constraint WHERE contype = 'f'
               AND confrelid = 'public.asoc_aportes_asociados'::regclass
           ) OR EXISTS (
             SELECT 1 FROM pg_trigger
             WHERE tgrelid = 'public.asoc_aportes_asociados'::regclass
               AND NOT tgisinternal AND tgenabled <> 'D'
           ) OR EXISTS (
             SELECT 1 FROM pg_rewrite
             WHERE ev_class = 'public.asoc_aportes_asociados'::regclass
           ) AS bloqueado`,
        );
        if (dependencias.bloqueado) {
          throw new ConflictException(
            'Los aportes tienen dependencias o triggers; se requiere revisar la depuracion con soporte',
          );
        }

        const actuales = await this.consultarGrupos(
          manager,
          undefined,
          dto.grupos,
        );
        const seleccion = new Set(ids);
        for (const solicitado of dto.grupos) {
          const actual = actuales.find(
            (grupo) =>
              grupo.idAsociado === solicitado.idAsociado &&
              grupo.periodo === solicitado.periodo,
          );
          if (!actual || actual.version !== solicitado.version) {
            throw new ConflictException(
              `Cambiaron los aportes del asociado ${solicitado.idAsociado} en ${solicitado.periodo}. Actualice la lista y seleccione nuevamente.`,
            );
          }
          if (
            solicitado.ids.some(
              (id) => !actual.registros.some((registro) => registro.id === id),
            )
          ) {
            throw new BadRequestException(
              'Un aporte seleccionado no pertenece al grupo indicado',
            );
          }
          if (
            actual.registros.every((registro) => seleccion.has(registro.id))
          ) {
            throw new BadRequestException(
              `Debe conservar al menos un aporte del asociado ${actual.idAsociado} en ${actual.periodo}`,
            );
          }
        }

        const registros = actuales.flatMap((grupo) => grupo.registros);
        const esperados = registros.filter((registro) =>
          seleccion.has(registro.id),
        );
        const conservados = registros.filter(
          (registro) => !seleccion.has(registro.id),
        );
        const totalEsperado = esperados.reduce(
          (total, registro) => total + registro.monto,
          0,
        );
        const [eliminados] = await manager.query<
          {
            cantidad: number;
            total: string;
            registros: RegistroDepuracion[];
          }[]
        >(
          `WITH eliminados AS (
             DELETE FROM public.asoc_aportes_asociados
             WHERE id = ANY($1::integer[]) RETURNING *
           )
           SELECT count(*)::integer AS cantidad, COALESCE(sum(monto), 0)::text AS total,
                  COALESCE(jsonb_agg(to_jsonb(e) ORDER BY id), '[]'::jsonb) AS registros
           FROM eliminados e`,
          [ids],
        );
        if (
          eliminados.cantidad !== ids.length ||
          Number(eliminados.total) !== totalEsperado
        ) {
          throw new ConflictException(
            'El resultado del borrado no coincide con la seleccion; no se guardaron cambios',
          );
        }

        const auditoriaId = randomUUID();
        await manager.query(
          `INSERT INTO public.asoc_aportes_depuraciones
             (id, id_usuario, motivo, cantidad, monto_eliminado, eliminados, conservados)
           VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)`,
          [
            auditoriaId,
            usuarioId,
            dto.motivo,
            eliminados.cantidad,
            eliminados.total,
            JSON.stringify(eliminados.registros),
            JSON.stringify(conservados),
          ],
        );
        return {
          auditoriaId,
          cantidad: eliminados.cantidad,
          montoEliminado: totalEsperado,
        };
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        'code' in error.driverError &&
        error.driverError.code === '55P03'
      ) {
        throw new ConflictException(
          'Hay otra operacion sobre los ahorros. Actualice e intente nuevamente.',
        );
      }
      this.logger.error(
        'No se pudo completar la depuracion de ahorros',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
