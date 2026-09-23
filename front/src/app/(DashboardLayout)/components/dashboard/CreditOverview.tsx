import React from "react";
import { Grid } from "@mui/material";
import {
  IconBriefcase,
  IconCreditCard,
  IconClockHour4,
  IconAlertTriangle,
} from "@tabler/icons-react";
import KpiCard from "./KpiCard";
import { DashboardData } from "@/services/dashboardService";

// Formato de moneda local
const fmtMoney = (value: number) =>
  "$" + (Number(value) || 0).toLocaleString("es-CO");

/**
 * Indicadores de la sección de CRÉDITOS.
 * Todos los valores corresponden al período seleccionado en el dashboard
 * (un año concreto o el histórico completo).
 */
const CreditOverview = ({ data }: { data: DashboardData }) => {
  const activeCredits = Number(data.activeCredits) || 0;
  const pendingCredits = Number(data.pendingCredits) || 0;
  const overdueCredits = Number(data.overdueCredits) || 0;
  const completedCredits = Number(data.completedCredits) || 0;
  const approvedCredits =
    Number(data.approvedCredits) || activeCredits + overdueCredits;
  const totalCreditAmount = Number(data.totalCreditAmount) || 0;

  const creditsInPeriod = data.creditsInPeriod;
  const periodLabel = data.period?.label ?? "Histórico completo";

  const totalCollected = Number(data.loanCollection?.totalCollected) || 0;
  const totalPaymentsCount = Number(data.loanCollection?.totalPaymentsCount) || 0;

  const activeRate =
    approvedCredits > 0 ? Math.round((activeCredits / approvedCredits) * 100) : 0;
  const overdueRate =
    approvedCredits > 0 ? Math.round((overdueCredits / approvedCredits) * 100) : 0;
  const collectionRate =
    totalCreditAmount > 0
      ? Math.min(
          Math.round(
            ((Number(data.loanCollection?.totalCapital) || 0) / totalCreditAmount) * 100,
          ),
          100,
        )
      : 0;

  return (
    <Grid container spacing={3}>
      {/* Capital colocado */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiCard
          title="Capital colocado"
          value={fmtMoney(totalCreditAmount)}
          sublabel={`${creditsInPeriod?.count ?? 0} créditos registrados · ${periodLabel}`}
          icon={<IconBriefcase size={26} color="#fff" />}
          gradient="linear-gradient(135deg, #7e22ce 0%, #c084fc 100%)"
          progress={collectionRate}
          trendLabel={`${collectionRate}% del capital recuperado`}
          fullHeight
        />
      </Grid>

      {/* Créditos activos */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiCard
          title="Créditos activos"
          value={String(activeCredits)}
          sublabel={`${approvedCredits} créditos aprobados en el período`}
          icon={<IconCreditCard size={26} color="#fff" />}
          gradient="linear-gradient(135deg, #5D87FF 0%, #49BEFF 100%)"
          progress={activeRate}
          trendLabel={`${activeRate}% de la cartera al día`}
          fullHeight
        />
      </Grid>

      {/* Créditos pendientes por aprobar */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiCard
          title="Créditos pendientes"
          value={String(pendingCredits)}
          sublabel={`${completedCredits} finalizados en el período`}
          icon={<IconClockHour4 size={26} color="#fff" />}
          gradient="linear-gradient(135deg, #FFAE1F 0%, #FA896B 100%)"
          trendLabel={`${totalPaymentsCount} pagos de cuota registrados`}
          fullHeight
        />
      </Grid>

      {/* Cartera en riesgo */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiCard
          title="Cartera en riesgo"
          value={`${overdueRate}%`}
          sublabel={`${overdueCredits} créditos con cuotas vencidas`}
          icon={<IconAlertTriangle size={26} color="#fff" />}
          gradient="linear-gradient(135deg, #FA896B 0%, #dc2626 100%)"
          progress={overdueRate}
          trendLabel={`Recaudado en el período: ${fmtMoney(totalCollected)}`}
          fullHeight
        />
      </Grid>
    </Grid>
  );
};

export default CreditOverview;
