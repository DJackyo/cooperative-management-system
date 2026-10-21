import { Injectable, BadRequestException } from '@nestjs/common';
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

  /** Etiquetas cortas de los meses usadas por las series de ahorro. */
  private static readonly MONTH_LABELS = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];

  /**
   * Normaliza el parámetro `year` recibido por query string.
   * Devuelve `null` cuando se solicita el histórico completo (sin filtro de año).
   */
  private static parseYear(year?: string | number | null): number | null {
    if (year === null || year === undefined || `${year}`.trim() === '') {
      return null;
    }
    const parsed = typeof year === 'number' ? year : parseInt(String(year), 10);
    if (Number.isNaN(parsed) || parsed < 2000 || parsed > 2100) {
      return null;
    }
    return parsed;
  }

  /** Etiqueta legible del período consultado. */
  private static buildPeriod(year: number | null) {
    return {
      year,
      isAllYears: year === null,
      label: year === null ? 'Histórico completo' : `Año ${year}`,
    };
  }

  /**
   * Construye la serie y el resumen de ahorros del período.
   * - Con un año seleccionado: 12 valores (Ene..Dic) del año.
   * - Sin año (histórico completo): un valor por cada año con actividad.
   */
  private static buildSavingsSeries(year: number | null, rows: any[]) {
    const safeRows = Array.isArray(rows) ? rows : [];

    if (year !== null) {
      const monthLabels = DashboardService.MONTH_LABELS;
      const totals = new Array(12).fill(0);
      const contributions = new Array(12).fill(0);
      const withdrawals = new Array(12).fill(0);
      let aportesCount = 0;

      safeRows.forEach((row) => {
        const monthIndex = Number(row.month) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          totals[monthIndex] = Number(row.total) || 0;
          contributions[monthIndex] = Number(row.contributions) || 0;
          withdrawals[monthIndex] = Math.abs(Number(row.withdrawals) || 0);
        }
        aportesCount += Number(row.count) || 0;
      });

      const totalSaved = totals.reduce((acc, value) => acc + value, 0);
      const periodsWithActivity = totals.filter(
        (_, index) => contributions[index] > 0 || withdrawals[index] > 0,
      ).length;

      let lastIndex = -1;
      let bestIndex = -1;
      totals.forEach((value, index) => {
        if (contributions[index] > 0 || withdrawals[index] > 0) lastIndex = index;
        if (bestIndex === -1 || value > totals[bestIndex]) bestIndex = index;
      });

      return {
        labels: [...monthLabels],
        values: totals,
        contributions,
        withdrawals,
        groupBy: 'month' as const,
        summary: {
          totalSaved,
          aportesCount,
          periodsWithActivity,
          totalPeriods: 12,
          avgPerActivePeriod:
            periodsWithActivity > 0 ? Math.round(totalSaved / periodsWithActivity) : 0,
          lastPeriodLabel: lastIndex >= 0 ? monthLabels[lastIndex] : null,
          lastPeriodTotal: lastIndex >= 0 ? totals[lastIndex] : 0,
          bestPeriodLabel: bestIndex >= 0 && totals[bestIndex] > 0 ? monthLabels[bestIndex] : null,
          bestPeriodTotal: bestIndex >= 0 ? totals[bestIndex] : 0,
        },
      };
    }

    // Histórico completo: se agrupa por año
    const perYear = new Map<
      number,
      { total: number; count: number; contributions: number; withdrawals: number }
    >();
    safeRows.forEach((row) => {
      const rowYear = Number(row.year);
      if (!rowYear) return;
      const current = perYear.get(rowYear) || {
        total: 0,
        count: 0,
        contributions: 0,
        withdrawals: 0,
      };
      current.total += Number(row.total) || 0;
      current.count += Number(row.count) || 0;
      current.contributions += Number(row.contributions) || 0;
      current.withdrawals += Math.abs(Number(row.withdrawals) || 0);
      perYear.set(rowYear, current);
    });

    const orderedYears = [...perYear.keys()].sort((a, b) => a - b);
    const values = orderedYears.map((rowYear) => perYear.get(rowYear)?.total || 0);
    const contributions = orderedYears.map(
      (rowYear) => perYear.get(rowYear)?.contributions || 0,
    );
    const withdrawals = orderedYears.map(
      (rowYear) => perYear.get(rowYear)?.withdrawals || 0,
    );
    const labels = orderedYears.map((rowYear) => String(rowYear));
    const totalSaved = values.reduce((acc, value) => acc + value, 0);
    const aportesCount = orderedYears.reduce(
      (acc, rowYear) => acc + (perYear.get(rowYear)?.count || 0),
      0,
    );
    const activeYears = orderedYears.filter((rowYear) => {
      const yearData = perYear.get(rowYear);
      return (yearData?.contributions || 0) > 0 || (yearData?.withdrawals || 0) > 0;
    });
    const periodsWithActivity = activeYears.length;

    let bestIndex = -1;
    values.forEach((value, index) => {
      if (bestIndex === -1 || value > values[bestIndex]) bestIndex = index;
    });
    const lastActiveYear = activeYears[activeYears.length - 1];
    const lastIndex =
      lastActiveYear === undefined ? -1 : orderedYears.indexOf(lastActiveYear);

    return {
      labels,
      values,
      contributions,
      withdrawals,
      groupBy: 'year' as const,
      summary: {
        totalSaved,
        aportesCount,
        periodsWithActivity,
        totalPeriods: periodsWithActivity,
        avgPerActivePeriod:
          periodsWithActivity > 0 ? Math.round(totalSaved / periodsWithActivity) : 0,
        lastPeriodLabel: lastIndex >= 0 ? labels[lastIndex] : null,
        lastPeriodTotal: lastIndex >= 0 ? values[lastIndex] : 0,
        bestPeriodLabel: bestIndex >= 0 ? labels[bestIndex] : null,
        bestPeriodTotal: bestIndex >= 0 ? values[bestIndex] : 0,
      },
    };
  }

  /** Años con actividad (aportes, créditos o pagos) más el año en curso. */
  async getAvailableYears(): Promise<number[]> {
    const currentYear = new Date().getFullYear();
    try {
      const rows = await this.aportesRepository.query(`
        SELECT DISTINCT EXTRACT(YEAR FROM fechas.fecha)::int AS year
        FROM (
          SELECT COALESCE(fecha_aporte, fecha_creacion) AS fecha
          FROM public.asoc_aportes_asociados
          WHERE monto > 0
          UNION ALL
          SELECT COALESCE(fecha_credito, fecha_desembolso, fecha_solicitud) AS fecha
          FROM public.prestamos
          UNION ALL
          SELECT COALESCE(dia_de_pago, fecha_vencimiento) AS fecha
          FROM public.pres_pagos
        ) AS fechas
        WHERE fechas.fecha IS NOT NULL
        ORDER BY year DESC
      `);

      const years = new Set<number>([currentYear]);
      (rows || []).forEach((row: { year: number | string }) => {
        const parsed = Number(row.year);
        if (!Number.isNaN(parsed) && parsed > 1900) {
          years.add(parsed);
        }
      });

      return [...years].sort((a, b) => b - a);
    } catch (error) {
      console.error('Error fetching available years:', error);
      return [currentYear];
    }
  }

  async getDashboardStats(yearParam?: string | number | null) {
    const year = DashboardService.parseYear(yearParam);

    try {
      const [
        totalUsers,
        creditCountsRows,
        totalCreditAmountRows,
        overdueCreditsRows,
        usersByStatus,
        savingsRows,
        loanCollectionRows,
        creditsInPeriodRows,
        availableYears,
      ] = await Promise.all([
        // Total de asociados (dato global, no depende del período)
        this.asociadosRepository.count(),

        // Créditos agrupados por estado dentro del período
        this.prestamosRepository.query(
          `SELECT UPPER(COALESCE(estado, '')) AS status, COUNT(*)::int AS count
             FROM public.prestamos
            WHERE ($1::int IS NULL
                   OR EXTRACT(YEAR FROM COALESCE(fecha_credito, fecha_desembolso, fecha_solicitud)) = $1)
            GROUP BY 1`,
          [year],
        ),

        // Capital colocado: monto de los créditos aprobados/activos del período
        this.prestamosRepository.query(
          `SELECT COALESCE(SUM(monto), 0) AS total
             FROM public.prestamos
            WHERE UPPER(COALESCE(estado, '')) IN ('APROBADO', 'ACTIVO')
              AND ($1::int IS NULL
                   OR EXTRACT(YEAR FROM COALESCE(fecha_credito, fecha_desembolso, fecha_solicitud)) = $1)`,
          [year],
        ),

        // Créditos en mora: con cuotas pendientes ya vencidas dentro del período
        this.prestamosRepository.query(
          `SELECT COUNT(DISTINCT prestamo.id)::int AS count
             FROM public.prestamos prestamo
             INNER JOIN public.pres_cuotas cuota ON cuota.id_prestamo = prestamo.id
            WHERE UPPER(COALESCE(prestamo.estado, '')) IN ('APROBADO', 'ACTIVO', 'VENCIDO')
              AND cuota.estado = 'PENDIENTE'
              AND cuota.fecha_vencimiento < NOW()
              AND ($1::int IS NULL
                   OR EXTRACT(YEAR FROM COALESCE(prestamo.fecha_credito, prestamo.fecha_desembolso, prestamo.fecha_solicitud)) = $1)`,
          [year],
        ),

        // Asociados por estado (dato global)
        this.asociadosRepository
          .createQueryBuilder('asociado')
          .innerJoin('asociado.idEstado', 'estado')
          .select('estado.estado', 'status')
          .addSelect('COUNT(asociado.id)', 'count')
          .groupBy('estado.estado')
          .getRawMany(),

        // Aportes (ahorros) del período, agrupados por año y mes
        this.aportesRepository.query(
          `SELECT EXTRACT(YEAR FROM COALESCE(fecha_aporte, fecha_creacion))::int AS year,
                  EXTRACT(MONTH FROM COALESCE(fecha_aporte, fecha_creacion))::int AS month,
                  COALESCE(SUM(monto), 0) AS total,
          COALESCE(SUM(monto) FILTER (WHERE monto > 0), 0) AS contributions,
          COALESCE(SUM(monto) FILTER (WHERE monto < 0), 0) AS withdrawals,
          COUNT(*) FILTER (WHERE monto > 0)::int AS count
             FROM public.asoc_aportes_asociados
            WHERE ($1::int IS NULL
                   OR EXTRACT(YEAR FROM COALESCE(fecha_aporte, fecha_creacion)) = $1)
            GROUP BY 1, 2
            ORDER BY 1 ASC, 2 ASC`,
          [year],
        ),

        // Recaudo de créditos (pagos de cuotas) del período
        this.pagosRepository.query(
          `SELECT COALESCE(SUM(COALESCE(total_pagado, monto, 0)), 0) AS "totalCollected",
                  COALESCE(SUM(COALESCE(abono_capital, 0) + COALESCE(abono_extra, 0)), 0) AS "totalCapital",
                  COALESCE(SUM(COALESCE(intereses, 0)), 0) AS "totalInterest",
                  COALESCE(SUM(COALESCE(mora, 0)), 0) AS "totalMora",
                  COALESCE(SUM(COALESCE(proteccion_cartera, 0)), 0) AS "totalProteccion",
                  COUNT(id_pago)::int AS "totalPaymentsCount"
             FROM public.pres_pagos
            WHERE ($1::int IS NULL
                   OR EXTRACT(YEAR FROM COALESCE(dia_de_pago, fecha_vencimiento)) = $1)`,
          [year],
        ),

        // Créditos registrados (cualquier estado) en el período
        this.prestamosRepository.query(
          `SELECT COUNT(*)::int AS count, COALESCE(SUM(monto), 0) AS amount
             FROM public.prestamos
            WHERE ($1::int IS NULL
                   OR EXTRACT(YEAR FROM COALESCE(fecha_credito, fecha_desembolso, fecha_solicitud)) = $1)`,
          [year],
        ),

        // Años con información para el selector de período del dashboard
        this.getAvailableYears(),
      ]);

      const counts = new Map<string, number>(
        (creditCountsRows || []).map((row: { status: string; count: number }) => [
          String(row.status || '').toUpperCase(),
          Number(row.count) || 0,
        ]),
      );
      const approvedCredits = (counts.get('APROBADO') || 0) + (counts.get('ACTIVO') || 0);
      const completedCredits = (counts.get('FINALIZADO') || 0) + (counts.get('CANCELADO') || 0);
      const pendingCredits = ['SOLICITADO', 'EN_REVISION', 'EN REVISIÓN'].reduce(
        (total, status) => total + (counts.get(status) || 0),
        0,
      );
      const overdueCreditsCount = Number(overdueCreditsRows?.[0]?.count) || 0;
      const overdueCredits = Math.min(overdueCreditsCount, approvedCredits);
      const activeCredits = Math.max(approvedCredits - overdueCredits, 0);

      // Ahorros: serie por mes (año seleccionado) o por año (histórico completo)
      const savings = DashboardService.buildSavingsSeries(year, savingsRows);

      const loanCollectionRow = loanCollectionRows?.[0] || {};
      const totalCollected = Number(loanCollectionRow.totalCollected) || 0;
      const totalPaymentsCount = Number(loanCollectionRow.totalPaymentsCount) || 0;

      const creditsInPeriodRow = creditsInPeriodRows?.[0] || {};

      return {
        period: DashboardService.buildPeriod(year),
        availableYears,
        // --- Sección de créditos ---
        totalUsers,
        approvedCredits,
        activeCredits,
        completedCredits,
        pendingCredits,
        totalCreditAmount: Number(totalCreditAmountRows?.[0]?.total) || 0,
        overdueCredits,
        creditCountsByStatus: [...counts.entries()].map(([status, count]) => ({
          status,
          count,
        })),
        creditsInPeriod: {
          count: Number(creditsInPeriodRow.count) || 0,
          amount: Number(creditsInPeriodRow.amount) || 0,
        },
        loanCollection: {
          totalCollected,
          totalCapital: Number(loanCollectionRow.totalCapital) || 0,
          totalInterest: Number(loanCollectionRow.totalInterest) || 0,
          totalMora: Number(loanCollectionRow.totalMora) || 0,
          totalProteccion: Number(loanCollectionRow.totalProteccion) || 0,
          totalPaymentsCount,
          avgPayment:
            totalPaymentsCount > 0 ? Math.round(totalCollected / totalPaymentsCount) : 0,
        },
        // --- Sección de ahorros ---
        savingsTransactions: savings.values,
        savingsLabels: savings.labels,
        savingsContributions: savings.contributions,
        savingsWithdrawals: savings.withdrawals,
        savingsGroupBy: savings.groupBy,
        savingsSummary: savings.summary,
        // --- Asociados y pendientes ---
        usersByStatus: (usersByStatus || []).map((row: { status: string; count: number }) => ({
          status: row.status,
          count: Number(row.count) || 0,
        })),
        pendingPaymentSupports: 0,
        deactivationRequests: [],
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      return {
        period: DashboardService.buildPeriod(year),
        availableYears: [],
        totalUsers: 0,
        approvedCredits: 0,
        activeCredits: 0,
        completedCredits: 0,
        pendingCredits: 0,
        totalCreditAmount: 0,
        overdueCredits: 0,
        creditCountsByStatus: [],
        creditsInPeriod: { count: 0, amount: 0 },
        loanCollection: {
          totalCollected: 0,
          totalCapital: 0,
          totalInterest: 0,
          totalMora: 0,
          totalProteccion: 0,
          totalPaymentsCount: 0,
          avgPayment: 0,
        },
        savingsTransactions: [],
        savingsLabels: [],
        savingsGroupBy: year === null ? 'year' : 'month',
        savingsSummary: {
          totalSaved: 0,
          aportesCount: 0,
          periodsWithActivity: 0,
          totalPeriods: 0,
          avgPerActivePeriod: 0,
          lastPeriodLabel: null,
          lastPeriodTotal: 0,
          bestPeriodLabel: null,
          bestPeriodTotal: 0,
        },
        usersByStatus: [],
        pendingPaymentSupports: 0,
        deactivationRequests: [],
      };
    }
  }

  async getRecentTransactions(yearParam?: string | number | null) {
    const year = DashboardService.parseYear(yearParam);
    const transactions = [];
    try {
      
      // Obtener pagos recientes con JOIN manual
      const recentPayments = await this.pagosRepository.query(
        `SELECT pago.id_pago AS id,
                pago.monto AS monto,
                pago.dia_de_pago AS fecha,
                asociado.nombre1 AS nombre1,
                asociado.nombre2 AS nombre2,
                asociado.apellido1 AS apellido1,
                asociado.apellido2 AS apellido2
           FROM public.pres_pagos pago
           LEFT JOIN public.pres_cuotas cuota ON cuota.id = pago.id_cuota
           LEFT JOIN public.prestamos prestamo ON prestamo.id = cuota.id_prestamo
           LEFT JOIN public.asociados asociado ON asociado.id = prestamo.id_asociado
          WHERE pago.dia_de_pago IS NOT NULL
            AND ($1::int IS NULL OR EXTRACT(YEAR FROM pago.dia_de_pago) = $1)
          ORDER BY pago.dia_de_pago DESC
          LIMIT 5`,
        [year],
      );
      
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
      const recentCredits = await this.prestamosRepository.query(
        `SELECT prestamo.id AS id,
                prestamo.monto AS monto,
                COALESCE(prestamo.fecha_desembolso, prestamo.fecha_credito, prestamo.fecha_solicitud) AS fecha,
                asociado.nombre1 AS nombre1,
                asociado.nombre2 AS nombre2,
                asociado.apellido1 AS apellido1,
                asociado.apellido2 AS apellido2
           FROM public.prestamos prestamo
           LEFT JOIN public.asociados asociado ON asociado.id = prestamo.id_asociado
          WHERE UPPER(COALESCE(prestamo.estado, '')) IN ('APROBADO', 'ACTIVO', 'SOLICITADO')
            AND COALESCE(prestamo.fecha_desembolso, prestamo.fecha_credito, prestamo.fecha_solicitud) IS NOT NULL
            AND ($1::int IS NULL
                 OR EXTRACT(YEAR FROM COALESCE(prestamo.fecha_desembolso, prestamo.fecha_credito, prestamo.fecha_solicitud)) = $1)
          ORDER BY fecha DESC
          LIMIT 5`,
        [year],
      );
      
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
          AND ($1::int IS NULL
               OR EXTRACT(YEAR FROM COALESCE(aporte.fecha_creacion, aporte.fecha_aporte)) = $1)
        ORDER BY COALESCE(aporte.fecha_creacion, aporte.fecha_aporte) DESC
        LIMIT 5
      `, [year]);
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
   * Genera o modifica las metas de ahorro de un año concreto.
   * `year` opcional: sin él se usa el año en curso.
   *
   * - Si un asociado activo aún no tiene meta para el año, se crea una nueva.
   * - Si ya existe una meta para el año, se modifica recalculando el valor
   *   con el mismo criterio: meta del año anterior → promedio histórico de aportes → 50 000.
   *
   * Se utiliza una única sentencia INSERT … ON CONFLICT para garantizar atomicidad
   * e idempotencia tanto en la creación como en la actualización.
   */
  async generateCurrentYearMetas(yearParam?: string | number | null) {
    try {
      // Si se envía un año explícito (p. ej. el seleccionado en el dashboard),
      // se respeta; solo sin año se usa el año en curso. Un año no interpretable
      // se rechaza para no generar silenciosamente las metas de otro año.
      const hasExplicitYear =
        yearParam !== null && yearParam !== undefined && `${yearParam}`.trim() !== '';
      const parsedYear = DashboardService.parseYear(yearParam);
      if (hasExplicitYear && parsedYear === null) {
        throw new BadRequestException(
          `Año inválido: "${yearParam}". Debe ser un número entre 2000 y 2100.`,
        );
      }

      const targetYear = parsedYear ?? new Date().getFullYear();
      const previousYear = targetYear - 1;
      console.log(`Generating/updating metas for year ${targetYear}`);

      // Contar cuántas metas ya existen para el año (estas serán actualizadas)
      const existingMetas = await this.metasAhorroRepository.query(
        'SELECT COUNT(*) as count FROM asoc_metas_ahorro WHERE año = $1',
        [targetYear],
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
      await this.metasAhorroRepository.query(upsertQuery, [targetYear, previousYear]);

      // Contar cuántas metas hay después del upsert
      const totalCount = await this.metasAhorroRepository.query(
        'SELECT COUNT(*) as count FROM asoc_metas_ahorro WHERE año = $1',
        [targetYear],
      );
      const total = parseInt(totalCount[0]?.count) || 0;
      const created = Math.max(total - updated, 0);

      return {
        message: `Metas del año ${targetYear} generadas/modificadas. Actualizadas: ${updated}. Creadas: ${created}`,
        created,
        updated,
      };
    } catch (error) {
      console.error('Error generating year metas:', error);
      throw error;
    }
  }

  async getSavingsProjection(yearParam?: string | number | null) {
    try {
      // La proyección siempre requiere un año concreto (por defecto, el año en curso)
      const year = DashboardService.parseYear(yearParam) ?? new Date().getFullYear();
      console.log('Calculating savings projection for year:', year);
      
      // Obtener el total de ahorros registrados en el año solicitado
      const registeredSavingsResult = await this.aportesRepository.query(`
        SELECT COALESCE(SUM(monto), 0) AS total
        FROM public.asoc_aportes_asociados
        WHERE monto > 0
          AND COALESCE(fecha_aporte, fecha_creacion) IS NOT NULL
          AND EXTRACT(YEAR FROM COALESCE(fecha_aporte, fecha_creacion)) = $1
      `, [year]);
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
        const savingsGoalsResult = await this.metasAhorroRepository.query(savingsGoalsQuery, [year]);
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
        year,
        projected,
        registered,
        percentage
      };
    } catch (error) {
      console.error('Error calculating savings projection:', error);
      return {
        year: DashboardService.parseYear(yearParam) ?? new Date().getFullYear(),
        projected: 0,
        registered: 0,
        percentage: 0
      };
    }
  }
}
