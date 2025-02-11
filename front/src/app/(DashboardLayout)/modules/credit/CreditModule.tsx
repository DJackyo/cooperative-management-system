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
  formatDateWithoutTime,
  getComparator,
} from "../../utilities/utils";
import {
  IconEyeDollar,
  IconPencilDollar,
  IconReceipt,
} from "@tabler/icons-react";
import { creditsService } from "@/services/creditRequestService";
import { useRouter } from "next/navigation";

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
  const [userInfo, setUserInfo] = useState<Asociado>({
    id: 0,
    nombres: "",
    numeroDeIdentificacion: "",
    idEstado: {
      id: 1,
      estado: "",
    },
  });

  const [credits, setSavings] = useState<Prestamo[]>([]);
  const [selectedPrestamo, setSelectedPrestamo] = useState<Prestamo | null>(
    null
  );

  // Estado para el usuario actual
  const [currentUser, setCurrentUser] = useState<LoggedUser>(defaultLoggedUser);

  // Paginación
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Ordenación
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("fechaPrestamo");

  const loadCredits = useCallback(async () => {
    const response = await creditsService.fetchByUser(userId);
    setSavings(response);
    if (response.length > 0) {
      setUserInfo(response[0].idAsociado);
    }
    console.log(response);
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {
      const hasSession = authService.isAuthenticated();
      if (hasSession) {
        const user = await authService.getCurrentUserData();
        setCurrentUser(user);
        console.log("currentUser->", user);
        loadCredits();
      }
    };
    fetchData();
  }, [userId, loadCredits]);

  const handleOpenRequestModal = () => setOpenRequestModal(true);
  const handleCloseRequestModal = () => setOpenRequestModal(false);

  const handleCloseModifyModal = () => setOpenModifyModal(false);

  const handleRequestSubmit = async (formData: {
    amount?: string;
    term?: string;
    reason?: string;
  }) => {
    console.log("Solicitud de crédito:", formData);
    let credito: any = formData;
    if (credito.monto) {
      credito.idAsociado = userInfo;
      let saved = await creditsService.create(credito);
      if (saved) {
        alert("registro almacenado!");
        loadCredits();
      }
    }
    handleCloseRequestModal();
  };

  const handleModifySubmit = (formData: {
    amount?: string;
    term?: string;
    reason?: string;
  }) => {
    console.log("Modificación de crédito:", formData);
    handleCloseModifyModal();
  };
  // Definir las columnas
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "fechaCredito", headerName: "Fecha crédito", width: 150 },
    { field: "monto", headerName: "Monto", width: 150 },
    { field: "plazoMeses", headerName: "Plazo meses", width: 130 },
    { field: "tasa", headerName: "Tasa", width: 130 },
    { field: "cuotaMensual", headerName: "Cuota mensual", width: 130 },
    { field: "estado", headerName: "Estado", width: 130 },
  ];
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

  const handleEditClick = (row: any) => {
    console.log(row);
    setSelectedPrestamo(row);
    setOpenModifyModal(true);
  };

  const handleOpenDetail = (row: any) => {
    console.log(row);
    if (row) {
      router.push(`/modules/credit/user?userId=${userId}`);
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

  return (
    <Grid container spacing={3}>
      {/* Información de la Solicitud */}
      <Grid item xs={12} md={8}>
        <UserCard id={userId} userInfo={userInfo} />
      </Grid>

      <Grid item xs={12} md={4}>
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
                      {columns.map((column) => (
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
                        {columns.map((column) => (
                          <TableCell key={column.field}>
                            {column.field === "fechaCredito"
                              ? formatDateWithoutTime(row[column.field])
                              : column.field === "monto" ||
                                column.field === "cuotaMensual"
                              ? "$" + formatCurrency(row[column.field])
                              : row[column.field]}
                          </TableCell>
                        ))}
                        <TableCell>
                          {/* Aquí mostramos solo el botón si currentUser tiene el rol "administrador" */}
                          {currentUser?.role === "administrador" && (
                            <Tooltip title="Editar" arrow>
                              <IconButton
                                onClick={() => handleEditClick(row)}
                                color="primary"
                                aria-label="Editar"
                              >
                                <IconPencilDollar />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Ver préstamo" arrow>
                            <IconButton
                              onClick={() => handleOpenDetail(row)}
                              color="secondary"
                              aria-label="Ver préstamo"
                            >
                              <IconEyeDollar />
                            </IconButton>
                          </Tooltip>
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
          <CreditForm type="request" onSubmit={handleRequestSubmit} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRequestModal} color="secondary">
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
            type="modify"
            existingData={selectedPrestamo}
            onSubmit={handleModifySubmit}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModifyModal} color="secondary">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default CreditModule;
