import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Checkbox, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, TextField, Typography, Paper, Alert, FormHelperText, CircularProgress } from "@mui/material";
import { Info, AccountBalanceWallet, CalendarMonth, AttachFile, CheckCircle, Shield, Warning, TrendingUp, CreditCard, Money, AccountBalance, Receipt, Settings } from "@mui/icons-material";
import { calcularDiasEnMora, calcularMora, formatCurrency, formatNameDate, formatNumber, numeroALetras, redondearHaciaArriba } from "@/app/(DashboardLayout)/utilities/utils";
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

const messages = {
  invalid_type_error: "El valor debe ser un número válido",
  min: "El valor debe ser mayor o igual a 0",
};
// 📌 Definir esquema de validación con Zod
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

// 📌 Tipado de datos (TypeScript)
type PresPagosFormData = z.infer<typeof presPagosSchema>;

// 📌 Tipado de Props
interface PresPagosFormProps {
  pago?: PresPagosFormData;
  creditId: number;
  idAsociado: number;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function PresPagosForm({ pago, creditId, idAsociado, onSuccess, onClose }: PresPagosFormProps) {
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  const [incluirProteccion, setIncluirProteccion] = useState(true); // Por defecto incluida
  const [incluirMora, setIncluirMora] = useState(true); // Por defecto incluida
  const [editarDiasMora, setEditarDiasMora] = useState(false); // Habilitar edición manual
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [confirmacion, setConfirmacion] = useState(false); // Confirmación del usuario
  const [mostrarOpcionesAvanzadas, setMostrarOpcionesAvanzadas] = useState(false); // Mostrar/ocultar checkboxes
  const { showNotification } = useNotification();

  // Verificar si el usuario es SUPERADMIN
  const userRoles = authService.getUserRoles();
  const isSuperAdmin = userRoles?.includes("ADMINISTRADOR");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PresPagosFormData>({
    resolver: zodResolver(presPagosSchema),
    defaultValues: {
      ...pago,
      diaDePago: pago?.diaDePago || new Date().toISOString().split("T")[0], // 📌 Por defecto: hoy
      abonoExtra: pago?.abonoExtra || 0,
    },
  });

  // 📌 Obtener valores dinámicos
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

  // 📌 Cargar valores de `pago` en el formulario cuando cambie
  useEffect(() => {
    if (pago) {
      Object.keys(pago).forEach((key) => {
        const valor = pago[key as keyof PresPagosFormData];

        // 📌 Si es un número, redondear hacia arriba
        if (typeof valor === "number") {
          setValue(key as keyof PresPagosFormData, formatNumber(redondearHaciaArriba(valor)));
        }
        // 📌 Si es una fecha en formato string, asegurarse de que sea un string válido
        else if (typeof valor === "string" && !isNaN(Date.parse(valor))) {
          setValue(key as keyof PresPagosFormData, valor.split("T")[0]); // Solo la parte YYYY-MM-DD
        }
        // 📌 Si es un string o boolean, asignarlo sin cambios
        else {
          setValue(key as keyof PresPagosFormData, valor);
        }
      });

      if (fechaVencimiento && diaDePago) {
        const diasEnMora = calcularDiasEnMora(fechaVencimiento, diaDePago);
        setValue("diasEnMora", diasEnMora);

        // 📌 Calcular mora si `diasEnMora` > 0
        if (diasEnMora > 0 && monto > 0) {
          const moraCalculada = calcularMora(monto, diasEnMora);
          setValue("mora", moraCalculada);
        } else {
          setValue("mora", 0);
        }
      }
    }
  }, [pago, fechaVencimiento, diaDePago, monto, setValue]);

  // 📌 Recalcular mora cuando cambien los días en mora manualmente
  useEffect(() => {
    if (editarDiasMora && Number(diasEnMoraValue) >= 0 && Number(monto) > 0) {
      const moraCalculada = calcularMora(Number(monto), Number(diasEnMoraValue));
      setValue("mora", moraCalculada);
    }
  }, [diasEnMoraValue, monto, editarDiasMora, setValue]);

  // 📌 Calcular Total a Pagar cuando cambien los valores
  useEffect(() => {
    // El total incluye: abonoCapital + intereses + mora (si está marcado) + abonoExtra
    // La protección de cartera se suma solo si el checkbox está marcado
    const total = (incluirMora ? Number(mora) : 0) + Number(intereses) + Number(abonoCapital) + Number(abonoExtra) + (incluirProteccion ? Number(proteccionCartera) : 0);
    setValue("totalPagar", total);
  }, [mora, abonoCapital, intereses, abonoExtra, proteccionCartera, incluirProteccion, incluirMora, setValue]);

  // 📌 Función de envío de datos
  const onSubmit = async (data: any) => {
    if (metodoSeleccionado === "" || typeof metodoSeleccionado !== "number") {
      showNotification("Debe seleccionar un método de pago", "warning");
      return;
    }

    // Validar comprobante si el método NO es efectivo
    if (metodoSeleccionado !== 1 && !comprobante) {
      showNotification("Debe adjuntar el comprobante de pago", "warning");
      return;
    }

    // Mostrar confirmación antes de procesar
    setPendingData(data);
    setShowConfirm(true);
  };

  const handleConfirmPayment = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      // Crear FormData si hay comprobante
      const formData = new FormData();

      // Agregar el comprobante solo si existe y es un archivo válido
      if (comprobante && comprobante instanceof File) {
        formData.append("comprobante", comprobante);
        console.log("📎 Archivo agregado:", comprobante.name);
      } else {
        console.log("⚠️ No hay archivo para adjuntar");
      }

      // Agregar los demás datos
      formData.append("idCuota", String(pago?.id || ""));
      formData.append("idAsociado", String(idAsociado));
      formData.append("metodoPagoId", String(metodoSeleccionado));
      formData.append("diaDePago", pendingData.diaDePago);
      formData.append("diasEnMora", String(pendingData.diasEnMora || 0));
      formData.append("mora", String(pendingData.mora || 0));
      formData.append("abonoExtra", String(pendingData.abonoExtra || 0));
      formData.append("totalPagado", String(pendingData.totalPagar || 0));
      formData.append("abonoCapital", String(pendingData.abonoCapital || 0));
      formData.append("intereses", String(pendingData.intereses || 0));
      formData.append("proteccionCartera", String(pendingData.proteccionCartera || 0));
      formData.append("monto", String(pago?.monto || 0));
      formData.append("numCuota", String(pago?.numeroCuota || 0));
      formData.append("fechaVencimiento", String(pago?.fechaVencimiento || ""));

      // console.debug("FormData prepared", Array.from(formData.entries()));

      const pagoRequest = await pagosService.create(creditId, formData);
      console.log("Pago enviado:", pagoRequest);

      if (pagoRequest) {
        showNotification("Pago registrado exitosamente", "success");
        onSuccess?.();
      } else {
        showNotification("Error al registrar el pago", "error");
      }
    } catch (error) {
      console.error("Error al registrar pago:", error);
      showNotification("Error al registrar el pago. Intente nuevamente.", "error");
    } finally {
      setLoading(false);
      setPendingData(null);
    }
  };

  const handleChange: any = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newValue = event.target.value as number;
    setMetodoSeleccionado(newValue);
    // Limpiar el comprobante si cambia a efectivo
    if (newValue === 1) {
      setComprobante(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification("El archivo no debe superar 5MB", "warning");
        return;
      }
      // Validar tipo
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        showNotification("Solo se permiten archivos JPG, PNG o PDF", "warning");
        return;
      }
      setComprobante(file);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {/* Header con información de la cuota */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{ backgroundColor: "white", borderRadius: "50%", p: 1.5, display: "flex" }}>
              <CalendarMonth sx={{ color: "primary.main", fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: "white", fontWeight: "bold" }}>
                Cuota #{pago?.numeroCuota || ""}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                Vencimiento: {fechaVencimiento ? new Date(fechaVencimiento + "T00:00:00").toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" }) : ""}
              </Typography>
            </Box>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
              Valor cuota mensual
            </Typography>
            <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
              ${formatCurrency(monto)}
            </Typography>
          </Box>
        </Box>
        {isSuperAdmin && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Settings />}
              onClick={() => setMostrarOpcionesAvanzadas(!mostrarOpcionesAvanzadas)}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.5)",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              {mostrarOpcionesAvanzadas ? "Ocultar" : "Mostrar"} Opciones Avanzadas
            </Button>
          </Box>
        )}
      </Paper>

      <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Información:</strong> El valor de la cuota mostrado arriba es referencial. El <strong>Total a Pagar</strong> se calcula sumando: <strong>Abono Capital + Intereses</strong>
          {incluirMora && (Number(mora) || 0) > 0 && <strong> + Mora</strong>}
          {incluirProteccion && <strong> + Protección</strong>}
          {abonoExtra > 0 && <strong> + Abono Extra</strong>}
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Sección de Fechas */}
        <Grid size={{ xs: 12 }}>
          <Paper elevation={2} sx={{ p: 2, backgroundColor: "#fafafa" }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarMonth fontSize="small" color="primary" /> Fechas
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Fecha de Vencimiento" type="date" InputLabelProps={{ shrink: true }} {...register("fechaVencimiento")} disabled sx={{ backgroundColor: "#f5f5f5" }} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Día de Pago *"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register("diaDePago")}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main",
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box>
                  <TextField
                    fullWidth
                    label="Días en Mora"
                    type="number"
                    {...register("diasEnMora", { valueAsNumber: true })}
                    error={!!errors.diasEnMora}
                    helperText={errors.diasEnMora?.message}
                    disabled={!editarDiasMora}
                    sx={{
                      backgroundColor: editarDiasMora ? "#fff3e0" : "#f5f5f5",
                      "& .MuiOutlinedInput-input": {
                        color: (Number(diasEnMoraValue) || 0) > 0 ? "error.main" : "inherit",
                        fontWeight: (Number(diasEnMoraValue) || 0) > 0 ? "bold" : "normal",
                      },
                    }}
                    InputProps={{
                      sx: { textAlign: "right" },
                      inputProps: { style: { textAlign: "right" } },
                    }}
                  />
                  {isSuperAdmin && mostrarOpcionesAvanzadas && (
                    <FormControlLabel
                      control={<Checkbox checked={editarDiasMora} onChange={(e) => setEditarDiasMora(e.target.checked)} size="small" />}
                      label={<Typography variant="caption">Editar manualmente</Typography>}
                      sx={{ mt: 0.5, ml: 0 }}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Sección de Valores que SI se suman */}
        <Grid size={{ xs: 12 }}>
          <Paper elevation={2} sx={{ p: 2, backgroundColor: "#fafafa" }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
              <AccountBalanceWallet fontSize="small" color="success" /> Valores que conforman el pago
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Abono a Capital"
                  type="number"
                  {...register("abonoCapital", { valueAsNumber: true })}
                  error={!!errors.abonoCapital}
                  helperText={errors.abonoCapital?.message}
                  disabled
                  sx={{ backgroundColor: "#e8f5e9" }}
                  InputProps={{
                    sx: { fontWeight: "bold", textAlign: "right" },
                    inputProps: { style: { textAlign: "right" } },
                    startAdornment: <Typography sx={{ mr: 1, color: "text.secondary" }}>$</Typography>,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Intereses"
                  type="number"
                  {...register("intereses", { valueAsNumber: true })}
                  error={!!errors.intereses}
                  helperText={errors.intereses?.message}
                  disabled
                  sx={{ backgroundColor: "#e3f2fd" }}
                  InputProps={{
                    sx: { textAlign: "right" },
                    inputProps: { style: { textAlign: "right" } },
                    startAdornment: <Typography sx={{ mr: 1, color: "text.secondary" }}>$</Typography>,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Protección de Cartera"
                  type="number"
                  {...register("proteccionCartera", { valueAsNumber: true })}
                  error={!!errors.proteccionCartera}
                  helperText={errors.proteccionCartera?.message}
                  disabled
                  sx={{ backgroundColor: incluirProteccion ? "#e3f2fd" : "#f5f5f5" }}
                  InputProps={{
                    sx: { textAlign: "right" },
                    inputProps: { style: { textAlign: "right" } },
                    startAdornment: <Typography sx={{ mr: 0.5, color: "text.secondary", fontSize: "0.875rem" }}>$</Typography>,
                  }}
                />
                {isSuperAdmin && mostrarOpcionesAvanzadas && (
                  <FormControlLabel
                    control={<Checkbox checked={incluirProteccion} onChange={(e) => setIncluirProteccion(e.target.checked)} size="small" />}
                    label={<Typography variant="caption">Incluir en el pago</Typography>}
                    sx={{ mt: 0.5, ml: 0 }}
                  />
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Mora"
                  type="number"
                  {...register("mora", { valueAsNumber: true })}
                  error={!!errors.mora}
                  helperText={errors.mora?.message}
                  disabled
                  sx={{ backgroundColor: incluirMora ? ((Number(watch("mora")) || 0) > 0 ? "#ffebee" : "#fff3e0") : "#f5f5f5" }}
                  InputProps={{
                    sx: {
                      textAlign: "right",
                      color: (Number(watch("mora")) || 0) > 0 && incluirMora ? "error.main" : "inherit",
                      fontWeight: (Number(watch("mora")) || 0) > 0 && incluirMora ? "bold" : "normal",
                    },
                    inputProps: { style: { textAlign: "right" } },
                    startAdornment: <Typography sx={{ mr: 0.5, color: "text.secondary", fontSize: "0.875rem" }}>$</Typography>,
                  }}
                />
                {isSuperAdmin && mostrarOpcionesAvanzadas && (
                  <FormControlLabel
                    control={<Checkbox checked={incluirMora} onChange={(e) => setIncluirMora(e.target.checked)} size="small" />}
                    label={<Typography variant="caption">Incluir en el pago</Typography>}
                    sx={{ mt: 0.5, ml: 0 }}
                  />
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Sección de Abono Extra */}
        <Grid size={{ xs: 12 }}>
          <Paper elevation={2} sx={{ p: 2, backgroundColor: "#f3e5f5", border: "2px solid #ab47bc" }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <TrendingUp fontSize="medium" sx={{ color: "#ab47bc" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#ab47bc" }}>
                Abono Extra a Capital
              </Typography>
              {abonoExtra > 0 && (
                <Box sx={{ mt: 1.5, ml: 1.5, p: 1.5, backgroundColor: "rgba(171, 71, 188, 0.08)", borderRadius: 1, border: "1px solid rgba(171, 71, 188, 0.3)" }}>
                  <Typography variant="body2" sx={{ color: "#ab47bc", fontStyle: "italic", fontWeight: "medium", textAlign: "center" }}>
                    {numeroALetras(abonoExtra, true)}
                  </Typography>
                </Box>
              )}
            </Box>
            <TextField
              fullWidth
              type="number"
              {...register("abonoExtra", { valueAsNumber: true })}
              error={!!errors.abonoExtra}
              helperText={errors.abonoExtra?.message || "Este valor se suma al abono a capital y reduce el saldo de la deuda"}
              placeholder="0"
              sx={{ backgroundColor: "white" }}
              InputProps={{
                sx: { fontSize: "1.125rem", fontWeight: "bold", textAlign: "right" },
                inputProps: { style: { textAlign: "right" }, min: 0 },
                startAdornment: <Typography sx={{ mr: 1, color: "#ab47bc", fontWeight: "bold", fontSize: "1.125rem" }}>$</Typography>,
              }}
            />
          </Paper>
        </Grid>

        {/* Método de Pago y Total a Pagar */}
        <Grid size={{ xs: 12 }}>
          <Paper elevation={2} sx={{ p: 2, backgroundColor: "#fafafa" }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
              <CreditCard fontSize="small" color="primary" /> Método de Pago y Total
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel id="metodo-pago-label">Método de Pago *</InputLabel>
                  <Select
                    labelId="metodo-pago-label"
                    id="metodo-pago"
                    value={metodoSeleccionado}
                    onChange={handleChange}
                    label="Método de Pago *"
                    error={!metodoSeleccionado}
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderWidth: 2,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    {metodosPago.map((metodo) => (
                      <MenuItem key={metodo.id} value={metodo.id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {metodo.nombre === "Efectivo" && <Money fontSize="small" />}
                          {metodo.nombre.includes("Transferencia") && <AccountBalance fontSize="small" />}
                          {metodo.nombre.includes("Consignación") && <Receipt fontSize="small" />}
                          {metodo.nombre}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {!metodoSeleccionado && <FormHelperText error>Seleccione un método de pago</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    background: "linear-gradient(135deg, #43a047 0%, #2e7d32 100%)",
                    borderRadius: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    border: "3px solid #1b5e20",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "medium", letterSpacing: 1 }}>
                    TOTAL A PAGAR
                  </Typography>
                  <Typography variant="h3" sx={{ color: "white", fontWeight: "bold", mt: 0.5 }}>
                    ${formatCurrency(totalPagar)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Campo de comprobante condicional */}
        {metodoSeleccionado && metodoSeleccionado !== 1 && (
          <Grid size={{ xs: 12 }}>
            <Paper elevation={2} sx={{ p: 2, backgroundColor: "#fff3e0", border: "2px dashed #ff9800" }}>
              <Alert severity="warning" icon={<AttachFile />} sx={{ mb: 2, backgroundColor: "transparent" }}>
                <strong>Comprobante Requerido:</strong> Debe adjuntar el comprobante de pago (transferencia, consignación, etc.)
              </Alert>

              <Box sx={{ backgroundColor: "white", p: 2, borderRadius: 1, border: comprobante ? "2px solid #4caf50" : "2px dashed #ccc" }}>
                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                  <Button variant="contained" component="label" startIcon={<AttachFile />} color={comprobante ? "success" : "primary"} size="large">
                    {comprobante ? "Cambiar Archivo" : "Adjuntar Comprobante *"}
                    <input type="file" hidden accept="image/jpeg,image/jpg,image/png,application/pdf" onChange={handleFileChange} />
                  </Button>
                  {comprobante && (
                    <Box display="flex" alignItems="center" gap={1} sx={{ backgroundColor: "#e8f5e9", px: 2, py: 1, borderRadius: 1 }}>
                      <CheckCircle color="success" />
                      <Typography variant="body2" color="success.main" fontWeight="bold">
                        {comprobante.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({(comprobante.size / 1024).toFixed(2)} KB)
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                  <Info fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />
                  Formatos permitidos: JPG, PNG, PDF (máx. 5MB)
                </Typography>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Confirmación y Botones */}
        <Grid size={{ xs: 12 }}>
          <Paper elevation={1} sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
            <FormControlLabel
              control={<Checkbox checked={confirmacion} onChange={(e) => setConfirmacion(e.target.checked)} />}
              label={
                <Typography variant="body2">
                  <strong>Confirmo</strong> que los datos del pago son correctos y he verificado el comprobante (si aplica)
                </Typography>
              }
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={onClose} disabled={loading} size="large" sx={{ minWidth: 120 }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={loading || !confirmacion} size="large" sx={{ minWidth: 120 }} startIcon={loading ? <CircularProgress size={20} /> : null}>
              {loading ? "Procesando..." : "Registrar Pago"}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={showConfirm}
        title="Confirmar Pago"
        message={`¿Está seguro de registrar el pago por $${formatCurrency(totalPagar)} pesos?`}
        type="warning"
        confirmText="Registrar Pago"
        cancelText="Cancelar"
        onConfirm={handleConfirmPayment}
        onCancel={() => setShowConfirm(false)}
      />
    </Box>
  );
}
