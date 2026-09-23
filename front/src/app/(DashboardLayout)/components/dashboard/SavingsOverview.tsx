import React from "react";
import { Grid } from "@mui/material";
import {
  IconCoins,
  IconTrendingUp,
  IconCalendarMonth,
  IconTrophy,
} from "@tabler/icons-react";
import KpiCard from "./KpiCard";
import { DashboardData } from "@/services/dashboardService";

// Formato de moneda local
const fmtMoney = (value: number) =>
  "$" + (Number(value) || 0).toLocaleString("es-CO");

/**
 * Indicadores de la sección de AHORROS.
 * Todos los valores corresponden al período seleccionado en el dashboard
 * (un año concreto o el histórico completo).
 */
const SavingsOverview = ({ data }: { data: DashboardData }) => {
  const summary = data.savingsSummary;
  const totalSaved = Number(summary?.totalSaved) || 0;
  const avgPerActivePeriod = Number(summary?.avgPerActivePeriod) || 0;
  const bestPeriodTotal = Number(summary?.bestPeriodTotal) || 0;
  const lastPeriodTotal = Number(summary?.lastPeriodTotal) || 0;
  const periodsWithActivity = Number(summary?.periodsWithActivity) || 0;
  const totalPeriods = Number(summary?.totalPeriods) || 0;
  const aportesCount = Number(summary?.aportesCount) || 0;

  const periodLabel = data.period?.label ?? "Histórico completo";
  const isMonthly = (data.savingsGroupBy ?? "year") === "month";

  // Aporte promedio por registro
  const avgPerAporte = aportesCount > 0 ? Math.round(totalSaved / aportesCount) : 0;
  // Cobertura: períodos con actividad dentro del período analizado
  const coverage =
    totalPeriods > 0 ? Math.round((periodsWithActivity / totalPeriods) * 100) : 0;
  // Variación del último período frente al promedio de períodos activos
  const lastVsAverage =
    avgPerActivePeriod > 0
      ? Math.round(((lastPeriodTotal - avgPerActivePeriod) / avgPerActivePeriod) * 100)
      : 0;

  return (
    <Grid container spacing={3}>
      {/* Ahorro total del período */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiCard
          title="Ahorro del período"
          value={fmtMoney(totalSaved)}
          sublabel={`${aportesCount} aportes · ${periodLabel}`}
          icon={<IconCoins size={26} color="#fff" />}
          gradient="linear-gradient(135deg, #13DEB9 0%, #02b3a9 100%)"
          fullHeight
        />
      </Grid>

      {/* Promedio por período con actividad */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiCard
          title={isMonthly ? "Promedio por mes activo" : "Promedio por año activo"}
          value={fmtMoney(avgPerActivePeriod)}
          sublabel={`${periodsWithActivity} ${isMonthly ? "meses" : "años"} con aportes`}
          icon={<IconTrendingUp size={26} color="#fff" />}
          gradient="linear-gradient(135deg, #2b9fc2 0%, #49BEFF 100%)"
          progress={coverage}
          trendLabel={`${coverage}% del período con actividad`}
          fullHeight
        />
      </Grid>

      {/* Mejor período */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiCard
          title="Mejor período"
          value={fmtMoney(bestPeriodTotal)}
          sublabel={
            summary?.bestPeriodLabel
              ? `Mayor recaudo en ${summary.bestPeriodLabel}`
              : "Sin aportes en el período"
          }
          icon={<IconTrophy size={26} color="#fff" />}
          gradient="linear-gradient(135deg, #7e22ce 0%, #c084fc 100%)"
          fullHeight
        />
      </Grid>

      {/* Último período con actividad */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiCard
          title="Último período"
          value={fmtMoney(lastPeriodTotal)}
          sublabel={
            summary?.lastPeriodLabel
              ? `${summary.lastPeriodLabel} · promedio por aporte ${fmtMoney(avgPerAporte)}`
              : "Sin aportes en el período"
          }
          icon={<IconCalendarMonth size={26} color="#fff" />}
          gradient="linear-gradient(135deg, #FFAE1F 0%, #FA896B 100%)"
          trend={avgPerActivePeriod > 0 ? lastVsAverage : undefined}
          trendDirection={lastVsAverage >= 0 ? "up" : "down"}
          trendLabel="vs promedio"
          fullHeight
        />
      </Grid>
    </Grid>
  );
};

export default SavingsOverview;
