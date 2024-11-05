// src/app/authentication/auth/AuthLogin.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import { authService } from "../services/authService";
import { User } from "@/interfaces/User";
import { useRouter } from "next/navigation";

interface loginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
}

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Verifica si el usuario ya tiene una sesión activa
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      router.push("/"); // Redirige al dashboard si ya está autenticado
    }
  }, []); // Se ejecuta solo una vez al montar el componente

  const handleLogin = async () => {
    try {
      const user: User = await authService.login(email, password);
      setError("");
      if (user) {
        console.log("Usuario autenticado:", user);
        router.push("/");
      }
    } catch (err) {
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
            variant="outlined"
            fullWidth
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
            type="password"
            variant="outlined"
            fullWidth
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
          {error && ( // Condición para mostrar el mensaje de error
            <Typography color="error" mt={2}>
              {error}
            </Typography>
          )}
          {/* <FormGroup>
          <FormControlLabel
            control={<Checkbox defaultChecked />}
            label="Remeber this Device"
          />
        </FormGroup> */}
          {/* <Typography
          component={Link}
          href="/"
          fontWeight="500"
          sx={{
            textDecoration: "none",
            color: "primary.main",
          }}
        >
          Forgot Password ?
        </Typography> */}
        </Stack>
      </Stack>
      <Box mt={3}>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          onClick={handleLogin} // Ejecuta la función de login
        >
          Ingresar
        </Button>
      </Box>
      {subtitle}
    </>
  );
};

export default AuthLogin;
