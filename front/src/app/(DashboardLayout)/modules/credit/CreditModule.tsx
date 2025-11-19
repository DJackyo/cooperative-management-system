import React, { Suspense, useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Skeleton,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
} from "@mui/material";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import UserCard from "../../utilities/UserCard";
import { Asociado, LoggedUser } from "@/interfaces/User";
import { Prestamo } from "@/interfaces/Prestamo";
import { authService } from "@/app/authentication/services/authService";
import { defaultLoggedUser, formatCurrency, formatDateTime, formatDateWithoutTime, getComparator, getEstadoChip, roleAdmin, validateRoles } from "../../utilities/utils";
import { IconChecks, IconEyeDollar, IconPencilDollar, IconX } from "@tabler/icons-react";
import { creditsService } from "@/services/creditRequestService";
import { setupAxiosInterceptors } from "@/services/axiosClient";
import GenericLoadingSkeleton from "@/components/GenericLoadingSkeleton";
import { usePageLoading } from "@/hooks/usePageLoading";
import StyledTable from "@/components/StyledTable";

// Componente cargado dinámicamente
const CreditForm = dynamic(() => import("./components/CreditForm"), {
  ssr: false,
});

interface CreditModuleProps {
  userId: number;
}

const CreditModule: React.FC<CreditModuleProps> = ({ userId }) => {
  const router = useRouter();
  const { loading, stopLoading } = usePageLoading();

  const [openRequestModal, setOpenRequestModal] = useState(false);
  const [openModifyModal, setOpenModifyModal] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [userInfo, setUserInfo] = useState<Asociado>({
    id: 0,
    nombres: "",
    numeroDeIdentificacion: "",
    idEstado: { id: 1, estado: "" },
  });
  const [credits, setCredits] = useState<Prestamo[]>([]);
  const [selectedPrestamo, setSelectedPrestamo] = useState<Prestamo | null>(null);
  const [currentUser, setCurrentUser] = useState<LoggedUser>(defaultLoggedUser);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("fechaPrestamo");
  const [tasas, setTasas] = useState<any[]>([]);

  const loadCredits = useCallback(async () => {
    try {
      const response = userId === 0 ? await creditsService.fetchAll() : await creditsService.fetchByUser(userId);
      
      if (response) {
        setCredits(response);
        if (response.length > 0) {
          setUserInfo(response[0].idAsociado);
        }
      }
    } catch (error: any) {
      console.error('Error loading credits:', error);
      if (error.response?.status === 401) {
        // Redirigir al login si no está autenticado
        router.push('/authentication/login');
      } else {
        setCredits([]);
      }
    }
  }, [userId, router]);

  const loadTasas = useCallback(async () => {
    if (!tasas || tasas.length === 0) {
      try {
        const response = await creditsService.getTasas();
        if (response) {
          setTasas(response);
        }
      } catch (error: any) {
        console.error('Error loading tasas:', error);
        if (error.response?.status === 401) {
          router.push('/authentication/login');
        }
      }
    }
  }, [tasas, router]);

  const fetchData = useCallback(async () => {
    const hasSession = authService.isAuthenticated();
    if (hasSession) {
      const user = await authService.getCurrentUserData();
      setCurrentUser(user);
      checkValidRoles();
      await loadTasas();
      await loadCredits();
      stopLoading();
    }
  }, [loadTasas, loadCredits]);

  useEffect(() => {
    setupAxiosInterceptors(router);
    fetchData();
  }, [userId, fetchData, router]);

  const checkValidRoles = () => {
    const userRoles = authService.getUserRoles();
    const isAdmin = validateRoles(roleAdmin, userRoles);
    setIsUserAdmin(isAdmin);
  };

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const stableSort = (array: Prestamo[], comparator: (a: Prestamo, b: Prestamo) => number) => {
    const stabilized = array.map((el, index) => [el, index] as [Prestamo, number]);
    stabilized.sort((a, b) => {
      const result = comparator(a[0], b[0]);
      return result !== 0 ? result : a[1] - b[1];
    });
    return stabilized.map((el) => el[0]);
  };

  const sortedTransactions = stableSort(credits, getComparator(order, orderBy));

  const handleOpenRequestModal = () => setOpenRequestModal(true);
  const handleCloseRequestModal = () => setOpenRequestModal(false);
  const handleCloseModifyModal = () => setOpenModifyModal(false);
  const handleCloseApproveModal = () => setOpenApproveModal(false);

  const handleEditClick = (row: Prestamo) => {
    setSelectedPrestamo(row);
    setOpenModifyModal(true);
  };

  const handleApproveClick = (row: Prestamo) => {
    setSelectedPrestamo(row);
    setOpenApproveModal(true);
  };

  const handleOpenDetail = (row: Prestamo) => {
    if (row) {
      const idUser = row.idAsociado.id;
      router.push(`/modules/credit/user?userId=${idUser}&creditId=${row.id}`);
    }
  };

  const handleRequestSubmit = async (formData: any) => {
    if (formData.monto) {
      // Mostrar loading
      Swal.fire({
        title: 'Procesando...',
        text: 'Creando solicitud de crédito',
        allowOutsideClick: false,
        zIndex: 10000,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      formData.idAsociado = userInfo;
      const saved = await creditsService.create(formData);
      
      if (saved) {
        await Swal.fire({
          title: '¡Solicitud Creada!',
          text: `Su solicitud de crédito por $${formatCurrency(formData.monto)} ha sido enviada exitosamente.`,
          icon: 'success',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#4caf50',
          zIndex: 10000
        });
        await loadCredits();
      } else {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo crear la solicitud. Intente nuevamente.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          zIndex: 10000
        });
      }
    }
    handleCloseRequestModal();
  };

  const handleModifySubmit = async (formData: any) => {
    if (selectedPrestamo) {
      // Confirmación antes de editar
      const result = await Swal.fire({
        title: '¿Confirmar Cambios?',
        text: 'Se actualizarán los datos del crédito seleccionado.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1976d2',
        cancelButtonColor: '#f44336',
        confirmButtonText: 'Sí, Actualizar',
        cancelButtonText: 'Cancelar',
        zIndex: 10000
      });

      if (result.isConfirmed) {
        // Mostrar loading
        Swal.fire({
          title: 'Procesando...',
          text: 'Actualizando crédito',
          allowOutsideClick: false,
          zIndex: 10000,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const saved = await creditsService.update(selectedPrestamo.id, formData);
        
        if (saved) {
          await Swal.fire({
            title: '¡Crédito Actualizado!',
            text: 'Los cambios han sido guardados exitosamente.',
            icon: 'success',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#4caf50',
            zIndex: 10000
          });
          await loadCredits();
          handleCloseModifyModal();
        } else {
          Swal.fire({
            title: 'Error',
            text: 'No se pudieron guardar los cambios. Intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Entendido',
            zIndex: 10000
          });
        }
      }
    }
  };

  const handleApproveCredit = async (formData: any) => {
    if (formData && selectedPrestamo) {
      // Cerrar modal temporalmente para mostrar SweetAlert2
      handleCloseApproveModal();
      
      // Confirmación antes de aprobar
      const result = await Swal.fire({
        title: '¿Confirmar Aprobación?',
        html: `
          <div style="text-align: left; margin: 20px 0;">
            <p><strong>Asociado:</strong> ${selectedPrestamo.idAsociado?.nombres}</p>
            <p><strong>Monto:</strong> $${formatCurrency(selectedPrestamo.monto)}</p>
            <p><strong>Plazo:</strong> ${selectedPrestamo.plazoMeses} meses</p>
            <p><strong>Cuota Mensual:</strong> $${formatCurrency(formData.cuotaMensual || 0)}</p>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 15px;">
            Esta acción no se puede deshacer. El crédito será aprobado inmediatamente.
          </p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4caf50',
        cancelButtonColor: '#f44336',
        confirmButtonText: 'Sí, Aprobar Crédito',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        // Mostrar loading
        Swal.fire({
          title: 'Procesando...',
          text: 'Aprobando el crédito',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        formData.estado = "APROBADO";
        formData.fechaCredito = formatDateTime(formData.fechaCredito);
        formData.fechaVencimiento = formatDateTime(formData.fechaVencimiento);
        formData.fechaActualizacion = formatDateTime(new Date());

        const rs = await creditsService.approveCredit(selectedPrestamo.id, formData);
        
        if (rs) {
          await Swal.fire({
            title: '¡Crédito Aprobado!',
            text: `El crédito de $${formatCurrency(selectedPrestamo.monto)} ha sido aprobado exitosamente.`,
            icon: 'success',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#4caf50'
          });
          await loadCredits();
          setSelectedPrestamo(null);
        } else {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo aprobar el crédito. Intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
        }
      } else {
        // Si cancela, reabrir el modal
        setOpenApproveModal(true);
      }
    }
  };

  const showSuccessMessage = (title: string, text?: string) => {
    Swal.fire({ 
      title, 
      text,
      icon: "success", 
      confirmButtonText: "Entendido",
      confirmButtonColor: '#4caf50',
      zIndex: 10000
    });
  };

  const showErrorMessage = (title: string, text?: string) => {
    Swal.fire({ 
      title, 
      text,
      icon: "error", 
      confirmButtonText: "Entendido",
      confirmButtonColor: '#f44336',
      zIndex: 10000
    });
  };

  const showInfoMessage = (title: string, text?: string) => {
    Swal.fire({ 
      title, 
      text,
      icon: "info", 
      confirmButtonText: "Entendido",
      confirmButtonColor: '#1976d2',
      zIndex: 10000
    });
  };

  // Función para calcular el estado de pagos de un crédito
  const getPaymentStatus = (prestamo: Prestamo) => {
    // Si no es un crédito aprobado, retornar estado normal
    if (!prestamo || prestamo.estado !== "APROBADO") {
      return { status: "normal", pendingPayments: 0, overduePayments: 0 };
    }

    // Si tiene cuotas reales, usar esos datos
    if (prestamo.presCuotas && prestamo.presCuotas.length > 0) {
      const today = new Date();
      const pendingPayments = prestamo.presCuotas.filter(cuota => cuota.estado === "PENDIENTE").length;
      const overduePayments = prestamo.presCuotas.filter(cuota => {
        if (cuota.estado !== "PENDIENTE") return false;
        const dueDate = new Date(cuota.fechaVencimiento);
        return dueDate < today;
      }).length;

      if (overduePayments > 0) return { status: "overdue", pendingPayments, overduePayments };
      if (pendingPayments > 0) return { status: "pending", pendingPayments, overduePayments };
      return { status: "completed", pendingPayments, overduePayments };
    }

    // Simular estado basado en fechas del crédito
    const today = new Date();
    const vencimiento = new Date(prestamo.fechaVencimiento);
    const desembolso = prestamo.fechaDesembolso ? new Date(prestamo.fechaDesembolso) : new Date(prestamo.fechaCredito);
    
    // Calcular cuotas simuladas basadas en plazo
    const mesesTranscurridos = Math.floor((today.getTime() - desembolso.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const cuotasPendientes = Math.max(0, prestamo.plazoMeses - mesesTranscurridos);
    
    // Si ya venció el crédito completo
    if (today > vencimiento) {
      return { status: "overdue", pendingPayments: cuotasPendientes, overduePayments: cuotasPendientes };
    }
    
    // Si tiene cuotas pendientes
    if (cuotasPendientes > 0) {
      return { status: "pending", pendingPayments: cuotasPendientes, overduePayments: 0 };
    }
    
    // Si está al día
    return { status: "completed", pendingPayments: 0, overduePayments: 0 };
  };

  // Función para obtener el estilo de fila según el estado de pagos
  const getRowStyle = (prestamo: Prestamo) => {
    const paymentStatus = getPaymentStatus(prestamo);
    
    switch (paymentStatus.status) {
      case "overdue":
        return {
          backgroundColor: "#ffebee",
          borderLeft: "4px solid #f44336",
          "&:hover": { backgroundColor: "#ffcdd2" }
        };
      case "pending":
        return {
          backgroundColor: "#fff3e0",
          borderLeft: "4px solid #ff9800",
          "&:hover": { backgroundColor: "#ffe0b2" }
        };
      case "completed":
        return {
          backgroundColor: "#e8f5e8",
          borderLeft: "4px solid #4caf50",
          "&:hover": { backgroundColor: "#c8e6c9" }
        };
      default:
        return {};
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "fechaCredito", headerName: "Fecha crédito", width: 150 },
    { field: "idAsociado", headerName: "Asociado", width: 150 },
    { field: "monto", headerName: "Monto", width: 150 },
    { field: "plazoMeses", headerName: "Plazo meses", width: 130 },
    { field: "tasa", headerName: "Tasa", width: 130 },
    { field: "cuotaMensual", headerName: "Cuota mensual", width: 130 },
    { field: "estado", headerName: "Estado", width: 130 },
    { field: "estadoPagos", headerName: "Estado Pagos", width: 140 },
  ];

  const filteredColumns = userId === 0 ? columns : columns.filter((column) => column.field !== "idAsociado");

  const formatRules: Record<string, (value: any, row?: any) => React.ReactNode> = {
    fechaCredito: (value) => formatDateWithoutTime(value),
    monto: (value) => "$" + formatCurrency(value),
    cuotaMensual: (value) => "$" + formatCurrency(value),
    idAsociado: (value) => value?.nombres ?? "N/A",
    tasa: (value) => (value * 100).toFixed(2) + "%",
    estado: (value) => getEstadoChip(value),
    estadoPagos: (value, row) => {
      if (!row || row.estado !== "APROBADO") {
        return <Typography variant="body2" color="text.secondary">N/A</Typography>;
      }
      
      const paymentStatus = getPaymentStatus(row);
      
      switch (paymentStatus.status) {
        case "overdue":
          return (
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box width={8} height={8} borderRadius="50%" bgcolor="#f44336" />
              <Typography variant="body2" color="#f44336" fontWeight="medium">
                {paymentStatus.overduePayments} vencidas
              </Typography>
            </Box>
          );
        case "pending":
          return (
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box width={8} height={8} borderRadius="50%" bgcolor="#ff9800" />
              <Typography variant="body2" color="#ff9800" fontWeight="medium">
                {paymentStatus.pendingPayments} pendientes
              </Typography>
            </Box>
          );
        case "completed":
          return (
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box width={8} height={8} borderRadius="50%" bgcolor="#4caf50" />
              <Typography variant="body2" color="#4caf50" fontWeight="medium">
                Al día
              </Typography>
            </Box>
          );
        default:
          return <Typography variant="body2" color="text.secondary">N/A</Typography>;
      }
    },
  };
  
  const filteredTransactions = sortedTransactions.filter((transaction) => {
    // Aquí puedes implementar el filtro por fecha si tienes variables `startDate` y `endDate`
    // Por ahora solo devuelve todo
    return true;
  });

  if (loading) {
    return <GenericLoadingSkeleton type="table" rows={6} />;
  }

  return (
    <Grid container spacing={3}>
      {/* Información de la Solicitud */}
      <Grid size={{ xs: 12, md: 8 }}>{userId > 0 && <UserCard id={userId} userInfo={userInfo} />}</Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        {userId > 0 && (
          <Card variant="outlined" sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" color="primary" gutterBottom>
                Gestión de préstamos
              </Typography>
              {/* Botones para abrir formulario en modal */}
              <Suspense fallback={<Skeleton variant="text" width="100%" />}>
                <Button variant="contained" color="primary" onClick={handleOpenRequestModal}>
                  Solicitar crédito
                </Button>
              </Suspense>
            </CardContent>
          </Card>
        )}
      </Grid>

      {/* Historial de Préstamos */}
      <Grid size={{ xs: 12, md: 12 }}>
        <Card variant="outlined" sx={{ boxShadow: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" color="primary" gutterBottom>
                Historial de Préstamos
              </Typography>
            </Box>
            <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={300} />}>
              {/* Tabla */}
              <StyledTable
                columns={filteredColumns}
                rows={filteredTransactions}
                withPagination={true}
                pageSizeOptions={[10, 25, 50]}
                renderCell={(column, row) => {
                  return formatRules[column.field] ? formatRules[column.field](row[column.field], row) : row[column.field];
                }}
                rowSx={(row) => {
                  return getRowStyle(row);
                }}
                actions={(row: any) => (
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    {isUserAdmin && (
                      <Tooltip title="Editar" arrow>
                        <IconButton
                          onClick={() => handleEditClick(row)}
                          color="info"
                          size="small"
                          aria-label="Editar"
                          sx={{
                            '&:hover': { backgroundColor: '#e1f5fe', transform: 'scale(1.1)' },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <IconPencilDollar />
                        </IconButton>
                      </Tooltip>
                    )}
                    {isUserAdmin && row["estado"] === "SOLICITADO" && (
                      <Tooltip title="Aprobar" arrow>
                        <IconButton
                          onClick={() => handleApproveClick(row)}
                          color="success"
                          size="small"
                          aria-label="Aprobar"
                          sx={{
                            '&:hover': { backgroundColor: '#e8f5e9', transform: 'scale(1.1)' },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <IconChecks />
                        </IconButton>
                      </Tooltip>
                    )}
                    {isUserAdmin && row["estado"] !== "SOLICITADO" && (
                      <Tooltip title="Ver préstamo" arrow>
                        <IconButton
                          onClick={() => handleOpenDetail(row)}
                          color="warning"
                          size="small"
                          aria-label="Ver préstamo"
                          sx={{
                            '&:hover': { backgroundColor: '#fff3e0', transform: 'scale(1.1)' },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <IconEyeDollar />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}
              />
            </Suspense>
          </CardContent>
        </Card>
      </Grid>

      {/* Modal para Solicitud de Préstamo */}
      <Dialog open={openRequestModal} onClose={handleCloseRequestModal} fullWidth maxWidth="md">
        <DialogTitle>
          <Typography variant="h6" component="span">
            Nueva Solicitud de Crédito
          </Typography>
        </DialogTitle>
        <DialogContent>
          <CreditForm mode="create" tasas={tasas} onSubmit={handleRequestSubmit} />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseRequestModal} 
            color="secondary" 
            variant="outlined"
            startIcon={<IconX />}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Modificación de Préstamo */}
      <Dialog open={openModifyModal} onClose={handleCloseModifyModal} fullWidth maxWidth="md">
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <IconPencilDollar color="#1976d2" />
            <Typography variant="h6" component="span">
              Editar Crédito
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <CreditForm mode="edit" tasas={tasas} existingData={selectedPrestamo} onSubmit={handleModifySubmit} />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseModifyModal} 
            color="secondary" 
            variant="outlined"
            startIcon={<IconX />}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Aprobación de Préstamo */}
      <Dialog open={openApproveModal} onClose={handleCloseApproveModal} fullWidth maxWidth="md">
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconChecks color="green" />
            <Typography variant="h6" component="span">
              Aprobar Solicitud de Crédito
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {selectedPrestamo && (
            <Card variant="outlined" sx={{ mb: 3, bgcolor: "#f8f9fa" }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Información del Crédito a Aprobar
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Asociado
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedPrestamo.idAsociado?.nombres}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Monto Solicitado
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" color="primary">
                      ${formatCurrency(selectedPrestamo.monto)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Plazo
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedPrestamo.plazoMeses} meses
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
          
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
            Configurar Términos de Aprobación
          </Typography>
          <CreditForm mode="approve" tasas={tasas} existingData={selectedPrestamo} onSubmit={handleApproveCredit} />
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", p: 3, bgcolor: "#f8f9fa" }}>
          <Button 
            onClick={handleCloseApproveModal} 
            color="secondary" 
            variant="outlined"
            startIcon={<IconX />}
          >
            Cancelar
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            Revise cuidadosamente los términos antes de aprobar
          </Typography>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default CreditModule;
