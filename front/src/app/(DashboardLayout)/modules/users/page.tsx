// src/(DashboardLayout)/modules/users/page.tsx
"use client";
import React from "react";
import UserManagementModule from "./UserManagementModule";
import { Box, Typography } from "@mui/material";

const UserManagementPage = () => {
  return (
    <Box sx={{ padding: 0 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Gestión de Usuarios
      </Typography>
      <UserManagementModule />
    </Box>
  );
};

export default UserManagementPage;
