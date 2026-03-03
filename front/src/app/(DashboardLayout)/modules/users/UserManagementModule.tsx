import React, { useState, useEffect, useCallback } from "react";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Chip from "@mui/material/Chip";

import { LoggedUser, User, Asociado } from "@/interfaces/User";
import { userService } from "@/services/userService";
import { asociadosService } from "@/services/asociadosService";
import UserModal from "./components/UserModal";
import DashboardCard from "../../components/shared/DashboardCard";
import { useRouter } from "next/navigation";
import { setupAxiosInterceptors } from "@/services/axiosClient";
// dinámico para evitar SSR en formularios pesados
import dynamic from "next/dynamic";
import { creditsService } from "@/services/creditRequestService";

// componente de formulario de créditos reutilizado
const CreditForm = dynamic(() => import("../credit/components/CreditForm"), {
  ssr: false,
});

import {
  IconUsersGroup,
  IconUserEdit,
  IconUserCancel,
  IconEditCircle,
  IconEyeDollar,
  IconCoins,
  IconUserCog,
  IconUserDollar,
  IconPigMoney,
  IconDeviceIpadHorizontalDollar,
  IconRefresh,
} from "@tabler/icons-react";
import { authService } from "@/app/authentication/services/authService";
import { defaultAporteValue } from "../../utilities/AportesUtils";
import { defaultLoggedUser } from "../../utilities/utils";
import { Aporte } from "@/interfaces/Aporte";
import AporteModal from "../savings/components/AporteModal";
import StyledTable from "@/components/StyledTable";
import { savingsService } from "@/services/savingsService";
import GenericLoadingSkeleton from "@/components/GenericLoadingSkeleton";
import { usePageLoading } from "@/hooks/usePageLoading";
import { Badge } from "@mui/material";

