"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import {
  AttachFile,
  Money,
  AccountBalance,
  Receipt,
  CreditCard,
  Close,
  Payment,
} from "@mui/icons-material";
import {
  calcularDiasEnMora,
  calcularMora,
  formatCurrency,
  formatDateToISO,
  formatNameDate,
  formatNumber,
  redondearHaciaArriba,
} from "@/app/(DashboardLayout)/utilities/utils";
import { pagosService } from "@/services/paymentsService";
import { MetodoPago } from "@/interfaces/Cuota";
import { useNotification } from "@/contexts/NotificationContext";

const metodosPago: MetodoPago[] = [
  { id: 1, nombre: "EFECTIVO" },
  { id: 2, nombre: "TRANSFERENCIA" },
  { id: 3, nombre: "CONSIGNACIÓN" },
  { id: 4, nombre: "NEQUI/DAVIPLATA" },
];

const getMetodoIcon = (nombre: string) => {
  if (nombre === "EFECTIVO") return <Money fontSize="small" />;
  if (nombre.includes("TRANSFERENCIA")) return <AccountBalance fontSize="small" />;
  if (nombre.includes("CONSIGNACIÓN")) return <Receipt fontSize="small" />;
  return <CreditCard fontSize="small" />;
};

interface BulkPresPagosModalProps {
  open: boolean;
  onClose: () => void;
  creditId: number;
  idAsociado: number;
  presCuotas: any[];
  onSuccess: () => void;
  userInfo?: {
    nombres?: string;
    numeroDeIdentificacion?: string;
  };
}

