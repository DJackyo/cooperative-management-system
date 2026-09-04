import React from "react";
import { Alert, Box, Modal, Typography, TextField, Select, MenuItem, Button, Grid, Divider, CircularProgress } from "@mui/material";
import { User } from "@/interfaces/User";

type UserModalProps = {
  open: boolean;
  onClose: () => void;
  formData: Omit<User, "id" | "fechaRegistro" | "fechaModificacion">;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  editingUser: boolean;
  formError?: string | null;
  submitting?: boolean;
};

const UserModal: React.FC<UserModalProps> = ({ open, onClose, formData, onChange, onSubmit, editingUser, formError, submitting = false }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          bgcolor: "background.paper",
          boxShadow: 24,
          p: { xs: 2, sm: 3 },
          width: { xs: "calc(100% - 32px)", sm: "min(720px, calc(100% - 48px))" },
          maxHeight: "calc(100vh - 32px)",
          overflowY: "auto",
          margin: "auto",
          marginTop: { xs: 2, sm: 6 },
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          {editingUser ? "Editar Asociado " + formData.idAsociado.nombres : "Crear Asociado y Usuario"}
        </Typography>
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        <Box component="form" noValidate autoComplete="off">
          <Grid container spacing={2}>
            {/* Asociado info */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                Información del asociado
              </Typography>
              <Divider sx={{ mt: 0.5 }} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label="Tipo Identificación"
                margin="normal"
                value={formData.idAsociado.tipoIdentificacionId || ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value as string, 10);
                  onChange({
                    target: {
                      name: "idAsociado.tipoIdentificacionId",
                      value: isNaN(val) ? null : val,
                    },
                  } as any);
                }}
              >
                <MenuItem value={1}>CÉDULA DE CIUDADANÍA</MenuItem>
                <MenuItem value={2}>PASAPORTE</MenuItem>
                <MenuItem value={3}>TARJETA DE IDENTIDAD</MenuItem>
                <MenuItem value={4}>CÉDULA DE EXTRANJERÍA</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Identificación" margin="normal" name="idAsociado.numeroDeIdentificacion" value={formData.idAsociado.numeroDeIdentificacion || ""} onChange={onChange} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Fecha de Expedición"
                margin="normal"
                name="idAsociado.fechaDeExpedicion"
                value={formData.idAsociado.fechaDeExpedicion || ""}
                onChange={onChange}
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Nombre 1" margin="normal" name="idAsociado.nombre1" value={formData.idAsociado.nombre1 || ""} onChange={onChange} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Nombre 2" margin="normal" name="idAsociado.nombre2" value={formData.idAsociado.nombre2 || ""} onChange={onChange} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Apellido 1" margin="normal" name="idAsociado.apellido1" value={formData.idAsociado.apellido1 || ""} onChange={onChange} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Apellido 2" margin="normal" name="idAsociado.apellido2" value={formData.idAsociado.apellido2 || ""} onChange={onChange} />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Fecha de Nacimiento"
                margin="normal"
                name="idAsociado.fechaDeNacimiento"
                value={formData.idAsociado.fechaDeNacimiento || ""}
                onChange={onChange}
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Género" margin="normal" name="idAsociado.genero" value={formData.idAsociado.genero || ""} onChange={onChange} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Estado Civil" margin="normal" name="idAsociado.estadoCivil" value={formData.idAsociado.estadoCivil || ""} onChange={onChange} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label="Estado Asociado"
                margin="normal"
                value={formData.idAsociado.idEstado.estado}
                onChange={(e) => {
                  const estado = e.target.value as string;
                  // map estado to id same as options
                  const idMap: Record<string, number> = {
                    ACTIVO: 1,
                    INACTIVO: 2,
                    EXASOCIADO: 3,
                    RETIRADO: 4,
                    RSD: 5,
                    EXCLUIDO: 6,
                  };
                  onChange({
                    target: {
                      name: "idAsociado.idEstado",
                      value: { id: idMap[estado] || 0, estado },
                    },
                  } as any);
                }}
              >
                <MenuItem value="ACTIVO">Activo</MenuItem>
                <MenuItem value="INACTIVO">Inactivo</MenuItem>
                <MenuItem value="EXASOCIADO">Exasociado</MenuItem>
                <MenuItem value="RETIRADO">Retirado</MenuItem>
                <MenuItem value="RSD">RSD</MenuItem>
                <MenuItem value="EXCLUIDO">Excluido</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label="¿Es asociado?"
                margin="normal"
                name="idAsociado.esAsociado"
                value={formData.idAsociado.esAsociado !== undefined ? String(formData.idAsociado.esAsociado) : "true"}
                onChange={(e) => onChange({
                  target: {
                    name: "idAsociado.esAsociado",
                    value: e.target.value === "true",
                  },
                } as any)}
              >
                <MenuItem value="true">Sí</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Grid>

            {/* Usuario credentials */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ mt: 1 }}>
                Acceso al sistema
              </Typography>
              <Divider sx={{ mt: 0.5 }} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Correo Electrónico" margin="normal" name="correoElectronico" value={formData.correoElectronico || ""} onChange={onChange} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Contraseña" margin="normal" type="password" name="contrasena" value={formData.contrasena || ""} onChange={onChange} disabled={editingUser} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label="Rol"
                margin="normal"
                value={formData.roles && formData.roles.length > 0 ? formData.roles[0].id : ""}
                onChange={(e) => {
                  const id = parseInt(e.target.value as string, 10);
                  const map: Record<number, string> = {
                    1: "socio",
                    2: "administrador",
                    3: "gestor",
                  };
                  onChange({
                    target: {
                      name: "roles",
                      value: { id, nombre: map[id] || "" },
                    },
                  } as any);
                }}
              >
                <MenuItem value={1}>Socio</MenuItem>
                <MenuItem value={3}>Gestor</MenuItem>
                <MenuItem value={2}>Administrador</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="flex-end" gap={1} sx={{ mt: 3 }}>
            <Button variant="outlined" color="inherit" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={onSubmit} disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}>
              {submitting ? "Guardando..." : editingUser ? "Actualizar" : "Crear"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default UserModal;
