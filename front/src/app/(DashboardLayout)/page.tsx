// src/(DashboardLayout)/page.tsx

"use client";
import useAuth from "../../hooks/useAuth";

import { Grid, Box } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
// components
import { useEffect, useState } from "react";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import TransactionsHistory from "./components/dashboard/TransactionsHistory";
import PaymentSupportsCard from "./components/dashboard/PaymentSupportsCard";

const Dashboard = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useAuth();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <AdminDashboard />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <PaymentSupportsCard />
              </Grid>
              <Grid item xs={12}>
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
