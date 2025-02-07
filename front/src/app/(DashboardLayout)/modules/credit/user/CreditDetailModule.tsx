// src/modules/credit/CreditDetailModule.tsx
import React, { Suspense, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Skeleton,
} from "@mui/material";
import { AttachMoney, CalendarToday, AccessTime } from "@mui/icons-material";
import { mockCreditRequestData, mockCreditInfoData } from "@/mock/mockData";
import dynamic from "next/dynamic";

// Usar `dynamic` para cargar el componente de forma dinámica solo en el cliente.
const CreditForm = dynamic(() => import("../components/CreditForm"), { ssr: false });
const PaymentHistoryTable = dynamic(() => import("../components/PaymentHistoryTable"), { ssr: false });
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Define los tipos de datos de crédito
interface CreditRequestData {
  amountRequested: number;
  requestDate: string;
  termRequested: number;
}

interface CreditInfoData {
  outstandingBalance: number;
  dueDate: string;
  remainingTerm: number;
}

const CreditDetailModule = () => {
  const [openRequestModal, setOpenRequestModal] = useState(false);
  const [openModifyModal, setOpenModifyModal] = useState(false);
  // Estados para los datos simulados, permitiendo el tipo null como valor inicial
  const [creditRequestData, setCreditRequestData] =
    useState<CreditRequestData | null>(null);
  const [creditInfoData, setCreditInfoData] = useState<CreditInfoData | null>(
    null
  );

  useEffect(() => {
    // Simular la carga de datos con un retardo
    setTimeout(() => {
      setCreditRequestData(mockCreditRequestData);
      setCreditInfoData(mockCreditInfoData);
    }, 2000); // 2 segundos de retardo
  }, []);

  const handleOpenRequestModal = () => setOpenRequestModal(true);
  const handleCloseRequestModal = () => setOpenRequestModal(false);

  const handleOpenModifyModal = () => setOpenModifyModal(true);
  const handleCloseModifyModal = () => setOpenModifyModal(false);

  const handleRequestSubmit = (formData: {
    amount?: string;
    term?: string;
    reason?: string;
  }) => {
    console.log("Solicitud de crédito:", formData);
    handleCloseRequestModal();
  };

  const handleModifySubmit = (formData: {
    amount?: string;
    term?: string;
    reason?: string;
  }) => {
    console.log("Modificación de crédito:", formData);
    handleCloseModifyModal();
  };
  // Configuración del gráfico
  const chartOptions = {
    chart: { type: "pie" as const, toolbar: { show: true } },
    labels: ["Pagado", "Pendiente"],
    colors: ["#008FFB", "#FF4560"],
    responsive: [{ breakpoint: 480, options: { chart: { width: 200 } } }],
  };

  const series = [400, 100]; // Datos del gráfico: Pagado y Pendiente

  return (
    <Grid container spacing={3}>
      {/* Información de la Solicitud */}
      <Grid item xs={12} md={4}>
        <Card variant="outlined" sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Información de la Solicitud
            </Typography>
            <Suspense fallback={<Skeleton variant="text" width="100%" />}>
              {creditRequestData ? (
                <>
                  <Typography variant="h6" display="flex" alignItems="center">
                    <AttachMoney sx={{ mr: 1 }} /> Monto Solicitado: $
                    {creditRequestData.amountRequested.toLocaleString()}
                  </Typography>
                  <Typography display="flex" alignItems="center">
                    <CalendarToday sx={{ mr: 1 }} /> Fecha de Solicitud:{" "}
                    {creditRequestData.requestDate}
                  </Typography>
                  <Typography display="flex" alignItems="center">
                    <AccessTime sx={{ mr: 1 }} /> Plazo Solicitado:{" "}
                    {creditRequestData.termRequested} meses
                  </Typography>
                </>
              ) : (
                <Skeleton variant="text" width="100%" height={50} />
              )}
            </Suspense>
          </CardContent>
        </Card>
      </Grid>

      {/* Información del Crédito */}
      <Grid item xs={12} md={4}>
        <Card variant="outlined" sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Información del Crédito
            </Typography>
            <Suspense fallback={<Skeleton variant="text" width="100%" />}>
              {creditInfoData ? (
                <>
                  <Typography variant="h6" display="flex" alignItems="center">
                    <AttachMoney sx={{ mr: 1 }} /> Saldo Pendiente: $
                    {creditInfoData.outstandingBalance.toLocaleString()}
                  </Typography>
                  <Typography display="flex" alignItems="center">
                    <CalendarToday sx={{ mr: 1 }} /> Fecha de Vencimiento:{" "}
                    {creditInfoData.dueDate}
                  </Typography>
                  <Typography display="flex" alignItems="center">
                    <AccessTime sx={{ mr: 1 }} /> Plazo Restante:{" "}
                    {creditInfoData.remainingTerm} meses
                  </Typography>
                </>
              ) : (
                <Skeleton variant="text" width="100%" height={50} />
              )}
            </Suspense>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card variant="outlined" sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Gestión de créditos
            </Typography>
            {/* Botones para abrir formulario en modal */}
            <Suspense fallback={<Skeleton variant="text" width="100%" />}>
              {creditInfoData ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenRequestModal}
                  >
                    Solicitar crédito
                  </Button>
                </>
              ) : (
                <Skeleton variant="text" width="100%" height={50} />
              )}
            </Suspense>
          </CardContent>
        </Card>
      </Grid>

      {/* Historial de pagos */}
      <Grid item xs={12} md={8}>
        <Card variant="outlined" sx={{ boxShadow: 3 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" color="primary" gutterBottom>
                Historial de Pagos
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleOpenModifyModal}
              >
                Modificar crédito
              </Button>
            </Box>
            <Suspense
              fallback={
                <Skeleton variant="rectangular" width="100%" height={300} />
              }
            >
              <div style={{ height: 300, width: "100%" }}>
                <PaymentHistoryTable />
              </div>
            </Suspense>
          </CardContent>
        </Card>
      </Grid>
      {/* Gráfico de Pagos */}
      <Grid item xs={12} md={4}>
        <Card variant="outlined" sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Estado de Pagos
            </Typography>
            <Suspense
              fallback={
                <Skeleton variant="circular" width={100} height={100} />
              }
            >
              <Chart
                options={chartOptions}
                series={series}
                type="pie"
                width="100%"
              />
            </Suspense>
            <Typography variant="body2" mt={2}>
              Pagado: $400, Pendiente: $100
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      {/* Modal para Solicitud de Crédito */}
      <Dialog open={openRequestModal} onClose={handleCloseRequestModal}>
        <DialogTitle>Solicitud de Crédito</DialogTitle>
        <DialogContent>
          <CreditForm type="request" onSubmit={handleRequestSubmit} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRequestModal} color="secondary">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Modificación de Crédito */}
      <Dialog open={openModifyModal} onClose={handleCloseModifyModal}>
        <DialogTitle>Modificación de Crédito</DialogTitle>
        <DialogContent>
          <CreditForm type="modify" onSubmit={handleModifySubmit} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModifyModal} color="secondary">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default CreditDetailModule;
