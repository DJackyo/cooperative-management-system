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
  Menu,
  Divider,
  ListItemIcon,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import Chip from "@mui/material/Chip";
import StatusChip from "@/components/StatusChip";

import { LoggedUser, User, Asociado } from "@/interfaces/User";
import { userService } from "@/services/userService";
import { asociadosService } from "@/services/asociadosService";
import UserModal from "./components/UserModal";
import AsociadoPerfilModal from "./components/AsociadoPerfilModal";
import AsistenciaAsambleaModal from "./components/AsistenciaAsambleaModal";
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
  IconUserDollar,
  IconDeviceIpadHorizontalDollar,
  IconRefresh,
  IconDotsVertical,
  IconSearch,
  IconX,
  IconUserPlus,
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

const UserManagementModule = () => {
  const router = useRouter();
  const { loading, stopLoading } = usePageLoading();

  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openAsociadoModal, setOpenAsociadoModal] = useState(false);
  const [openAsistenciaModal, setOpenAsistenciaModal] = useState(false);
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

  const [actionsAnchor, setActionsAnchor] = useState<HTMLElement | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAsociado, setSelectedAsociado] = useState<any | null>(null);
  // Estado para el usuario actual
  const [currentUser, setCurrentUser] = useState<LoggedUser>(defaultLoggedUser);
  //Aporte
  const [selectedAporte, setSelectedAporte] = useState<Aporte | null>(null); // Estado para la fila seleccionada
  const [openAporteModal, setOpenAporteModal] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  // crédito modal states
  const [openCreditModal, setOpenCreditModal] = useState(false);
  const [creditTasas, setCreditTasas] = useState<any[]>([]);
  const [creditUserInfo, setCreditUserInfo] = useState<Asociado | null>(null);
  const [submittingUser, setSubmittingUser] = useState(false);

  const refreshUsersWithLoans = async () => {
    setLoadingLoans(true);
    setLoadError(null);
    try {
      const response = await userService.fetchAllWithLoans();
      setUsers(response);
    } catch (error) {
      console.error('Error al actualizar préstamos:', error);
      setLoadError('No fue posible actualizar la información. Intenta nuevamente.');
    } finally {
      setLoadingLoans(false);
    }
  };

  useEffect(() => {
    // make sure interceptors are ready for any request
    setupAxiosInterceptors(router);

    const loadUsers = async () => {
      if (!authService.isAuthenticated()) {
        stopLoading();
        return;
      }

      try {
        const response = await userService.fetchAllWithLoans();
        setUsers(response);
        const count = response.filter(
          (user: User) => user.idAsociado?.idEstado.estado === "ACTIVO"
        ).length;
        setActiveUsersCount(count);
        const user = await authService.getCurrentUserData();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        setLoadError('No fue posible cargar los usuarios. Intenta nuevamente.');
      } finally {
        stopLoading();
      }
    };

    loadUsers();
  }, [router]);

  const filteredUsers = users?.filter((user: User) => {
    const normalizedSearch = search.trim().toLowerCase();
    const associated = user.idAsociado;
    const fullName = [
      associated?.nombre1,
      associated?.nombre2,
      associated?.apellido1,
      associated?.apellido2,
      associated?.nombres,
    ].filter(Boolean).join(" ").toLowerCase();
    const matchesName =
      !normalizedSearch ||
      fullName.includes(normalizedSearch) ||
      user.correoElectronico?.toLowerCase().includes(normalizedSearch) ||
      associated?.numeroDeIdentificacion?.toLowerCase().includes(normalizedSearch) ||
      user.id.toString() === normalizedSearch;
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

  const clearFilters = () => {
    setSearch("");
    setFilterState("ACTIVO");
  };

  const roleColors: any = {
    SOCIO: "primary",
    "GESTOR DE OPERACIONES": "warning",
    ADMINISTRADOR: "success",
  };

  const getRoleColor = (role: string) => {
    return roleColors[role] || "default";
  };

  const handleOpenModal = async (user?: User) => {
    if (user) {
      let editableUser = user;
      try {
        const detailUser = await userService.fetchById(user.id);
        if (detailUser) {
          editableUser = { ...user, ...detailUser };
        }
      } catch (error) {
        console.error("Error al cargar el detalle del usuario:", error);
      }

      setEditingUser(editableUser);
      setFormData({
        ...editableUser,
      });
    } else {
      setEditingUser(null);
      setFormData(defaultData);
    }
    setOpenModal(true);
  };

  const handleOpenAsociado = async (user?: User) => {
    if (!user?.idAsociado?.id) return;

    setSelectedAsociado({ asociado: user.idAsociado });
    setOpenAsociadoModal(true);

    try {
      const detalle = await asociadosService.fetchFullProfile(user.idAsociado.id);
      if (detalle) {
        setSelectedAsociado(detalle);
      }
    } catch (error) {
      console.error("Error al cargar los datos del asociado:", error);
    }
  };

  const handleSubmitAsociado = async (data: any) => {
    if (!selectedAsociado) return;

    await asociadosService.updateFullProfile(data.asociado.id, data);
    const usersData = await userService.fetchAllWithLoans();
    setUsers(usersData);
  };

  const handleOpenAsistencia = async (user?: User) => {
    if (!user?.idAsociado?.id) return;

    setSelectedAsociado({ asociado: user.idAsociado });
    setOpenAsistenciaModal(true);
    try {
      const detalle = await asociadosService.fetchFullProfile(user.idAsociado.id);
      if (detalle) setSelectedAsociado(detalle);
    } catch (error) {
      console.error("Error al cargar la asistencia del asociado:", error);
    }
  };

  const handleSubmitAsistencia = async (data: any) => {
    if (!selectedAsociado?.asociado?.id) return;
    await asociadosService.updateFullProfile(selectedAsociado.asociado.id, data);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingUser(null);
  };

  const handleCloseAsociadoModal = () => {
    setOpenAsociadoModal(false);
    setSelectedAsociado(null);
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
      setSubmittingUser(true);
      try {
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
            const { id: asociadoId, idEstado: _idEstado, ...asociadoData } = formData.idAsociado;
            await asociadosService.update(asociadoId, asociadoData as any);
          }
          const userData = {
            correoElectronico: formData.correoElectronico,
            username: formData.username,
            fechaModificacion: new Date(),
          };
          await userService.update(editingUser.id, userData as any);
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
      } catch (error: any) {
        console.error("Error al guardar el usuario:", error);
        setFormError(error?.response?.data?.message || "No fue posible guardar los cambios. Revisa los datos e intenta nuevamente.");
      } finally {
        setSubmittingUser(false);
      }
  };

  const handleDeactivate = async (user: User) => {
    try {
      user.idAsociado.idEstado.id = 5;
      await userService.deactivate(user.id, user);
      setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== user.id));
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  };

  const handleOpenActions = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setActionsAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  const handleClose = () => {
    setActionsAnchor(null);
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

  if (loadError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={refreshUsersWithLoans}>
            Reintentar
          </Button>
        }
      >
        {loadError}
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
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
              <Typography variant="h4" fontWeight="800" lineHeight={1}>
                {activeUsersCount}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                Usuarios Activos
              </Typography>
            </Box>
          </Box>
        </DashboardCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DashboardCard title="">
          <Typography variant="h4" fontWeight="800" lineHeight={1}>{users.length}</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>Usuarios registrados</Typography>
        </DashboardCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DashboardCard title="">
          <Typography variant="h4" fontWeight="800" lineHeight={1}>{filteredUsers.length}</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>Resultados visibles</Typography>
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
                <Box>
                  <Typography variant="h5" color="primary" gutterBottom>
                    Buscar y filtrar
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Encuentra usuarios por nombre, correo, identificación o ID.
                  </Typography>
                </Box>
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<IconX size={17} />}
                  onClick={clearFilters}
                  disabled={!search && filterState === "ACTIVO"}
                >
                  Limpiar
                </Button>
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
                InputProps={{
                  startAdornment: <InputAdornment position="start"><IconSearch size={18} /></InputAdornment>,
                }}
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
                <Box>
                  <Typography variant="h5" color="primary" gutterBottom>
                    Listado de usuarios
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {filteredUsers.length} resultado{filteredUsers.length === 1 ? "" : "s"} con los filtros actuales
                  </Typography>
                </Box>
              <Box sx={{ display: 'flex', gap: 1, marginBottom: 3, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Button 
                  variant="outlined" 
                  onClick={refreshUsersWithLoans}
                  disabled={loadingLoans}
                  startIcon={<IconRefresh />}
                  size="small"
                >
                  {loadingLoans ? 'Actualizando...' : 'Actualizar Préstamos'}
                </Button>
                <Button variant="contained" onClick={() => handleOpenModal()} startIcon={<IconUserPlus size={18} />}>
                  Nuevo usuario
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
                      <StatusChip status={user.idAsociado.idEstado.estado} size="small" />
                    ) : (
                      "Sin estado"
                    );
                  case "prestamos":
                    return (user.loansCount || 0) > 0 ? (
                      <Chip
                        label={`${user.loansCount} préstamo(s)`}
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
                      <Box sx={{ display: "flex", justifyContent: "center", minWidth: 88 }}>
                        <Tooltip title="Abrir acciones del usuario">
                          <IconButton
                          onClick={(event) => handleOpenActions(event, user)}
                          aria-label={`Más acciones para ${user.idAsociado?.nombres || "usuario"}`}
                          aria-haspopup="menu"
                          color="primary"
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            backgroundColor: "#f8fbff",
                            "&:hover": { backgroundColor: "#eaf2ff" },
                          }}
                          >
                            <IconDotsVertical size={20} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    );
                  default:
                    return user[column.field];
                }
              }}
            />

            <Menu
              anchorEl={actionsAnchor}
              open={Boolean(actionsAnchor)}
              onClose={handleClose}
              MenuListProps={{ "aria-labelledby": "user-actions-button" }}
              PaperProps={{ sx: { minWidth: 250, borderRadius: 2, mt: 1 } }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Acciones para
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} noWrap>
                  {selectedUser?.idAsociado?.nombres || "Usuario seleccionado"}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { handleOpenModal(selectedUser!); handleClose(); }}>
                <ListItemIcon><IconUserEdit size={20} /></ListItemIcon>
                Editar usuario
              </MenuItem>
              <MenuItem onClick={() => { handleOpenAsociado(selectedUser!); handleClose(); }}>
                <ListItemIcon><IconEditCircle size={20} /></ListItemIcon>
                Editar datos del asociado
              </MenuItem>
              <MenuItem onClick={() => { handleOpenAsistencia(selectedUser!); handleClose(); }}>
                <ListItemIcon><IconEditCircle size={20} /></ListItemIcon>
                Registrar asistencia a asamblea
              </MenuItem>
              <Divider />
              <Typography variant="overline" color="text.secondary" sx={{ px: 2, lineHeight: 2.5 }}>
                Préstamos
              </Typography>
              <MenuItem onClick={() => { handleCreateCredit(selectedUser!); handleClose(); }}>
                <ListItemIcon><IconEditCircle size={20} /></ListItemIcon>
                Crear préstamo
              </MenuItem>
              <MenuItem
                onClick={() => { handleViewCredits(selectedUser!); handleClose(); }}
                disabled={!(selectedUser?.loansCount || 0)}
              >
                <ListItemIcon><IconEyeDollar size={20} /></ListItemIcon>
                Ver préstamos
                {!!selectedUser?.loansCount && <Chip label={selectedUser.loansCount} size="small" color="primary" sx={{ ml: "auto" }} />}
              </MenuItem>
              <Divider />
              <Typography variant="overline" color="text.secondary" sx={{ px: 2, lineHeight: 2.5 }}>
                Ahorros
              </Typography>
              <MenuItem onClick={() => { handleSavingsAsociado(selectedUser!); handleClose(); }}>
                <ListItemIcon><IconCoins size={20} /></ListItemIcon>
                Ver aportes
              </MenuItem>
              <MenuItem onClick={() => { handleCreateAporteClick(selectedUser!); handleClose(); }}>
                <ListItemIcon><IconUserDollar size={20} /></ListItemIcon>
                Crear aporte
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => { handleDeactivate(selectedUser!); handleClose(); }}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon><IconUserCancel size={20} color="currentColor" /></ListItemIcon>
                Inactivar usuario
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
        submitting={submittingUser}
      />
      <AsociadoPerfilModal
        open={openAsociadoModal}
        profile={selectedAsociado}
        onClose={handleCloseAsociadoModal}
        onSubmit={handleSubmitAsociado}
      />
      <AsistenciaAsambleaModal
        open={openAsistenciaModal}
        profile={selectedAsociado}
        onClose={() => { setOpenAsistenciaModal(false); setSelectedAsociado(null); }}
        onSubmit={handleSubmitAsistencia}
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
