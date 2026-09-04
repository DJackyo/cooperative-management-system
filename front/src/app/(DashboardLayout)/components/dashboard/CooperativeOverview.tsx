import React from "react";
import { Grid } from "@mui/material";
import {
  IconUsers,
  IconBriefcase,
  IconCoins,
  IconAlertTriangle,
} from "@tabler/icons-react";
import KpiCard from "./KpiCard";
import { DashboardData } from "@/services/dashboardService";

// Utilidades de formato
const fmtMoney = (value: number) =>
  "$" + (Number(value) || 0).toLocaleString("es-CO");

// Componente que resume el estado financiero y social de la cooperativa
const CooperativeOverview = ({ data }: { data: DashboardData }) => {
  const totalUsers = Number(data.totalUsers) || 0;
  const activeCredits = Number(data.activeCredits) || 0;
  const pendingCredits = Number(data.pendingCredits) || 0;
  const overdueCredits = Number(data.overdueCredits) || 0;
  const totalCreditAmount = Number(data.totalCreditAmount) || 0;
  const approvedCredits = activeCredits + overdueCredits;

  // Ahorro captado en los últimos meses con actividad
  const totalSavings = (data.savingsTransactions || []).reduce(
    (acc, val) => acc + (Number(val) || 0),
    0
  );
  const latestSavings = data.savingsTransactions?.at(-1) || 0;

  // Cartera total (colocada) para el cálculo de mora
  const totalPortfolio = activeCredits + overdueCredits;
  const overdueRate =
    totalPortfolio > 0
      ? Math.round((overdueCredits / totalPortfolio) * 100)
      : 0;

  // % de créditos activos respecto a la cartera total
  const creditProgress =
    totalPortfolio > 0 ? Math.round((activeCredits / totalPortfolio) * 100) : 0;

  // % de asociados activos (si el backend entrega el desglose)
  const usersByStatus = data.usersByStatus || [];
  const activeUsers = usersByStatus.find(
    (u) => u.status.toLowerCase() === "activo"
  )?.count;
  const usersProgress =
    activeUsers && totalUsers > 0
      ? Math.round((activeUsers / totalUsers) * 100)
      : totalUsers > 0
      ? 100
      : 0;

  return (
    <Grid container spacing={3}>     

      {/* Capital colocado (cartera) */}
      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
        <KpiCard
          title="Capital Colocado"
          value={fmtMoney(totalCreditAmount)}
          sublabel={`${approvedCredits} créditos aprobados`}
          icon={<IconBriefcase size={26} color="#fff" />}
          gradient="linear-gradient(135deg, #7e22ce 0%, #c084fc 100%)"
          progress={creditProgress}
          trendLabel={`${activeCredits} activos de ${approvedCredits} aprobados`}
          fullHeight
        />
      </Grid>

      {/* Ahorro captado */}
      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
        <KpiCard
          title="Ahorro Captado"
          value={fmtMoney(totalSavings)}
          sublabel={`Último mes: ${fmtMoney(latestSavings)}`}
          icon={<IconCoins size={26} color="#fff" />}
          gradient="linear-gradient(135deg, #13DEB9 0%, #02b3a9 100%)"
          fullHeight
        />
      </Grid>

      {/* Cartera en riesgo */}
      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
        <KpiCard
          title="Cartera en Riesgo"
          value={`${overdueRate}%`}
          sublabel={`${overdueCredits} créditos vencidos`}
          icon={<IconAlertTriangle size={26} color="#fff" />}
          gradient="linear-gradient(135deg, #FFAE1F 0%, #FA896B 100%)"
          progress={overdueRate}
          trendLabel={`${overdueCredits} de ${approvedCredits} créditos aprobados`}
          fullHeight
        />
      </Grid>
    </Grid>
  );
};

export default CooperativeOverview;