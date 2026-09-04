// src/(DashboardLayout)/page.tsx

"use client";
import useAuth from "../../hooks/useAuth";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
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
    <PageContainer title="Dashboard" description="Dashboard de la cooperativa">
      <Box>
        {/* Encabezado de bienvenida */}
        <Box
          sx={{
            background:
              "linear-gradient(120deg, #2447a8 0%, #3567d6 58%, #2b9fc2 100%)",
            borderRadius: 2,
            p: { xs: 2.5, sm: 3, md: 4 },
            mb: 3,
            color: "#fff",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 20px rgba(36,71,168,0.2)",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              opacity: 0.12,
              backgroundImage: "linear-gradient(135deg, transparent 45%, #fff 46%, transparent 47%)",
              backgroundSize: "18px 18px",
            },
          }}
        >
          <Typography variant="overline" sx={{ position: "relative", zIndex: 1, letterSpacing: "0.12em", opacity: 0.8, fontWeight: 700 }}>
            CENTRO DE CONTROL
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ position: "relative", zIndex: 1 }}>
            ¡Bienvenido de nuevo!
          </Typography>
          <Typography
            variant="body2"
            sx={{ position: "relative", zIndex: 1, mt: 1, opacity: 0.92, maxWidth: 560 }}
          >
            Aquí tienes un resumen del estado de la cooperativa: usuarios, cartera
            de créditos y ahorros en tiempo real.
          </Typography>
          <Box sx={{ position: "relative", zIndex: 1, mt: 2, display: "inline-flex", alignItems: "center", gap: 1, px: 1.25, py: 0.6, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)" }}>
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#8ff4d6", boxShadow: "0 0 0 4px rgba(143,244,214,0.15)" }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Vista operativa</Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid container size={{ xs: 12, md: 8 }}>
            <AdminDashboard />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
            <Stack
              spacing={2}
              sx={{ width: "100%", height: "100%" }}
              useFlexGap
            >
              {/* <PaymentSupportsCard
                sx={{ flexShrink: 0, alignSelf: "stretch" }}
              /> */}
              <SavingsProjectionCard sx={{ flexShrink: 0 }} />
              <TransactionsHistory
                sx={{ flexGrow: 1, minHeight: 200 }}
                fullHeight
              />
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
