import React, { useEffect, useState } from "react";
import { Grid, Typography, Box, Divider, Avatar, Stack } from "@mui/material";
import { IconCoins, IconActivity } from "@tabler/icons-react";
import { dashboardService, DashboardData } from "@/services/dashboardService";
import CooperativeOverview from "./CooperativeOverview";
import TotalUsersCard from "./TotalUsersCard";
import SavingsTransactionsCard from "./SavingsTransactionsCard";
import CreditDistribution from "./CreditDistribution";
import LoadingSkeleton from "@/components/LoadingSkeleton";

// Encabezado de sección con ícono degradado
const SectionHeader = ({
  icon,
  title,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
}) => {
  return (
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
      <Typography variant="h6" color="textPrimary" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
    </Stack>
  );
};

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalUsers: 0,
    activeCredits: 0,
    pendingCredits: 0,
    totalCreditAmount: 0,
    overdueCredits: 0,
    savingsTransactions: [],
    pendingPaymentSupports: 0,
    deactivationRequests: [],
  });
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (dataLoaded) return;
      
      setLoading(true);
      try {
        const data = await dashboardService.getDashboardData();
        console.log('Backend data received:', data);
        setDashboardData(data);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setDashboardData({
          totalUsers: 0,
          activeCredits: 0,
          pendingCredits: 0,
          totalCreditAmount: 0,
          overdueCredits: 0,
          savingsTransactions: [],
          pendingPaymentSupports: 0,
          deactivationRequests: [],
        });
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  return (
    <Grid container spacing={3}>
      {loading ? (
        <Grid size={{ xs: 12 }}>
          <LoadingSkeleton />
        </Grid>
      ) : (
        <>
          {/* Estado de la cooperativa */}
          <Grid size={{ xs: 12 }}>
            <SectionHeader
              icon={<IconActivity size={22} color="#fff" />}
              title="Estado de la Cooperativa"
              color="linear-gradient(135deg, #5D87FF 0%, #49BEFF 100%)"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CooperativeOverview data={dashboardData} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box my={2}>
              <Divider />
            </Box>
          </Grid>

          {/* Distribución de créditos y usuarios */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CreditDistribution dashboardData={dashboardData} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TotalUsersCard
              title="Asociados por estado"
              totalUsers={dashboardData.totalUsers}
              usersByStatus={dashboardData.usersByStatus}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box my={2}>
              <Divider />
            </Box>
          </Grid>

          {/* Ahorros por mes */}
          <Grid size={{ xs: 12 }}>
            <SectionHeader
              icon={<IconCoins size={22} color="#fff" />}
              title="Ahorros y Transacciones"
              color="linear-gradient(135deg, #13DEB9 0%, #02b3a9 100%)"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SavingsTransactionsCard
              savingsTransactions={dashboardData.savingsTransactions}
              savingsLabels={dashboardData.savingsLabels}
            />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default AdminDashboard;
