// src/(DashboardLayout)/page.tsx

"use client";
import useAuth from "../../hooks/useAuth";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
// components
import { useEffect, useState } from "react";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import TransactionsHistory from "./components/dashboard/TransactionsHistory";
import PaymentSupportsCard from "./components/dashboard/PaymentSupportsCard";
import SavingsProjectionCard from "./components/dashboard/SavingsProjectionCard";
import { useRouter } from "next/navigation";
import { setupAxiosInterceptors } from "@/services/axiosClient";
import { authService } from "../authentication/services/authService";

const Dashboard = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useAuth();

  useEffect(() => {
    setupAxiosInterceptors(router);
    const userRole = authService.getUserRoles();
    setUserRole(userRole);
  }, [router]);

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <Grid container spacing={2}>
          <Grid container size={{ xs: 12, md: 8 }}>
            <AdminDashboard />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <PaymentSupportsCard />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <SavingsProjectionCard />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TransactionsHistory />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