export default function BulkPresPagosModal({
  open,
  onClose,
  creditId,
  idAsociado,
  presCuotas,
  onSuccess,
  userInfo,
}: BulkPresPagosModalProps) {
  const { showNotification } = useNotification();

  const pendingCuotas = useMemo(() => {
    return (presCuotas || [])
      .filter((c: any) => c.estado === "PENDIENTE")
      .sort((a: any, b: any) => a.numeroCuota - b.numeroCuota);
  }, [presCuotas]);

  const [selectedCuotaIds, setSelectedCuotaIds] = useState<number[]>([]);
  const [diaDePago, setDiaDePago] = useState<string>(formatDateToISO(new Date()));
  const [metodoPagoId, setMetodoPagoId] = useState<number>(1);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [incluirProteccion, setIncluirProteccion] = useState<boolean>(true);
  const [incluirMora, setIncluirMora] = useState<boolean>(true);
  const [observaciones, setObservaciones] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [progressIndex, setProgressIndex] = useState<number>(0);
  const [currentCuotaNum, setCurrentCuotaNum] = useState<number | null>(null);

  // Initialize selected cuotas on modal open
  useEffect(() => {
    if (open) {
      setSelectedCuotaIds(pendingCuotas.map((c: any) => c.id));
      setDiaDePago(formatDateToISO(new Date()));
      setMetodoPagoId(1);
      setComprobante(null);
      setIncluirProteccion(true);
      setIncluirMora(true);
      setObservaciones("");
      setLoading(false);
      setProgressIndex(0);
      setCurrentCuotaNum(null);
    }
  }, [open, pendingCuotas]);

  const handleToggleCuota = (id: number) => {
    setSelectedCuotaIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedCuotaIds(pendingCuotas.map((c: any) => c.id));
  };

  const handleDeselectAll = () => {
    setSelectedCuotaIds([]);
  };

  const handleSelectFirstN = (n: number) => {
    setSelectedCuotaIds(pendingCuotas.slice(0, n).map((c: any) => c.id));
  };

  // Calculations for selected cuotas
  const calculatedItems = useMemo(() => {
    return pendingCuotas.map((cuota: any) => {
      const isSelected = selectedCuotaIds.includes(cuota.id);
      const monto = Number(cuota.monto) || 0;
      const fechaVencimiento = cuota.fechaVencimiento
        ? formatDateToISO(cuota.fechaVencimiento)
        : "";

      const diasEnMora = incluirMora && fechaVencimiento && diaDePago
        ? calcularDiasEnMora(fechaVencimiento, diaDePago)
        : 0;

      const mora = incluirMora && diasEnMora > 0 && monto > 0
        ? calcularMora(monto, diasEnMora)
        : 0;

      const proteccionCartera = incluirProteccion
        ? (Number(cuota.proteccionCartera) || 0)
        : 0;

      const abonoCapital = Number(cuota.abonoCapital) || 0;
      const intereses = Number(cuota.intereses) || 0;
      const abonoExtra = 0;

      const totalCuota = redondearHaciaArriba(
        abonoCapital + intereses + proteccionCartera + mora + abonoExtra
      );

      return {
        cuota,
        isSelected,
        fechaVencimiento,
        diasEnMora,
        mora,
        proteccionCartera,
        abonoCapital,
        intereses,
        abonoExtra,
        totalCuota,
      };
    });
  }, [pendingCuotas, selectedCuotaIds, diaDePago, incluirMora, incluirProteccion]);

  const selectedCalculatedItems = useMemo(() => {
    return calculatedItems.filter((item) => item.isSelected);
  }, [calculatedItems]);

  const totalSum = useMemo(() => {
    return selectedCalculatedItems.reduce((sum, item) => sum + item.totalCuota, 0);
  }, [selectedCalculatedItems]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setComprobante(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (selectedCalculatedItems.length === 0) {
      showNotification("Debe seleccionar al menos una cuota para pagar", "warning");
      return;
    }

    if (metodoPagoId !== 1 && !comprobante) {
      showNotification("Debe adjuntar el comprobante de pago para este método", "warning");
      return;
    }

    setLoading(true);
    setProgressIndex(0);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedCalculatedItems.length; i++) {
      const item = selectedCalculatedItems[i];
      setProgressIndex(i + 1);
      setCurrentCuotaNum(item.cuota.numeroCuota);

      try {
        const formData = new FormData();
        if (comprobante && comprobante instanceof File) {
          formData.append("comprobante", comprobante);
        }
        formData.append("idCuota", String(item.cuota.id));
        formData.append("idPrestamo", String(creditId));
        formData.append("idAsociado", String(idAsociado));
        formData.append("metodoPagoId", String(metodoPagoId));
        formData.append("diaDePago", diaDePago);
        formData.append("diasEnMora", String(item.diasEnMora));
        formData.append("mora", String(item.mora));
        formData.append("abonoExtra", "0");
        formData.append("totalPagado", String(item.totalCuota));
        formData.append("abonoCapital", String(item.abonoCapital));
        formData.append("intereses", String(item.intereses));
        formData.append("proteccionCartera", String(item.proteccionCartera));
        formData.append("monto", String(item.cuota.monto || 0));
        formData.append("numCuota", String(item.cuota.numeroCuota || 0));
        formData.append("fechaVencimiento", String(item.fechaVencimiento || ""));
        formData.append("observaciones", observaciones || "");

        await pagosService.create(creditId, formData);
        successCount++;
      } catch (err) {
        console.error(`Error registrando pago cuota ${item.cuota.numeroCuota}:`, err);
        failCount++;
      }
    }

    setLoading(false);

    if (failCount === 0) {
      showNotification(
        `¡Se registraron exitosamente ${successCount} pago(s) en masa!`,
        "success"
      );
      onSuccess();
      onClose();
    } else {
      showNotification(
        `Se registraron ${successCount} pago(s), pero ${failCount} fallo(n).`,
        "warning"
      );
      onSuccess();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
          px: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: "rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Payment sx={{ color: "white" }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
              Registrar Pagos en Masa
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Crédito #{creditId} {userInfo?.nombres ? `— ${userInfo.nombres}` : ""}
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          disabled={loading}
          sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, bgcolor: "#f8fafc" }}>
        {pendingCuotas.length === 0 ? (
          <Alert severity="info" sx={{ mt: 1 }}>
            No hay cuotas pendientes por pagar en este crédito.
          </Alert>
        ) : (
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {/* Opciones Globales de Pago */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0" }}>
              <Typography variant="subtitle2" fontWeight={700} color="primary.main" gutterBottom>
                Configuración del Pago
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Día de Pago"
                    value={diaDePago}
                    onChange={(e) => setDiaDePago(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small" disabled={loading}>
                    <InputLabel>Método de Pago</InputLabel>
                    <Select
                      value={metodoPagoId}
                      label="Método de Pago"
                      onChange={(e) => setMetodoPagoId(Number(e.target.value))}
                    >
                      {metodosPago.map((metodo) => (
                        <MenuItem key={metodo.id} value={metodo.id}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getMetodoIcon(metodo.nombre)}
                            <span>{metodo.nombre}</span>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    size="small"
                    startIcon={<AttachFile />}
                    color={comprobante ? "success" : metodoPagoId !== 1 ? "warning" : "inherit"}
                    disabled={loading}
                    sx={{ height: 40, textTransform: "none" }}
                  >
                    {comprobante ? comprobante.name.substring(0, 15) + "..." : "Comprobante (opcional)"}
                    <input type="file" hidden accept="image/*,application/pdf" onChange={handleFileChange} />
                  </Button>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={incluirProteccion}
                        onChange={(e) => setIncluirProteccion(e.target.checked)}
                        disabled={loading}
                      />
                    }
                    label="Incluir Protección de Cartera"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={incluirMora}
                        onChange={(e) => setIncluirMora(e.target.checked)}
                        disabled={loading}
                      />
                    }
                    label="Incluir Mora (si aplica por fecha)"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Observaciones (opcional)"
                    placeholder="Nota u observación para todos los pagos en masa..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    disabled={loading}
                  />
                </Grid>              </Grid>
            </Paper>

            {/* Accesos rápidos de selección */}
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: "1px solid #e2e8f0" }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  Selección de Cuotas ({selectedCuotaIds.length} / {pendingCuotas.length} seleccionadas)
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button size="small" variant="text" onClick={handleSelectAll} disabled={loading}>
                    Todas
                  </Button>
                  {pendingCuotas.length >= 3 && (
                    <Button size="small" variant="text" onClick={() => handleSelectFirstN(3)} disabled={loading}>
                      Primeras 3
                    </Button>
                  )}
                  {pendingCuotas.length >= 6 && (
                    <Button size="small" variant="text" onClick={() => handleSelectFirstN(6)} disabled={loading}>
                      Primeras 6
                    </Button>
                  )}
                  {pendingCuotas.length >= 12 && (
                    <Button size="small" variant="text" onClick={() => handleSelectFirstN(12)} disabled={loading}>
                      Primeras 12
                    </Button>
                  )}
                  <Button size="small" variant="text" color="error" onClick={handleDeselectAll} disabled={loading}>
                    Desmarcar
                  </Button>
                </Stack>
              </Box>
            </Paper>

            {/* Tabla de cuotas pendientes */}
            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0", maxHeight: 300, overflowY: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={
                          selectedCuotaIds.length > 0 && selectedCuotaIds.length < pendingCuotas.length
                        }
                        checked={
                          pendingCuotas.length > 0 && selectedCuotaIds.length === pendingCuotas.length
                        }
                        onChange={(e) => (e.target.checked ? handleSelectAll() : handleDeselectAll())}
                        disabled={loading}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Cuota</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Vencimiento</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Capital</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Intereses</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Protección</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Mora</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calculatedItems.map((item) => (
                    <TableRow
                      key={item.cuota.id}
                      hover
                      onClick={() => !loading && handleToggleCuota(item.cuota.id)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: item.isSelected ? "rgba(15, 118, 110, 0.05)" : "inherit",
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={item.isSelected} disabled={loading} />
                      </TableCell>
                      <TableCell>
                        <Chip label={`#${item.cuota.numeroCuota}`} size="small" sx={{ fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>{formatNameDate(item.cuota.fechaVencimiento)}</TableCell>
                      <TableCell align="right">${formatCurrency(formatNumber(item.abonoCapital))}</TableCell>
                      <TableCell align="right">${formatCurrency(formatNumber(item.intereses))}</TableCell>
                      <TableCell align="right">
                        {item.proteccionCartera > 0
                          ? `$${formatCurrency(formatNumber(item.proteccionCartera))}`
                          : "-"}
                      </TableCell>
                      <TableCell align="right" sx={{ color: item.mora > 0 ? "error.main" : "text.secondary" }}>
                        {item.mora > 0 ? `$${formatCurrency(formatNumber(item.mora))}` : "-"}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "primary.main" }}>
                        ${formatCurrency(formatNumber(item.totalCuota))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Resumen Total */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#0f766e",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", textTransform: "uppercase" }}>
                  Resumen de Pago
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {selectedCalculatedItems.length} cuota(s) seleccionada(s)
                </Typography>
              </Box>

              <Box textAlign="right">
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", textTransform: "uppercase" }}>
                  Monto Total a Pagar
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  ${formatCurrency(formatNumber(totalSum))}
                </Typography>
              </Box>
            </Paper>

            {/* Progreso de guardado */}
            {loading && (
              <Box sx={{ width: "100%" }}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Registrando pago {progressIndex} de {selectedCalculatedItems.length}...
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="primary">
                    Cuota #{currentCuotaNum}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(progressIndex / selectedCalculatedItems.length) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: "#f1f5f9", justifyContent: "space-between" }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || selectedCalculatedItems.length === 0}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Payment />}
          sx={{ px: 3, textTransform: "none", fontWeight: 700 }}
        >
          {loading
            ? "Procesando..."
            : `Registrar ${selectedCalculatedItems.length} Pago(s) ($${formatCurrency(formatNumber(totalSum))})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
