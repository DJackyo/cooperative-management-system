import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asociados } from '../../entities/entities/Asociados';
import { Prestamos } from '../../entities/entities/Prestamos';
import { PresPagos } from '../../entities/entities/PresPagos';
import { AsocAportesAsociados } from '../../entities/entities/AsocAportesAsociados';
import { AsocMetasAhorro } from '../../entities/entities/AsocMetasAhorro';
import { PresCuotas } from '../../entities/entities/PresCuotas';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Asociados)
    private asociadosRepository: Repository<Asociados>,
    @InjectRepository(Prestamos)
    private prestamosRepository: Repository<Prestamos>,
    @InjectRepository(PresPagos)
    private pagosRepository: Repository<PresPagos>,
    @InjectRepository(PresCuotas)
    private cuotasRepository: Repository<PresCuotas>,
    @InjectRepository(AsocAportesAsociados)
    private aportesRepository: Repository<AsocAportesAsociados>,
    @InjectRepository(AsocMetasAhorro)
    private metasAhorroRepository: Repository<AsocMetasAhorro>,

  ) {}

  async getDashboardStats() {
    try {
      const [totalUsers, creditCounts, totalCreditAmount, overdueCredits, usersByStatus, savingsData] = await Promise.all([
        this.asociadosRepository.count(),
        this.prestamosRepository
          .createQueryBuilder('prestamo')
          .select('prestamo.estado', 'status')
          .addSelect('COUNT(prestamo.id)', 'count')
          .groupBy('prestamo.estado')
          .getRawMany(),
        this.prestamosRepository
          .createQueryBuilder('prestamo')
          .select('SUM(prestamo.monto)', 'total')
          .where('prestamo.estado = :estado', { estado: 'APROBADO' })
          .getRawOne(),
        this.prestamosRepository
          .createQueryBuilder('prestamo')
          .where('prestamo.fechaVencimiento < :today', { today: new Date() })
          .andWhere('prestamo.estado = :estado', { estado: 'APROBADO' })
          .getCount(),
        this.asociadosRepository
          .createQueryBuilder('asociado')
          .innerJoin('asociado.idEstado', 'estado')
          .select('estado.estado', 'status')
          .addSelect('COUNT(asociado.id)', 'count')
          .groupBy('estado.estado')
          .getRawMany(),
        this.aportesRepository
          .createQueryBuilder('aporte')
          .select('EXTRACT(YEAR FROM aporte.fechaAporte)', 'year')
          .addSelect('EXTRACT(MONTH FROM aporte.fechaAporte)', 'month')
          .addSelect('SUM(aporte.monto)', 'total')
          .where('aporte.monto > 0')
          .groupBy('EXTRACT(YEAR FROM aporte.fechaAporte)')
          .addGroupBy('EXTRACT(MONTH FROM aporte.fechaAporte)')
          .orderBy('year', 'DESC')
          .addOrderBy('month', 'DESC')
          .limit(6)
          .getRawMany(),
      ]);

      const counts = new Map(
        creditCounts.map((row) => [String(row.status || '').toUpperCase(), Number(row.count) || 0]),
      );
      const approvedCredits = counts.get('APROBADO') || 0;
      const pendingCredits = ['SOLICITADO', 'EN_REVISION', 'EN REVISIÓN'].reduce(
        (total, status) => total + (counts.get(status) || 0),
        0,
      );
      const activeCredits = Math.max(approvedCredits - overdueCredits, 0);
      const chronologicalSavings = [...savingsData].reverse();

      return {
        totalUsers,
        activeCredits,
        pendingCredits,
        totalCreditAmount: Number(totalCreditAmount?.total) || 0,
        overdueCredits,
        savingsTransactions: chronologicalSavings.map((row) => Number(row.total) || 0),
        savingsLabels: chronologicalSavings.map((row) => `${row.year}-${String(row.month).padStart(2, '0')}`),
        pendingPaymentSupports: 0,
        deactivationRequests: [],
        usersByStatus: usersByStatus.map((row) => ({
          status: row.status,
          count: Number(row.count) || 0,
        })),
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      return {
        totalUsers: 0,
        activeCredits: 0,
        pendingCredits: 0,
        totalCreditAmount: 0,
        overdueCredits: 0,
        savingsTransactions: [],
        savingsLabels: [],
        pendingPaymentSupports: 0,
        deactivationRequests: [],
        usersByStatus: [],
      };
    }
  }

  async getRecentTransactions() {
    const transactions = [];
    try {
      
      // Obtener pagos recientes con JOIN manual
      const recentPayments = await this.pagosRepository
        .createQueryBuilder('pago')
        .leftJoin('pago.idCuota', 'cuota')
        .leftJoin('cuota.idPrestamo', 'prestamo')
        .leftJoin('prestamo.idAsociado', 'asociado')
        .select([
          'pago.id_pago as id',
          'pago.monto as monto',
          'pago.dia_de_pago as fecha',
          'asociado.nombre1 as nombre1',
          'asociado.nombre2 as nombre2',
          'asociado.apellido1 as apellido1',
          'asociado.apellido2 as apellido2'
        ])
        .where('pago.dia_de_pago IS NOT NULL')
        .orderBy('pago.dia_de_pago', 'DESC')
        .limit(5)
        .getRawMany();
      
      // Agregar pagos a las transacciones
      recentPayments.forEach(pago => {
        if (pago.fecha && pago.monto) {
          transactions.push({
            id: `payment_${pago.id}`,
            type: 'payment',
            amount: pago.monto,
            user: `${pago.nombre1 || ''} ${pago.nombre2 || ''} ${pago.apellido1 || ''} ${pago.apellido2 || ''}`.trim().replace(/\s+/g, ' '),
            timestamp: new Date(pago.fecha).toISOString(),
            description: `Pago de cuota por valor de $${pago.monto.toLocaleString('es-CO')}`,
          });
        }
      });
      
    } catch (error) {
      console.error('Error fetching recent payments:', error);
    }

    try {
      // Obtener créditos aprobados recientes
      const recentCredits = await this.prestamosRepository
        .createQueryBuilder('prestamo')
        .leftJoin('prestamo.idAsociado', 'asociado')
        .select([
          'prestamo.id as id',
          'prestamo.monto as monto',
          'COALESCE(prestamo.fecha_desembolso, prestamo.fecha_credito, prestamo.fecha_solicitud) as fecha',
          'asociado.nombre1 as nombre1',
          'asociado.nombre2 as nombre2',
          'asociado.apellido1 as apellido1',
          'asociado.apellido2 as apellido2'
        ])
        .where('prestamo.estado IN (:...estados)', { estados: ['APROBADO', 'ACTIVO', 'SOLICITADO'] })
        .andWhere('COALESCE(prestamo.fecha_desembolso, prestamo.fecha_credito, prestamo.fecha_solicitud) IS NOT NULL')
        .orderBy('fecha', 'DESC')
        .limit(5)
        .getRawMany();
      
      // Agregar créditos aprobados a las transacciones
      recentCredits.forEach(prestamo => {
        if (prestamo.fecha) {
          transactions.push({
            id: `credit_${prestamo.id}`,
            type: 'credit_approved',
            amount: prestamo.monto,
            user: `${prestamo.nombre1 || ''} ${prestamo.nombre2 || ''} ${prestamo.apellido1 || ''} ${prestamo.apellido2 || ''}`.trim().replace(/\s+/g, ' '),
            timestamp: new Date(prestamo.fecha).toISOString(),
            description: `Crédito aprobado por valor de $${prestamo.monto.toLocaleString('es-CO')}`,
          });
        }
      });
      
    } catch (error) {
      console.error('Error fetching recent credits:', error);
    }

    try {
      // Obtener aportes recientes (ahorros)
      const recentSavings = await this.aportesRepository.query(`
        SELECT
          aporte.id,
          aporte.monto,
          COALESCE(aporte.fecha_creacion, aporte.fecha_aporte) AS fecha,
          asociado.nombre1,
          asociado.nombre2,
          asociado.apellido1,
          asociado.apellido2
        FROM public.asoc_aportes_asociados aporte
        LEFT JOIN public.asociados asociado ON asociado.id = aporte.id_asociado
        WHERE aporte.monto > 0
          AND COALESCE(aporte.fecha_creacion, aporte.fecha_aporte) IS NOT NULL
        ORDER BY COALESCE(aporte.fecha_creacion, aporte.fecha_aporte) DESC
        LIMIT 5
      `);
      console.log('Recent savings:', recentSavings); 
      // Agregar ahorros a las transacciones
      recentSavings.forEach(aporte => {
        const amount = Number(aporte.monto) || 0;
        transactions.push({
          id: `savings_${aporte.id}`,
          type: 'savings',
          amount,
          user: `${aporte.nombre1 || ''} ${aporte.nombre2 || ''} ${aporte.apellido1 || ''} ${aporte.apellido2 || ''}`.trim().replace(/\s+/g, ' '),
          timestamp: new Date(aporte.fecha).toISOString(),
          description: `Ahorro agregado de $${amount.toLocaleString('es-CO')}`,
        });
      });
      
    } catch (error) {
      console.error('Error fetching recent savings:', error);
    }

    try {
      // Ordenar todas las transacciones por fecha (más recientes primero)
      transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Retornar solo las 10 más recientes
      return transactions.slice(0, 10);
      
    } catch (error) {
      console.error('Error sorting recent transactions:', error);
      return [];
    }
  }

  async getPendingPaymentSupports() {
    // Implementar lógica para soportes pendientes
    return { count: 0 };
  }

  async generateYearProjection(year: number) {
    try {
      console.log(`Generating projections for year ${year}`);
      
      // Verificar si ya existen metas para este año
      const existingMetas = await this.aportesRepository.query(
        'SELECT COUNT(*) as count FROM asoc_metas_ahorro WHERE año = $1',
        [year]
      );
      
      if (parseInt(existingMetas[0]?.count) > 0) {
        return {
          message: `Ya existen ${existingMetas[0].count} metas para el año ${year}`,
          created: 0
        };
      }
      
      // Generar metas basadas en el año anterior o promedio histórico
      const previousYear = year - 1;
      
      const insertQuery = `
        INSERT INTO asoc_metas_ahorro (asociado_id, meta_mensual, año)
        SELECT 
          asoc.id,
          COALESCE(
            -- Usar meta del año anterior si existe
            (SELECT meta_mensual FROM asoc_metas_ahorro 
             WHERE asociado_id = asoc.id AND año = $2),
            -- Si no, usar promedio histórico de aportes
            ROUND(
              (SELECT AVG(monto) FROM asoc_aportes_asociados 
               WHERE id_asociado = asoc.id AND monto > 0), 0
            ),
            -- Meta mínima por defecto
            50000
          ) as meta_mensual,
          $1 as año
        FROM asociados asoc
        WHERE asoc.id_estado = 1
      `;
      
      await this.aportesRepository.query(insertQuery, [year, previousYear]);
      
      // Contar cuántas se crearon
      const newCount = await this.aportesRepository.query(
        'SELECT COUNT(*) as count FROM asoc_metas_ahorro WHERE año = $1',
        [year]
      );
      
      return {
        message: `Proyecciones generadas exitosamente para el año ${year}`,
        created: parseInt(newCount[0]?.count) || 0
      };
      
    } catch (error) {
      console.error('Error generating year projection:', error);
      throw error;
    }
  }

  /**
   * Recalcula las metas de ahorro del año indicado:
   * - Actualiza las metas existentes con la meta del año anterior o el promedio histórico de aportes.
   * - Crea las metas faltantes para los asociados activos que no las tengan.
   */
  async recalculateYearProjection(year: number) {
    try {
      console.log(`Recalculating projections for year ${year}`);
      const previousYear = year - 1;

      // Cuántas metas existen actualmente para el año
      const existingMetas = await this.aportesRepository.query(
        'SELECT COUNT(*) as count FROM asoc_metas_ahorro WHERE año = $1',
        [year]
      );
      const updated = parseInt(existingMetas[0]?.count) || 0;

      // 1) Actualizar metas existentes con el mismo criterio de generación
      const updateQuery = `
        UPDATE asoc_metas_ahorro meta
        SET meta_mensual = COALESCE(
          -- Usar meta del año anterior si existe
          (SELECT m2.meta_mensual FROM asoc_metas_ahorro m2
           WHERE m2.asociado_id = meta.asociado_id AND m2.año = $2),
          -- Si no, usar promedio histórico de aportes
          ROUND(
            (SELECT AVG(a.monto) FROM asoc_aportes_asociados a
             WHERE a.id_asociado = meta.asociado_id AND a.monto > 0), 0
          ),
          -- Conservar la meta actual si no hay referencia
          meta.meta_mensual
        )
        WHERE meta.año = $1
      `;
      await this.aportesRepository.query(updateQuery, [year, previousYear]);

      // 2) Cuántos asociados activos no tienen meta para este año
      const missingBefore = await this.aportesRepository.query(
        `SELECT COUNT(*) as count
         FROM asociados asoc
         WHERE asoc.id_estado = 1
           AND NOT EXISTS (
             SELECT 1 FROM asoc_metas_ahorro m
             WHERE m.asociado_id = asoc.id AND m.año = $1
           )`,
        [year]
      );
      const missing = parseInt(missingBefore[0]?.count) || 0;

      // 3) Crear las metas faltantes
      if (missing > 0) {
        const insertQuery = `
          INSERT INTO asoc_metas_ahorro (asociado_id, meta_mensual, año)
          SELECT
            asoc.id,
            COALESCE(
              (SELECT meta_mensual FROM asoc_metas_ahorro
               WHERE asociado_id = asoc.id AND año = $2),
              ROUND(
                (SELECT AVG(monto) FROM asoc_aportes_asociados
                 WHERE id_asociado = asoc.id AND monto > 0), 0
              ),
              50000
            ) as meta_mensual,
            $1 as año
          FROM asociados asoc
          WHERE asoc.id_estado = 1
            AND NOT EXISTS (
              SELECT 1 FROM asoc_metas_ahorro m
              WHERE m.asociado_id = asoc.id AND m.año = $1
            )
        `;
        await this.aportesRepository.query(insertQuery, [year, previousYear]);
      }

      return {
        message:
          missing > 0
            ? `Metas recalculadas para el año ${year}. Actualizadas: ${updated}. Creadas: ${missing}`
            : `Metas recalculadas para el año ${year}. Actualizadas: ${updated}`,
        updated,
        created: missing,
      };
    } catch (error) {
      console.error('Error recalculating year projection:', error);
      throw error;
    }
  }


  /**
   * Genera o modifica las metas de ahorro para el presente año.
   *
   * - Si un asociado activo aún no tiene meta para el año actual, se crea una nueva.
   * - Si ya existe una meta para el año actual, se modifica recalculando el valor
   *   con el mismo criterio: meta del año anterior → promedio histórico de aportes → 50 000.
   *
   * Se utiliza una única sentencia INSERT … ON CONFLICT para garantizar atomicidad
   * e idempotencia tanto en la creación como en la actualización.
   */
  async generateCurrentYearMetas() {
    try {
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;
      console.log(`Generating/updating metas for current year ${currentYear}`);

      // Contar cuántas metas ya existen para el año actual (estas serán actualizadas)
      const existingMetas = await this.metasAhorroRepository.query(
        'SELECT COUNT(*) as count FROM asoc_metas_ahorro WHERE año = $1',
        [currentYear],
      );
      const updated = parseInt(existingMetas[0]?.count) || 0;

      // Upsert: para cada asociado activo, insertar o actualizar su meta mensual
      const upsertQuery = `
        INSERT INTO asoc_metas_ahorro (asociado_id, meta_mensual, año, activa)
        SELECT
          asoc.id,
          COALESCE(
            -- Usar meta del año anterior si existe
            (SELECT m.meta_mensual FROM asoc_metas_ahorro m
             WHERE m.asociado_id = asoc.id AND m.año = $2),
            -- Si no, usar promedio histórico de aportes
            ROUND(
              (SELECT AVG(a.monto) FROM asoc_aportes_asociados a
               WHERE a.id_asociado = asoc.id AND a.monto > 0), 0
            ),
            -- Meta mínima por defecto
            50000
          ) as meta_mensual,
          $1 as año,
          true as activa
        FROM asociados asoc
        WHERE asoc.id_estado = 1
        ON CONFLICT (asociado_id, año) DO UPDATE
          SET meta_mensual = EXCLUDED.meta_mensual,
              activa = true,
              fecha_actualizacion = CURRENT_TIMESTAMP
      `;
      await this.metasAhorroRepository.query(upsertQuery, [currentYear, previousYear]);

      // Contar cuántas metas hay después del upsert
      const totalCount = await this.metasAhorroRepository.query(
        'SELECT COUNT(*) as count FROM asoc_metas_ahorro WHERE año = $1',
        [currentYear],
      );
      const total = parseInt(totalCount[0]?.count) || 0;
      const created = Math.max(total - updated, 0);

      return {
        message: `Metas del presente año (${currentYear}) generadas/modificadas. Actualizadas: ${updated}. Creadas: ${created}`,
        created,
        updated,
      };
    } catch (error) {
      console.error('Error generating current year metas:', error);
      throw error;
    }
  }

  async getSavingsProjection() {
    try {
      const currentYear = new Date().getFullYear();
      console.log('Calculating savings projection for year:', currentYear);
      
      // Obtener el total de ahorros registrados en el año actual
      const registeredSavingsResult = await this.aportesRepository.query(`
        SELECT COALESCE(SUM(monto), 0) AS total
        FROM public.asoc_aportes_asociados
        WHERE monto > 0
          AND fecha_aporte IS NOT NULL
          AND EXTRACT(YEAR FROM fecha_aporte) = $1
      `, [currentYear]);
      const registeredSavings = registeredSavingsResult[0];
      
      console.log('Registered savings raw result:', registeredSavings);
      
      // Intentar obtener metas de ahorro usando consulta SQL directa
      let projected = 0;
      try {
        const savingsGoalsQuery = `
          SELECT COALESCE(SUM(meta_mensual * 12), 0) AS total_anual
          FROM public.asoc_metas_ahorro
          WHERE "año" = $1 AND activa = true
        `;
        const savingsGoalsResult = await this.metasAhorroRepository.query(savingsGoalsQuery, [currentYear]);
        console.log('Savings goals raw result:', savingsGoalsResult);
        
        projected = parseFloat(savingsGoalsResult[0]?.total_anual) || 0;
        console.log('Projected amount from metas:', projected);
      } catch (metasError) {
        console.log('Error querying asoc_metas_ahorro:', metasError instanceof Error ? metasError.message : metasError);
        projected = 0;
      }
      
      const registered = parseFloat(registeredSavings?.total) || 0;
      const percentage = projected > 0 ? (registered / projected) * 100 : 0;
      
      console.log('Final calculation:', { projected, registered, percentage });
      
      return {
        projected,
        registered,
        percentage
      };
    } catch (error) {
      console.error('Error calculating savings projection:', error);
      return {
        projected: 0,
        registered: 0,
        percentage: 0
      };
    }
  }
}
