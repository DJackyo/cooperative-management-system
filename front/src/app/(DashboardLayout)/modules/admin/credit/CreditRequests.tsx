import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Grid,
  // Modal,
  Box,
  Tooltip,
} from "@mui/material";
import {
  fetchCreditRequests,
  approveCreditRequest,
  rejectCreditRequest,
  fetchPaymentPlanByCreditId,
} from "@/services/creditRequestService";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import dynamic from 'next/dynamic';

const DynamicModal = dynamic(() => import('@mui/material/Modal'), {
  ssr: false, // Desactiva el prerenderizado para este componente
});

const CreditRequests = () => {
  const [creditRequests, setCreditRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest]: any = useState(null);
  const [paymentPlan, setPaymentPlan]: any = useState([]);

  useEffect(() => {
    const loadCreditRequests = async () => {
      const response = await fetchCreditRequests();
      setCreditRequests(response.data);
      setFilteredRequests(response.data);
    };
    loadCreditRequests();
  }, []);

  useEffect(() => {
    const filtered = creditRequests.filter((request: any) => {
      return (
        (filterName
          ? request.name.toLowerCase().includes(filterName.toLowerCase())
          : true) && (filterStatus ? request.status === filterStatus : true)
      );
    });
    setFilteredRequests(filtered);
  }, [filterName, filterStatus, creditRequests]);

  const handleApprove = async (id: number) => {
    await approveCreditRequest(id);
    setFilteredRequests((prevRequests: any) =>
      prevRequests.map((request: any) =>
        request.id === id ? { ...request, status: "aprobado" } : request
      )
    );
  };

  const handleReject = async (id: number) => {
    await rejectCreditRequest(id);
    setFilteredRequests((prevRequests: any) =>
      prevRequests.map((request: any) =>
        request.id === id ? { ...request, status: "rechazado" } : request
      )
    );
  };

  const handleViewPaymentPlan = async (request: any) => {
    try {
      const response = await fetchPaymentPlanByCreditId(request.id);
      console.log(response.data);
      setSelectedRequest(request);
      setPaymentPlan(response.data.paymentPlan); // Asegúrate de que esta ruta es correcta
      setModalOpen(true); // Abre el modal
    } catch (error) {
      console.error("Error al obtener el plan de pagos:", error);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
    setPaymentPlan([]); // Limpiar el plan de pagos al cerrar el modal
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12}>
        {/* Filtros en un Card separado */}
        <DashboardCard title="Filtros">
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Socio"
                variant="outlined"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estado"
                variant="outlined"
                select
                SelectProps={{
                  native: true,
                }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </TextField>
            </Grid>
          </Grid>
        </DashboardCard>
      </Grid>
      <Grid item xs={12} md={12}>
        {/* Tabla de solicitudes de crédito */}
        <DashboardCard title="Lista de Solicitudes de Crédito">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Nombre</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Monto Solicitado</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Fecha de Solicitud</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Estado</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Acciones</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.name}</TableCell>
                    <TableCell>{request.amountRequested}</TableCell>
                    <TableCell>{request.requestDate}</TableCell>
                    <TableCell>
                      <Typography
                        color={
                          request.status === "pendiente"
                            ? "orange"
                            : request.status === "aprobado"
                            ? "green"
                            : "red"
                        }
                      >
                        {request.status}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Aprobar">
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleApprove(request.id)}
                          disabled={request.status !== "pendiente"}
                        >
                          <CheckIcon />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Rechazar">
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleReject(request.id)}
                          disabled={request.status !== "pendiente"}
                          sx={{ marginLeft: 1 }}
                        >
                          <CloseIcon />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Ver plan de pagos">
                        <Button
                          variant="contained"
                          onClick={() => handleViewPaymentPlan(request)}
                          disabled={request.status !== "aprobado"}
                          sx={{ marginLeft: 1 }}
                        >
                          <VisibilityIcon />
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DashboardCard>
      </Grid>
      {/* Modal para mostrar detalles de la solicitud */}
      <DynamicModal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "40rem",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          {selectedRequest && (
            <>
              <Typography variant="h6" color="primary" gutterBottom>
                Detalles de Solicitud de Crédito
              </Typography>
              <Typography>
                <strong>Nombre:</strong> {selectedRequest.name}
              </Typography>
              <Typography>
                <strong>Monto Solicitado:</strong>{" "}
                {selectedRequest.amountRequested}
              </Typography>
              <Typography>
                <strong>Fecha de Solicitud:</strong>{" "}
                {selectedRequest.requestDate}
              </Typography>
              <Typography>
                <strong>Estado:</strong> {selectedRequest.status}
              </Typography>

              {/* Plan de Pagos */}
              <Typography
                variant="h6"
                color="primary"
                gutterBottom
                sx={{ mt: 2 }}
              >
                Plan de Pagos
              </Typography>
              {paymentPlan.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Número de Pago</TableCell>
                        <TableCell>Monto</TableCell>
                        <TableCell>Fecha de Vencimiento</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paymentPlan.map((payment: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{payment.amount}</TableCell>
                          <TableCell>{payment.dueDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>No hay plan de pagos disponible.</Typography>
              )}

              <Button
                variant="contained"
                onClick={handleCloseModal}
                sx={{ mt: 2 }}
              >
                Cerrar
              </Button>
            </>
          )}
        </Box>
      </DynamicModal>
    </Grid>
  );
};

export default CreditRequests;
