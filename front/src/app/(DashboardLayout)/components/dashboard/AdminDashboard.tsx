import React, { useEffect, useRef, useState } from "react";
import { Avatar, Box, Chip, Grid, Stack, Typography } from "@mui/material";
import { IconCoins, IconCreditCard, IconUsers } from "@tabler/icons-react";
import { dashboardService, DashboardData } from "@/services/dashboardService";
import SavingsOverview from "./SavingsOverview";
import CreditOverview from "./CreditOverview";
import TotalUsersCard from "./TotalUsersCard";
import SavingsTransactionsCard from "./SavingsTransactionsCard";
import CreditDistribution from "./CreditDistribution";
import LoanCollectionCard from "./LoanCollectionCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";

interface AdminDashboardProps {
  /** Año del período a consultar. `null` = histórico completo ("Todos los años"). */
  year?: number | null;
}

/** Datos base usados mientras carga o cuando la petición falla. */
const EMPTY_DASHBOARD: DashboardData = {
  totalUsers: 0,
  activeCredits: 0,
  pendingCredits: 0,
  completedCredits: 0,
  approvedCredits: 0,
  totalCreditAmount: 0,
  overdueCredits: 0,
  savingsTransactions: [],
  savingsLabels: [],
  savingsContributions: [],
  savingsWithdrawals: [],
  pendingPaymentSupports: 0,
  deactivationRequests: [],
};

/** Encabezado de cada sección con su ícono y el período analizado. */
const SectionHeader = ({
  icon,
  title,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  color: string;
}) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    <Avatar
      sx={{
        background: color,
        width: 40,
        height: 40,
        boxShadow: "0 5px 12px rgba(93,135,255,0.3)",
      }}
    >
      {icon}
    </Avatar>
    <Box>
      <Typography variant="h6" color="textPrimary" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  </Stack>
);

/** Contenedor que separa visualmente cada sección del dashboard. */
const Section = ({ accent, children }: { accent: string; children: React.ReactNode }) => (
  <Box
    sx={{
      p: { xs: 1.5, sm: 2 },
      height: "100%",
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      borderLeft: `5px solid ${accent}`,
      bgcolor: "#fbfcff",
      display: "flex",
      flexDirection: "column",
      gap: 3,
    }}
  >
    {children}
  </Box>
);

const AdminDashboard = ({ year = null }: AdminDashboardProps) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const loadedOnce = useRef(false);

  useEffect(() => {
    let activo = true;

    const loadDashboardData = async () => {
      if (loadedOnce.current) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await dashboardService.getDashboardData(year);
        if (!activo) return;
        setDashboardData({ ...EMPTY_DASHBOARD, ...data });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        if (activo) {
          setDashboardData({
            ...EMPTY_DASHBOARD,
            period: {
              year,
              isAllYears: year === null,
              label: year === null ? "Histórico completo" : `Año ${year}`,
            },
          });
        }
      } finally {
        loadedOnce.current = true;
        if (activo) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      activo = false;
    };
  }, [year]);

  if (loading) {
    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <LoadingSkeleton />
        </Grid>
      </Grid>
    );
  }

  const periodLabel =
    dashboardData.period?.label ??
    (year === null ? "Histórico completo" : `Año ${year}`);
  const savingsGroupBy = dashboardData.savingsGroupBy ?? (year === null ? "year" : "month");

  return (
    <Box sx={{ opacity: refreshing ? 0.6 : 1, transition: "opacity 0.2s ease" }}>
      <Grid container spacing={3}>
        {refreshing && (
          <Grid size={{ xs: 12 }}>
            <Chip
              label={`Actualizando información de ${periodLabel}...`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Grid>
        )}

        {/* ===================== SECCIÓN AHORROS ===================== */}
        <Grid size={{ xs: 12 }} data-tour="dashboard-savings-section">
          <Section accent="#13DEB9">
            <Grid size={{ xs: 12 }}>
              <SectionHeader
                icon={<IconCoins size={22} color="#fff" />}
                title="Ahorros"
                subtitle={`Aportes de los asociados · ${periodLabel}`}
                color="linear-gradient(135deg, #13DEB9 0%, #02b3a9 100%)"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <SavingsOverview data={dashboardData} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <SavingsTransactionsCard
                savingsTransactions={dashboardData.savingsTransactions}
                savingsLabels={dashboardData.savingsLabels}
                savingsContributions={dashboardData.savingsContributions}
                savingsWithdrawals={dashboardData.savingsWithdrawals}
                groupBy={savingsGroupBy}
                total={dashboardData.savingsSummary?.totalSaved}
                periodLabel={periodLabel}
              />
            </Grid>
          </Section>
        </Grid>

        {/* ===================== SECCIÓN CRÉDITOS ===================== */}
        <Grid size={{ xs: 12 }} data-tour="dashboard-credits-section">
          <Section accent="#5D87FF">
            <Grid size={{ xs: 12 }}>
              <SectionHeader
                icon={<IconCreditCard size={22} color="#fff" />}
                title="Créditos"
                subtitle={`Cartera, colocación y recaudo · ${periodLabel}`}
                color="linear-gradient(135deg, #5D87FF 0%, #49BEFF 100%)"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CreditOverview data={dashboardData} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <LoanCollectionCard
                loanCollection={dashboardData.loanCollection}
                totalCreditAmount={dashboardData.totalCreditAmount}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CreditDistribution dashboardData={dashboardData} />
            </Grid>
          </Section>
        </Grid>

        {/* ===================== SECCIÓN ASOCIADOS =====================
            Solo en "Todos los años": los estados de los asociados son un dato
            global de la base actual y no tienen desglose histórico por año. */}
        {year === null && (
          <Grid size={{ xs: 12 }} data-tour="dashboard-users-section">
            <Section accent="#7e22ce">
              <Grid size={{ xs: 12 }}>
                <SectionHeader
                  icon={<IconUsers size={22} color="#fff" />}
                  title="Asociados"
                  subtitle="Estado actual de la base de asociados · visible solo en Todos los años"
                  color="linear-gradient(135deg, #7e22ce 0%, #c084fc 100%)"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TotalUsersCard
                  title="Asociados por estado"
                  totalUsers={dashboardData.totalUsers}
                  usersByStatus={dashboardData.usersByStatus}
                />
              </Grid>
            </Section>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
