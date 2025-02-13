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
import { formatCurrency } from "@/app/(DashboardLayout)/utilities/utils";
import PaymentPlan from "./PaymentPlan";

interface CreditFormProps {
  onSubmit: (data: any) => void;
  tasas: any;
  existingData?: any;
}

const CreditForm: React.FC<CreditFormProps> = ({
  onSubmit,
  tasas,
  existingData,
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

  const [formData, setFormData] = useState({
    fechaCredito: new Date(),
    fechaVencimiento: null,
    monto: "",
    plazoMeses: "",
    cuotaMensual: "",
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
    const monto = parseFloat(formData.monto);
    const plazoMeses = parseInt(formData.plazoMeses);
    setIdTasa(formData.tasa);
    if (monto > 0 && plazoMeses > 0 && tasaInteresMensual > 0) {
      const cuota =
        (monto *
          tasaInteresMensual *
          Math.pow(1 + tasaInteresMensual, plazoMeses)) /
        (Math.pow(1 + tasaInteresMensual, plazoMeses) - 1);
      setFormData((prevData) => ({
        ...prevData,
        cuotaMensual: cuota.toFixed(0),
      }));
    }
  };

  const calculateFechaVencimiento = (
    fechaCredito: Date | null,
    plazoMeses: string
  ) => {
    if (!fechaCredito || !plazoMeses) return;
    const vencimiento = new Date(fechaCredito);
    vencimiento.setMonth(vencimiento.getMonth() + parseInt(plazoMeses));
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
      formData.plazoMeses &&
      formData.tasa &&
      formData.fechaCredito
    );
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">
          {existingData ? "Editar Préstamo" : "Crear Préstamo"}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Información del préstamo
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Columna 3 */}
            <Grid item xs={12} sm={3}>
              <TextField
                label="Monto"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                fullWidth
                required
                type="number"
                onBlur={calculateCuotaMensual}
              />
            </Grid>

            {/* Columna 1 */}
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel id="plazo-label">Plazo (Meses)</InputLabel>
                <Select
                  labelId="plazo-label"
                  value={formData.plazoMeses}
                  name="plazoMeses"
                  onChange={handleChange}
                  label="Plazo (Meses)"
                  required
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
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel id="tasa-label">Tasa de Interés</InputLabel>
                <Select
                  labelId="tasa-label"
                  value={formData.tasa}
                  name="tasaInteres"
                  onChange={handleChange}
                  label="Tasa de Interés"
                  required
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
            <Grid item xs={12} sm={3}>
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
            {/* <Grid item xs={12} sm={3}></Grid> */}
            <Grid item xs={12} sm={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Fecha del Crédito"
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
                value={formData.observaciones}
                onChange={handleChange}
                fullWidth
                multiline
                rows={1}
              />
            </Grid>
            {/* Mostrar el Plan de Pagos solo si el formulario está completo */}
            {isFormComplete() && (
              <PaymentPlan
                monto={parseFloat(formData.monto)}
                tasaInteres={parseFloat(formData.tasa)}
                plazoMeses={parseInt(formData.plazoMeses)}
                fechaCredito={formData.fechaCredito}
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
                {existingData ? "Actualizar Préstamo" : "Crear Préstamo"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreditForm;
