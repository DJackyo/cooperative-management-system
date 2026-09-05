"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { Asociado } from "@/interfaces/User";

interface AsociadoModalProps {
  open: boolean;
  asociado: Asociado | null;
  onClose: () => void;
  onSubmit: (data: Omit<Asociado, "id">) => Promise<void>;
}

const toDateInputValue = (value?: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const emptyAsociado: Omit<Asociado, "id"> = {
  nombres: "",
  numeroDeIdentificacion: "",
  idEstado: { id: 1, estado: "ACTIVO" },
  nombre1: "",
  nombre2: "",
  apellido1: "",
  apellido2: "",
  tipoIdentificacionId: null,
  fechaDeExpedicion: null,
  fechaDeNacimiento: null,
  genero: "",
  estadoCivil: "",
  esAsociado: true,
};

const AsociadoModal: React.FC<AsociadoModalProps> = ({
  open,
  asociado,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Omit<Asociado, "id">>(emptyAsociado);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!asociado) return;

    setFormData({
      ...emptyAsociado,
      ...asociado,
      fechaDeExpedicion: toDateInputValue(asociado.fechaDeExpedicion),
      fechaDeNacimiento: toDateInputValue(asociado.fechaDeNacimiento),
    });
    setError(null);
  }, [asociado]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.numeroDeIdentificacion || !formData.nombre1 || !formData.apellido1) {
      setError("Completa identificación, primer nombre y primer apellido.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        ...formData,
        nombres: [formData.nombre1, formData.nombre2, formData.apellido1, formData.apellido2]
          .filter(Boolean)
          .join(" "),
        fechaDeExpedicion: formData.fechaDeExpedicion || null,
        fechaDeNacimiento: formData.fechaDeNacimiento || null,
      });
      onClose();
    } catch (submitError: any) {
      setError(
        submitError?.response?.data?.message ||
          "No fue posible actualizar los datos del asociado.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={submitting ? undefined : onClose}>
      <Box
        sx={{
          bgcolor: "background.paper",
          boxShadow: 24,
          p: { xs: 2, sm: 3 },
          width: { xs: "calc(100% - 32px)", sm: "min(760px, calc(100% - 48px))" },
          maxHeight: "calc(100vh - 32px)",
          overflowY: "auto",
          margin: "auto",
          marginTop: { xs: 2, sm: 5 },
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Editar datos del asociado
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Actualiza únicamente la información personal y cooperativa del asociado.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" noValidate autoComplete="off">
          <Typography variant="subtitle1" fontWeight={700}>Identificación</Typography>
          <Divider sx={{ mt: 0.5, mb: 1 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label="Tipo de identificación"
                name="tipoIdentificacionId"
                value={formData.tipoIdentificacionId ?? ""}
                onChange={handleChange}
                margin="normal"
              >
                <MenuItem value={1}>Cédula de ciudadanía</MenuItem>
                <MenuItem value={2}>Pasaporte</MenuItem>
                <MenuItem value={3}>Tarjeta de identidad</MenuItem>
                <MenuItem value={4}>Cédula de extranjería</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Número de identificación" name="numeroDeIdentificacion" value={formData.numeroDeIdentificacion || ""} onChange={handleChange} margin="normal" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth type="date" label="Fecha de expedición" name="fechaDeExpedicion" value={formData.fechaDeExpedicion || ""} onChange={handleChange} margin="normal" InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 2 }}>Datos personales</Typography>
          <Divider sx={{ mt: 0.5, mb: 1 }} />
          <Grid container spacing={2}>
            {[
              ["nombre1", "Primer nombre"],
              ["nombre2", "Segundo nombre"],
              ["apellido1", "Primer apellido"],
              ["apellido2", "Segundo apellido"],
            ].map(([name, label]) => (
              <Grid key={name} size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField fullWidth label={label} name={name} value={formData[name as keyof typeof formData] || ""} onChange={handleChange} margin="normal" />
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth type="date" label="Fecha de nacimiento" name="fechaDeNacimiento" value={formData.fechaDeNacimiento || ""} onChange={handleChange} margin="normal" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth label="Género" name="genero" value={formData.genero || ""} onChange={handleChange} margin="normal" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth label="Estado civil" name="estadoCivil" value={formData.estadoCivil || ""} onChange={handleChange} margin="normal" />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 2 }}>Estado cooperativo</Typography>
          <Divider sx={{ mt: 0.5, mb: 1 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Estado del asociado"
                value={formData.idEstado?.estado || "ACTIVO"}
                onChange={(event) => {
                  const estado = event.target.value;
                  const ids: Record<string, number> = { ACTIVO: 1, INACTIVO: 2, EXASOCIADO: 3, RETIRADO: 4, RSD: 5, EXCLUIDO: 6 };
                  setFormData((current) => ({ ...current, idEstado: { id: ids[estado] || 1, estado } }));
                }}
                margin="normal"
              >
                {Object.keys({ ACTIVO: 1, INACTIVO: 2, EXASOCIADO: 3, RETIRADO: 4, RSD: 5, EXCLUIDO: 6 }).map((estado) => <MenuItem key={estado} value={estado}>{estado}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="¿Es asociado?"
                value={formData.esAsociado == null ? "true" : String(formData.esAsociado)}
                onChange={(event) => setFormData((current) => ({ ...current, esAsociado: event.target.value === "true" }))}
                margin="normal"
              >
                <MenuItem value="true">Sí</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" gap={1} sx={{ mt: 3 }}>
            <Button variant="outlined" color="inherit" onClick={onClose} disabled={submitting}>Cancelar</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}>
              {submitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default AsociadoModal;
