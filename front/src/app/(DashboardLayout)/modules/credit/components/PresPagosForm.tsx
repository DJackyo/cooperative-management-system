import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Checkbox, FormControl, FormControlLabel, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography, Paper, Divider, Chip, Alert, FormHelperText } from "@mui/material";
import { Info, AccountBalanceWallet, CalendarMonth, Payment, AttachFile, CheckCircle } from "@mui/icons-material";
import { calcularDiasEnMora, calcularMora, formatCurrency, formatNumber, numeroALetras, redondearHaciaArriba } from "@/app/(DashboardLayout)/utilities/utils";
import { pagosService } from "@/services/paymentsService";
import { MetodoPago } from "@/interfaces/Cuota";
import { useNotification } from "@/contexts/NotificationContext";
import ConfirmDialog from "@/components/ConfirmDialog";

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
  pagado: z.literal(true).refine((value) => value === true, {
    message: "Debe marcar la casilla para registrar el pago",
  }),
});

// 📌 Tipado de datos (TypeScript)
type PresPagosFormData = z.infer<typeof presPagosSchema>;

// 📌 Tipado de Props
interface PresPagosFormProps {
  pago?: PresPagosFormData;
  creditId: number;
  onSuccess?: () => void;
}

export default function PresPagosForm({ pago, creditId, onSuccess }: PresPagosFormProps) {
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  const [incluirProteccion, setIncluirProteccion] = useState(true); // Por defecto incluida
  const [incluirMora, setIncluirMora] = useState(true); // Por defecto incluida
  const [editarDiasMora, setEditarDiasMora] = useState(false); // Habilitar edición manual
  const [comprobante, setComprobante] = useState<File | null>(null);
  const { showNotification } = useNotification();

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
  const diasEnMoraValue = watch("diasEnMora", 0);

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
    if (editarDiasMora && diasEnMoraValue >= 0 && monto > 0) {
      const moraCalculada = calcularMora(monto, diasEnMoraValue);
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
    if (!metodoSeleccionado || metodoSeleccionado === "") {
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

      // Agregar el comprobante si existe
      if (comprobante) {
        formData.append("comprobante", comprobante);
      }

      // Agregar los demás datos
      formData.append("idCuota", String(pago?.id || ""));
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
      formData.append("fechaVencimiento", pago?.fechaVencimiento || "");

      console.log("Datos enviados:", Object.fromEntries(formData));
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
      <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: "#e3f2fd", borderLeft: "4px solid #1976d2" }}>
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
          <CalendarMonth sx={{ color: "primary.main", fontSize: 28 }} />
          <Typography variant="h6" color="primary">
            {pago ? `Cuota # ${pago.numeroCuota}` : ""}
          </Typography>
          <Chip label={`Valor: $${formatCurrency(monto)}`} color="primary" size="small" sx={{ ml: 1, fontWeight: "bold" }} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Complete la información para registrar el pago de esta cuota
        </Typography>
      </Paper>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Sección de Fechas */}
        <Grid size={{ xs: 6 }}>
          <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
            <strong>Nota:</strong> El "Valor de la cuota" es informativo. El <strong>Total a Pagar</strong> se calcula sumando: <strong>Abono Capital + Intereses</strong>
            {incluirMora && mora > 0 && <strong> + Mora</strong>}
            {incluirProteccion && <strong> + Protección de Cartera</strong>}
            <strong> + Abono Extra</strong>
          </Alert>
        </Grid>
        {/* Sección de Valores Informativos */}
        <Grid container spacing={2} sx={{ mt: 1 }} size={{ xs: 6 }}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
              <Info fontSize="small" /> Valor Informativo
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Paper elevation={1} sx={{ p: 1, backgroundColor: "#f9f9f9" }}>
              <TextField
                fullWidth
                label="Valor de la cuota mensual"
                type="number"
                {...register("monto", { valueAsNumber: true })}
                error={!!errors.monto}
                helperText="Este valor es solo de referencia"
                disabled
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  sx: { textAlign: "right" },
                  inputProps: { style: { textAlign: "right" } },
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 2 }} />
      </Grid>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Sección de Fechas */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: "bold" }}>
            📅 Fechas
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField fullWidth label="Fecha de Vencimiento" type="date" InputLabelProps={{ shrink: true }} {...register("fechaVencimiento")} disabled sx={{ backgroundColor: "#f5f5f5" }} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField fullWidth label="Día de Pago *" type="date" InputLabelProps={{ shrink: true }} {...register("diaDePago")} />
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
              sx={{ backgroundColor: editarDiasMora ? "#fff3e0" : "#f5f5f5" }}
              InputProps={{
                sx: { textAlign: "right" },
                inputProps: { style: { textAlign: "right", min: 0 } },
              }}
            />
            <FormControlLabel
              control={<Checkbox checked={editarDiasMora} onChange={(e) => setEditarDiasMora(e.target.checked)} size="small" />}
              label={<Typography variant="caption">Editar manualmente</Typography>}
              sx={{ mt: 0.5, ml: 0 }}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Sección de Valores que SI se suman */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="success.main" sx={{ mb: 1, fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
            <AccountBalanceWallet fontSize="small" /> Valores que conforman el pago
          </Typography>
        </Grid>

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
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              sx: { textAlign: "right" },
              inputProps: { style: { textAlign: "right" } },
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
            sx={{ backgroundColor: "#e8f5e9" }}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              sx: { textAlign: "right" },
              inputProps: { style: { textAlign: "right" } },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Box>
            <TextField
              fullWidth
              label="Protección de cartera"
              type="number"
              {...register("proteccionCartera", { valueAsNumber: true })}
              error={!!errors.proteccionCartera}
              disabled
              sx={{ backgroundColor: incluirProteccion ? "#e8f5e9" : "#f5f5f5" }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                sx: { textAlign: "right" },
                inputProps: { style: { textAlign: "right" } },
              }}
            />
            <FormControlLabel
              control={<Checkbox checked={incluirProteccion} onChange={(e) => setIncluirProteccion(e.target.checked)} size="small" />}
              label={<Typography variant="caption">Incluir en el pago</Typography>}
              sx={{ mt: 0.5, ml: 0 }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Box>
            <TextField
              fullWidth
              label="Mora Calculada"
              type="number"
              disabled
              value={watch("mora") || 0}
              sx={{ backgroundColor: incluirMora ? (mora > 0 ? "#ffebee" : "#e8f5e9") : "#f5f5f5" }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                sx: {
                  textAlign: "right",
                  color: mora > 0 && incluirMora ? "error.main" : "inherit",
                  fontWeight: mora > 0 && incluirMora ? "bold" : "normal",
                },
                inputProps: { style: { textAlign: "right" } },
              }}
            />
            <FormControlLabel
              control={<Checkbox checked={incluirMora} onChange={(e) => setIncluirMora(e.target.checked)} size="small" />}
              label={<Typography variant="caption">Incluir en el pago</Typography>}
              sx={{ mt: 0.5, ml: 0 }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Abono extra (opcional)"
            type="number"
            {...register("abonoExtra", { valueAsNumber: true })}
            error={!!errors.abonoExtra}
            helperText="Abono adicional al capital"
            value={watch("abonoExtra") || 0}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              sx: { textAlign: "right" },
              inputProps: { style: { textAlign: "right" } },
            }}
          />
        </Grid>

        {/* Total a Pagar destacado */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel id="metodo-pago-label">Método de Pago *</InputLabel>
            <Select labelId="metodo-pago-label" id="metodo-pago" value={metodoSeleccionado} onChange={handleChange} label="Método de Pago *" error={!metodoSeleccionado}>
              {metodosPago.map((metodo) => (
                <MenuItem key={metodo.id} value={metodo.id}>
                  {metodo.nombre}
                </MenuItem>
              ))}
            </Select>
            {!metodoSeleccionado && <FormHelperText error>Seleccione un método de pago</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 2, backgroundColor: "#1976d2", borderRadius: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Typography variant="body2" sx={{ color: "white", mb: 0.5 }}>
              TOTAL A PAGAR
            </Typography>
            <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
              ${formatCurrency(totalPagar)}
            </Typography>
          </Paper>
        </Grid>

        {/* Campo de comprobante condicional */}
        {metodoSeleccionado && metodoSeleccionado !== 1 && (
          <>
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning" icon={<AttachFile />} sx={{ mb: 2 }}>
                <strong>Comprobante Requerido:</strong> Debe adjuntar el comprobante de pago (transferencia, consignación, etc.)
              </Alert>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={2} sx={{ p: 2, border: comprobante ? "2px solid #4caf50" : "2px dashed #ccc" }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Button variant="contained" component="label" startIcon={<AttachFile />} color={comprobante ? "success" : "primary"}>
                    {comprobante ? "Cambiar Archivo" : "Adjuntar Comprobante *"}
                    <input type="file" hidden accept="image/jpeg,image/jpg,image/png,application/pdf" onChange={handleFileChange} />
                  </Button>
                  {comprobante && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircle color="success" />
                      <Typography variant="body2" color="success.main" fontWeight="bold">
                        {comprobante.name}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  Formatos permitidos: JPG, PNG, PDF (máx. 5MB)
                </Typography>
              </Paper>
            </Grid>
          </>
        )}

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper elevation={1} sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
            <FormControlLabel
              control={<Checkbox {...register("pagado")} />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    Confirmo registrar el pago por ${formatCurrency(totalPagar)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    ({numeroALetras(totalPagar, true)})
                  </Typography>
                </Box>
              }
            />
            {errors.pagado && (
              <Alert severity="error" sx={{ mt: 1 }}>
                Debe marcar la casilla para confirmar el registro del pago
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Botón de envío */}
        <Grid size={{ xs: 12 }} sx={{ textAlign: "right", mt: 2 }}>
          <Button type="submit" variant="contained" size="large" disabled={loading} startIcon={<Payment />} sx={{ minWidth: 200 }}>
            {loading ? "Registrando..." : "Registrar Pago"}
          </Button>
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
