"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Swal from "sweetalert2";
import { IconCalculator, IconCreditCard } from "@tabler/icons-react";
import { creditsService } from "@/services/creditRequestService";
import { CreditoRetanqueable, RetanqueoDto } from "@/interfaces/Retanqueo";
import { formatCurrencyFixed } from "@/app/(DashboardLayout)/utilities/utils";

interface RetanqueoDialogProps {
  open: boolean;
  onClose: () => void;
  creditoOrigen: CreditoRetanqueable | null;
  onSuccess: () => void;
  tasas: any[];
  userId: number;
}

interface FormState {
  idAsociado: number;
  idPrestamoOrigen: number;
  montoNuevo: number | string;
  plazoMeses: number | string;
  idTasa: number | string;
  aplicaProteccionCartera: boolean;
  fechaCredito: Date | null;
  fechaDesembolso: Date | null;
  fechaVencimiento: Date | null;
  observaciones: string;
  estado: string;
}

const ESTADOS_RETANQUEO = [
  { value: "APROBADO", label: "Aprobado" },
  { value: "SOLICITADO", label: "Solicitado" },
];
const RetanqueoDialog: React.FC<RetanqueoDialogProps> = ({
  open,
  onClose,
  creditoOrigen,
  onSuccess,
  tasas,
  userId,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    idAsociado: userId,
    idPrestamoOrigen: 0,
    montoNuevo: "",
    plazoMeses: "",
    idTasa: "",
    aplicaProteccionCartera: true,
    fechaCredito: new Date(),
    fechaDesembolso: new Date(),
    fechaVencimiento: null,
    observaciones: "",
    estado: "APROBADO",
  });

  // El backend envuelve el calculo de liquidacion dentro de `liquidacion`
  const liquidacion = useMemo(
    () => (creditoOrigen as any)?.liquidacion ?? null,
    [creditoOrigen]
  );
  const totalALiquidar: number = Number(liquidacion?.totalALiquidar ?? 0);

  useEffect(() => {
    if (!creditoOrigen) return;

    const idAsociadoCredito =
      (creditoOrigen as any)?.idAsociado?.id ?? (creditoOrigen as any)?.idAsociado ?? userId;

    setFormData((prev) => ({
      ...prev,
      idAsociado: Number(idAsociadoCredito) || userId,
      idPrestamoOrigen: creditoOrigen.id,
      montoNuevo: "",
      plazoMeses: creditoOrigen.plazoMeses ?? "",
      idTasa: (creditoOrigen as any)?.idTasa?.id ?? "",
      aplicaProteccionCartera: creditoOrigen.aplicaProteccionCartera ?? true,
      fechaCredito: creditoOrigen.fechaCredito ? new Date(creditoOrigen.fechaCredito) : new Date(),
      fechaDesembolso: new Date(),
      fechaVencimiento: null,
      observaciones: "",
      estado: "APROBADO",
    }));
  }, [creditoOrigen, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // El Select de MUI entrega { name, value } directamente en el evento
  const handleSelectChange = (e: { target: { name?: string; value: unknown } }) => {
    const { name, value } = e.target;
    if (!name) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field: keyof FormState, value: Date | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const tasaSeleccionada = useMemo(
    () => tasas.find((t: any) => t.id === Number(formData.idTasa)),
    [tasas, formData.idTasa]
  );

  const montoNuevoNum = Number(formData.montoNuevo) || 0;
  const plazoMesesNum = Number(formData.plazoMeses) || 0;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.idPrestamoOrigen) {
      Swal.fire({
        icon: "warning",
        title: "Credito no seleccionado",
        text: "No se identifico el credito a retanquear.",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (!montoNuevoNum || montoNuevoNum <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Monto requerido",
        text: "Ingrese el monto del nuevo credito.",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (!plazoMesesNum || plazoMesesNum <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Plazo requerido",
        text: "Ingrese el plazo en meses del nuevo credito.",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (totalALiquidar > 0 && montoNuevoNum <= totalALiquidar) {
      Swal.fire({
        icon: "warning",
        title: "Monto insuficiente",
        text: `El nuevo monto debe ser mayor al saldo a liquidar ($${formatCurrencyFixed(totalALiquidar)}).`,
        confirmButtonText: "Entendido",
      });
      return;
    }

    const dto: RetanqueoDto = {
      idAsociado: formData.idAsociado,
      idPrestamoOrigen: formData.idPrestamoOrigen,
      montoNuevo: montoNuevoNum,
      plazoMeses: plazoMesesNum,
      idTasa: formData.idTasa === "" ? undefined : Number(formData.idTasa),
      aplicaProteccionCartera: formData.aplicaProteccionCartera,
      fechaCredito: formData.fechaCredito ?? undefined,
      fechaDesembolso: formData.fechaDesembolso ?? undefined,
      fechaVencimiento: formData.fechaVencimiento ?? undefined,
      observaciones: formData.observaciones || undefined,
      estado: formData.estado,
    };

    setLoading(true);
    try {
      Swal.fire({
        title: "Procesando retanqueo...",
        text: "Creando el nuevo credito y liquidando el credito original.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const result = await creditsService.procesarRetanqueo(dto);

      await Swal.fire({
        icon: "success",
        title: "Retanqueo exitoso",
        text: `El retanqueo del credito #${formData.idPrestamoOrigen} fue procesado correctamente.`,
        confirmButtonText: "Entendido",
        confirmButtonColor: "#4caf50",
      });

      onSuccess();
      onClose();
      return result;
    } catch (error: any) {
      console.error("Error al procesar retanqueo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "No se pudo procesar el retanqueo.",
        confirmButtonText: "Entendido",
      });
    } finally {
      setLoading(false);
    }
  };
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
          <IconCreditCard size={24} color="primary" />
          Retanqueo de Credito
        </DialogTitle>

        <Card>
          <CardContent sx={{ px: 4, pb: 2 }}>
            {creditoOrigen && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 1.5 }}>
                <Typography variant="body2">
                  Credito original #{creditoOrigen.id} -{" "}
                  {(creditoOrigen as any)?.idAsociado?.nombres || "N/A"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Estado: {creditoOrigen.estado}
                </Typography>
              </Alert>
            )}

            {totalALiquidar > 0 && (
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Saldo a liquidar
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      ${formatCurrencyFixed(totalALiquidar)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Monto minimo del nuevo credito
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="warning.main">
                      &gt; ${formatCurrencyFixed(totalALiquidar)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Monto Nuevo"
                  name="montoNuevo"
                  type="number"
                  value={formData.montoNuevo}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  slotProps={{ htmlInput: { min: 0, step: "any" } }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Plazo (meses)"
                  name="plazoMeses"
                  type="number"
                  value={formData.plazoMeses}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  slotProps={{ htmlInput: { min: 1, step: 1 } }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="retanqueo-tasa-label">Tasa de Interes</InputLabel>
                  <Select
                    labelId="retanqueo-tasa-label"
                    label="Tasa de Interes"
                    name="idTasa"
                    value={formData.idTasa}
                    onChange={handleSelectChange}
                  >
                    {tasas.map((t: any) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.tasa}% {t.anio ? `(${t.anio})` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                  {tasaSeleccionada && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      Tasa seleccionada: {tasaSeleccionada.tasa}%
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.aplicaProteccionCartera}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          aplicaProteccionCartera: e.target.checked,
                        }))
                      }
                      color="primary"
                    />
                  }
                  label="Aplicar Proteccion de Cartera"
                  labelPlacement="end"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Fecha de Credito"
                    value={formData.fechaCredito}
                    onChange={(v) => handleDateChange("fechaCredito", v)}
                    slotProps={{ textField: { fullWidth: true, size: "small" } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Fecha de Desembolso"
                    value={formData.fechaDesembolso}
                    onChange={(v) => handleDateChange("fechaDesembolso", v)}
                    slotProps={{ textField: { fullWidth: true, size: "small" } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Fecha Vencimiento (opcional)"
                    value={formData.fechaVencimiento}
                    onChange={(v) => handleDateChange("fechaVencimiento", v)}
                    slotProps={{ textField: { fullWidth: true, size: "small" } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>

            <TextField
              label="Observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              size="small"
              sx={{ mt: 2 }}
              placeholder="Ej: Retanqueo para ampliar cupo..."
            />

            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="retanqueo-estado-label">Estado</InputLabel>
                  <Select
                    labelId="retanqueo-estado-label"
                    label="Estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleSelectChange}
                  >
                    {ESTADOS_RETANQUEO.map((estado) => (
                      <MenuItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>

          <CardContent sx={{ px: 4, pb: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button type="button" onClick={onClose} color="inherit" disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={<IconCalculator size={18} />}
            >
              {loading ? "Procesando..." : "Confirmar Retanqueo"}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Dialog>
  );
};

export default RetanqueoDialog;