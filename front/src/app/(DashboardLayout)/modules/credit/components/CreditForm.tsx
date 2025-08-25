import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import { authService } from "@/app/authentication/services/authService";
import {
  formatCurrency,
  formatCurrencyFixed,
  formatNameDate,
  numeroALetras,
} from "@/app/(DashboardLayout)/utilities/utils";
import PaymentPlan from "./PaymentPlan";

interface CreditFormProps {
  onSubmit: (data: any) => void;
  tasas: any;
  existingData?: any;
  mode: "create" | "edit" | "approve";
}

const CreditForm: React.FC<CreditFormProps> = ({
  onSubmit,
  tasas,
  existingData,
  mode,
}) => {
  const estadosPrestamo = [
    { value: "SOLICITADO", label: "Solicitar" },
    { value: "APROBADO", label: "Aprobado" },
    { value: "RECHAZADO", label: "Rechazado" },
  ];

  const plazosMeses = [6, 9, 12, 18, 24, 30, 36, 48]; // Opciones de plazo en meses

  const [tasaInteresMensual, setTasaInteresMensual] = useState<number>(0); // Tasa de interés mensual

  const loadTasas = useCallback(async () => {
    if (tasas.length > 0) {
      setTasaInteresMensual(parseFloat(tasas[0].tasa));
      setIdTasa(tasas[0].tasa);
    }
  }, [existingData]);

  const [formData, setFormData] : any= useState({
    fechaCredito: new Date(),
    fechaVencimiento: null,
    monto: 0,
    plazoMeses: "",
    cuotaMensual: 0,
    tasa: "0.0140",
    estado: "SOLICITADO",
    observaciones: "",
    idTasa: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      const hasSession = authService.isAuthenticated();
      if (hasSession) {
        loadTasas();
        if (existingData) {
          setFormData({
            fechaCredito: existingData.fechaCredito || null,
            fechaVencimiento: existingData.fechaVencimiento || null,
            monto: existingData.monto,
            plazoMeses: existingData.plazoMeses,
            cuotaMensual: existingData.cuotaMensual,
            tasa: existingData.tasa,
            estado: existingData.estado || "SOLICITADO",
            observaciones: existingData.observaciones,
            idTasa: existingData.idTasa?.id,
          });
        }
      }
    };
    fetchData();
  }, [existingData]);

  useEffect(() => {
    // Recalcular cuota mensual y fecha vencimiento si el monto, plazo o tasa cambian
    if (formData.monto && formData.plazoMeses) {
      calculateCuotaMensual();
      calculateFechaVencimiento(formData.fechaCredito, formData.plazoMeses);
    }
  }, [formData.monto, formData.plazoMeses, formData.fechaCredito]);

  const handleChange: any = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value }: any = e.target;
    setFormData({ ...formData, [name!]: value });
    console.log(name, value);

    if (name === "tasaInteres") {
      setTasaInteresMensual(parseFloat(value));
    }
  };

  const setIdTasa: any = (value: string) => {
    const tasaFiltrada = tasas.find((tasa: any) => tasa.tasa === value);
    const idTasa = tasaFiltrada ? tasaFiltrada.id : 1;
    console.log(idTasa);
    formData.idTasa = idTasa;
  };

  const calculateCuotaMensual: any = () => {
    const monto = parseFloat(formData.monto.toString());
    const plazoMeses =
      typeof formData.plazoMeses === "string"
        ? parseInt(formData.plazoMeses)
        : formData.plazoMeses;
    setIdTasa(formData.tasa);
    if (monto > 0 && plazoMeses > 0 && tasaInteresMensual > 0) {
      const cuota =
        (monto *
          tasaInteresMensual *
          Math.pow(1 + tasaInteresMensual, plazoMeses)) /
        (Math.pow(1 + tasaInteresMensual, plazoMeses) - 1);
      setFormData((prevData: any) => ({
        ...prevData,
        cuotaMensual: cuota.toFixed(0),
      }));
    }
  };

  const calculateFechaVencimiento = (
    fechaCredito: Date | null,
    plazoMeses: number | string
  ) => {
    if (!fechaCredito || !plazoMeses) return;
    const vencimiento = new Date(fechaCredito);
    plazoMeses =
      typeof formData.plazoMeses === "string"
        ? parseInt(formData.plazoMeses)
        : formData.plazoMeses;
    vencimiento.setMonth(vencimiento.getMonth() + plazoMeses);
    setFormData((prevData: any) => ({
      ...prevData,
      fechaVencimiento: vencimiento,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormComplete = () => {
    // Verifica si los campos obligatorios están completos (sin contar las observaciones)
    return (
      formData.monto &&
      formData.monto > 1000 &&
      formData.plazoMeses &&
      formData.tasa &&
      formData.fechaCredito &&
      formData.fechaVencimiento
    );
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">
          {mode === "create"
            ? "Crear Solicitud de Crédito"
            : mode === "edit"
            ? "Actualización del Crédito"
            : "Aprobación del Crédito"}
        </Typography>
        {mode !== "approve" ? (
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Información del préstamo
          </Typography>
        ) : (
          <Box>
            {" "}
            <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 3 }}>
              ¿Desea proceder con la aprobación del crédito bajo los siguientes
              términos?
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="textPrimary">
                  <strong>PRÉSTAMO POR: </strong> $
                  {formatCurrencyFixed(formData?.monto)} (
                  {numeroALetras(formData?.monto, true)})
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="textPrimary">
                  <strong>MESES: </strong>
                  {formData?.plazoMeses}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle1" color="textPrimary">
                  <strong>TASA:</strong> {(formData?.tasa * 100).toFixed(2)}%
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" color="textPrimary">
                  <strong>CUOTA MENSUAL:</strong> $
                  {formatCurrencyFixed(formData?.cuotaMensual)} (
                  {numeroALetras(formData?.cuotaMensual, true)})
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Columna 3 */}
            <Grid
              item
              xs={12}
              sm={3}
              sx={{ display: mode === "approve" ? "none" : "block" }}
            >
              <TextField
                label="Monto"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                fullWidth
                required
                type="number"
                onBlur={calculateCuotaMensual}
                disabled={mode === "approve"}
              />
            </Grid>

            {/* Columna 1 */}
            <Grid
              item
              xs={12}
              sm={3}
              sx={{ display: mode === "approve" ? "none" : "block" }}
            >
              <FormControl fullWidth>
                <InputLabel id="plazo-label">Plazo (Meses)</InputLabel>
                <Select
                  labelId="plazo-label"
                  value={formData.plazoMeses}
                  name="plazoMeses"
                  onChange={handleChange}
                  label="Plazo (Meses)"
                  required
                  disabled={mode === "approve"}
                >
                  {plazosMeses.map((plazo) => (
                    <MenuItem key={plazo} value={plazo}>
                      {plazo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Columna 2 */}
            <Grid
              item
              xs={12}
              sm={3}
              sx={{ display: mode === "approve" ? "none" : "block" }}
            >
              <FormControl fullWidth>
                <InputLabel id="tasa-label">Tasa de Interés</InputLabel>
                <Select
                  labelId="tasa-label"
                  value={formData.tasa}
                  name="tasaInteres"
                  onChange={handleChange}
                  label="Tasa de Interés"
                  required
                  disabled={mode === "approve"}
                >
                  {tasas.map((tasa: any) => (
                    <MenuItem key={tasa.id} value={tasa.tasa}>
                      [{tasa.anio}] - {formatCurrency(tasa.tasa * 100)}%
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Columna 3 */}
            <Grid
              item
              xs={12}
              sm={3}
              sx={{ display: mode === "approve" ? "none" : "block" }}
            >
              <TextField
                label="Cuota Mensual"
                name="cuotaMensual"
                value={formData.cuotaMensual}
                fullWidth
                disabled
              />
            </Grid>

            {/* Estado */}
            {formData.estado !== "SOLICITADO" && (
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="estado-label">Estado</InputLabel>
                  <Select
                    labelId="estado-label"
                    value={formData.estado}
                    name="estado"
                    onChange={handleChange}
                    label="Estado"
                  >
                    {estadosPrestamo.map((estado) => (
                      <MenuItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Fecha Crédito */}
            <Grid item xs={12} sm={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Fecha de Inicio del Crédito"
                  value={formData.fechaCredito}
                  onChange={(newValue) =>
                    handleChange({
                      target: { name: "fechaCredito", value: newValue },
                    } as any)
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            {/* Fecha Vencimiento */}
            <Grid item xs={12} sm={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Fecha del Vencimiento"
                  value={formData.fechaVencimiento}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth disabled />
                  )}
                  onChange={function (
                    value: null,
                    keyboardInputValue?: string
                  ): void {}}
                />
              </LocalizationProvider>
            </Grid>

            {/* Observaciones */}
            <Grid item xs={12} sm={formData.estado === "SOLICITADO" ? 6 : 12}>
              <TextField
                label="Observaciones"
                name="observaciones"
                value={formData.observaciones ? formData.observaciones : ""}
                onChange={handleChange}
                fullWidth
                multiline
                rows={1}
              />
            </Grid>
            {/* Mostrar el Plan de Pagos solo si el formulario está completo */}
            {isFormComplete() && (
              <PaymentPlan
                monto={formData.monto}
                tasaInteres={parseFloat(formData.tasa)}
                plazoMeses={formData.plazoMeses}
                fechaCredito={formData.fechaCredito}
                mode={mode}
              />
            )}

            {/* Botón de Enviar */}
            <Grid item xs={9}></Grid>
            <Grid item xs={3}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                {mode === "create"
                  ? "Solicitar Crédito"
                  : mode === "edit"
                  ? "Actualizar Crédito"
                  : "Aprobar Crédito"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreditForm;
