"use client";
import React from "react";
import BackupManager from "@/components/BackupManager";
import { Box } from "@mui/material";
import { IconDatabase } from "@tabler/icons-react";
import PageHeader from "@/app/(DashboardLayout)/components/shared/PageHeader";

export default function BackupsPage() {
  return (
    <Box sx={{ padding: 0 }}>
      <PageHeader
        title="Gestión de Backups"
        subtitle="Crea y restaura copias de seguridad de la base de datos"
        icon={<IconDatabase size={22} />}
        gradient="linear-gradient(135deg, #475569 0%, #94a3b8 120%)"
      />
      <BackupManager />
    </Box>
  );
}
