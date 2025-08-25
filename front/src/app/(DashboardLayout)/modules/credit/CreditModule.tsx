// src/modules/credit/CreditModule.tsx
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
import UserCard from "../../utilities/UserCard";
import { Asociado, LoggedUser } from "@/interfaces/User";
import { Prestamo } from "@/interfaces/Prestamo";
import { authService } from "@/app/authentication/services/authService";
import {
  defaultLoggedUser,
  formatCurrency,
  formatDateTime,
  formatDateWithoutTime,
  getComparator,
  getEstadoChip,
  roleAdmin,
  validateRoles,
} from "../../utilities/utils";
import {
  IconChecks,
  IconEyeDollar,
  IconPencilDollar,
  IconX,
} from "@tabler/icons-react";
import { creditsService } from "@/services/creditRequestService";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { setupAxiosInterceptors } from "@/services/axiosClient";

// Usar `dynamic` para cargar el componente de forma dinámica solo en el cliente.
const CreditForm = dynamic(() => import("./components/CreditForm"), {
  ssr: false,
});

interface CreditModuleProps {
  userId: number;
}

const CreditModule: React.FC<CreditModuleProps> = ({ userId }) => {
  const router = useRouter();

  const [openRequestModal, setOpenRequestModal] = useState(false);
  const [openModifyModal, setOpenModifyModal] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);

  const [userInfo, setUserInfo] = useState<Asociado>({
    id: 0,
    nombres: "",
    numeroDeIdentificacion: "",
    idEstado: {
      id: 1,
      estado: "",
    },
  });

  const [credits, setCredits] = useState<Prestamo[]>([]);
  const [selectedPrestamo, setSelectedPrestamo] = useState<Prestamo | null>(
    null
  );

  // Estado para el usuario actual
  const [currentUser, setCurrentUser] = useState<LoggedUser>(defaultLoggedUser);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  // Paginación
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Ordenación
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("fechaPrestamo");

  const [tasas, setTasas] = useState<any[]>([]);

  const loadCredits = useCallback(async () => {
    let response;
    if (userId === 0) {
      response = await creditsService.fetchAll();
    } else {
      response = await creditsService.fetchByUser(userId);
    }
    setCredits(response);
    if (response.length > 0) {
      setUserInfo(response[0].idAsociado);
    }
    console.log(response);
  }, [userId]);

  const loadTasas = useCallback(async () => {
    if (tasas?.length === 0) {
      const response = await creditsService.getTasas();
      setTasas(response);
    }
  }, []);

  const fetchData = async () => {
    const hasSession = authService.isAuthenticated();
    if (hasSession) {
      const user = await authService.getCurrentUserData();
      setCurrentUser(user);
      checkValidRoles();
      console.log("currentUser->", user);
      loadTasas();
      loadCredits();
    }
  };

  useEffect(() => {
    setupAxiosInterceptors(router);
    fetchData();
  }, [userId, loadCredits, loadTasas]);

  // Definir las columnas
  let columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "fechaCredito", headerName: "Fecha crédito", width: 150 },
    { field: "idAsociado", headerName: "Asociado", width: 150 },
    { field: "monto", headerName: "Monto", width: 150 },
    { field: "plazoMeses", headerName: "Plazo meses", width: 130 },
    { field: "tasa", headerName: "Tasa", width: 130 },
    { field: "cuotaMensual", headerName: "Cuota mensual", width: 130 },
    { field: "estado", headerName: "Estado", width: 130 },
  ];

  // Condición para mostrar u ocultar la columna 'idAsociado' según 'userId'
  const filteredColumns =
    userId === 0
      ? columns
      : columns.filter((column) => column.field !== "idAsociado");

  // console.log("filteredColumns->", filteredColumns);

  // Cambiar el orden cuando el encabezado es clickeado
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  const stableSort = (
    array: Prestamo[],
    comparator: (a: Prestamo, b: Prestamo) => number
  ) => {
    const stabilizedThis = array.map(
      (el, index) => [el, index] as [Prestamo, number]
    );
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const sortedTransactions = stableSort(credits, getComparator(order, orderBy));

  // Filtrar transacciones por fechas
  const filteredTransactions = sortedTransactions.filter(() => {
    // const transactionDate = new Date(transaction.fechaPrestamo);
    // if (startDate && transactionDate < startDate) return false;
    // if (endDate && transactionDate > endDate) return false;
    return true;
  });
  // Obtener las filas actuales según la paginación
  const paginatedRows = filteredTransactions.slice(
    page * pageSize,
    page * pageSize + pageSize
  );

  const handleOpenRequestModal = () => setOpenRequestModal(true);
  const handleCloseRequestModal = () => setOpenRequestModal(false);

  const handleCloseModifyModal = () => setOpenModifyModal(false);
  const handleCloseApproveModal = () => setOpenApproveModal(false);

  const handleEditClick = (row: any) => {
    setSelectedPrestamo(row);
    setOpenModifyModal(true);
  };

  const handleOpenDetail = (row: any) => {
    console.log(row);
    if (row) {
      router.push(`/modules/credit/user?userId=${userId}&creditId=${row.id}`);
    }
  };

  // Manejo de la paginación
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0); // Volver a la primera página cuando cambie el número de filas por página
  };

  const handleApproveClick = (row: any) => {
    // console.log(row);
    setSelectedPrestamo(row);
    setOpenApproveModal(true);
  };

  const handleRequestSubmit = async (formData: {
    amount?: string;
    term?: string;
    reason?: string;
  }) => {
    // console.log("Solicitud de crédito:", formData);
    let credito: any = formData;
    if (credito.monto) {
      credito.idAsociado = userInfo;
      let saved = await creditsService.create(credito);
      if (saved) {
        showMessage("Crédito Almacenado");
        loadCredits();
      }
    }
    handleCloseRequestModal();
  };

  const handleModifySubmit = async (formData: any) => {
    // console.log("Modificación de crédito:", formData);
    if (selectedPrestamo) {
      let saved = await creditsService.update(selectedPrestamo.id, formData);
      if (saved) {
        showMessage("Crédito Editado");
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
      console.log(formData);
      const rs = await creditsService.approveCredit(
        selectedPrestamo!.id,
        formData
      );
      if (rs) {
        showMessage("Crédito Aprobado");
      }
      setOpenApproveModal(false);
      setSelectedPrestamo(null);
    }
  };

  const showMessage = (title: string) => {
    Swal.fire({
      title,
      text: " ",
      icon: "info",
      confirmButtonText: "Aceptar",
    }).then(() => {
      loadCredits();
    });
  };

  // Objeto de mapeo para formatear los valores de la tabla
  const formatRules: Record<string, (value: any) => React.ReactNode> = {
    fechaCredito: (value) => formatDateWithoutTime(value),
    monto: (value) => "$" + formatCurrency(value),
    cuotaMensual: (value) => "$" + formatCurrency(value),
    idAsociado: (value) => value?.nombres ?? "N/A",
    tasa: (value) => (value * 100).toFixed(2) + "%",
    estado: (value) => getEstadoChip(value),
  };

  const checkValidRoles = () => {
    const userRoles = authService.getUserRoles();
    const isAdmin = validateRoles(roleAdmin, userRoles);
    setIsUserAdmin(isAdmin);
  };

  return (
    <Grid container spacing={3}>
      {/* Información de la Solicitud */}
      <Grid item xs={12} md={8}>
        {userId > 0 && <UserCard id={userId} userInfo={userInfo} />}
      </Grid>

      <Grid item xs={12} md={4}>
        {userId > 0 && (
          <Card variant="outlined" sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" color="primary" gutterBottom>
                Gestión de préstamos
              </Typography>
              {/* Botones para abrir formulario en modal */}
              <Suspense fallback={<Skeleton variant="text" width="100%" />}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenRequestModal}
                >
                  Solicitar crédito
                </Button>
              </Suspense>
            </CardContent>
          </Card>
        )}
      </Grid>

      {/* Historial de Préstamos */}
      <Grid item xs={12} md={12}>
        <Card variant="outlined" sx={{ boxShadow: 3 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" color="primary" gutterBottom>
                Historial de Préstamos
              </Typography>
            </Box>
            <Suspense
              fallback={
                <Skeleton variant="rectangular" width="100%" height={300} />
              }
            >
              {/* Tabla */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {filteredColumns.map((column) => (
                        <TableCell
                          key={column.field}
                          style={{ width: column.width }}
                          onClick={() =>
                            column.field === "fechaCredito" &&
                            handleRequestSort(column.field)
                          }
                        >
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
                          <TableCell key={column.field}>
                            {formatRules[column.field]
                              ? formatRules[column.field](row[column.field])
                              : row[column.field]}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Box
                            sx={{
                              width: 123,
                            }}
                          >
                            {isUserAdmin && (
                              <Tooltip title="Editar" arrow>
                                <IconButton
                                  onClick={() => handleEditClick(row)}
                                  color="info"
                                  aria-label="Editar"
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
                                  aria-label="Aprobar"
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
                                  aria-label="Ver préstamo"
                                >
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
      <Dialog
        open={openRequestModal}
        onClose={handleCloseRequestModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle> </DialogTitle>
        <DialogContent>
          <CreditForm
            mode="create"
            tasas={tasas}
            onSubmit={handleRequestSubmit}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseRequestModal}
            color="secondary"
            variant="outlined"
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Modificación de Préstamo */}
      <Dialog
        open={openModifyModal}
        onClose={handleCloseModifyModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle></DialogTitle>
        <DialogContent>
          <CreditForm
            mode="edit"
            tasas={tasas}
            existingData={selectedPrestamo}
            onSubmit={handleModifySubmit}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseModifyModal}
            color="secondary"
            variant="outlined"
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Aprobación de Préstamo */}
      <Dialog
        open={openApproveModal}
        onClose={handleCloseApproveModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle></DialogTitle>

        <DialogContent>
          <CreditForm
            mode="approve"
            tasas={tasas}
            existingData={selectedPrestamo}
            onSubmit={handleApproveCredit}
          />
        </DialogContent>

        <DialogActions sx={{ justifyContent: "flex-end", p: 3 }}>
          <Button
            onClick={handleCloseApproveModal}
            color="secondary"
            variant="outlined"
          >
            <IconX />
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default CreditModule;
