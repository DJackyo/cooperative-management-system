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
} from "@mui/material";
import { Aporte } from "@/interfaces/Aporte";

interface AporteModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (aporte: Aporte) => void;
  initialData: Aporte | null; // Recibimos los datos iniciales
}

const formatDateToISO = (date: string | Date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Asegurar dos dígitos para el mes
  const day = String(d.getDate()).padStart(2, "0"); // Asegurar dos dígitos para el día
  return `${year}-${month}-${day}`;
};

const AporteModal: React.FC<AporteModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const defaultValues: Aporte = {
    id: 0,
    fechaAporte: formatDateToISO(new Date()),
    monto: 0,
    observaciones: null,
    fechaModificacion: "",
    fechaCreacion: "",
    tipoAporte: "MENSUAL",
    estado: "Activo",
    metodoPago: "EFECTIVO",
    comprobante: null,
    idUsuarioRegistro: null,
    idAsociado: {
      id: 0,
      nombres: "",
      numeroDeIdentificacion: "",
    },
  };

  const [aporte, setAporte] = useState<Aporte>(defaultValues);
  const [errors, setErrors] = useState<any>({});

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

  const handleChange = (
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

    // Si hay errores, devolver false
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    // Validar el formulario antes de enviar
    if (validateForm()) {
      onSubmit(aporte);
      onClose(); // Cerrar el modal
    }
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
            <Grid item xs={12} md={6}>
              {/* Fecha de aporte */}
              <TextField
                label="Fecha Aporte"
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
            <Grid item xs={12} md={6}>
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
              />
            </Grid>

            <Grid item xs={12} md={6}>
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
                {errors.tipoAporte && <Typography color="error">{errors.tipoAporte}</Typography>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Metodo de pago */}
              <FormControl fullWidth sx={{ mt: 2 }} error={!!errors.metodoPago}>
                <InputLabel>Metodo de Pago</InputLabel>
                <Select
                  label="Metodo de Pago"
                  name="metodoPago"
                  value={aporte.metodoPago}
                  onChange={handleChange}
                >
                  <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                  <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                  <MenuItem value="TARJETA">Tarjeta</MenuItem>
                </Select>
                {errors.metodoPago && <Typography color="error">{errors.metodoPago}</Typography>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={12}>
              {/* Comprobante */}
              <TextField
                label="Comprobante"
                type="file"
                fullWidth
                name="comprobante"
                onChange={handleChange}
                sx={{ mt: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={12}>
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
            <Button variant="outlined" color="secondary" onClick={onClose}>
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
