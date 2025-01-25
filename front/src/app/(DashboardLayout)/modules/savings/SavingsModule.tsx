// src/modules/savings/SavingsModule.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  TextField,
  Button,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AttachMoney } from "@mui/icons-material";
import { Aporte } from "@/interfaces/Aporte";
import { savingsService } from "@/services/savingsService";
import { Asociado } from "@/interfaces/User";

import { IconCoins } from "@tabler/icons-react";
import AporteModal from "./components/AporteModal";

// Función para formatear la fecha sin la hora
const formatDateWithoutTime = (date: string | Date) => {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

// Función para formatear el monto
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES").format(amount);
};
// Agregar el tipo de las props
interface SavingsModuleProps {
  id: number; // Aquí recibimos el id como prop
}

const SavingsModule: React.FC<SavingsModuleProps> = ({ id }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [selectedAporte, setSelectedAporte] = useState<Aporte | null>(null); // Estado para la fila seleccionada

  const [savings, setSavings] = useState<Aporte[]>([]);
  const [userInfo, setUserInfo] = useState<Asociado>({});

  // Paginación
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Ordenación
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("fechaAporte");

  useEffect(() => {
    const loadSavings = async () => {
      // Asigna el valor de 'id' al filtro
      const filter = {
        idAsociadoId: id ? id : 0,
      };
      const response = await savingsService.fetchByFilters(filter);
      setSavings(response);
      if (response.length > 0) {
        setUserInfo(response[0].idAsociado);
      }
      console.log(response);
    };
    loadSavings();
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

  const getComparator = (order: "asc" | "desc", orderBy: string) => {
    return order === "desc"
      ? (a: Aporte, b: Aporte) => (a[orderBy] < b[orderBy] ? 1 : -1)
      : (a: Aporte, b: Aporte) => (a[orderBy] < b[orderBy] ? -1 : 1);
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
    { field: "metodoPago", headerName: "Metodo Pago", width: 130 },
    { field: "comprobante", headerName: "Comprobante", width: 130 },
  ];

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

  const handleCreateClick = () => {
    setSelectedAporte(null); // Establecer el estado a null para crear un nuevo aporte
    setOpenModal(true); // Abrir el modal
  };

  const handleEditClick = (aporte: Aporte) => {
    console.log(aporte)
    setSelectedAporte(aporte); // Establecer los datos del aporte cuando el usuario hace clic en una fila
    setOpenModal(true); // Abrir el modal
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const handleAporteSubmit = (aporte: Aporte) => {
    console.log("Aporte registrado:", aporte);
    // Aquí puedes realizar la lógica de guardar el aporte en el backend o en el estado
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
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
                    marginRight: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "#e3f2fd",
                      width: 36,
                      height: 36,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 2,
                    }}
                  >
                    <Typography variant="h5" color="primary.main">
                      {id}
                    </Typography>
                  </Avatar>
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ marginTop: 0.5, marginBottom: 1 }}
                  >
                    {userInfo.nombres}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    sx={{ marginTop: 0.5 }}
                  >
                    {userInfo.numeroDeIdentificacion}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
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

        <Grid item xs={12} md={12}>
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
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <DatePicker
                  label="Fecha Fin"
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
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

        <Grid item xs={12}>
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
                  onClick={handleCreateClick}
                  sx={{ mb: 2 }}
                >
                  Registrar Aporte
                </Button>
              </Box>

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
                            column.field === "fechaAporte" &&
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
                            {column.field === "fechaAporte"
                              ? formatDateWithoutTime(row[column.field])
                              : column.field === "monto"
                              ? formatCurrency(row[column.field])
                              : row[column.field]}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button
                            onClick={() => handleEditClick(row)}
                            color="primary"
                          >
                            Editar
                          </Button>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal para subir soporte de pago */}
      <AporteModal
        open={openModal}
        onClose={handleModalClose}
        onSubmit={handleAporteSubmit}
        initialData={selectedAporte || null} 
      />
    </LocalizationProvider>
  );
};

export default SavingsModule;
