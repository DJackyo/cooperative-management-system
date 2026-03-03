"use client";
import React from "react";
import BackupManager from "@/components/BackupManager";
import { Typography, Box } from "@mui/material"; 

export default function BackupsPage() {
  return (
    <Box sx={{ padding: 0 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Gestión de Backups
      </Typography>
      <BackupManager />
    </Box>
    
  );
}
