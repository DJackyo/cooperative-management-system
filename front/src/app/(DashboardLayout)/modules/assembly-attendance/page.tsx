"use client";

import React from "react";
import { Box } from "@mui/material";
import { IconCalendarEvent } from "@tabler/icons-react";
import PageHeader from "@/app/(DashboardLayout)/components/shared/PageHeader";
import AsistenciaAsambleaList from "../users/components/AsistenciaAsambleaList";

const AssemblyAttendancePage = () => {
  return (
    <Box sx={{ padding: 0 }}>
      <PageHeader
        title="Asistencia a asamblea"
        subtitle="Consulta, filtra y descarga el registro de asistencia de los asociados"
        icon={<IconCalendarEvent size={22} />}
        gradient="linear-gradient(135deg, #0F766E 0%, #14B8A6 120%)"
      />
      <AsistenciaAsambleaList />
    </Box>
  );
};

export default AssemblyAttendancePage;