const UserManagementModule = () => {
  const router = useRouter();
  const { loading, stopLoading } = usePageLoading();

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
      nombre1: "",
      nombre2: "",
      apellido1: "",
      apellido2: "",
      numeroDeIdentificacion: "",
      idEstado: { id: 1, estado: "ACTIVO" },
      id: 0,
      tipoIdentificacionId: null,
      fechaDeExpedicion: null,
      fechaDeNacimiento: null,
      genero: null,
      estadoCivil: null,
      esAsociado: true,
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
  const [filterState, setFilterState] = useState<string>("ACTIVO");

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElLoans, setAnchorElLoans] = useState(null);
  const [anchorElSavings, setAnchorElSavings] = useState(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // Estado para el usuario actual
  const [currentUser, setCurrentUser] = useState<LoggedUser>(defaultLoggedUser);
  //Aporte
  const [selectedAporte, setSelectedAporte] = useState<Aporte | null>(null); // Estado para la fila seleccionada
  const [openAporteModal, setOpenAporteModal] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(false);
  // crédito modal states
  const [openCreditModal, setOpenCreditModal] = useState(false);
  const [creditTasas, setCreditTasas] = useState<any[]>([]);
  const [creditUserInfo, setCreditUserInfo] = useState<Asociado | null>(null);

  const refreshUsersWithLoans = async () => {
    setLoadingLoans(true);
    try {
      const response = await userService.fetchAllWithLoans();
      setUsers(response);
    } catch (error) {
      console.error('Error al actualizar préstamos:', error);
    } finally {
      setLoadingLoans(false);
    }
  };

  useEffect(() => {
    // make sure interceptors are ready for any request
    setupAxiosInterceptors(router);

    const loadUsers = async () => {
      const hasSession = authService.isAuthenticated();
      if (hasSession) {
        const response = await userService.fetchAllWithLoans();
        setUsers(response);
        const count = response.filter(
          (user: User) => user.idAsociado?.idEstado.estado === "ACTIVO"
        ).length;
        setActiveUsersCount(count);
        const user = await authService.getCurrentUserData();
        setCurrentUser(user);
        stopLoading();
      }
    };

    loadUsers();
  }, [router]);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: any }>
  ) => {
    const { name, value } = e.target as any;
    if (!name) return;
    if (name.includes(".")) {
      const path = name.split(".");
      setFormData((prev) => {
        const updated: any = { ...prev };
        let cursor = updated;
        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i];
          cursor[key] = { ...(cursor[key] || {}) };
          cursor = cursor[key];
        }
        cursor[path[path.length - 1]] = value;
        return updated;
      });
    } else {
      // if roles field, ensure we store an array
      if (name === "roles") {
        setFormData({ ...formData, [name]: [value] });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    }
  };

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
      setFormError(null);
      if (!editingUser) {
        // check for duplicate email before creating asociado
        const existing: any[] = await userService.fetchAll();
        if (existing.some(u => u.correoElectronico === formData.correoElectronico)) {
          setFormError('El correo electrónico ya está registrado. Por favor use otro correo.');
          return; // abort
        }
      }

      if (editingUser && editingUser.id) {
        if (formData.idAsociado && formData.idAsociado.id) {
          await asociadosService.update(formData.idAsociado.id, formData.idAsociado as any);
        }
        await userService.update(editingUser.id, formData as any);
      } else {
        let asociadoPayload: any = { ...formData.idAsociado };
        if (asociadoPayload && !asociadoPayload.id) {
          if (asociadoPayload.idEstado && typeof asociadoPayload.idEstado === 'string') {
            asociadoPayload.idEstado = { id: 1, estado: asociadoPayload.idEstado };
          }
          const createdAsoc = await asociadosService.create(asociadoPayload);
          asociadoPayload = createdAsoc;
        }
        const userPayload = { ...formData, idAsociado: asociadoPayload, username: formData.correoElectronico };
        await userService.create(userPayload as any);
      }
      const usersData: any = await userService.fetchAll();
      setUsers(usersData);
      handleCloseModal();
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

  const handleClickUser = (event: any, user: User) => {
    setAnchorElUser(event.currentTarget);
    setSelectedUser(user);
  };
  const handleClickLoans = (event: any, user: User) => {
    setAnchorElLoans(event.currentTarget);
    setSelectedUser(user);
  };
  const handleClickSavings = (event: any, user: User) => {
    setAnchorElSavings(event.currentTarget);
    setSelectedUser(user);
  };

  const handleClose = () => {
    setAnchorElUser(null);
    setAnchorElLoans(null);
    setAnchorElSavings(null);
    setSelectedUser(null);
  };

  const handleViewCredits = (user?: User) => {
    if (user) {
      router.push(`/modules/credit?userId=${user.idAsociado.id}`);
    }
  };

  const loadCreditTasas = useCallback(async () => {
    if (creditTasas.length === 0) {
      try {
        const resp = await creditsService.getTasas();
        setCreditTasas(resp || []);
      } catch (err) {
        console.error("Error al cargar tasas:", err);
      }
    }
  }, [creditTasas]);

  // load tasas once on mount so the modal has data ready
  useEffect(() => {
    loadCreditTasas();
  }, [loadCreditTasas]);

  const handleCreateCredit = (user?: User) => {
    if (user) {
      setCreditUserInfo(user.idAsociado);
      loadCreditTasas();
      setOpenCreditModal(true);
    }
  };

  const handleCreditSubmit = async (formData: any) => {
    try {
      if (formData.monto) {
        formData.idAsociado = creditUserInfo;
        const saved = await creditsService.create(formData);
        // cerrar inmediatamente para evitar solapamientos
        setOpenCreditModal(false);

        const Swal = (await import('sweetalert2')).default;
        if (saved) {
          await Swal.fire({
            title: '¡Solicitud Creada!',
            text: `Su solicitud de crédito ha sido enviada exitosamente.`,
            icon: 'success',
            confirmButtonText: 'OK',
            zIndex: 10000,
          } as any);
          refreshUsersWithLoans();
        } else {
          await Swal.fire({
            title: 'Error',
            text: 'No se pudo crear la solicitud. Intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'OK',
            zIndex: 10000,
          } as any);
        }
      } else {
        setOpenCreditModal(false);
      }
    } catch (error) {
      console.error('Error creando crédito:', error);
      setOpenCreditModal(false);
      const Swal = (await import('sweetalert2')).default;
      await Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al enviar la solicitud. Revise su conexión.',
        icon: 'error',
        confirmButtonText: 'OK',
        zIndex: 10000,
      } as any);
    }
  };

  const handleSavingsAsociado = (user?: User) => {
    if (user) {
      router.push(`/modules/savings?id=${user.idAsociado.id}`);
    }
  };

  const handleCreateAporteClick = (userInfo: any) => {
    defaultAporteValue.asociado = userInfo;
    defaultAporteValue.idUsuarioRegistro = currentUser.userId;
    console.log("defaultAporteValue", defaultAporteValue, currentUser);
    setSelectedAporte(defaultAporteValue);
    setOpenAporteModal(true);
  };

  const handleAporteModalClose = () => {
    setOpenAporteModal(false);
  };

  const handleAporteSubmit = async (aporte: Aporte) => {
    console.log("Aporte registrado:", aporte);
    if (aporte.monto) {
      aporte.idAsociado = aporte.asociado?.id;
      let saved = await savingsService.create(aporte);
      if (saved) {
        const Swal = (await import('sweetalert2')).default;
        Swal.fire({
          title: '¡Éxito!',
          text: 'Registro almacenado correctamente',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
    }
  };


  if (loading) {
    return <GenericLoadingSkeleton type="table" rows={8} />;
  }

  return (
    <Grid container spacing={3}>
      <Grid  size={{ xs: 12, md: 4 }}>
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

      <Grid  size={{ xs: 12 }}>
        <DashboardCard title="">
          <Grid container spacing={2} sx={{ marginBottom: 2 }}>
            <Grid  size={{ xs: 12 }}>
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
            <Grid  size={{ xs: 12, md: 6 }}>
              {/* Filtro por nombre */}
              <TextField
                label="Buscar por nombres o ID"
                variant="outlined"
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
              />
            </Grid>

            <Grid  size={{ xs: 12, md: 6 }}>
              {/* Filtro por estado */}
              <FormControl fullWidth>
                <InputLabel id="estado-label">Filtrar por estado</InputLabel>
                <Select
                  labelId="estado-label"
                  id="estado-select"
                  value={filterState}
                  label="Filtrar por estado"
                  onChange={(e) => setFilterState(e.target.value)}
                  size="small"
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

      <Grid  size={{ xs: 12 }}>
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
              <Box sx={{ display: 'flex', gap: 1, marginBottom : 3 }}>
                <Button 
                  variant="outlined" 
                  onClick={refreshUsersWithLoans}
                  disabled={loadingLoans}
                  startIcon={<IconRefresh />}
                  size="small"
                >
                  {loadingLoans ? 'Actualizando...' : 'Actualizar Préstamos'}
                </Button>
                <Button variant="outlined" onClick={() => handleOpenModal()}>
                  Crear Asociado
                </Button>
              </Box>
            </Box>

            <StyledTable
              columns={[
                { field: "id", headerName: "ID", width: 70 },
                { field: "idAsociado.nombres", headerName: "Nombres", width: 150 },
                { field: "correoElectronico", headerName: "Correo", width: 180 },
                { field: "roles", headerName: "Rol", width: 150 },
                { field: "estado", headerName: "Estado", width: 120 },
                { field: "prestamos", headerName: "Préstamos", width: 130 },
                { field: "acciones", headerName: "Acciones", width: 200 },
              ]}
              rows={sortedUsers}
              withPagination={true}
              pageSizeOptions={[10, 25, 50]}
              renderCell={(column, user) => {
                switch (column.field) {
                  case "id":
                    return user.id;
                  case "idAsociado.nombres":
                    return user.idAsociado ? user.idAsociado.nombres : "Sin asociado";
                  case "correoElectronico":
                    return user.correoElectronico || "No disponible";
                  case "roles":
                    return user.roles.length > 0
                      ? user.roles.map((role: any) => (
                          <Chip
                            key={role.id}
                            label={role.nombre || "Nombre no disponible"}
                            style={{ margin: "2px" }}
                            size="small"
                            color={getRoleColor(role.nombre)}
                          />
                        ))
                      : "Sin rol";
                  case "estado":
                    return user.idAsociado ? (
                      <Chip
                        label={user.idAsociado.idEstado.estado}
                        color={getStatusColor(user.idAsociado.idEstado.estado)}
                        size="small"
                      />
                    ) : (
                      "Sin estado"
                    );
                  case "prestamos":
                    return (user.activeLoansCount || 0) > 0 ? (
                      <Chip
                        label={`${user.activeLoansCount} activo(s)`}
                        color="primary"
                        size="small"
                        icon={<IconDeviceIpadHorizontalDollar />}
                      />
                    ) : (
                      <Chip
                        label="Sin préstamos"
                        color="default"
                        size="small"
                        variant="outlined"
                      />
                    );
                  case "acciones":
                    return (
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap', minWidth: 150 }}>
                        {/* Botón para acciones de Usuario */}
                        <ButtonGroup variant="outlined" size="small">
                          <IconButton onClick={(e) => handleClickUser(e, user)}>
                            <IconUserCog />
                          </IconButton>
                        </ButtonGroup>

                        {/* Botón para acciones de Préstamos */}
                        <ButtonGroup variant="outlined" size="small">
                          <IconButton 
                            onClick={(e) => handleClickLoans(e, user)}
                            sx={{
                              backgroundColor: (user.activeLoansCount || 0) > 0 ? '#e3f2fd' : 'transparent',
                              '&:hover': {
                                backgroundColor: (user.activeLoansCount || 0) > 0 ? '#bbdefb' : 'rgba(0, 0, 0, 0.04)'
                              }
                            }}
                          >
                            <Badge 
                              badgeContent={user.activeLoansCount || 0} 
                              color="primary"
                              invisible={!(user.activeLoansCount || 0)}
                            >
                              <IconDeviceIpadHorizontalDollar 
                                color={(user.activeLoansCount || 0) > 0 ? '#1976d2' : undefined}
                              />
                            </Badge>
                          </IconButton>
                        </ButtonGroup>

                        {/* Botón para acciones de Ahorros */}
                        <ButtonGroup variant="outlined" size="small">
                          <IconButton onClick={(e) => handleClickSavings(e, user)}>
                            <IconPigMoney />
                          </IconButton>
                        </ButtonGroup>
                      </Box>
                    );
                  default:
                    return user[column.field];
                }
              }}
            />

            {/* Menús contextuales */}
            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleClose}
              sx={{
                boxShadow:
                  "rgba(0, 0, 0, 0.07) 0px 4px 10px -2px, rgba(0, 0, 0, 0.04) 0px 6px 12px -4px !important",
              }}
              elevation={1}
            >
              <Typography
                variant="subtitle2"
                sx={{ padding: "8px 16px", fontWeight: "bold" }}
              >
                Usuario
              </Typography>
              <MenuItem onClick={() => {
                handleOpenModal(selectedUser!);
                handleClose();
              }}>
                <IconUserEdit style={{ marginRight: "1rem" }} />
                Editar Usuario
              </MenuItem>
              <MenuItem onClick={() => {
                handleDeactivate(selectedUser!);
                handleClose();
              }}>
                <IconUserCancel
                  style={{ marginRight: "1rem" }}
                />
                Inactivar Usuario
              </MenuItem>
              <Typography
                variant="subtitle2"
                sx={{ padding: "8px 16px", fontWeight: "bold" }}
              >
                Asociado
              </Typography>
              <MenuItem
                onClick={() => {
                  handleOpenAsociado(selectedUser!);
                  handleClose();
                }}
              >
                <IconEditCircle
                  style={{ marginRight: "1rem" }}
                />
                Editar Asociado
              </MenuItem>
            </Menu>

            <Menu
              anchorEl={anchorElLoans}
              open={Boolean(anchorElLoans)}
              onClose={handleClose}
              elevation={1}
            >
              <Typography
                variant="subtitle2"
                sx={{ padding: "8px 16px", fontWeight: "bold" }}
              >
                Préstamos
              </Typography>
              <MenuItem
                onClick={() => {
                  handleCreateCredit(selectedUser!);
                  handleClose();
                }}
              >
                <IconEditCircle
                  style={{ marginRight: "1rem" }}
                />
                Crear Préstamo
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleViewCredits(selectedUser!);
                  handleClose();
                }}
                disabled={!(selectedUser?.activeLoansCount || 0)}
                sx={{
                  opacity: !(selectedUser?.activeLoansCount || 0) ? 0.5 : 1
                }}
              >
                <IconEyeDollar
                  style={{ marginRight: "1rem" }}
                />
                Ver Préstamos
              </MenuItem>
            </Menu>

            <Menu
              anchorEl={anchorElSavings}
              open={Boolean(anchorElSavings)}
              onClose={handleClose}
              elevation={1}
            >
              <MenuItem
                onClick={() => {
                  handleSavingsAsociado(selectedUser!);
                  handleClose();
                }}
              >
                <IconCoins style={{ marginRight: "1rem" }} />
                Ver aportes
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleCreateAporteClick(selectedUser!);
                  handleClose();
                }}
              >
                <IconUserDollar
                  style={{ marginRight: "1rem" }}
                />
                Crear aporte
              </MenuItem>
            </Menu>

            {/* Paginación ahora manejada internamente por StyledTable */}
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
        formError={formError}
      />
      {/* Modal para crear préstamo desde esta página */}
      <Dialog open={openCreditModal} onClose={() => setOpenCreditModal(false)} fullWidth maxWidth="md">
        <DialogTitle>
          <Typography variant="h6" component="span">
            Nueva Solicitud de Crédito
          </Typography>
        </DialogTitle>
        <DialogContent>
          <CreditForm mode="create" tasas={creditTasas} onSubmit={handleCreditSubmit} />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenCreditModal(false)} color="secondary" variant="outlined" startIcon={<IconUserCancel />}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para subir soporte de pago */}
      <AporteModal
        open={openAporteModal}
        onClose={handleAporteModalClose}
        onSubmit={handleAporteSubmit}
        initialData={selectedAporte || null}
      />
    </Grid>
  );
};

export default UserManagementModule;
