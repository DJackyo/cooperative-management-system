import React, { useState, useEffect } from "react";
import {
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
  TableSortLabel,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Pagination,
} from "@mui/material";
import Chip from "@mui/material/Chip";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { User } from "@/interfaces/User";
import UserModal from "./components/UserModal";
import { userService } from "@/services/userService";
import { IconUsersGroup } from "@tabler/icons-react";
import DashboardCard from "../../components/shared/DashboardCard";

const UserManagementModule = () => {
  const [search, setSearch] = useState(""); // Estado para el filtro de búsqueda
  const [openModal, setOpenModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const defaultData = {
    username: "",
    correoElectronico: "",
    contrasena: "",
    roles: [{ id: 1, nombre: "socio" }],
    idAsociado: {
      nombres: "",
      numeroDeIdentificacion: "",
      idEstado: { id: 1, estado: "activo" },
    },
  };
  const [formData, setFormData] =
    useState<Omit<User, "id" | "fechaRegistro" | "fechaModificacion">>(
      defaultData
    );

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeUsersCount, setActiveUsersCount] = useState(0);

  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("idAsociado.nombres");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterState, setFilterState] = useState<string>(""); // Filtro por estado

  useEffect(() => {
    const loadUsers = async () => {
      const response = await userService.fetchUsers();
      setUsers(response);
      const count = response.filter(
        (user: User) => user.idAsociado?.idEstado.estado === "ACTIVO"
      ).length;
      setActiveUsersCount(count);
    };
    loadUsers();
  }, []);

  const filteredUsers = users?.filter((user: User) => {
    const matchesName = user.idAsociado.nombres
      .toLowerCase()
      .includes(search.toLowerCase()) || user.id.toString() == search;
    const matchesState = filterState
      ? user.idAsociado.idEstado.estado === filterState
      : true;
    return matchesName && matchesState;
  });

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedUsers = filteredUsers.sort((a: any, b: any) => {
    let nameA = a.idAsociado?.nombres?.toLowerCase() || "";
    let nameB = b.idAsociado?.nombres?.toLowerCase() || "";
    if (orderBy == "id") {
      nameA = a.id;
      nameB = b.id;
    }

    if (nameA < nameB) {
      return order === "asc" ? -1 : 1;
    }
    if (nameA > nameB) {
      return order === "asc" ? 1 : -1;
    }
    return 0;
  });

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Volver a la primera página cuando cambies las filas por página
  };

  const statusColors: any = {
    ACTIVO: "success",
    RETIRADO: "default",
    RSD: "info",
    EXASOCIADO: "warning",
    INACTIVO: "error",
    EXCLUIDO: "error",
  };

  const getStatusColor = (estado: string) => {
    return statusColors[estado] || "default";
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        ...user,
      });
    } else {
      setEditingUser(null);
      setFormData(defaultData);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingUser(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        // Actualizar usuario
        // await userService.updateUser(editingUser.id, formData); // Llama a la función del servicio
      } else {
        // Crear usuario
        // await userService.createUser(formData); // Llama a la función del servicio
      }
      // Recargar usuarios
      const usersData: any = await userService.fetchUsers();
      setUsers(usersData);
      handleCloseModal();
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await userService.deleteUser(id); // Llama a la función del servicio
      setUsers(users.filter((user) => user.id !== id)); // Actualiza el estado local
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
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

      <Grid item xs={12}>
        <DashboardCard title="">
          <Grid container spacing={2} sx={{ marginBottom: 2 }}>
            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h5" color="primary" gutterBottom>
                  Filtro
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* Filtro por nombre */}
              <TextField
                label="Buscar por nombres o ID"
                variant="outlined"
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              {/* Filtro por estado */}
              <FormControl fullWidth>
                <InputLabel id="estado-label">Filtrar por estado</InputLabel>
                <Select
                  labelId="estado-label"
                  id="estado-select"
                  value={filterState}
                  label="Filtrar por estado"
                  onChange={(e) => setFilterState(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="ACTIVO">Activo</MenuItem>
                  <MenuItem value="INACTIVO">Inactivo</MenuItem>
                  <MenuItem value="EXASOCIADO">Exasociado</MenuItem>
                  <MenuItem value="RETIRADO">Retirado</MenuItem>
                  <MenuItem value="RSD">RSD</MenuItem>
                  <MenuItem value="EXCLUIDO">Excluido</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DashboardCard>
      </Grid>

      <Grid item xs={12}>
        <DashboardCard title="">
          <Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" color="primary" gutterBottom>
                Listado de usuarios
              </Typography>
              {/* <Button variant="outlined" onClick={() => handleOpenModal()}>
                Crear Usuario
              </Button> */}
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "id"}
                        direction={orderBy === "id" ? order : "asc"}
                        onClick={() => handleRequestSort("id")}
                      >
                        ID
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "idAsociado.nombres"}
                        direction={
                          orderBy === "idAsociado.nombres" ? order : "asc"
                        }
                        onClick={() => handleRequestSort("idAsociado.nombres")}
                      >
                        Nombres
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Correo</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>
                          {user.idAsociado
                            ? user.idAsociado.nombres
                            : "Sin asociado"}
                        </TableCell>
                        <TableCell>
                          {user.correoElectronico || "No disponible"}
                        </TableCell>
                        <TableCell>
                          {user.roles.length > 0
                            ? user.roles
                                .map(
                                  (role) =>
                                    role.nombre || "Nombre no disponible"
                                )
                                .join(", ")
                            : "Sin rol"}
                        </TableCell>
                        <TableCell>
                          {user.idAsociado ? (
                            <Chip
                              label={user.idAsociado.idEstado.estado}
                              color={getStatusColor(
                                user.idAsociado.idEstado.estado
                              )}
                              size="small"
                            />
                          ) : (
                            "Sin estado"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Paginación */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página"
              />
              <Pagination
                count={Math.ceil(filteredUsers.length / rowsPerPage)}
                page={page}
                onChange={handleChangePage}
                color="primary"
                shape="rounded"
                siblingCount={1} // Número de páginas visibles a la izquierda y derecha del número actual
              />
            </Box>
          </Box>
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
