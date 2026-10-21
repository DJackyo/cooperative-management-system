"use client";

import React, { JSX, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { IconEye, IconEyeOff, IconMail, IconLock } from "@tabler/icons-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconMail size={18} color="#7c8fac" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box mt="20px">
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
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconLock size={18} color="#7c8fac" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                      sx={{ color: "#7c8fac" }}
                    >
                      {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
