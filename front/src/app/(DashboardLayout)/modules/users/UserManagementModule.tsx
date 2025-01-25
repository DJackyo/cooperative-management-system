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
  ButtonGroup,
  Menu,
  Divider,
} from "@mui/material";
import Chip from "@mui/material/Chip";

import { User } from "@/interfaces/User";
import { userService } from "@/services/userService";
import UserModal from "./components/UserModal";
import DashboardCard from "../../components/shared/DashboardCard";
import { useRouter } from "next/navigation";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  IconUsersGroup,
  IconUserEdit,
  IconUserCancel,
  IconEditCircle,
  IconEyeDollar,
  IconCoins,
} from "@tabler/icons-react";

const UserManagementModule = () => {
  const router = useRouter();

  const [search, setSearch] = useState("");
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
      id: 0,
    },
  };
  const [formData, setFormData] =
    useState<
      Omit<User, "id" | "fechaRegistro" | "fechaModificacion" | "idAsociado.id">
    >(defaultData);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeUsersCount, setActiveUsersCount] = useState(0);

  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("idAsociado.nombres");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterState, setFilterState] = useState<string>("ACTIVO");

  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      const response = await userService.fetchAll();
      setUsers(response);
      const count = response.filter(
        (user: User) => user.idAsociado?.idEstado.estado === "ACTIVO"
      ).length;
      setActiveUsersCount(count);
    };
    loadUsers();
  }, []);

  const filteredUsers = users?.filter((user: User) => {
    const matchesName =
      user.idAsociado.nombres.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toString() == search;
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

  const handleChangePage: any = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  const roleColors: any = {
    SOCIO: "primary",
    "GESTOR DE OPERACIONES": "warning",
    ADMINISTRADOR: "success",
  };

  const getRoleColor = (role: string) => {
    return roleColors[role] || "default";
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

  const handleOpenAsociado = (user?: User) => {
    if (user) {
      console.log(user);
    }
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
        // await userService.update(editingUser.id, formData); // Llama a la función del servicio
      } else {
        // Crear usuario
        // await userService.create(formData); // Llama a la función del servicio
      }
      // Recargar usuarios
      const usersData: any = await userService.fetchAll();
      setUsers(usersData);
      handleCloseModal();
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
    }
  };

  const handleDeactivate = async (user: User) => {
    try {
      user.idAsociado.idEstado.id = 5;
      await userService.deactivate(user.id, user);
      setUsers(users.filter((user) => user.id !== user.id));
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  };

  // Abrir el menú de opciones
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  // Cerrar el menú de opciones
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCreditsAsociado = (user?: User) => {
    if (user) {
      console.log(user);
    }
  };

  const handleSavingsAsociado = (user?: User) => {
    if (user) {
      router.push(`/modules/savings?id=${user.idAsociado.id}`);
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
              <Button variant="outlined" onClick={() => handleOpenModal()}>
                Crear Asociado
              </Button>
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
                    <TableCell>Acciones</TableCell>
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
                            ? user.roles.map((role) => (
                                <Chip
                                  key={role.id}
                                  label={role.nombre || "Nombre no disponible"}
                                  style={{ margin: "2px" }}
                                  size="small"
                                  color={getRoleColor(role.nombre)}
                                />
                              ))
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
                        <TableCell>
                          <ButtonGroup variant="outlined" size="small">
                            <IconButton onClick={handleClick}>
                              <MoreVertIcon />
                            </IconButton>
                          </ButtonGroup>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ padding: "8px 16px", fontWeight: "bold" }}
                            >
                              Acciones de Usuario
                            </Typography>
                            <MenuItem onClick={() => handleOpenModal(user)}>
                              <IconUserEdit style={{ marginRight: "1rem" }} />
                              Editar Usuario
                            </MenuItem>
                            <MenuItem onClick={() => handleDeactivate(user)}>
                              <IconUserCancel style={{ marginRight: "1rem" }} />
                              Inactivar Usuario
                            </MenuItem>
                            <Divider />
                            <Typography
                              variant="subtitle2"
                              sx={{ padding: "8px 16px", fontWeight: "bold" }}
                            >
                              Acciones de Asociado
                            </Typography>
                            <MenuItem onClick={() => handleOpenAsociado(user)}>
                              <IconEditCircle style={{ marginRight: "1rem" }} />
                              Editar Asociado
                            </MenuItem>
                            <MenuItem
                              onClick={() => handleCreditsAsociado(user)}
                            >
                              <IconEyeDollar style={{ marginRight: "1rem" }} />
                              Préstamos Asociado
                            </MenuItem>
                            <MenuItem
                              onClick={() => handleSavingsAsociado(user)}
                            >
                              <IconCoins style={{ marginRight: "1rem" }} />
                              Ahorros Asociado
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Paginación */}

            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página"
            />
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
