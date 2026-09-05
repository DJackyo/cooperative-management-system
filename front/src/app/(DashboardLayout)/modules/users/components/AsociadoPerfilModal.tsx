"use client";

import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import { IconChevronDown, IconPlus, IconTrash } from "@tabler/icons-react";

interface AsociadoPerfilModalProps {
  open: boolean;
  profile: any | null;
  onClose: () => void;
  onSubmit: (profile: any) => Promise<void>;
}

const dateValue = (value: string | null | undefined) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const emptyProfile = {
  asociado: {},
  contactos: {},
  ubicacion: {},
  laboral: {},
  economica: {},
  asistencia: {},
  familiares: [],
};

const AsociadoPerfilModal: React.FC<AsociadoPerfilModalProps> = ({
  open,
  profile,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<any>(emptyProfile);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const next = structuredClone({ ...emptyProfile, ...profile });
    next.asociado = { ...profile.asociado };
    next.contactos = { ...(profile.contactos || {}) };
    next.ubicacion = { ...(profile.ubicacion || {}) };
    next.laboral = { ...(profile.laboral || {}) };
    next.economica = { ...(profile.economica || {}) };
    next.asistencia = { ...(profile.asistencia || {}) };
    next.familiares = (profile.familiares || []).map((familiar: any) => ({ ...familiar }));
    ["fechaDeExpedicion", "fechaDeNacimiento"].forEach((field) => {
      next.asociado[field] = dateValue(next.asociado[field]);
    });
    next.laboral.fechaDeRetiro = dateValue(next.laboral.fechaDeRetiro);
    next.asistencia.fecha = dateValue(next.asistencia.fecha);
    setFormData(next);
    setError(null);
  }, [profile]);

  const updateSection = (section: string, name: string, value: any) => {
    setFormData((current: any) => ({
      ...current,
      [section]: { ...current[section], [name]: value },
    }));
  };

  const updateAsociado = (name: string, value: any) => updateSection("asociado", name, value);

  const Field = ({ section, name, label, type = "text", select = false }: any) => {
    const value = formData[section]?.[name] ?? "";
    return (
      <TextField
        fullWidth
        margin="normal"
        label={label}
        name={name}
        type={type}
        select={select}
        value={value}
        onChange={(event) => {
          const nextValue = name === "empleado"
            ? event.target.value === "true"
            : type === "number"
              ? (event.target.value === "" ? null : Number(event.target.value))
              : event.target.value;
          updateSection(section, name, nextValue);
        }}
        InputLabelProps={type === "date" ? { shrink: true } : undefined}
      >
        {select && name === "empleado" && <><MenuItem value="true">Sí</MenuItem><MenuItem value="false">No</MenuItem></>}
        {select && name === "asistio" && <><MenuItem value="SI">Sí</MenuItem><MenuItem value="NO">No</MenuItem></>}
      </TextField>
    );
  };

  const addFamiliar = () => {
    setFormData((current: any) => ({
      ...current,
      familiares: [...current.familiares, { nombres: "", numeroDeIdentificacion: "", tipoIdentificacionId: null, tipoFamiliarId: null }],
    }));
  };

  const updateFamiliar = (index: number, name: string, value: any) => {
    setFormData((current: any) => ({
      ...current,
      familiares: current.familiares.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, [name]: value } : item),
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(formData);
      onClose();
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message || "No fue posible guardar el expediente del asociado.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={submitting ? undefined : onClose}>
      <Box sx={{ bgcolor: "background.paper", boxShadow: 24, p: { xs: 2, sm: 3 }, width: { xs: "calc(100% - 24px)", sm: "min(900px, calc(100% - 48px))" }, maxHeight: "calc(100vh - 24px)", overflowY: "auto", margin: "auto", marginTop: { xs: 1, sm: 3 }, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>Expediente completo del asociado</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Actualiza la información personal, cooperativa y familiar en un solo lugar.</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<IconChevronDown />}><Typography fontWeight={700}>Datos personales e identificación</Typography></AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {[["nombre1", "Primer nombre"], ["nombre2", "Segundo nombre"], ["apellido1", "Primer apellido"], ["apellido2", "Segundo apellido"], ["numeroDeIdentificacion", "Número de identificación"]].map(([name, label]) => <Grid key={name} size={{ xs: 12, sm: 6, md: 4 }}><TextField fullWidth label={label} value={formData.asociado[name] || ""} onChange={(event) => updateAsociado(name, event.target.value)} margin="normal" /></Grid>)}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}><TextField fullWidth select label="Tipo de identificación" value={formData.asociado.tipoIdentificacionId ?? ""} onChange={(event) => updateAsociado("tipoIdentificacionId", Number(event.target.value) || null)} margin="normal"><MenuItem value={1}>Cédula de ciudadanía</MenuItem><MenuItem value={2}>Pasaporte</MenuItem><MenuItem value={3}>Tarjeta de identidad</MenuItem><MenuItem value={4}>Cédula de extranjería</MenuItem></TextField></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}><TextField fullWidth type="date" label="Fecha de expedición" value={formData.asociado.fechaDeExpedicion || ""} onChange={(event) => updateAsociado("fechaDeExpedicion", event.target.value)} margin="normal" InputLabelProps={{ shrink: true }} /></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}><TextField fullWidth type="date" label="Fecha de nacimiento" value={formData.asociado.fechaDeNacimiento || ""} onChange={(event) => updateAsociado("fechaDeNacimiento", event.target.value)} margin="normal" InputLabelProps={{ shrink: true }} /></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}><TextField fullWidth label="Género" value={formData.asociado.genero || ""} onChange={(event) => updateAsociado("genero", event.target.value)} margin="normal" /></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}><TextField fullWidth label="Estado civil" value={formData.asociado.estadoCivil || ""} onChange={(event) => updateAsociado("estadoCivil", event.target.value)} margin="normal" /></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}><TextField fullWidth select label="Estado del asociado" value={formData.asociado.idEstado?.estado || "ACTIVO"} onChange={(event) => { const estado = event.target.value; const ids: any = { ACTIVO: 1, INACTIVO: 2, EXASOCIADO: 3, RETIRADO: 4, RSD: 5, EXCLUIDO: 6 }; updateAsociado("idEstado", { id: ids[estado], estado }); }} margin="normal">{["ACTIVO", "INACTIVO", "EXASOCIADO", "RETIRADO", "RSD", "EXCLUIDO"].map((estado) => <MenuItem key={estado} value={estado}>{estado}</MenuItem>)}</TextField></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}><TextField fullWidth select label="¿Es asociado?" value={String(formData.asociado.esAsociado ?? true)} onChange={(event) => updateAsociado("esAsociado", event.target.value === "true")} margin="normal"><MenuItem value="true">Sí</MenuItem><MenuItem value="false">No</MenuItem></TextField></Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion><AccordionSummary expandIcon={<IconChevronDown />}><Typography fontWeight={700}>Contacto y ubicación</Typography></AccordionSummary><AccordionDetails><Grid container spacing={2}>{[["contactos", "telefono1", "Teléfono principal"], ["contactos", "telefono2", "Teléfono alterno"], ["contactos", "correoElectronico", "Correo electrónico"], ["contactos", "nombre", "Contacto de referencia"], ["ubicacion", "direccion", "Dirección"], ["ubicacion", "barrio", "Barrio"], ["ubicacion", "ciudad", "Ciudad"], ["ubicacion", "pais", "País"], ["ubicacion", "telefono", "Teléfono de ubicación"]].map(([section, name, label]) => <Grid key={`${section}-${name}`} size={{ xs: 12, sm: 6, md: 4 }}><Field section={section} name={name} label={label} /></Grid>)}</Grid></AccordionDetails></Accordion>

        <Accordion><AccordionSummary expandIcon={<IconChevronDown />}><Typography fontWeight={700}>Información laboral y económica</Typography></AccordionSummary><AccordionDetails><Grid container spacing={2}><Grid size={{ xs: 12, sm: 6, md: 4 }}><Field section="laboral" name="empleado" label="¿Es empleado?" select /></Grid>{[["tipoContrato", "Tipo de contrato"], ["ocupacion", "Ocupación"], ["jornadaLaboral", "Jornada laboral"], ["antiguedad", "Antigüedad"]].map(([name, label]) => <Grid key={name} size={{ xs: 12, sm: 6, md: 4 }}><Field section="laboral" name={name} label={label} /></Grid>)}<Grid size={{ xs: 12, sm: 6, md: 4 }}><Field section="laboral" name="fechaDeRetiro" label="Fecha de retiro" type="date" /></Grid>{[["estrato", "Estrato"], ["nivelIngresos", "Nivel de ingresos"], ["sectorEconomico", "Sector económico"], ["calidad", "Calidad"], ["reingreso", "Reingreso"]].map(([name, label]) => <Grid key={name} size={{ xs: 12, sm: 6, md: 4 }}><Field section="economica" name={name} label={label} type={name === "estrato" || name === "nivelIngresos" ? "number" : "text"} /></Grid>)}</Grid></AccordionDetails></Accordion>

        <Accordion><AccordionSummary expandIcon={<IconChevronDown />}><Typography fontWeight={700}>Información familiar</Typography></AccordionSummary><AccordionDetails><Button size="small" variant="outlined" startIcon={<IconPlus />} onClick={addFamiliar} sx={{ mb: 2 }}>Agregar familiar</Button>{formData.familiares.map((familiar: any, index: number) => <Box key={familiar.id || index} sx={{ p: 2, mb: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}><Grid container spacing={2}>{[["nombres", "Nombres"], ["numeroDeIdentificacion", "Identificación"]].map(([name, label]) => <Grid key={name} size={{ xs: 12, sm: 4 }}><TextField fullWidth label={label} value={familiar[name] || ""} onChange={(event) => updateFamiliar(index, name, event.target.value)} /></Grid>)}<Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Tipo de familiar" value={familiar.tipoFamiliar?.nombre || familiar.tipoFamiliarId || ""} onChange={(event) => updateFamiliar(index, "tipoFamiliarId", Number(event.target.value) || null)} /></Grid></Grid></Box>)}</AccordionDetails></Accordion>

        <Divider sx={{ my: 2 }} /><Box display="flex" justifyContent="flex-end" gap={1}><Button variant="outlined" color="inherit" onClick={onClose} disabled={submitting}>Cancelar</Button><Button variant="contained" onClick={handleSubmit} disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}>{submitting ? "Guardando..." : "Guardar expediente"}</Button></Box>
      </Box>
    </Modal>
  );
};

export default AsociadoPerfilModal;
