// src/app/authentication/login/page.tsx
"use client";
import Link from "next/link";
import { Grid, Box, Card, Stack, Typography } from "@mui/material";
// components
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import AuthLogin from "../auth/AuthLogin";

const Login2 = () => {
  return (
    <PageContainer title="Login" description="this is Login page">
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", background: "linear-gradient(135deg, #eef5f7 0%, #f7f9fc 55%, #e8effa 100%)", p: { xs: 2, sm: 3 } }}>
        <Grid container justifyContent="center" sx={{ width: "100%" }}>
          <Grid size={{ xs: 12, sm: 8, md: 5, lg: 4, xl: 3 }}>
            <Card variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, width: "100%", boxShadow: "0 18px 45px rgba(42,53,71,0.10)" }}>
              <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                <Logo />
              </Box>
              <AuthLogin
                subtext={
                  <Typography variant="subtitle1" textAlign="left" color="textSecondary" mb={1}>
                    Ingrese su correo y contraseña para continuar
                  </Typography>
                }
                subtitle={
                  <Stack direction="row" spacing={1} justifyContent="center" mt={3}>
                    <Typography color="textSecondary" variant="body2">
                      ¿Aún no tiene una cuenta?
                    </Typography>
                    <Typography component={Link} href="/authentication/register" variant="body2" fontWeight="600" sx={{ textDecoration: "none", color: "primary.main" }}>
                      Registrarse
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
};
export default Login2;
