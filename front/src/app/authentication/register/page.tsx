"use client";
import { Grid, Box, Card, Typography, Stack, Chip } from "@mui/material";
import Link from "next/link";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import AuthRegister from "../auth/AuthRegister";

const Register2 = () => (
  <PageContainer title="Registro" description="Cree su cuenta en COOPINSI">
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #edf6f5 0%, #f8fbfc 52%, #e8eef8 100%)", p: { xs: 2, sm: 3, md: 5 } }}>
      <Box sx={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", background: "rgba(38, 166, 154, 0.12)", filter: "blur(2px)", top: -170, left: -130 }} />
      <Box sx={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "rgba(93, 135, 255, 0.10)", bottom: -180, right: -100 }} />
      <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center" justifyContent="center" sx={{ width: "100%", position: "relative", zIndex: 1 }}>
        <Grid size={{ xs: 12, md: 5, lg: 5 }} sx={{ display: { xs: "none", md: "block" } }}>
          <Box sx={{ maxWidth: 520, mx: "auto", pr: { md: 2, lg: 5 } }}>
            <Chip label="COOPINSI" color="primary" variant="outlined" sx={{ mb: 2, fontWeight: 700, letterSpacing: "0.08em" }} />
            <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.08, letterSpacing: 0, color: "#20333f", mb: 2 }}>
              Su cooperativa, más cerca.
            </Typography>
            <Typography variant="h6" sx={{ color: "#60727d", fontWeight: 400, lineHeight: 1.6, maxWidth: 400 }}>
              Cree su cuenta para gestionar sus ahorros, aportes y beneficios de la cooperativa.
            </Typography>
            <Box component="img" src="/images/backgrounds/login-bg.svg" alt="Ilustración de bienvenida" sx={{ width: "100%", maxWidth: 460, mt: 3, display: "block" }} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 6, lg: 5, xl: 4 }}>
          <Card variant="outlined" sx={{ p: { xs: 2.5, sm: 4.5 }, width: "100%", border: "1px solid rgba(255,255,255,0.85)", borderRadius: 3, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(14px)", boxShadow: "0 24px 65px rgba(42,53,71,0.15)" }}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <Logo />
            </Box>
            <AuthRegister
              subtext={
                <Typography variant="subtitle1" textAlign="left" color="textSecondary" mb={1}>
                  Complete sus datos para crear su cuenta
                </Typography>
              }
              subtitle={
                <Stack direction="row" spacing={1} justifyContent="center" mt={3}>
                  <Typography color="textSecondary" variant="body2">
                    ¿Ya tiene una cuenta?
                  </Typography>
                  <Typography component={Link} href="/authentication/login" variant="body2" fontWeight="600" sx={{ textDecoration: "none", color: "primary.main" }}>
                    Iniciar sesión
                  </Typography>
                </Stack>
              }
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  </PageContainer>
);

export default Register2;
