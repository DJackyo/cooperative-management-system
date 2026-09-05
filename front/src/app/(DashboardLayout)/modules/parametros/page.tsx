"use client";

import React from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { IconSettings } from "@tabler/icons-react";
import PageHeader from "@/app/(DashboardLayout)/components/shared/PageHeader";
import ParametroCRUD, {
  ParametroField,
} from "@/app/(DashboardLayout)/modules/parametros/components/ParametroCRUD";
import { rolesService } from "@/services/rolesService";
import { tiposIdentificacionService } from "@/services/tiposIdentificacionService";
import { estadosAsociadoService } from "@/services/estadosAsociadoService";
import { estadosAprobacionService } from "@/services/estadosAprobacionService";
import { tiposFamiliaresService } from "@/services/tiposFamiliaresService";
import { metodosPagoService } from "@/services/metodosPagoService";
import { creditsService } from "@/services/creditRequestService";

const rolesFields: ParametroField[] = [
  { key: "nombre", label: "Nombre", required: true },
  { key: "descripcion", label: "Descripción" },
];

const tiposIdentificacionFields: ParametroField[] = [
  { key: "nombre", label: "Nombre", required: true },
];

const estadosAsociadoFields: ParametroField[] = [
  { key: "id", label: "ID", type: "number", required: true },
  { key: "estado", label: "Estado" },
];

const estadosAprobacionFields: ParametroField[] = [
  { key: "nombreEstado", label: "Nombre del estado", required: true },
];

const tiposFamiliaresFields: ParametroField[] = [
  { key: "nombre", label: "Nombre", required: true },
];

const metodosPagoFields: ParametroField[] = [
  { key: "nombre", label: "Nombre", required: true },
];

const tasasFields: ParametroField[] = [
  { key: "anio", label: "Año", type: "number", required: true },
  { key: "tasa", label: "Tasa (decimal)", required: true },
];

const ParametrosPage = () => {
  const [tab, setTab] = React.useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const renderTab = () => {
    switch (tab) {
      case 0:
        return (
          <ParametroCRUD
            service={rolesService}
            title="Rol"
            fields={rolesFields}
          />
        );
      case 1:
        return (
          <ParametroCRUD
            service={tiposIdentificacionService}
            title="Tipo de identificación"
            fields={tiposIdentificacionFields}
          />
        );
      case 2:
        return (
          <ParametroCRUD
            service={estadosAsociadoService}
            title="Estado de asociado"
            fields={estadosAsociadoFields}
          />
        );
      case 3:
        return (
          <ParametroCRUD
            service={estadosAprobacionService}
            title="Estado de aprobación"
            fields={estadosAprobacionFields}
          />
        );
      case 4:
        return (
          <ParametroCRUD
            service={tiposFamiliaresService}
            title="Tipo de familiar"
            fields={tiposFamiliaresFields}
          />
        );
      case 5:
        return (
          <ParametroCRUD
            service={metodosPagoService}
            title="Método de pago"
            fields={metodosPagoFields}
          />
        );
      case 6:
        return (
          <ParametroCRUD
            service={{
              fetchAll: creditsService.getTasas,
              create: creditsService.createTasa,
              update: creditsService.updateTasa,
              delete: creditsService.deleteTasa,
            }}
            title="Tasa de préstamo"
            fields={tasasFields}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ padding: 0 }}>
      <PageHeader
        title="Parámetros del sistema"
        subtitle="Administra las tablas pequeñas de configuración"
        icon={<IconSettings size={22} />}
        gradient="linear-gradient(135deg, #0E7A0E 0%, #49BEFF 120%)"
      />
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tab}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="parámetros"
        >
          <Tab label="Roles" />
          <Tab label="Tipos de identificación" />
          <Tab label="Estados de asociado" />
          <Tab label="Estados de aprobación" />
          <Tab label="Tipos de familiares" />
          <Tab label="Métodos de pago" />
          <Tab label="Tasas de préstamo" />
        </Tabs>
      </Box>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Configuración de catálogos según el esquema de la cooperativa. Los
        cambios se reflejan en el resto de la aplicación.
      </Typography>
      {renderTab()}
    </Box>
  );
};

export default ParametrosPage;