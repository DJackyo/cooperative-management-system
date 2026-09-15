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
  IconButton,
  MenuItem,
  Modal,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { IconChevronDown, IconPlus, IconTrash } from "@tabler/icons-react";
import { tiposFamiliaresService } from "@/services/tiposFamiliaresService";
import { tiposIdentificacionService } from "@/services/tiposIdentificacionService";

interface AsociadoPerfilModalProps {
  open: boolean;
  profile: any | null;
  onClose: () => void;
  onSubmit: (profile: any) => Promise<void>;
}

const dateValue = (value: string | null | undefined) => {
  if (!value) return "";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const emptyProfile = {
  asociado: {},
  contactos: {},
  ubicacion: {},
  laboral: {},
  economica: {},
  asistencia: {},
  familiares: [],
};

interface FieldProps {
  formData: any;
  section: string;
  name: string;
  label: string;
  type?: string;
  select?: boolean;
  onChange: (section: string, name: string, value: any) => void;
}

const Field: React.FC<FieldProps> = ({
  formData,
  section,
  name,
  label,
  type = "text",
  select = false,
  onChange,
}) => {
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
        const nextValue =
          name === "empleado"
            ? event.target.value === "true"
            : type === "number"
            ? event.target.value === ""
              ? null
              : Number(event.target.value)
            : event.target.value;
        onChange(section, name, nextValue);
      }}
      InputLabelProps={type === "date" ? { shrink: true } : undefined}
    >
      {select && name === "empleado"
        ? [
            <MenuItem key="true" value="true">
              Sí
            </MenuItem>,
            <MenuItem key="false" value="false">
              No
            </MenuItem>,
          ]
        : null}
      {select && name === "asistio"
        ? [
            <MenuItem key="SI" value="SI">
              Sí
            </MenuItem>,
            <MenuItem key="NO" value="NO">
              No
            </MenuItem>,
          ]
        : null}
    </TextField>
  );
};

const defaultTiposFamiliares = [
  { id: 1, nombre: "CÓNYUGE / COMPAÑERO(A)" },
  { id: 2, nombre: "HIJO(A)" },
  { id: 3, nombre: "PADRE / MADRE" },
  { id: 4, nombre: "HERMANO(A)" },
  { id: 5, nombre: "OTRO FAMILIAR" },
];

const defaultTiposIdentificacion = [
  { id: 1, nombre: "Cédula de ciudadanía" },
  { id: 2, nombre: "Pasaporte" },
  { id: 3, nombre: "Tarjeta de identidad" },
  { id: 4, nombre: "Cédula de extranjería" },
];

const generosOptions = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMENINO", label: "Femenino" },
  { value: "OTRO", label: "Otro" },
];

const estadosCivilesOptions = [
  { value: "SOLTERO(A)", label: "Soltero(a)" },
  { value: "CASADO(A)", label: "Casado(a)" },
  { value: "UNIÓN LIBRE", label: "Unión libre" },
  { value: "DIVORCIADO(A)", label: "Divorciado(a)" },
  { value: "VIUDO(A)", label: "Viudo(a)" },
];

const ocupacionesOptions = [
  { value: "EMPLEADO", label: "Empleado" },
  { value: "INDEPENDIENTE", label: "Independiente" },
  { value: "PENSIONADO", label: "Pensionado / Jubilado" },
  { value: "COMERCIANTE", label: "Comerciante" },
  { value: "ESTUDIANTE", label: "Estudiante" },
  { value: "HOGAR", label: "Hogar / Ama de casa" },
  { value: "DESEMPLEADO", label: "Desempleado" },
  { value: "OTRO", label: "Otro" },
];

