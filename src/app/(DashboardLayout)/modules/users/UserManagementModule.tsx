// src/(DashboardLayout)/modules/users/UserManagementModule.tsx

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { User } from "@/interfaces/User";
import UserModal from "./components/UserModal";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/services/userService"; // Importa el servicio
import {
  IconClipboardList,
  IconUsersGroup,
  IconUsersPlus,
} from "@tabler/icons-react";
import DashboardCard from "../../components/shared/DashboardCard";

const UserManagementModule = () => {
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<Omit<User, "id" | "status">>({
    names: "",
    email: "",
    identification: "",
    contactData: "",
    locationData: "",
    role: "",
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeUsersCount, setActiveUsersCount] = useState(0);

  useEffect(() => {
    const loadUsers = async () => {
      const response = await fetchUsers();
      setUsers(response.data);
      const count = response.data.filter(
        (user) => user.status === "activo"
      ).length;
      setActiveUsersCount(count);
    };
    loadUsers();
  }, []);

  // Filtra la lista de usuarios según la búsqueda
  const filteredUsers = users.filter(
    (user:User) =>
      user.names.toLowerCase().includes(search.toLowerCase()) || // Asegúrate que la propiedad sea 'name'
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        names: user.names,
        email: user.email,
        identification: user.identification || "",
        contactData: user.contactData || "",
        locationData: user.locationData || "",
        role: user.role.toLowerCase(),
      });
    } else {
      setEditingUser(null);
      setFormData({
        names: "",
        email: "",
        identification: "",
        contactData: "",
        locationData: "",
        role: "",
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingUser(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        // Actualizar usuario
        await updateUser(editingUser.id, formData); // Llama a la función del servicio
      } else {
        // Crear usuario
        await createUser(formData); // Llama a la función del servicio
      }
      // Recargar usuarios
      const usersData = await fetchUsers();
      setUsers(usersData);
      handleCloseModal();
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      // Manejar errores (puedes mostrar un mensaje al usuario)
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id); // Llama a la función del servicio
      setUsers(users.filter((user) => user.id !== id)); // Actualiza el estado local
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      // Manejar errores (puedes mostrar un mensaje al usuario)
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={4}>
        <DashboardCard title="">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Avatar
              sx={{ bgcolor: "#e3f2fd", width: 56, height: 56, marginRight: 2 }}
            >
              <IconUsersGroup width={24} color="#1976d2" />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {activeUsersCount}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Usuarios Activos
              </Typography>
            </Box>
          </Box>
        </DashboardCard>
      </Grid>
      <Grid item xs={4}>
        <DashboardCard title="">
          <Box padding={2}></Box>
        </DashboardCard>
      </Grid>
      <Grid item xs={4}>
        <DashboardCard>
          <Box padding={2}>
            <Button variant="contained" onClick={() => handleOpenModal()}>
              Crear Usuario
            </Button>
          </Box>
        </DashboardCard>
      </Grid>

      {/* Tabla de Usuarios */}
      <Grid item xs={12}>
        <DashboardCard title="Listado de usuarios">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombres</TableCell>
                  <TableCell>Correo</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.names}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenModal(user)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(user.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DashboardCard>
      </Grid>
      <UserModal
        open={openModal}
        onClose={handleCloseModal}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        editingUser={editingUser !== null}
      />
    </Grid>
  );
};

export default UserManagementModule;
