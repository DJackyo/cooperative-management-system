import React from "react";
import {
  Box,
  Modal,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Grid,
} from "@mui/material";

type UserModalProps = {
  open: boolean;
  onClose: () => void;
  formData: {
    names: string;
    email: string;
    identification: string;
    contactData: string;
    locationData: string;
    role: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: () => void;
  editingUser: boolean;
};

const UserModal: React.FC<UserModalProps> = ({
  open,
  onClose,
  formData,
  onChange,
  onSubmit,
  editingUser,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          bgcolor: "background.paper",
          boxShadow: 24,
          padding: 4,
          width: "40rem",
          margin: "auto",
          marginTop: "100px",
        }}
      >
        <Typography variant="h6" gutterBottom>
          {editingUser ? "Editar Usuario" : "Crear Usuario"}
        </Typography>
        <Box component="form" noValidate autoComplete="off">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Nombres"
                margin="normal"
                name="names" // Asegúrate de que el name coincida
                value={formData.names}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Correo Electrónico"
                margin="normal"
                name="email"
                value={formData.email}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Identificación"
                margin="normal"
                name="identification"
                value={formData.identification}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Datos de Contacto"
                margin="normal"
                name="contactData"
                value={formData.contactData}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Datos de Ubicación"
                margin="normal"
                name="locationData"
                value={formData.locationData}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Rol"
                margin="normal"
                name="role"
                value={formData.role}
                onChange={onChange}
              >
                <MenuItem value="socio">Socio</MenuItem>
                <MenuItem value="gestor">Gestor</MenuItem>
                <MenuItem value="administrador">Administrador</MenuItem>
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
