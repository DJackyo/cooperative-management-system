import React, { useEffect, useState } from "react";
import { Grid, Typography, Paper, Box, Divider } from "@mui/material";
import dynamic from "next/dynamic";
import { dashboardService, DashboardData } from "@/services/dashboardService";
import TotalUsersCard from "./TotalUsersCard";
import SavingsTransactionsCard from "./SavingsTransactionsCard";
import ActiveCredits from "./ActiveCredits";
import OverdueCredits from "./PendingCredits";
import PendingApprovalsCard from "./PendingApprovalsCard";
import CreditDistribution from "./CreditDistribution";
import Loading from "@/app/loading";
import LoadingSkeleton from "@/components/LoadingSkeleton";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalUsers: 0,
    activeCredits: 0,
    pendingCredits: 0,
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
        const fallbackData = {
          totalUsers: 1200,
          activeCredits: 350,
          pendingCredits: 120,
          savingsTransactions: [300000, 450000, 380000],
          savingsLabels: ['2024-11', '2024-12', '2025-02'],
          pendingPaymentSupports: 15,
          deactivationRequests: [],
          usersByStatus: [
            { status: 'Activo', count: 840 },
            { status: 'Inactivo', count: 240 },
            { status: 'Retirado', count: 120 },
          ],
        };
        console.log('Using fallback data due to API error');
        setDashboardData(fallbackData);
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
          {/* Sección Usuarios */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom color="primary">
              👥 Usuarios
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TotalUsersCard 
              totalUsers={dashboardData.totalUsers} 
              usersByStatus={dashboardData.usersByStatus} 
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box my={2}>
              <Divider />
            </Box>
          </Grid>

          {/* Sección Cartera */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom color="primary">
              💼 Cartera de Créditos
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ActiveCredits dashboardData={dashboardData} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <PendingApprovalsCard count={dashboardData.pendingCredits} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <OverdueCredits dashboardData={dashboardData} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CreditDistribution dashboardData={dashboardData} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box my={2}>
              <Divider />
            </Box>
          </Grid>

          {/* Sección Ahorros */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom color="primary">
              💰 Ahorros y Transacciones
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SavingsTransactionsCard 
              savingsTransactions={dashboardData.savingsTransactions} 
              savingsLabels={dashboardData.savingsLabels}
            />
          </Grid>

          {/* <Grid  size={{ xs: 12, md: 4 }}>
            <DashboardCard title="Pending Payment Supports">
              <Typography variant="h5">
                {dashboardData.pendingPaymentSupports}
              </Typography>
            </DashboardCard>
          </Grid> */}

          {/* <Grid  size={{ xs: 12, md: 6 }}>
            <SavingsTransactionsCard />
          </Grid> */}

          {/* <Grid  size={{ xs: 12 }}>
              <DashboardCard title="Deactivation Requests">
                  <Chart options={deactivationRequestsOptions} series={deactivationRequestsSeries} type="bar" height={350} />
              </DashboardCard>
          </Grid> */}
        </>
      )}
    </Grid>
  );
};

export default AdminDashboard;
