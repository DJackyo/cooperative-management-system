import React, { useEffect, useState } from "react";
import { Grid, Typography, Paper } from "@mui/material";
import dynamic from "next/dynamic";
import { fetchDashboardData } from "@/mock/mockDashboardData";
import TotalUsersCard from "./TotalUsersCard";
import SavingsTransactionsCard from "./SavingsTransactionsCard";
import ActiveCredits from "./ActiveCredits";
import PendingCredits from "./PendingCredits";
import CreditDistribution from "./CreditDistribution";
import Loading from "@/app/loading";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeCredits: 0,
    pendingCredits: 0,
    savingsTransactions: [],
    pendingPaymentSupports: 0,
    deactivationRequests: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDashboardData().then((data:any) => {
      setDashboardData(data);
      setLoading(false);
    });
  }, []);

  return (
    <Grid container spacing={3}>
      {loading ? (
        <Grid  size={{ xs: 12, sm: 12 }}>
          <Paper style={{ padding: "20px", textAlign: "center" }}>
            <Loading />
          </Paper>
        </Grid>
      ) : (
        <>
          <Grid  size={{ xs: 12, md: 4 }}>
            <TotalUsersCard />
          </Grid>

          <Grid  size={{ xs: 12, md: 4 }}>
            <ActiveCredits dashboardData={dashboardData} />
          </Grid>

          <Grid  size={{ xs: 12, md: 4 }}>
            <PendingCredits dashboardData={dashboardData} />
          </Grid>

          <Grid  size={{ xs: 12, md: 6 }}>
            <CreditDistribution />
          </Grid>

          <Grid  size={{ xs: 12, md: 6 }}>
            <SavingsTransactionsCard />
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
