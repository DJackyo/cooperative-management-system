"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

interface AsistenciaAsambleaModalProps {
  open: boolean;
  profile: any | null;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const AsistenciaAsambleaModal: React.FC<AsistenciaAsambleaModalProps> = ({
  open,
  profile,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({ fecha: "", asistio: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      fecha: formatDate(profile?.asistencia?.fecha),
      asistio: profile?.asistencia?.asistio || "",
    });
    setError(null);
  }, [profile, open]);

  const handleSubmit = async () => {
    if (!profile?.asociado?.id) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        asociado: { id: profile.asociado.id },
        asistencia: formData,
      });
      onClose();
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message || "No fue posible guardar la asistencia.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Asistencia a asamblea</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {profile?.asociado?.nombres || "Asociado seleccionado"}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          fullWidth
          type="date"
          label="Fecha de la asamblea"
          value={formData.fecha}
          onChange={(event) => setFormData((current) => ({ ...current, fecha: event.target.value }))}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          select
          label="¿Asistió?"
          value={formData.asistio}
          onChange={(event) => setFormData((current) => ({ ...current, asistio: event.target.value }))}
          margin="normal"
        >
          <MenuItem value="SI">Sí</MenuItem>
          <MenuItem value="NO">No</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">Cancelar</Button>
        <Button onClick={handleSubmit} disabled={submitting || !formData.fecha || !formData.asistio} variant="contained">
          {submitting ? <CircularProgress size={18} color="inherit" /> : "Guardar asistencia"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AsistenciaAsambleaModal;
