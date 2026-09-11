import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
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
  FormHelperText,
  CircularProgress,
  Stack,
  Divider,
  Chip,
  Avatar,
  InputAdornment,
  Collapse,
} from "@mui/material";
import {
  Info,
  AttachFile,
  CheckCircle,
  Warning,
  TrendingUp,
  CreditCard,
  Money,
  AccountBalance,
  Receipt,
  Settings,
  CalendarMonth,
  AccountBalanceWallet,
  EventAvailable,
  EventBusy,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import {
  calcularDiasEnMora,
  calcularMora,
  formatCurrency,
  formatDateToISO,
  formatNumber,
  numeroALetras,
  redondearHaciaArriba,
} from "@/app/(DashboardLayout)/utilities/utils";
import { pagosService } from "@/services/paymentsService";
import { MetodoPago } from "@/interfaces/Cuota";
import { useNotification } from "@/contexts/NotificationContext";
import ConfirmDialog from "@/components/ConfirmDialog";
import { authService } from "@/app/authentication/services/authService";

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

const messages = {
  invalid_type_error: "El valor debe ser un número válido",
  min: "El valor debe ser mayor o igual a 0",
};

const presPagosSchema = z.object({
  id: z.number().optional(),
  numeroCuota: z.number().min(1, "Número de cuota requerido"),
  fechaVencimiento: z.string().optional(),
  diaDePago: z.string().optional(),
  monto: z.number().min(0, messages.min),
  diasEnMora: z.number().min(0, messages.min).optional(),
  mora: z.number().optional(),
  totalPagar: z.number().optional(),
  estado: z.string().optional(),
  proteccionCartera: z.number().min(0, messages.min),
  abonoCapital: z.number().min(0, messages.min),
  intereses: z.number().min(0, messages.min),
  abonoExtra: z.number().min(0, messages.min),
});

type PresPagosFormData = z.infer<typeof presPagosSchema>;

interface PresPagosFormProps {
  pago?: PresPagosFormData;
  creditId: number;
  idAsociado: number;
  isEditMode?: boolean;
  pagoIdToEdit?: number;
  cuotas?: any[];
  onSuccess?: () => void;
  onClose?: () => void;
}

// Componente para campo de valor de solo lectura
const ReadOnlyField: React.FC<{
  label: string;
  value: number;
  bgColor: string;
  valueColor?: string;
  bold?: boolean;
}> = ({ label, value, bgColor, valueColor, bold }) => (
  <TextField
    fullWidth
    size="small"
    label={label}
    value={formatCurrency(value)}
    disabled
    sx={{
      "& .MuiOutlinedInput-root": {
        backgroundColor: bgColor,
        "&.Mui-disabled": { backgroundColor: bgColor },
      },
    }}
    InputProps={{
      startAdornment: <Typography sx={{ mr: 0.5, color: "text.secondary", fontSize: "0.85rem" }}>$</Typography>,
      sx: {
        textAlign: "right",
        fontWeight: bold ? 700 : 500,
        color: valueColor || "text.primary",
      },
      inputProps: { style: { textAlign: "right" } },
    }}
  />
);

export default function PresPagosForm({
  pago,
  creditId,
  idAsociado,
  isEditMode = false,
  pagoIdToEdit,
  cuotas = [],
  onSuccess,
  onClose,
}: PresPagosFormProps) {
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  const [incluirProteccion, setIncluirProteccion] = useState(true);
  const [incluirMora, setIncluirMora] = useState(true);
  const [editarDiasMora, setEditarDiasMora] = useState(false);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [confirmacion, setConfirmacion] = useState(false);
  const [mostrarOpcionesAvanzadas, setMostrarOpcionesAvanzadas] = useState(false);
  const { showNotification } = useNotification();

  const userRoles = authService.getUserRoles();
  const isSuperAdmin = userRoles?.includes("ADMINISTRADOR");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<PresPagosFormData>({
    resolver: zodResolver(presPagosSchema),
    defaultValues: {
      ...pago,
      diaDePago: pago?.diaDePago || new Date().toISOString().split("T")[0],
      abonoExtra: pago?.abonoExtra || 0,
    },
  });

  const monto = watch("monto", 0);
  const fechaVencimiento = watch("fechaVencimiento");
  const diaDePago = watch("diaDePago");
  const proteccionCartera = watch("proteccionCartera", 0);
  const abonoCapital = watch("abonoCapital", 0);
  const intereses = watch("intereses", 0);
  const mora = watch("mora", 0);
  const abonoExtra = watch("abonoExtra", 0) || 0;
  const totalPagar = watch("totalPagar") || 0;
  const diasEnMoraValue = watch("diasEnMora", 0) ?? 0;

  useEffect(() => {
    if (pago) {
      if ((pago as any).metodoPagoId) {
        setMetodoSeleccionado((pago as any).metodoPagoId);
      } else if ((pago as any).presPagos?.[0]?.metodoPago?.id) {
        setMetodoSeleccionado((pago as any).presPagos[0].metodoPago.id);
      }

      if (typeof pago.proteccionCartera === "number" && pago.proteccionCartera <= 0) {
        setIncluirProteccion(false);
      } else if (typeof pago.proteccionCartera === "number" && pago.proteccionCartera > 0) {
        setIncluirProteccion(true);
      }

      const formattedData: Record<string, any> = {};
      Object.keys(pago).forEach((key) => {
        const valor = pago[key as keyof PresPagosFormData];
        if (typeof valor === "number") {
          formattedData[key] = formatNumber(redondearHaciaArriba(valor));
        } else if (
          typeof valor === "string" &&
          (key.toLowerCase().includes("fecha") || key.toLowerCase().includes("dia") || !isNaN(Date.parse(valor)))
        ) {
          formattedData[key] = formatDateToISO(valor);
        } else {
          formattedData[key] = valor;
        }
      });

      if (!formattedData.diaDePago) {
        formattedData.diaDePago = formatDateToISO(new Date());
      }

      reset(formattedData);
    }
  }, [pago, reset]);

  useEffect(() => {
    const numMonto = Number(monto) || 0;

    if (!editarDiasMora) {
      if (fechaVencimiento && diaDePago) {
        const dias = calcularDiasEnMora(fechaVencimiento, diaDePago);
        setValue("diasEnMora", dias);
        const valorMora = dias > 0 && numMonto > 0 ? calcularMora(numMonto, dias) : 0;
        setValue("mora", valorMora);
      }
    } else {
      const dias = Number(diasEnMoraValue) || 0;
      const valorMora = dias > 0 && numMonto > 0 ? calcularMora(numMonto, dias) : 0;
      setValue("mora", valorMora);
    }
  }, [fechaVencimiento, diaDePago, monto, editarDiasMora, diasEnMoraValue, setValue]);

  useEffect(() => {
    const numMora = incluirMora ? Number(mora) || 0 : 0;
    const numIntereses = Number(intereses) || 0;
    const numAbonoCapital = Number(abonoCapital) || 0;
    const numAbonoExtra = Number(abonoExtra) || 0;
    const numProteccion = incluirProteccion ? Number(proteccionCartera) || 0 : 0;

    const total = numMora + numIntereses + numAbonoCapital + numAbonoExtra + numProteccion;
    setValue("totalPagar", total);
  }, [mora, abonoCapital, intereses, abonoExtra, proteccionCartera, incluirProteccion, incluirMora, setValue]);

  const onSubmit = async (data: any) => {
    if (metodoSeleccionado === "" || typeof metodoSeleccionado !== "number") {
      showNotification("Debe seleccionar un método de pago", "warning");
      return;
    }
    if (metodoSeleccionado !== 1 && !comprobante && !isEditMode) {
      showNotification("Debe adjuntar el comprobante de pago", "warning");
      return;
    }
    setPendingData(data);
    setShowConfirm(true);
  };

  const handleConfirmPayment = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const formData = new FormData();
      if (comprobante && comprobante instanceof File) {
        formData.append("comprobante", comprobante);
      }
      formData.append("idCuota", String(pago?.id || ""));
      formData.append("idPrestamo", String(creditId));
      formData.append("idAsociado", String(idAsociado));
      formData.append("metodoPagoId", String(metodoSeleccionado));
      formData.append("diaDePago", pendingData.diaDePago);
      formData.append("diasEnMora", String(incluirMora ? (pendingData.diasEnMora || 0) : 0));
      formData.append("mora", String(incluirMora ? (pendingData.mora || 0) : 0));
      formData.append("abonoExtra", String(pendingData.abonoExtra || 0));
      formData.append("totalPagado", String(pendingData.totalPagar || 0));
      formData.append("abonoCapital", String(pendingData.abonoCapital || 0));
      formData.append("intereses", String(pendingData.intereses || 0));
      formData.append("proteccionCartera", String(incluirProteccion ? (pendingData.proteccionCartera || 0) : 0));
      formData.append("monto", String(pago?.monto || 0));
      formData.append("numCuota", String(pago?.numeroCuota || 0));
      formData.append("fechaVencimiento", String(pago?.fechaVencimiento || ""));

      let pagoRequest;
      if (isEditMode && pagoIdToEdit) {
        pagoRequest = await pagosService.update(pagoIdToEdit, formData);
      } else {
        pagoRequest = await pagosService.create(creditId, formData);
      }

      if (pagoRequest) {
        showNotification(
          isEditMode ? "Pago actualizado exitosamente" : "Pago registrado exitosamente",
          "success"
        );
        onSuccess?.();
      } else {
        showNotification(
          isEditMode ? "Error al actualizar el pago" : "Error al registrar el pago",
          "error"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification(
        isEditMode
          ? "Error al actualizar el pago. Intente nuevamente."
          : "Error al registrar el pago. Intente nuevamente.",
        "error"
      );
    } finally {
      setLoading(false);
      setPendingData(null);
    }
  };

  const handleChange: any = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newValue = event.target.value as number;
    setMetodoSeleccionado(newValue);
    if (newValue === 1) setComprobante(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification("El archivo no debe superar 5MB", "warning");
        return;
      }
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        showNotification("Solo se permiten archivos JPG, PNG o PDF", "warning");
        return;
      }
      setComprobante(file);
    }
  };

  const hasMora = Number(mora) > 0;
  const hasAbonoExtra = abonoExtra > 0;
  const isEfectivo = metodoSeleccionado === 1;

  const cuotaNumActual = pago?.numeroCuota || 1;

  // Cuotas pendientes relevantes a partir de esta cuota
  const cuotasRelevantes = cuotas.filter((c: any) => {
    if (c.numeroCuota < cuotaNumActual) return false;
    if (c.estado === "CANCELADO") return false;
    if (c.numeroCuota === cuotaNumActual) return true;
    return c.estado === "PENDIENTE";
  });

  const capitalAbonadoActual = Math.round(Number(abonoCapital) || 0);
  const abonoExtraActual = Math.round(Number(abonoExtra) || 0);

  // Amortización: Saldo de capital pendiente actual (suma del abono a capital de las cuotas restantes)
  const saldoCapitalPendiente = Math.round(
    cuotasRelevantes.reduce((sum: number, c: any) => {
      const cap = Number(c.abonoCapital) > 0 ? Number(c.abonoCapital) : Number(c.monto) || 0;
      return sum + cap;
    }, 0)
  );

  // Total de capital amortizado en este pago (Abono a capital + Abono extra)
  const capitalDeducido = capitalAbonadoActual + abonoExtraActual;

  // Saldo de capital pendiente proyectado tras este pago
  let saldoCapitalProyectado = Math.max(0, saldoCapitalPendiente - capitalDeducido);

  // Si la diferencia restante es de $100 pesos o menos (desfasamiento por centavos/redondeos de tabla), el saldo es $0 (Crédito Cancelado)
  if (saldoCapitalProyectado <= 100) {
    saldoCapitalProyectado = 0;
  } else {
    saldoCapitalProyectado = Math.round(saldoCapitalProyectado);
  }

  const totalPendienteCredito = saldoCapitalPendiente;
  const saldoPendienteRecalculado = saldoCapitalProyectado;

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {/* Header con información de la cuota */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: 2,
          background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 150,
            height: 150,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.05)",
          }}
        />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.15)", width: 44, height: 44 }}>
              <CalendarMonth sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 0.8, lineHeight: 1 }}>
                {isEditMode ? "Editar Pago" : "Registrar Pago"}
              </Typography>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                Cuota #{pago?.numeroCuota || "-"}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                <EventBusy sx={{ fontSize: 14, opacity: 0.9 }} />
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Vence: {fechaVencimiento
                    ? new Date(formatDateToISO(fechaVencimiento) + "T00:00:00").toLocaleDateString("es-CO", {
                        timeZone: "America/Bogota",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "-"}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} alignItems={{ xs: "flex-start", sm: "center" }}>
            {totalPendienteCredito > 0 && (
              <Box textAlign={{ xs: "left", sm: "right" }}>
                <Typography variant="caption" sx={{ opacity: 0.85, display: "block", letterSpacing: 0.5 }}>
                  SALDO CAPITAL PENDIENTE
                </Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#ffd54f" }}>
                  ${formatCurrency(totalPendienteCredito)}
                </Typography>
              </Box>
            )}

            <Box textAlign={{ xs: "left", sm: "right" }}>
              <Typography variant="caption" sx={{ opacity: 0.85, display: "block", letterSpacing: 0.5 }}>
                VALOR CUOTA
              </Typography>
              <Typography variant="h5" fontWeight={800}>
                ${formatCurrency(monto)}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      {/* Chip de estado + Opciones avanzadas */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
        flexWrap="wrap"
        gap={1}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {hasMora && incluirMora && (
            <Chip
              size="small"
              icon={<Warning sx={{ fontSize: 14 }} />}
              label={`Con mora: ${diasEnMoraValue} días`}
              color="error"
              variant="outlined"
            />
          )}
          {hasAbonoExtra && (
            <Chip
              size="small"
              icon={<TrendingUp sx={{ fontSize: 14 }} />}
              label={`Abono extra: $${formatCurrency(abonoExtra)}`}
              sx={{ borderColor: "#ab47bc", color: "#ab47bc" }}
              variant="outlined"
            />
          )}
          {!hasMora && !hasAbonoExtra && (
            <Chip
              size="small"
              icon={<CheckCircle sx={{ fontSize: 14 }} />}
              label="Sin mora ni abonos extra"
              color="success"
              variant="outlined"
            />
          )}
        </Stack>

        {isSuperAdmin && (
          <Button
            size="small"
            variant="text"
            startIcon={<Settings sx={{ fontSize: 16 }} />}
            endIcon={mostrarOpcionesAvanzadas ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setMostrarOpcionesAvanzadas(!mostrarOpcionesAvanzadas)}
            sx={{ textTransform: "none", fontSize: 12 }}
          >
            Opciones avanzadas
          </Button>
        )}
      </Stack>

      <Alert
        severity="info"
        icon={<Info fontSize="small" />}
        sx={{ mb: 2, py: 0.5, borderRadius: 1.5, "& .MuiAlert-message": { fontSize: "0.78rem" } }}
      >
        El <strong>Total a Pagar</strong> = Abono Capital + Intereses
        {incluirMora && hasMora && " + Mora"}
        {incluirProteccion && " + Protección"}
        {hasAbonoExtra && " + Abono Extra"}
      </Alert>

      <Grid container spacing={2}>
        {/* SECCIÓN 1: Fechas */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main" }}>
                <CalendarMonth sx={{ fontSize: 16 }} />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={700}>
                Fechas
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Vencimiento"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register("fechaVencimiento")}
                  disabled
                  sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fafc" } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Día de Pago *"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register("diaDePago")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box>
                  <TextField
                    fullWidth
                    size="small"
                    label="Días en Mora"
                    type="number"
                    {...register("diasEnMora", {
                      valueAsNumber: true,
                      setValueAs: (v) => (v === "" || isNaN(v) ? 0 : Number(v)),
                    })}
                    onFocus={(e) => e.target.select()}
                    error={!!errors.diasEnMora}
                    helperText={errors.diasEnMora?.message}
                    disabled={!editarDiasMora}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: editarDiasMora ? "#fff3e0" : "#f8fafc",
                      },
                    }}
                    InputProps={{
                      inputProps: { style: { textAlign: "right" } },
                      sx: {
                        color: Number(diasEnMoraValue) > 0 ? "error.main" : "inherit",
                        fontWeight: Number(diasEnMoraValue) > 0 ? 700 : 400,
                      },
                    }}
                  />
                  {isSuperAdmin && mostrarOpcionesAvanzadas && (
                    <Collapse in={mostrarOpcionesAvanzadas}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={editarDiasMora}
                            onChange={(e) => setEditarDiasMora(e.target.checked)}
                            size="small"
                          />
                        }
                        label={<Typography variant="caption">Editar manualmente</Typography>}
                        sx={{ mt: 0.5, ml: 0 }}
                      />
                    </Collapse>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* SECCIÓN 2: Desglose de valores */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: "success.main" }}>
                <AccountBalanceWallet sx={{ fontSize: 16 }} />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={700}>
                Desglose del Pago
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ReadOnlyField label="Abono a Capital" value={abonoCapital} bgColor="#e8f5e9" bold />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ReadOnlyField label="Intereses" value={intereses} bgColor="#e3f2fd" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <ReadOnlyField
                    label="Protección Cartera"
                    value={proteccionCartera}
                    bgColor={incluirProteccion ? "#e3f2fd" : "#f8fafc"}
                  />
                  {isSuperAdmin && mostrarOpcionesAvanzadas && (
                    <Collapse in={mostrarOpcionesAvanzadas}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={incluirProteccion}
                            onChange={(e) => setIncluirProteccion(e.target.checked)}
                            size="small"
                          />
                        }
                        label={<Typography variant="caption">Incluir en el pago</Typography>}
                        sx={{ mt: 0.5, ml: 0 }}
                      />
                    </Collapse>
                  )}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <ReadOnlyField
                    label="Mora"
                    value={mora || 0}
                    bgColor={incluirMora ? (hasMora ? "#ffebee" : "#fff3e0") : "#f8fafc"}
                    valueColor={hasMora && incluirMora ? "error.main" : undefined}
                    bold={hasMora && incluirMora}
                  />
                  {isSuperAdmin && mostrarOpcionesAvanzadas && (
                    <Collapse in={mostrarOpcionesAvanzadas}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={incluirMora}
                            onChange={(e) => setIncluirMora(e.target.checked)}
                            size="small"
                          />
                        }
                        label={<Typography variant="caption">Incluir en el pago</Typography>}
                        sx={{ mt: 0.5, ml: 0 }}
                      />
                    </Collapse>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Abono Extra */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 1.5,
                bgcolor: "#f3e5f5",
                border: "1px solid #ab47bc40",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <TrendingUp sx={{ color: "#ab47bc", fontSize: 18 }} />
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#ab47bc" }}>
                  Abono Extra a Capital
                </Typography>
                {hasAbonoExtra && (
                  <Chip
                    size="small"
                    label="Aplicado"
                    sx={{ bgcolor: "#ab47bc", color: "white", height: 20, fontSize: 10 }}
                  />
                )}
              </Stack>

              <Grid container spacing={1.5} alignItems="center">
                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    {...register("abonoExtra", {
                      valueAsNumber: true,
                      setValueAs: (v) => (v === "" || isNaN(v) ? 0 : Number(v)),
                    })}
                    onFocus={(e) => e.target.select()}
                    error={!!errors.abonoExtra}
                    placeholder="0"
                    sx={{ bgcolor: "white", "& .MuiOutlinedInput-root": { bgcolor: "white" } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ color: "#ab47bc", fontWeight: 700 }}>$</Typography>
                        </InputAdornment>
                      ),
                      inputProps: { style: { textAlign: "right", fontSize: "1rem", fontWeight: 600 } },
                    }}
                  />
                  {errors.abonoExtra?.message && (
                    <FormHelperText error>{errors.abonoExtra.message}</FormHelperText>
                  )}
                </Grid>
                {hasAbonoExtra && (
                  <Grid size={{ xs: 12, sm: 7 }}>
                    <Box
                      sx={{
                        p: 1.25,
                        bgcolor: "rgba(171, 71, 188, 0.06)",
                        borderRadius: 1,
                        border: "1px dashed #ab47bc60",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#7e22ce",
                          fontStyle: "italic",
                          fontWeight: 600,
                          display: "block",
                        }}
                      >
                        {numeroALetras(abonoExtra, true)}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* SECCIÓN 3: Método de pago + Total */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main" }}>
                <CreditCard sx={{ fontSize: 16 }} />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={700}>
                Método de Pago
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2} alignItems="stretch">
              <Grid size={{ xs: 12, md: 7 }}>
                <FormControl fullWidth size="small" required error={!metodoSeleccionado}>
                  <InputLabel id="metodo-pago-label">Método de Pago *</InputLabel>
                  <Select
                    labelId="metodo-pago-label"
                    id="metodo-pago"
                    value={metodoSeleccionado}
                    onChange={handleChange}
                    label="Método de Pago *"
                  >
                    {metodosPago.map((metodo) => (
                      <MenuItem key={metodo.id} value={metodo.id}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {getMetodoIcon(metodo.nombre)}
                          <Typography variant="body2">{metodo.nombre}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                  {!metodoSeleccionado && (
                    <FormHelperText error>Seleccione un método de pago</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    height: "100%",
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    minHeight: 56,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, letterSpacing: 0.8, fontSize: 10 }}
                  >
                    TOTAL A PAGAR
                  </Typography>
                  <Typography variant="h5" sx={{ color: "white", fontWeight: 800, lineHeight: 1.1 }}>
                    ${formatCurrency(totalPagar)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Comprobante */}
            <Collapse in={!!metodoSeleccionado && !isEfectivo}>
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: "#fff7ed",
                  border: "1px dashed #fb923c",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <AttachFile sx={{ color: "#ea580c", fontSize: 18 }} />
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#ea580c" }}>
                    Comprobante Requerido
                  </Typography>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
                  <Button
                    variant={comprobante ? "outlined" : "contained"}
                    component="label"
                    startIcon={comprobante ? <CheckCircle /> : <AttachFile />}
                    color={comprobante ? "success" : "primary"}
                    size="small"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    {comprobante ? "Cambiar archivo" : "Adjuntar comprobante *"}
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={handleFileChange}
                    />
                  </Button>

                  {comprobante && (
                    <Chip
                      icon={<CheckCircle sx={{ fontSize: 14 }} />}
                      label={`${comprobante.name} (${(comprobante.size / 1024).toFixed(1)} KB)`}
                      color="success"
                      variant="outlined"
                      size="small"
                      sx={{ maxWidth: "100%" }}
                    />
                  )}
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", fontSize: 11 }}>
                  <Info sx={{ fontSize: 12, verticalAlign: "middle", mr: 0.3 }} />
                  Formatos: JPG, PNG, PDF · Máx. 5MB
                </Typography>
              </Box>
            </Collapse>
          </Paper>
        </Grid>

        {/* Resumen proyectado del Saldo Pendiente */}
        {totalPendienteCredito > 0 && (
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: saldoPendienteRecalculado === 0 ? "#f0fdf4" : "#e0f2fe",
                border: "1px solid",
                borderColor: saldoPendienteRecalculado === 0 ? "#16a34a40" : "#0284c740",
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: saldoPendienteRecalculado === 0 ? "#15803d" : "#0369a1",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Proyección de Saldo
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{ color: saldoPendienteRecalculado === 0 ? "#166534" : "#0c4a6e" }}
                  >
                    {saldoPendienteRecalculado === 0
                      ? "¡El crédito quedará totalmente CANCELADO!"
                      : "Saldo pendiente proyectado tras este pago"}
                  </Typography>
                </Box>

                <Stack direction="row" alignItems="baseline" spacing={1}>
                  <Typography variant="caption" sx={{ color: "text.secondary", textDecoration: "line-through" }}>
                    ${formatCurrency(totalPendienteCredito)}
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{ color: saldoPendienteRecalculado === 0 ? "#16a34a" : "#0284c7" }}
                  >
                    ${formatCurrency(saldoPendienteRecalculado)}
                  </Typography>
                </Stack>
              </Stack>
              {(capitalAbonadoActual > 0 || abonoExtraActual > 0) && (
                <Typography
                  variant="caption"
                  sx={{
                    color: saldoPendienteRecalculado === 0 ? "#15803d" : "#0369a1",
                    display: "block",
                    mt: 0.5,
                    fontStyle: "italic",
                  }}
                >
                  * Deduce ${formatCurrency(capitalAbonadoActual)} (Abono a capital)
                  {abonoExtraActual > 0 && ` + $${formatCurrency(abonoExtraActual)} (Abono extra)`} del saldo actual.
                </Typography>
              )}
            </Paper>
          </Grid>
        )}

        {/* Confirmación */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: "1px solid",
              borderColor: confirmacion ? "success.main" : "divider",
              bgcolor: confirmacion ? "#f0fdf4" : "#fafafa",
              transition: "all 0.2s",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={confirmacion}
                  onChange={(e) => setConfirmacion(e.target.checked)}
                  color="success"
                />
              }
              label={
                <Typography variant="body2">
                  <strong>Confirmo</strong> que los datos del pago son correctos
                  {!isEfectivo && metodoSeleccionado && " y he verificado el comprobante"}
                </Typography>
              }
            />
          </Paper>
        </Grid>

        {/* Botones */}
        <Grid size={{ xs: 12 }}>
          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            spacing={1.5}
            justifyContent="flex-end"
          >
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={loading}
              size="large"
              sx={{ textTransform: "none", minWidth: 120, borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !confirmacion}
              size="large"
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{
                textTransform: "none",
                minWidth: 160,
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              {loading ? "Procesando..." : isEditMode ? "Guardar Cambios" : "Registrar Pago"}
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={showConfirm}
        title={isEditMode ? "Confirmar Edición de Pago" : "Confirmar Pago"}
        message={
          isEditMode
            ? `¿Está seguro de guardar los cambios en este pago por $${formatCurrency(totalPagar)} pesos?`
            : `¿Está seguro de registrar el pago por $${formatCurrency(totalPagar)} pesos?`
        }
        type="warning"
        confirmText={isEditMode ? "Guardar Cambios" : "Registrar Pago"}
        cancelText="Cancelar"
        onConfirm={handleConfirmPayment}
        onCancel={() => setShowConfirm(false)}
      />
    </Box>
  );
}