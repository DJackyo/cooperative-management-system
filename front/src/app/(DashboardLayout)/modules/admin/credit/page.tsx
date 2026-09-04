// src/app/credit-requests/page.tsx
"use client";
import React from "react";
import CreditRequests from "./CreditRequests"; // Ajusta la ruta según tu estructura de carpetas
import { Box } from "@mui/material";
import { IconClipboardCheck } from "@tabler/icons-react";
import PageHeader from "@/app/(DashboardLayout)/components/shared/PageHeader";

const CreditRequestsPage = () => {
  return (
    <Box>
      <PageHeader
        title="Solicitudes de Crédito"
        subtitle="Revisa y gestiona las solicitudes pendientes"
        icon={<IconClipboardCheck size={22} />}
        gradient="linear-gradient(135deg, #0ea5e9 0%, #49BEFF 120%)"
      />
      <CreditRequests />
    </Box>
  );
};

export default CreditRequestsPage;
