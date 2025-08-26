import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import { Aporte } from "@/interfaces/Aporte";
import { formatDateToISO } from "@/app/(DashboardLayout)/utilities/utils";
import { defaultAporteValue as defaultValues } from "@/app/(DashboardLayout)/utilities/AportesUtils";

interface AporteModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (aporte: Aporte) => void;
  initialData: Aporte | null;
}

const AporteModal: React.FC<AporteModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [aporte, setAporte] = useState<Aporte>(defaultValues);
  const [errors, setErrors] = useState<any>({});

  // Array de métodos de pago disponibles
  const paymentMethods = [
    { value: "EFECTIVO", label: "Efectivo" },
    { value: "TRANSFERENCIA", label: "Transferencia" },
    { value: "TARJETA", label: "Tarjeta" },
  ];

  // Métodos de pago que requieren comprobante
  const paymentMethodsWithComprobante = ["TRANSFERENCIA", "TARJETA"];

  useEffect(() => {
    if (initialData) {
      setAporte({
        ...initialData,
        fechaAporte: initialData.fechaAporte
          ? formatDateToISO(initialData.fechaAporte)
          : "", // Si ya tiene fecha, formatearla
      });
    } else {
      setAporte(defaultValues);
    }
  }, [initialData]);

  const handleChange: any = (
    event: React.ChangeEvent<
      HTMLInputElement | { name?: string; value: unknown }
    >
  ) => {
    const { name, value } = event.target;
    setAporte({
      ...aporte,
      [name as string]: value,
    });
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Validación monto > 0
    if (aporte.monto <= 0) {
      newErrors.monto = "El monto debe ser mayor que 0.";
    }

    // Validación fecha de aporte no puede ser en el futuro
    const currentDate = new Date();
    const selectedDate = new Date(aporte.fechaAporte);
    if (!aporte.fechaAporte) {
      newErrors.fechaAporte = "La fecha de aporte es obligatoria.";
    } else if (selectedDate > currentDate) {
      newErrors.fechaAporte = "La fecha no puede ser en el futuro.";
    }

    // Validación selectores
    if (!aporte.tipoAporte) {
      newErrors.tipoAporte = "Debe seleccionar un tipo de aporte.";
    }
    if (!aporte.estado) {
      newErrors.estado = "Debe seleccionar un estado.";
    }
    if (!aporte.metodoPago) {
      newErrors.metodoPago = "Debe seleccionar un método de pago.";
    }

    // Validación para el campo comprobante solo si el metodoPago es 'TRANSFERENCIA' o 'TARJETA'
    if (
      paymentMethodsWithComprobante.includes(aporte.metodoPago) &&
      !aporte.comprobante
    ) {
      newErrors.comprobante =
        "El comprobante es obligatorio para este método de pago.";
    }

    // Si hay errores, devolver false
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(aporte);
      onClose();
      setAporte(defaultValues);
    }
  };

  const handleCancel = () => {
    onClose();
    setAporte(defaultValues);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="modal-title" variant="h6" component="h2">
          {aporte.id ? "Editar Aporte" : "Nuevo Aporte"}
        </Typography>
        <form>
          <Grid container spacing={3}>
            {/* Primera columna */}
            <Grid  size={{ xs: 12, md: 6 }}>
              {/* Fecha de aporte */}
              <TextField
                label="Fecha del Aporte"
                type="date"
                fullWidth
                name="fechaAporte"
                value={aporte.fechaAporte}
                onChange={handleChange}
                sx={{ mt: 2 }}
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!errors.fechaAporte}
                helperText={errors.fechaAporte}
              />
            </Grid>
            <Grid  size={{ xs: 12, md: 6 }}>
              {/* Monto */}
              <TextField
                label="Monto"
                type="number"
                fullWidth
                name="monto"
                value={aporte.monto}
                onChange={handleChange}
                sx={{ mt: 2 }}
                error={!!errors.monto}
                helperText={errors.monto}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid  size={{ xs: 12, md: 6 }}>
              {/* Tipo de aporte */}
              <FormControl fullWidth sx={{ mt: 2 }} error={!!errors.tipoAporte}>
                <InputLabel>Tipo Aporte</InputLabel>
                <Select
                  label="Tipo Aporte"
                  name="tipoAporte"
                  value={aporte.tipoAporte}
                  onChange={handleChange}
                >
                  <MenuItem value="MENSUAL">Mensual</MenuItem>
                  <MenuItem value="ANUAL">Anual</MenuItem>
                  <MenuItem value="EXTRAORDINARIO">Extraordinario</MenuItem>
                </Select>
                {errors.tipoAporte && (
                  <Typography color="error">{errors.tipoAporte}</Typography>
                )}
              </FormControl>
            </Grid>

            <Grid  size={{ xs: 12, md: 6 }}>
              {/* Metodo de pago */}
              <FormControl fullWidth sx={{ mt: 2 }} error={!!errors.metodoPago}>
                <InputLabel>Metodo de Pago</InputLabel>
                <Select
                  label="Metodo de Pago"
                  name="metodoPago"
                  value={aporte.metodoPago}
                  onChange={handleChange}
                >
                  {/* Mapeo dinámico de los métodos de pago */}
                  {paymentMethods.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.metodoPago && (
                  <Typography color="error">{errors.metodoPago}</Typography>
                )}
              </FormControl>
            </Grid>

            {/* Comprobante solo si es Transferencia o Tarjeta */}
            {paymentMethodsWithComprobante.includes(aporte.metodoPago) && (
              <Grid  size={{ xs: 12, md: 12}}>
                <TextField
                  label="Comprobante"
                  type="file"
                  fullWidth
                  name="comprobante"
                  onChange={handleChange}
                  sx={{ mt: 2 }}
                  error={!!errors.comprobante}
                  helperText={errors.comprobante}
                />
              </Grid>
            )}

            <Grid  size={{ xs: 12, md: 12}}>
              {/* Observaciones */}
              <TextField
                label="Observaciones"
                fullWidth
                name="observaciones"
                value={aporte.observaciones || ""}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />
            </Grid>
          </Grid>

          {/* Botones de acción */}
          <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              {aporte.id > 0 ? "Actualizar" : "Registrar"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AporteModal;
