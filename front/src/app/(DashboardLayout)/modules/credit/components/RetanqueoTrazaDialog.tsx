"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import Swal from "sweetalert2";
import {
  IconDownload,
  IconEye,
  IconFileTypePdf,
  IconHistory,
} from "@tabler/icons-react";
import { creditsService } from "@/services/creditRequestService";
import { TrazaRetanqueo } from "@/interfaces/Retanqueo";

interface RetanqueoTrazaDialogProps {
  open: boolean;
  onClose: () => void;
  idPrestamo?: number | null;
}

const formatMonto = (valor: number | null | undefined) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(valor ?? 0));

const formatFecha = (valor: string | null | undefined) => {
  if (!valor) return "-";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "-";
  return fecha.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getEstadoColor = (
  estado: string | null
): "success" | "warning" | "error" | "default" => {
  switch (estado) {
    case "APROBADO":
      return "success";
    case "SOLICITADO":
      return "warning";
    case "RECHAZADO":
      return "error";
    default:
      return "default";
  }
};

const RetanqueoTrazaDialog: React.FC<RetanqueoTrazaDialogProps> = ({
  open,
  onClose,
  idPrestamo,
}) => {
  const [trazas, setTrazas] = useState<TrazaRetanqueo[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);

  const cargarTrazas = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = idPrestamo
        ? await creditsService.getRetanqueosDePrestamo(idPrestamo)
        : await creditsService.getRetanqueos();
      setTrazas(data);
    } catch (error: any) {
      setErrorMsg(error?.message || "No se pudieron cargar las trazas de retanqueo");
    } finally {
      setLoading(false);
    }
  }, [idPrestamo]);

  useEffect(() => {
    if (open) {
      cargarTrazas();
    }
  }, [open, cargarTrazas]);
  const handleVerRecibo = async (traza: TrazaRetanqueo) => {
    setPdfLoadingId(traza.id);
    try {
      await creditsService.abrirReciboRetanqueoPDF(traza.id, traza.numeroRecibo);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error al abrir el recibo",
        text: error?.message || "No se pudo generar el recibo PDF",
        confirmButtonText: "Entendido",
      });
    } finally {
      setPdfLoadingId(null);
    }
  };

  const handleDescargarRecibo = async (traza: TrazaRetanqueo) => {
    setPdfLoadingId(traza.id);
    try {
      await creditsService.descargarReciboRetanqueoPDF(traza.id, traza.numeroRecibo);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error al descargar el recibo",
        text: error?.message || "No se pudo descargar el recibo PDF",
        confirmButtonText: "Entendido",
      });
    } finally {
      setPdfLoadingId(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
        <IconHistory size={22} color="#1976d2" />
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Trazas de retanqueo
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {idPrestamo
              ? `Historial de retanqueos del crédito #${idPrestamo}`
              : "Historial de todos los retanqueos realizados"}
          </Typography>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : errorMsg ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMsg}
          </Alert>
        ) : trazas.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="body1" color="text.secondary">
              No hay trazas de retanqueo registradas
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                    Recibo
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                    Fecha
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                    Créditos (origen → nuevo)
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                    Monto origen
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                    Monto nuevo
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                    Saldo liquidado
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                    Desembolso neto
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                    Estado
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }}>
                    Recibo PDF
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trazas.map((traza) => {
                  const idOrigen =
                    typeof traza.idPrestamoOrigen === "object"
                      ? traza.idPrestamoOrigen?.id
                      : traza.idPrestamoOrigen;
                  const idNuevo =
                    typeof traza.idPrestamoNuevo === "object"
                      ? traza.idPrestamoNuevo?.id
                      : traza.idPrestamoNuevo;

                  return (
                    <TableRow key={traza.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {traza.numeroRecibo || `RTQ-${traza.id}`}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatFecha(traza.fechaRetanqueo)}</TableCell>
                      <TableCell>
                        #{idOrigen} → #{idNuevo}
                      </TableCell>
                      <TableCell align="right">
                        {formatMonto(traza.montoOrigen)}
                      </TableCell>
                      <TableCell align="right">
                        {formatMonto(traza.montoNuevo)}
                      </TableCell>
                      <TableCell align="right">
                        {formatMonto(traza.saldoLiquidado)}
                      </TableCell>
                      <TableCell align="right">
                        {formatMonto(traza.desembolsoNeto)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={traza.estado || "-"}
                          color={getEstadoColor(traza.estado)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="center"
                        >
                          <Tooltip title="Ver recibo" arrow>
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                disabled={pdfLoadingId === traza.id}
                                onClick={() => handleVerRecibo(traza)}
                              >
                                {pdfLoadingId === traza.id ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <IconEye size={18} />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Descargar recibo" arrow>
                            <span>
                              <IconButton
                                size="small"
                                color="success"
                                disabled={pdfLoadingId === traza.id}
                                onClick={() => handleDescargarRecibo(traza)}
                              >
                                <IconDownload size={18} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cerrar
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<IconFileTypePdf size={16} />}
          onClick={cargarTrazas}
          disabled={loading}
        >
          Actualizar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RetanqueoTrazaDialog;




