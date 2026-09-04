// src/(DashboardLayout)/modules/users/page.tsx
"use client";
import React from "react";
import UserManagementModule from "./UserManagementModule";
import { Box } from "@mui/material";
import { IconUserCog } from "@tabler/icons-react";
import PageHeader from "@/app/(DashboardLayout)/components/shared/PageHeader";

const UserManagementPage = () => {
  return (
    <Box sx={{ padding: 0 }}>
      <PageHeader
        title="Gestión de Usuarios"
        subtitle="Administra los asociados y sus cuentas de acceso"
        icon={<IconUserCog size={22} />}
        gradient="linear-gradient(135deg, #5D87FF 0%, #49BEFF 120%)"
      />
      <UserManagementModule />
    </Box>
  );
};

export default UserManagementPage;
