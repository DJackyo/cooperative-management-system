// src/modules/savings/SavingsModule.tsx
"use client";
import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  TextField,
  Button,
  TablePagination,
  Avatar,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AttachMoney, Close as CloseIcon, CheckCircle as CheckCircleIcon, PendingActions as PendingIcon } from "@mui/icons-material";
import Swal from "sweetalert2";
import { Aporte } from "@/interfaces/Aporte";
import { savingsService } from "@/services/savingsService";
import { Asociado, LoggedUser } from "@/interfaces/User";

import {
  IconCoins,
  IconPencilDollar,
  IconReceipt,
  IconUserDollar,
  IconUserExclamation,
  IconFileText,
} from "@tabler/icons-react";
import AporteModal from "./components/AporteModal";
import BulkAporteModal from "./components/BulkAporteModal";
import {
  defaultLoggedUser,
  formatCurrency,
  formatDateWithoutTime,
  getComparator,
  validateRoles,
  roleAdmin,
} from "../../utilities/utils";
import { authService } from "@/app/authentication/services/authService";
import ReceiptModal from "./components/ReceiptModal";
import { defaultAporteValue } from "../../utilities/AportesUtils";
import { IconUser } from "@tabler/icons-react";
import UserCard from "../../utilities/UserCard";
import GenericLoadingSkeleton from "@/components/GenericLoadingSkeleton";
import { usePageLoading } from "@/hooks/usePageLoading";
import StyledTable from "@/components/StyledTable";

// Agregar el tipo de las props
interface SavingsModuleProps {
  id: number; // Aquí recibimos el id como prop
}