const AsociadoPerfilModal: React.FC<AsociadoPerfilModalProps> = ({
  open,
  profile,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<any>(emptyProfile);
  const [tiposFamiliaresList, setTiposFamiliaresList] = useState<any[]>(defaultTiposFamiliares);
  const [tiposIdentificacionList, setTiposIdentificacionList] = useState<any[]>(defaultTiposIdentificacion);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    tiposFamiliaresService
      .fetchAll()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setTiposFamiliaresList(data);
        }
      })
      .catch(() => {});

    tiposIdentificacionService
      .fetchAll()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setTiposIdentificacionList(data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!profile) return;
    const next = structuredClone({ ...emptyProfile, ...profile });
    next.asociado = { ...profile.asociado };
    next.contactos = { ...(profile.contactos || {}) };
    next.ubicacion = { ...(profile.ubicacion || {}) };
    next.laboral = { ...(profile.laboral || {}) };
    next.economica = { ...(profile.economica || {}) };
    next.asistencia = { ...(profile.asistencia || {}) };
    next.familiares = (profile.familiares || []).map((familiar: any) => ({
      ...familiar,
      tipoFamiliarId: familiar.tipoFamiliarId ?? familiar.tipoFamiliar?.id ?? null,
    }));
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

  const addFamiliar = () => {
    setFormData((current: any) => ({
      ...current,
      familiares: [
        ...current.familiares,
        {
          nombres: "",
          numeroDeIdentificacion: "",
          tipoIdentificacionId: null,
          tipoFamiliarId: null,
        },
      ],
    }));
  };

  const removeFamiliar = (index: number) => {
    setFormData((current: any) => ({
      ...current,
      familiares: current.familiares.filter(
        (_: any, itemIndex: number) => itemIndex !== index
      ),
    }));
  };

  const updateFamiliar = (index: number, name: string, value: any) => {
    setFormData((current: any) => ({
      ...current,
      familiares: current.familiares.map((item: any, itemIndex: number) =>
        itemIndex === index ? { ...item, [name]: value } : item
      ),
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
              {[["nombre1", "Primer nombre"], ["nombre2", "Segundo nombre"], ["apellido1", "Primer apellido"], ["apellido2", "Segundo apellido"], ["numeroDeIdentificacion", "Número de identificación"]].map(([name, label]) => <Grid key={name} size={{ xs: 12, sm: 6, md: 4 }}><TextField fullWidth label={label} value={formData.asociado[name] || ""} onChange={(event) => updateAsociado(name, name === "numeroDeIdentificacion" ? event.target.value.replace(/\D/g, "") : event.target.value)} margin="normal" /></Grid>)}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}><TextField fullWidth select label="Tipo de identificación" value={formData.asociado.tipoIdentificacionId ?? ""} onChange={(event) => updateAsociado("tipoIdentificacionId", event.target.value === "" ? null : Number(event.target.value))} margin="normal"><MenuItem value="">-- Seleccionar --</MenuItem>{tiposIdentificacionList.map((ti: any) => (<MenuItem key={ti.id} value={ti.id}>{ti.nombre}</MenuItem>))}</TextField></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}><TextField fullWidth type="date" label="Fecha de expedición" value={formData.asociado.fechaDeExpedicion || ""} onChange={(event) => updateAsociado("fechaDeExpedicion", event.target.value)} margin="normal" InputLabelProps={{ shrink: true }} /></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}><TextField fullWidth type="date" label="Fecha de nacimiento" value={formData.asociado.fechaDeNacimiento || ""} onChange={(event) => updateAsociado("fechaDeNacimiento", event.target.value)} margin="normal" InputLabelProps={{ shrink: true }} /></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  select
                  label="Género"
                  value={formData.asociado.genero || ""}
                  onChange={(event) => updateAsociado("genero", event.target.value)}
                  margin="normal"
                >
                  <MenuItem value="">-- Seleccionar --</MenuItem>
                  {generosOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                  {formData.asociado.genero &&
                    !generosOptions.some((opt) => opt.value === formData.asociado.genero) && (
                      <MenuItem value={formData.asociado.genero}>
                        {formData.asociado.genero}
                      </MenuItem>
                    )}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  select
                  label="Estado civil"
                  value={formData.asociado.estadoCivil || ""}
                  onChange={(event) => updateAsociado("estadoCivil", event.target.value)}
                  margin="normal"
                >
                  <MenuItem value="">-- Seleccionar --</MenuItem>
                  {estadosCivilesOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                  {formData.asociado.estadoCivil &&
                    !estadosCivilesOptions.some((opt) => opt.value === formData.asociado.estadoCivil) && (
                      <MenuItem value={formData.asociado.estadoCivil}>
                        {formData.asociado.estadoCivil}
                      </MenuItem>
                    )}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}><TextField fullWidth select label="Estado del asociado" value={formData.asociado.idEstado?.estado || "ACTIVO"} onChange={(event) => { const estado = event.target.value; const ids: any = { ACTIVO: 1, INACTIVO: 2, EXASOCIADO: 3, RETIRADO: 4, RSD: 5, EXCLUIDO: 6 }; updateAsociado("idEstado", { id: ids[estado], estado }); }} margin="normal">{["ACTIVO", "INACTIVO", "EXASOCIADO", "RETIRADO", "RSD", "EXCLUIDO"].map((estado) => <MenuItem key={estado} value={estado}>{estado}</MenuItem>)}</TextField></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}><TextField fullWidth select label="¿Es asociado?" value={String(formData.asociado.esAsociado ?? true)} onChange={(event) => updateAsociado("esAsociado", event.target.value === "true")} margin="normal"><MenuItem value="true">Sí</MenuItem><MenuItem value="false">No</MenuItem></TextField></Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion><AccordionSummary expandIcon={<IconChevronDown />}><Typography fontWeight={700}>Contacto y ubicación</Typography></AccordionSummary><AccordionDetails><Grid container spacing={2}>{[["contactos", "telefono1", "Teléfono principal"], ["contactos", "telefono2", "Teléfono alterno"], ["contactos", "correoElectronico", "Correo electrónico"], ["contactos", "nombre", "Contacto de referencia"], ["ubicacion", "direccion", "Dirección"], ["ubicacion", "barrio", "Barrio"], ["ubicacion", "ciudad", "Ciudad"], ["ubicacion", "pais", "País"], ["ubicacion", "telefono", "Teléfono de ubicación"]].map(([section, name, label]) => <Grid key={`${section}-${name}`} size={{ xs: 12, sm: 6, md: 4 }}><Field formData={formData} section={section} name={name} label={label} onChange={updateSection} /></Grid>)}</Grid></AccordionDetails></Accordion>

        <Accordion><AccordionSummary expandIcon={<IconChevronDown />}><Typography fontWeight={700}>Información laboral y económica</Typography></AccordionSummary><AccordionDetails><Grid container spacing={2}><Grid size={{ xs: 12, sm: 6, md: 4 }}><Field formData={formData} section="laboral" name="empleado" label="¿Es empleado?" select onChange={updateSection} /></Grid><Grid size={{ xs: 12, sm: 6, md: 4 }}><Field formData={formData} section="laboral" name="tipoContrato" label="Tipo de contrato" onChange={updateSection} /></Grid><Grid size={{ xs: 12, sm: 6, md: 4 }}><TextField fullWidth select label="Ocupación" value={formData.laboral?.ocupacion || ""} onChange={(event) => updateSection("laboral", "ocupacion", event.target.value)} margin="normal"><MenuItem value="">-- Seleccionar --</MenuItem>{ocupacionesOptions.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}{formData.laboral?.ocupacion && !ocupacionesOptions.some((opt) => opt.value === formData.laboral.ocupacion) && (<MenuItem value={formData.laboral.ocupacion}>{formData.laboral.ocupacion}</MenuItem>)}</TextField></Grid>{[["jornadaLaboral", "Jornada laboral"], ["antiguedad", "Antigüedad"]].map(([name, label]) => <Grid key={name} size={{ xs: 12, sm: 6, md: 4 }}><Field formData={formData} section="laboral" name={name} label={label} onChange={updateSection} /></Grid>)}<Grid size={{ xs: 12, sm: 6, md: 4 }}><Field formData={formData} section="laboral" name="fechaDeRetiro" label="Fecha de retiro" type="date" onChange={updateSection} /></Grid>{[["estrato", "Estrato"], ["nivelIngresos", "Nivel de ingresos"], ["sectorEconomico", "Sector económico"], ["calidad", "Calidad"], ["reingreso", "Reingreso"]].map(([name, label]) => <Grid key={name} size={{ xs: 12, sm: 6, md: 4 }}><Field formData={formData} section="economica" name={name} label={label} type={name === "estrato" || name === "nivelIngresos" ? "number" : "text"} onChange={updateSection} /></Grid>)}</Grid></AccordionDetails></Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<IconChevronDown />}>
            <Typography fontWeight={700}>Información familiar</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Registra los familiares a cargo o relacionados del asociado.
              </Typography>
              <Button size="small" variant="outlined" startIcon={<IconPlus />} onClick={addFamiliar}>
                Agregar familiar
              </Button>
            </Box>

            {formData.familiares.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center", fontStyle: "italic" }}>
                No hay familiares registrados. Haz clic en "Agregar familiar" para adicionar filas.
              </Typography>
            ) : (
              formData.familiares.map((familiar: any, index: number) => (
                <Box
                  key={familiar.id ? `fam-${familiar.id}` : `fam-idx-${index}`}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    backgroundColor: "background.paper",
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Nombres completos"
                        value={familiar.nombres || ""}
                        onChange={(event) => updateFamiliar(index, "nombres", event.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        select
                        label="Tipo de doc."
                        value={familiar.tipoIdentificacionId ?? ""}
                        onChange={(event) =>
                          updateFamiliar(
                            index,
                            "tipoIdentificacionId",
                            event.target.value === "" ? null : Number(event.target.value)
                          )
                        }
                      >
                        <MenuItem value="">-- Seleccionar --</MenuItem>
                        {tiposIdentificacionList.map((ti: any) => (
                          <MenuItem key={ti.id} value={ti.id}>
                            {ti.nombre}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Identificación"
                        value={familiar.numeroDeIdentificacion || ""}
                        onChange={(event) => updateFamiliar(index, "numeroDeIdentificacion", event.target.value.replace(/\D/g, ""))}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        fullWidth
                        size="small"
                        select
                        label="Tipo de familiar"
                        value={familiar.tipoFamiliarId ?? ""}
                        onChange={(event) =>
                          updateFamiliar(
                            index,
                            "tipoFamiliarId",
                            event.target.value === "" ? null : Number(event.target.value)
                          )
                        }
                      >
                        <MenuItem value="">-- Seleccionar --</MenuItem>
                        {tiposFamiliaresList.map((tf: any) => (
                          <MenuItem key={tf.id} value={tf.id}>
                            {tf.nombre}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 1 }} display="flex" justifyContent="center">
                      <Tooltip title="Eliminar fila">
                        <IconButton
                          color="error"
                          onClick={() => removeFamiliar(index)}
                          size="small"
                        >
                          <IconTrash size={20} />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Box>
              ))
            )}
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 2 }} /><Box display="flex" justifyContent="flex-end" gap={1}><Button variant="outlined" color="inherit" onClick={onClose} disabled={submitting}>Cancelar</Button><Button variant="contained" onClick={handleSubmit} disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}>{submitting ? "Guardando..." : "Guardar expediente"}</Button></Box>
      </Box>
    </Modal>
  );
};

export default AsociadoPerfilModal;
