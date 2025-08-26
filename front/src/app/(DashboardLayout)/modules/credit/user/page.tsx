// src/app/(DashboardLayout)/modules/credit/page.tsx
"use client";
import { ErrorOutline } from "@mui/icons-material";
import { Card, CardContent, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
// import CreditDetailModule from "./CreditDetailModule";

const CreditDetailModule = dynamic(() => import('./CreditDetailModule'), {
  ssr: false, // 👈 evita el renderizado en el servidor
});

const UserCreditPage = () => {
  // Obtener los parámetros de la URL
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const creditId = searchParams.get("creditId");

  // Lógica condicional antes del retorno
  if (
    (!userId || parseInt(userId) < 0) &&
    (!creditId || parseInt(creditId) < 0)
  ) {
    return (
      <Card
        variant="outlined"
        sx={{ boxShadow: 3, maxWidth: 400, margin: "auto", mt: 4 }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center">
            <ErrorOutline sx={{ mr: 1, fontSize: 40, color: "error.main" }} />{" "}
            {/* Ícono de error */}
            <Typography variant="h6" color="error" align="center">
              No se encontró un ID de usuario o de Crédito relacionado para
              mostrar la información
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <CreditDetailModule
      userId={parseInt(userId!)}
      creditId={parseInt(creditId!)}
    />
  );
};

export default UserCreditPage;
