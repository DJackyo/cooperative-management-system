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
import { User } from "@/interfaces/User";

type UserModalProps = {
  open: boolean;
  onClose: () => void;
  formData: Omit<User, "id" | "fechaRegistro" | "fechaModificacion">;
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
          {editingUser
            ? "Editar Usuario " + formData.idAsociado.nombres
            : "Crear Usuario"}
        </Typography>
        <Box component="form" noValidate autoComplete="off">
          <Grid container spacing={2}>
            <Grid  size={{ xs: 12, md:  6}}>
              <TextField
                fullWidth
                label="Identificación"
                margin="normal"
                name="identification"
                value={formData.idAsociado.numeroDeIdentificacion}
                onChange={onChange}
                disabled={true}
              />
            </Grid>
            <Grid  size={{ xs: 12, md:  6}}>
              <TextField
                fullWidth
                label="Correo Electrónico"
                margin="normal"
                name="email"
                value={formData.correoElectronico}
                onChange={onChange}
              />
            </Grid>
            <Grid  size={{ xs: 12, md:  6}}>
              <TextField
                fullWidth
                select
                label="Rol"
                margin="normal"
                name="role"
                value={formData.roles}
                onChange={onChange}
              >
                <MenuItem value="1">Socio</MenuItem>
                <MenuItem value="3">Gestor</MenuItem>
                <MenuItem value="2">Administrador</MenuItem>
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