const SavingsModule: React.FC<SavingsModuleProps> = ({ id }) => {
  const { loading, stopLoading } = usePageLoading();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [openAporteModal, setOpenAporteModal] = useState(false);
  const [selectedAporte, setSelectedAporte] = useState<Aporte | null>(null); // Estado para la fila seleccionada

  const [savings, setSavings] = useState<Aporte[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usersSearch, setUsersSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('ACTIVO');
  const [userInfo, setUserInfo] = useState<Asociado>({
    id: 0,
    nombres: "",
    numeroDeIdentificacion: "",
    idEstado: {
      id: 1,
      estado: "",
    },
  });

  // Paginación
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Ordenación
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("fechaAporte");

  // Estado para el usuario actual
  const [currentUser, setCurrentUser] = useState<LoggedUser>(defaultLoggedUser);

  // Estado para la fila seleccionada
  const [selectedRow, setSelectedRow] = useState<any>(defaultAporteValue);
  const [receiptModalOpen, setModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const loadSavingsRef = useRef<() => Promise<void>>();
  
  loadSavingsRef.current = async () => {
    // Siempre cargar todos los usuarios para el modal bulk
    const allUsersResponse = await savingsService.fetchAllUsersSavings();
    setAllUsers(allUsersResponse || []);

    if (id === 0) {
      // Vista de administrador - ya cargamos los usuarios arriba
    } else {
      // Cargar ahorros de un usuario específico
      const filter = {
        idAsociadoId: id,
      };
      const response = await savingsService.fetchByFilters(filter);
      setSavings(response || []);
      if (response && response.length > 0) {
        setUserInfo(response[0].idAsociado);
      } else {
        // Si no hay aportes, cargar la información del usuario directamente
        const user = allUsersResponse.find((u: any) => u.id === id);
        if (user) {
          setUserInfo(user);
        }
      }
    }
  };

  const loadSavings = useCallback(() => loadSavingsRef.current?.(), []);

  useEffect(() => {
    const fetchData = async () => {
      const hasSession = authService.isAuthenticated();
      if (hasSession) {
        const user = await authService.getCurrentUserData();
        setCurrentUser(user);
        await loadSavings();
        stopLoading();
      }
    };
    fetchData();
  }, [id]); // Vuelve a ejecutar si 'id' cambia

  const stableSort = (
    array: Aporte[],
    comparator: (a: Aporte, b: Aporte) => number
  ) => {
    const stabilizedThis = array.map(
      (el, index) => [el, index] as [Aporte, number]
    );
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const sortedTransactions = stableSort(savings, getComparator(order, orderBy));

  // Filtrar transacciones por fechas
  const filteredTransactions = sortedTransactions.filter((transaction) => {
    const transactionDate = new Date(transaction.fechaAporte);

    if (startDate && transactionDate < startDate) return false;
    if (endDate && transactionDate > endDate) return false;

    return true;
  });

  // Calcular el total ahorrado (suma de montos)
  const totalAhorrado = filteredTransactions.reduce((total, transaction) => {
    return total + (transaction.monto * 1 || 0);
  }, 0);

  // Formatear el total ahorrado con separadores de miles
  const formattedTotalAhorrado = formatCurrency(totalAhorrado);

  // Obtener las filas actuales según la paginación
  const paginatedRows = filteredTransactions.slice(
    page * pageSize,
    page * pageSize + pageSize
  );

  // Definir las columnas
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "fechaAporte", headerName: "Fecha aporte", width: 150 },
    { field: "monto", headerName: "Monto", width: 150 },
    { field: "estado", headerName: "Estado", width: 130 },
    { field: "metodoPago", headerName: "Método Pago", width: 130 },
  ];

  // Helper para obtener color de estado
  const getStatusColor = (estado: string) => {
    const statusLower = estado?.toLowerCase() || '';
    if (statusLower.includes('aprobado') || statusLower.includes('confirmado')) return '#4caf50';
    if (statusLower.includes('pendiente')) return '#ff9800';
    if (statusLower.includes('rechazado')) return '#f44336';
    return '#9e9e9e';
  };

  // Helper para obtener icono de estado
  const getStatusIcon = (estado: string) => {
    const statusLower = estado?.toLowerCase() || '';
    if (statusLower.includes('aprobado') || statusLower.includes('confirmado')) return <CheckCircleIcon sx={{ fontSize: 18 }} />;
    if (statusLower.includes('pendiente')) return <PendingIcon sx={{ fontSize: 18 }} />;
    return null;
  };

  // Manejo de la paginación
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0); // Volver a la primera página cuando cambie el número de filas por página
  };

  // Cambiar el orden cuando el encabezado es clickeado
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleCreateAporteClick = () => {
    defaultAporteValue.asociado = userInfo;
    defaultAporteValue.idUsuarioRegistro = currentUser.userId;
    console.log("defaultAporteValue", defaultAporteValue, currentUser);
    setSelectedAporte(defaultAporteValue);
    setOpenAporteModal(true);
  };

  const handleEditClick = (row: any) => {
    console.log(row);
    // Crear una copia del objeto para no mutar el original
    const rowCopy = {
      ...row,
      asociado: row.idAsociado,
      idAsociado: row.idAsociado?.id || row.idAsociado,
      idUsuarioRegistro: currentUser.userId
    };
    console.log(rowCopy);
    setSelectedAporte(rowCopy);
    setOpenAporteModal(true);
  };

  const handleAporteModalClose = () => {
    setOpenAporteModal(false);
  };

  const handleAporteSubmit = async (aporte: Aporte) => {
    console.log("Aporte registrado:", aporte);
    if (aporte.monto) {
      aporte.idAsociado = aporte.asociado?.id;
      
      // Convertir estado de string a boolean si es necesario
      if (typeof aporte.estado === 'string') {
        aporte.estado = aporte.estado.toLowerCase() === 'activo' || aporte.estado === 'true';
      }
      
      let saved;
      if (aporte.id && aporte.id > 0) {
        // Es una edición, usar update
        saved = await savingsService.update(aporte.id, aporte);
      } else {
        // Es un nuevo registro, usar create
        saved = await savingsService.create(aporte);
      }
      
      if (saved) {
        await Swal.fire({
          icon: 'success',
          title: aporte.id ? 'Aporte actualizado' : 'Registro almacenado',
          text: aporte.id ? 'El aporte ha sido actualizado exitosamente' : 'El aporte ha sido creado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
        loadSavings();
      }
    }
  };

  const handleOpenReceiptModal = (row: any) => {
    console.log(row);
    // Crear una copia del objeto para no mutar el original
    const rowCopy = {
      ...row,
      asociado: row.idAsociado,
      idAsociado: row.idAsociado?.id || row.idAsociado
    };
    setSelectedRow(rowCopy);
    setModalOpen(true);
  };

  const handleCloseReceiptModal = () => {
    setModalOpen(false); // Cerramos el modal
  };

  const handleViewComprobante = (comprobantePath?: string) => {
    // Validar que exista un comprobante
    if (!comprobantePath) {
      Swal.fire({
        icon: 'warning',
        title: 'Comprobante no disponible',
        text: 'No hay comprobante disponible para este aporte',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Preferir la URL de entorno, fallback al puerto donde corre el backend (5000)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

    // Evitar que encodeURIComponent codifique las barras: codificamos por segmentos
    const safePath = comprobantePath
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    const comprobanteUrl = `${baseUrl}/aportes-asociados/comprobante/${safePath}`;
    // Abrir modal con el comprobante en vez de nueva pestaña
    setComprobanteUrl(comprobanteUrl);
    setComprobanteModalOpen(true);
  };

  // Estado para mostrar comprobante en modal
  const [comprobanteModalOpen, setComprobanteModalOpen] = useState(false);
  const [comprobanteUrl, setComprobanteUrl] = useState<string | null>(null);

  const handleCloseComprobanteModal = () => {
    setComprobanteModalOpen(false);
    setComprobanteUrl(null);
  };

  if (loading) {
    return <GenericLoadingSkeleton type="table" rows={5} />;
  }

  // Si id es 0, mostrar listado de todos los usuarios
  if (id === 0) {
    // Filtrar usuarios por búsqueda global y estado
    const filteredUsers = allUsers
      .filter((user: any) => {
        const searchTerm = usersSearch.toLowerCase();
        const matchesSearch = (
          user.id.toString().includes(searchTerm) ||
          user.nombres.toLowerCase().includes(searchTerm) ||
          user.numeroDeIdentificacion?.toLowerCase().includes(searchTerm) ||
          user.idEstado?.estado?.toLowerCase().includes(searchTerm)
        );
        
        // Filtro por estado
        if (estadoFilter === 'TODOS') {
          return matchesSearch;
        }
        
        const estadoUser = user.idEstado?.estado?.toUpperCase() || "";
        return matchesSearch && estadoUser === estadoFilter;
      })
      .sort((a: any, b: any) => {
        // Ordenar alfabéticamente por nombre
        return a.nombres.localeCompare(b.nombres);
      });

    const handleUsersSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setUsersSearch(event.target.value);
    };

    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined" sx={{ boxShadow: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" color="primary">
                  Gestión de Ahorros - Todos los Usuarios
                </Typography>
                <Box display="flex" gap={2} alignItems="center">
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="estado-filter-label">Estado</InputLabel>
                    <Select
                      labelId="estado-filter-label"
                      value={estadoFilter}
                      onChange={(e) => setEstadoFilter(e.target.value)}
                      label="Estado"
                    >
                      <MenuItem value="TODOS">Todos</MenuItem>
                      <MenuItem value="ACTIVO">Activos</MenuItem>
                      <MenuItem value="RSD">Retirados</MenuItem>
                      <MenuItem value="SUS">Suspendidos</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setBulkModalOpen(true)}
                    startIcon={<IconCoins />}
                  >
                    Crear Aportes en Masa
                  </Button>
                  <TextField
                    label="Buscar usuarios"
                    variant="outlined"
                    size="small"
                    value={usersSearch}
                    onChange={handleUsersSearchChange}
                    placeholder="ID, nombre, identificación o estado..."
                    sx={{ minWidth: 300 }}
                  />
                </Box>
              </Box>
              
              <StyledTable
                columns={[
                  { field: "id", headerName: "ID", width: 70 },
                  { field: "nombres", headerName: "Nombre", width: 150 },
                  { field: "numeroDeIdentificacion", headerName: "Identificación", width: 150 },
                  { field: "totalAhorrado", headerName: "Total Ahorrado", width: 150 },
                  { field: "ultimaFechaAporte", headerName: "Último Aporte", width: 130 },
                  { field: "idEstado.estado", headerName: "Estado", width: 120 },
                ]}
                rows={filteredUsers}
                withPagination={true}
                pageSizeOptions={[10, 25, 50]}
                renderCell={(column, user) => {
                  switch (column.field) {
                    case "id":
                      return user.id;
                    case "nombres":
                      return user.nombres;
                    case "numeroDeIdentificacion":
                      return user.numeroDeIdentificacion;
                    case "totalAhorrado":
                      return (
                        <Box sx={{ fontWeight: 600, color: '#2e7d32' }}>
                          $ {formatCurrency(user.totalAhorrado || 0)}
                        </Box>
                      );
                    case "ultimaFechaAporte":
                      return user.ultimaFechaAporte ? formatDateWithoutTime(user.ultimaFechaAporte) : '-';
                    case "idEstado.estado":
                      return (
                        <Box
                          sx={{
                            display: 'inline-block',
                            padding: '6px 10px',
                            borderRadius: '20px',
                            backgroundColor: user.idEstado?.estado?.toLowerCase().includes('activo') ? '#c8e6c9' : '#ffcdd2',
                            color: user.idEstado?.estado?.toLowerCase().includes('activo') ? '#2e7d32' : '#c62828',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        >
                          {user.idEstado?.estado || 'N/A'}
                        </Box>
                      );
                    default:
                      return user[column.field];
                  }
                }}
                actions={(user) => (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => window.location.href = `/modules/savings?id=${user.id}`}
                  >
                    Ver Detalles
                  </Button>
                )}
              />
            </CardContent>
          </Card>
        </Grid>
        {/* Modal de Creación en Masa */}
        <BulkAporteModal
          open={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          onSuccess={() => {
            loadSavings();
          }}
          allUsers={allUsers}
        />
      </Grid>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        <Grid  size={{ xs: 12, md: 8 }}>
          <UserCard id={id} userInfo={userInfo} />
        </Grid>
        <Grid  size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ boxShadow: 3 }}>
            <CardContent>
              <Box
                display="flex"
                sx={{
                  display: "flex",
                  justifyContent: "start",
                  alignItems: "center",
                  marginRight: 2,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    marginRight: 3,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "#e3f2fd",
                      width: 40,
                      height: 40,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 2,
                    }}
                  >
                    <Typography variant="h6" color="primary.main">
                      <IconCoins />
                    </Typography>
                  </Avatar>
                </Box>
                <Box>
                  <Typography variant="h5" color="primary" gutterBottom>
                    Total ahorrado
                  </Typography>
                  <Typography variant="h6" display="flex" alignItems="center">
                    <AttachMoney sx={{ mr: 1 }} /> {formattedTotalAhorrado}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid  size={{ xs: 12, md: 12 }}>
          <Card variant="outlined" sx={{ boxShadow: 3, padding: 2 }}>
            <Typography variant="h5" color="primary" gutterBottom>
              Filtro de fechas
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <DatePicker
                  label="Fecha Inicio"
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  slotProps={{ textField: { size: 'small' } }}
                  />
                  {/* slots={{ textField: TextField }}
                  slotProps={{ textField: { fullWidth: true } }} */}
                <DatePicker
                  label="Fecha Fin"
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  slotProps={{ textField: { size: 'small' } }}
                  />
                  {/* slots={{ textField: TextField }}
                  slotProps={{ textField: { fullWidth: true } }} */}
              </Box>
              <Box display="flex">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                >
                  Restablecer
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid  size={{xs: 12, md: 12 }}>
          <Card variant="outlined" sx={{ boxShadow: 3 }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h5" color="primary" gutterBottom>
                  Historial de Aportes
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCreateAporteClick}
                  sx={{ mb: 2 }}
                  startIcon={<IconUserDollar />}
                >
                  Registrar Aporte
                </Button>
              </Box>

              {/* Tabla */}
              <StyledTable
                columns={columns}
                rows={paginatedRows}
                renderCell={(column, row, index) => {
                  if (column.field === "fechaAporte") {
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => handleRequestSort(column.field)}>
                        📅 {formatDateWithoutTime(row[column.field])}
                      </Box>
                    );
                  } else if (column.field === "monto") {
                    return (
                      <Box
                        sx={{
                          fontWeight: 600,
                          color: '#2e7d32',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        $ {formatCurrency(row[column.field])}
                      </Box>
                    );
                  } else if (column.field === "estado") {
                    return (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.8,
                          padding: '6px 12px',
                          borderRadius: '20px',
                          backgroundColor: getStatusColor(row[column.field]) + '20',
                          color: getStatusColor(row[column.field]),
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          width: 'fit-content',
                        }}
                      >
                        {getStatusIcon(row[column.field])}
                        {row[column.field]}
                      </Box>
                    );
                  } else {
                    return (
                      <Typography sx={{ fontSize: '0.8rem' }}>
                        {row[column.field]}
                      </Typography>
                    );
                  }
                }}
                actions={(row: any) => (
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    {validateRoles(roleAdmin, currentUser?.role?.map((r: any) => r.nombre) || []) && (
                      <Tooltip title="Editar" arrow>
                        <IconButton
                          onClick={() => handleEditClick(row)}
                          color="primary"
                          size="small"
                          aria-label="Editar"
                          sx={{
                            '&:hover': { backgroundColor: '#e3f2fd', transform: 'scale(1.1)' },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <IconPencilDollar />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Ver recibo" arrow>
                      <IconButton
                        onClick={() => handleOpenReceiptModal(row)}
                        color="secondary"
                        size="small"
                        aria-label="Ver recibo"
                        sx={{
                          '&:hover': { backgroundColor: '#f3e5f5', transform: 'scale(1.1)' },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <IconReceipt />
                      </IconButton>
                    </Tooltip>
                    {row.comprobante && (
                      <Tooltip title="Ver comprobante" arrow>
                        <IconButton
                          onClick={() => handleViewComprobante(row.comprobante)}
                          color="warning"
                          size="small"
                          aria-label="Ver comprobante"
                          sx={{
                            '&:hover': { backgroundColor: '#fff3e0', transform: 'scale(1.1)' },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <IconFileText />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}
              />

              {/* Paginación */}
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={filteredTransactions.length}
                rowsPerPage={pageSize}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handlePageSizeChange}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal para subir soporte de pago */}
      <AporteModal
        open={openAporteModal}
        onClose={handleAporteModalClose}
        onSubmit={handleAporteSubmit}
        initialData={selectedAporte || null}
      />
      {/* Modal para visualizar comprobante (PDF o imagen) */}
      <Dialog open={comprobanteModalOpen} onClose={handleCloseComprobanteModal} fullWidth maxWidth="lg">
        <DialogTitle>
          Comprobante
          <IconButton
            aria-label="close"
            onClick={handleCloseComprobanteModal}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {comprobanteUrl ? (
            comprobanteUrl.toLowerCase().endsWith('.pdf') ? (
              <iframe src={comprobanteUrl} title="comprobante" width="100%" height={600} />
            ) : (
              <img src={comprobanteUrl} alt="comprobante" style={{ maxWidth: '100%', height: 'auto' }} />
            )
          ) : (
            <Typography>No hay comprobante disponible</Typography>
          )}
        </DialogContent>
      </Dialog>
      {/* Modal de Recibo */}
      <ReceiptModal
        open={receiptModalOpen}
        onClose={handleCloseReceiptModal}
        data={{ selectedRow, savings }}
      />
      {/* Modal de Creación en Masa */}
      <BulkAporteModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        onSuccess={() => {
          loadSavings();
        }}
        allUsers={allUsers}
      />
    </LocalizationProvider>
  );
};

export default SavingsModule;
