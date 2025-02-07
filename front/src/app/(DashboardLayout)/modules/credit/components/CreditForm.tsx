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
import { creditsService } from "@/services/creditRequestService";
import { formatCurrency } from "@/app/(DashboardLayout)/utilities/utils";

interface CreditFormProps {
  onSubmit: (data: any) => void;
  existingData?: any;
}

const CreditForm: React.FC<CreditFormProps> = ({ onSubmit, existingData }) => {
  const estadosPrestamo = [
    { value: "SOLICITADO", label: "Solicitado" },
    { value: "APROBADO", label: "Aprobado" },
    { value: "RECHAZADO", label: "Rechazado" },
  ];

  const plazosMeses = [6, 9, 12, 18, 24, 30, 36, 48]; // Opciones de plazo en meses

  const loadTasas = useCallback(async () => {
    const response = await creditsService.getTasas();
    setTasas(response);
    setTasaInteresMensual(parseFloat(response[0].tasa));
    setIdTasa(response[0].tasa);
  }, [existingData]);

  const [formData, setFormData] = useState({
    fechaCredito: null,
    fechaVencimiento: null,
    monto: "",
    plazoMeses: "",
    cuotaMensual: "",
    tasaInteres: "0.0140",
    estado: "SOLICITADO",
    observaciones: "",
    idTasa: 1,
  });

  const [tasas, setTasas] = useState<any[]>([]);
  const [tasaInteresMensual, setTasaInteresMensual] = useState<number>(0); // Tasa de interés mensual

  useEffect(() => {
    const fetchData = async () => {
      const hasSession = authService.isAuthenticated();
      if (hasSession) {
        const user = await authService.getCurrentUserData();
        console.log("currentUser->", user);
        loadTasas();
      }
    };
    fetchData();
    if (existingData) {
      setFormData({
        fechaCredito: existingData.fechaCredito || null,
        fechaVencimiento: existingData.fechaVencimiento || null,
        monto: existingData.monto,
        plazoMeses: existingData.plazoMeses,
        cuotaMensual: existingData.cuotaMensual,
        tasaInteres: existingData.tasaInteres,
        estado: existingData.estado || "SOLICITADO",
        observaciones: existingData.observaciones,
        idTasa: existingData.idTasa,
      });
    }
  }, [existingData]);

  useEffect(() => {
    // Recalcular cuota mensual y fecha vencimiento si el monto, plazo o tasa cambian
    if (formData.monto && formData.plazoMeses) {
      calculateCuotaMensual();
      calculateFechaVencimiento(formData.fechaCredito, formData.plazoMeses);
    }
  }, [formData.monto, formData.plazoMeses, formData.fechaCredito]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value }: any = e.target;
    setFormData({ ...formData, [name!]: value });
    console.log(name, value);

    if (name === "tasaInteres") {
      setTasaInteresMensual(parseFloat(value));      
    }
  };

  const setIdTasa = (value: string) => {
    const tasaFiltrada = tasas.find((tasa) => tasa.tasa === value);
    const idTasa = tasaFiltrada ? tasaFiltrada.id : null;
    console.log(idTasa);
    formData.idTasa = idTasa;
  };

  const calculateCuotaMensual = () => {
    const monto = parseFloat(formData.monto);
    const plazoMeses = parseInt(formData.plazoMeses);
    setIdTasa(formData.tasaInteres);
    if (monto > 0 && plazoMeses > 0 && tasaInteresMensual > 0) {
      const cuota =
        (monto *
          tasaInteresMensual *
          Math.pow(1 + tasaInteresMensual, plazoMeses)) /
        (Math.pow(1 + tasaInteresMensual, plazoMeses) - 1);
      setFormData((prevData) => ({
        ...prevData,
        cuotaMensual: cuota.toFixed(2),
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
    setFormData((prevData) => ({ ...prevData, fechaVencimiento: vencimiento }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">
          {existingData ? "Editar Préstamo" : "Crear Préstamo"}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Columna 3 */}
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="tasa-label">Tasa de Interés</InputLabel>
                <Select
                  labelId="tasa-label"
                  value={formData.tasaInteres}
                  name="tasaInteres"
                  onChange={handleChange}
                  label="Tasa de Interés"
                  required
                >
                  {tasas.map((tasa) => (
                    <MenuItem key={tasa.id} value={tasa.tasa}>
                      [{tasa.anio}] - {formatCurrency(tasa.tasa * 100)}%
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Columna 3 */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Cuota Mensual"
                name="cuotaMensual"
                value={formData.cuotaMensual}
                fullWidth
                disabled
              />
            </Grid>

            {/* Estado */}
            <Grid item xs={12} sm={4}>
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

            {/* Fecha Crédito */}
            <Grid item xs={12} sm={4}></Grid>
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Fecha del Vencimiento"
                  value={formData.fechaVencimiento}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth disabled />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            {/* Observaciones */}
            <Grid item xs={12}>
              <TextField
                label="Observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>

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
