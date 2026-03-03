import React from "react";
import { Box, Modal, Typography, TextField, Select, MenuItem, Button, Grid } from "@mui/material";
import { User } from "@/interfaces/User";

type UserModalProps = {
  open: boolean;
  onClose: () => void;
  formData: Omit<User, "id" | "fechaRegistro" | "fechaModificacion">;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  editingUser: boolean;
  formError?: string | null;
};

const UserModal: React.FC<UserModalProps> = ({ open, onClose, formData, onChange, onSubmit, editingUser, formError }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          bgcolor: "background.paper",
          boxShadow: 24,
          padding: 4,
          width: "60vw",
          margin: "auto",
          marginTop: "50px",
        }}
      >
        <Typography variant="h6" gutterBottom>
          {editingUser ? "Editar Asociado " + formData.idAsociado.nombres : "Crear Asociado y Usuario"}
        </Typography>
        {formError && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {formError}
          </Typography>
        )}
        <Box component="form" noValidate autoComplete="off">
          <Grid container spacing={2}>
            {/* Asociado info */}
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
              <TextField fullWidth label="Identificación" margin="normal" name="idAsociado.numeroDeIdentificacion" value={formData.idAsociado.numeroDeIdentificacion} onChange={onChange} />
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
                onChange={onChange}
              >
                <MenuItem value="true">Sí</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Grid>

            {/* Usuario credentials */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Correo Electrónico" margin="normal" name="correoElectronico" value={formData.correoElectronico} onChange={onChange} />
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
          <Button variant="contained" onClick={onSubmit} sx={{ marginTop: 2 }}>
            {editingUser ? "Actualizar" : "Crear"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UserModal;
