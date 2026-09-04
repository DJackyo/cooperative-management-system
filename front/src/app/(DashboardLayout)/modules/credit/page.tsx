// src/app/(DashboardLayout)/modules/credit/page.tsx
"use client";
import { ErrorOutline } from "@mui/icons-material";
import { Card, CardContent, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useSearchParams } from "next/navigation";
import CreditModule from "./CreditModule";
import { IconAdjustmentsDollar } from "@tabler/icons-react";
import PageHeader from "@/app/(DashboardLayout)/components/shared/PageHeader";

const CreditPage = () => {
  // Obtener los parámetros de la URL
  const searchParams = useSearchParams();
  const id = searchParams.get("userId"); // Obtener el parámetro "id" de la URL

  // Lógica condicional antes del retorno
  if (!id || parseInt(id) < 0) {
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
              No se encontró un ID de usuario relacionado para mostrar la
              información
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Gestión de Crédito"
        subtitle="Administra solicitudes, aprobaciones y pagos de créditos"
        icon={<IconAdjustmentsDollar size={22} />}
        gradient="linear-gradient(135deg, #7e22ce 0%, #c084fc 120%)"
      />
      <CreditModule userId={parseInt(id)} />
    </div>
  );
};

export default CreditPage;
