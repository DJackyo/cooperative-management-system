"use client";

import React, { JSX, useEffect, useState } from "react";
import { Box, Typography, Button, Stack, Alert, CircularProgress } from "@mui/material";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import { authService } from "../services/authService";
import { User } from "@/interfaces/User";
import { useRouter } from "next/navigation";

interface loginType {
  title?: string;
  subtitle?: React.ReactNode | React.ReactNode[];
  subtext?: React.ReactNode | React.ReactNode[];
}

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verifica si el usuario ya tiene una sesión activa
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      router.push("/"); // Redirige al dashboard si ya está autenticado
    }
  }, [router]); // Se ejecuta solo una vez al montar el componente

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const user: User = await authService.login(email, password);
      setLoading(false);
      if (user) {
        console.log("Usuario autenticado:", email);
        router.push("/");
      }
    } catch (err) {
      setLoading(false);
      setError("Correo o contraseña incorrectos");
    }
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}
      <form onSubmit={handleLogin}>
        <Stack>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="username"
              mb="5px"
            >
              Correo electrónico
            </Typography>
            <CustomTextField
              id="username"
              name="email"
              variant="outlined"
              fullWidth
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />
          </Box>
          <Box mt="25px">
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="password"
              mb="5px"
            >
              Contraseña
            </Typography>
            <CustomTextField
              id="password"
              name="password"
              type="password"
              variant="outlined"
              fullWidth
              autoComplete="current-password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />
          </Box>
          <Stack
            justifyContent="space-between"
            direction="row"
            alignItems="center"
            my={2}
          >
            {error && (
              <Alert severity="error" sx={{ width: "100%" }}>
                {error}
              </Alert>
            )}
          </Stack>
        </Stack>
        <Box mt={2}>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={loading || !email || !password}
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : undefined
            }
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </Box>
      </form>
      {subtitle}
    </>
  );
};

export default AuthLogin;
