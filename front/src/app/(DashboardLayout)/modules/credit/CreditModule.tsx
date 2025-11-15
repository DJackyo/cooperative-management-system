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
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("fechaPrestamo");
  const [tasas, setTasas] = useState<any[]>([]);

  const loadCredits = useCallback(async () => {
    const response = userId === 0 ? await creditsService.fetchAll() : await creditsService.fetchByUser(userId);

    setCredits(response);
    if (response.length > 0) {
      setUserInfo(response[0].idAsociado);
    }
  }, [userId]);

  const loadTasas = useCallback(async () => {
    if (!tasas || tasas.length === 0) {
      const response = await creditsService.getTasas();
      setTasas(response);
    }
  }, [tasas]);

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
  const paginatedRows = sortedTransactions.slice(page * pageSize, page * pageSize + pageSize);

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

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
      formData.idAsociado = userInfo;
      const saved = await creditsService.create(formData);
      if (saved) {
        showMessage("Crédito Almacenado");
        await loadCredits();
      }
    }
    handleCloseRequestModal();
  };

  const handleModifySubmit = async (formData: any) => {
    if (selectedPrestamo) {
      const saved = await creditsService.update(selectedPrestamo.id, formData);
      if (saved) {
        showMessage("Crédito Editado");
        await loadCredits();
      }
      handleCloseModifyModal();
    }
  };

  const handleApproveCredit = async (formData: any) => {
    if (formData) {
      formData.estado = "APROBADO";
      formData.fechaCredito = formatDateTime(formData.fechaCredito);
      formData.fechaVencimiento = formatDateTime(formData.fechaVencimiento);
      formData.fechaActualizacion = formatDateTime(new Date());

      const rs = await creditsService.approveCredit(selectedPrestamo!.id, formData);
      if (rs) {
        showMessage("Crédito Aprobado");
        await loadCredits();
      }
      handleCloseApproveModal();
      setSelectedPrestamo(null);
    }
  };

  const showMessage = (title: string) => {
    Swal.fire({ title, icon: "info", confirmButtonText: "Aceptar" });
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
  ];

  const filteredColumns = userId === 0 ? columns : columns.filter((column) => column.field !== "idAsociado");

  const formatRules: Record<string, (value: any) => React.ReactNode> = {
    fechaCredito: (value) => formatDateWithoutTime(value),
    monto: (value) => "$" + formatCurrency(value),
    cuotaMensual: (value) => "$" + formatCurrency(value),
    idAsociado: (value) => value?.nombres ?? "N/A",
    tasa: (value) => (value * 100).toFixed(2) + "%",
    estado: (value) => getEstadoChip(value),
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
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {filteredColumns.map((column) => (
                        <TableCell key={column.field} style={{ width: column.width }} onClick={() => column.field === "fechaCredito" && handleRequestSort(column.field)}>
                          {column.headerName}
                        </TableCell>
                      ))}
                      <TableCell>Acción</TableCell>
                    </TableRow>
                  </TableHead>

                  {/* Cuerpo de la tabla */}
                  <TableBody>
                    {paginatedRows.map((row: any) => (
                      <TableRow key={row.id}>
                        {filteredColumns.map((column) => (
                          <TableCell key={column.field}>{formatRules[column.field] ? formatRules[column.field](row[column.field]) : row[column.field]}</TableCell>
                        ))}
                        <TableCell>
                          <Box
                            sx={{
                              width: 123,
                            }}
                          >
                            {isUserAdmin && (
                              <Tooltip title="Editar" arrow>
                                <IconButton onClick={() => handleEditClick(row)} color="info" aria-label="Editar">
                                  <IconPencilDollar />
                                </IconButton>
                              </Tooltip>
                            )}
                            {isUserAdmin && row["estado"] === "SOLICITADO" && (
                              <Tooltip title="Aprobar" arrow>
                                <IconButton onClick={() => handleApproveClick(row)} color="success" aria-label="Aprobar">
                                  <IconChecks />
                                </IconButton>
                              </Tooltip>
                            )}
                            {isUserAdmin && row["estado"] !== "SOLICITADO" && (
                              <Tooltip title="Ver préstamo" arrow>
                                <IconButton onClick={() => handleOpenDetail(row)} color="warning" aria-label="Ver préstamo">
                                  <IconEyeDollar />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
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
                count={filteredTransactions.length}
                rowsPerPage={pageSize}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handlePageSizeChange}
              />
            </Suspense>
          </CardContent>
        </Card>
      </Grid>

      {/* Modal para Solicitud de Préstamo */}
      <Dialog open={openRequestModal} onClose={handleCloseRequestModal} fullWidth maxWidth="md">
        <DialogTitle> </DialogTitle>
        <DialogContent>
          <CreditForm mode="create" tasas={tasas} onSubmit={handleRequestSubmit} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRequestModal} color="secondary" variant="outlined">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Modificación de Préstamo */}
      <Dialog open={openModifyModal} onClose={handleCloseModifyModal} fullWidth maxWidth="md">
        <DialogTitle></DialogTitle>
        <DialogContent>
          <CreditForm mode="edit" tasas={tasas} existingData={selectedPrestamo} onSubmit={handleModifySubmit} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModifyModal} color="secondary" variant="outlined">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Aprobación de Préstamo */}
      <Dialog open={openApproveModal} onClose={handleCloseApproveModal} fullWidth maxWidth="md">
        <DialogTitle></DialogTitle>

        <DialogContent>
          <CreditForm mode="approve" tasas={tasas} existingData={selectedPrestamo} onSubmit={handleApproveCredit} />
        </DialogContent>

        <DialogActions sx={{ justifyContent: "flex-end", p: 3 }}>
          <Button onClick={handleCloseApproveModal} color="secondary" variant="outlined">
            <IconX />
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default CreditModule;
