import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  IconButton,
  Chip,
  Paper,
  Typography,
  Grid,
} from "@mui/material";
import { useState } from "react";
import { CheckCircle, Warning, AccessTime, Payment, AttachFile, Visibility, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import {
  calcularDiasEnMora,
  calcularMora,
  formatCurrency,
  formatDateTime,
  formatNameDate,
  formatNumber,
  getEstadoChip,
  redondearHaciaArriba,
} from "@/app/(DashboardLayout)/utilities/utils";
import { Cuota } from "@/interfaces/Prestamo";
import PresPagosForm from "./PresPagosForm";
import InfoTooltip from "@/components/InfoTooltip";
import StyledTable from "@/components/StyledTable";

interface PaymentHistoryProps {
  presCuotas: Cuota[];
  plazoMeses: number;
  creditId: number;
  onPaymentSuccess?: () => void;
}

const PaymentHistoryTable: React.FC<PaymentHistoryProps> = ({
  presCuotas,
  plazoMeses,
  creditId,
  onPaymentSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow]: any = useState(null);
  const [comprobanteDialogOpen, setComprobanteDialogOpen] = useState(false);
  const [selectedComprobante, setSelectedComprobante] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpenModal = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const handlePaymentSuccess = () => {
    handleCloseModal();
    onPaymentSuccess?.();
  };

  const handleOpenComprobante = (filename: string) => {
    setSelectedComprobante(filename);
    setComprobanteDialogOpen(true);
  };

  const handleCloseComprobante = () => {
    setComprobanteDialogOpen(false);
    setSelectedComprobante(null);
  };

  const getComprobanteUrl = (filename: string) => {
    return `http://localhost:3001/uploads/comprobantes-pagos/${filename}`;
  };

  const toggleRowExpansion = (rowId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  let sortedCuotas = [...presCuotas].sort(
    (a: any, b: any) => a.numeroCuota - b.numeroCuota
  );
  console.log("sortedCuotas->", sortedCuotas);

  sortedCuotas = sortedCuotas.map((cuota) => ({
    ...cuota,
    diasEnMora: cuota.estado === "PAGADO" ? 0 : calcularDiasEnMora(
      cuota.fechaVencimiento,
      formatDateTime(new Date())
    ),
  }));

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRows = sortedCuotas.slice(page * pageSize, page * pageSize + pageSize);

  // Calcular estadísticas
  const cuotasPagadas = sortedCuotas.filter(c => c.estado === "PAGADO").length;
  const cuotasPendientes = sortedCuotas.filter(c => c.estado === "PENDIENTE").length;
  const cuotasAtrasadas = sortedCuotas.filter(c => {
    if (c.estado === "PENDIENTE") {
      const today = new Date();
      const dueDate = new Date(c.fechaVencimiento);
      return dueDate < today;
    }
    return false;
  }).length;

  // Función para obtener el estilo de fila según el estado de pagos
  const getRowStyle = (cuota: any) => {
    if (cuota.estado === "PAGADO") {
      return {
        backgroundColor: "#e8f5e9",
        borderLeft: "4px solid #4caf50",
        "&:hover": { backgroundColor: "#c8e6c9" }
      };
    }
    
    if (cuota.estado === "PENDIENTE") {
      const today = new Date();
      const dueDate = new Date(cuota.fechaVencimiento);
      
      // Si está vencido
      if (dueDate < today) {
        return {
          backgroundColor: "#ffebee",
          borderLeft: "4px solid #f44336",
          "&:hover": { backgroundColor: "#ffcdd2" }
        };
      }
      
      // Si está próximo a vencer (menos de 7 días)
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7 && diffDays > 0) {
        return {
          backgroundColor: "#fff3e0",
          borderLeft: "4px solid #ff9800",
          "&:hover": { backgroundColor: "#ffe0b2" }
        };
      }
    }
    
    return {};
  };

  const columns = [
    { field: "expand", headerName: "", width: 30 },
    { field: "numeroCuota", headerName: "# Cuota", width: 40 },
    { field: "fechaVencimiento", headerName: "Vencimiento", width: 130 },
    { field: "monto", headerName: "Valor Cuota", width: 115 },
    { field: "diasEnMora", headerName: "Días Mora", width: 90 },
    { field: "abonoExtra", headerName: "Abono Extra", width: 115 },
    { field: "estado", headerName: "Estado", width: 80 },
    { field: "fechaPago", headerName: "Fecha Pago", width: 140 },
    { field: "acciones", headerName: "Acciones", width: 100 },
  ];

  const formatRules: Record<string, (value: any, row?: any) => React.ReactNode> = {
    expand: (value, row) => (
      <IconButton
        size="small"
        onClick={() => toggleRowExpansion(row.id)}
        sx={{ color: 'primary.main' }}
      >
        {expandedRows.has(row.id) ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      </IconButton>
    ),
    numeroCuota: (value) => (
      <Chip 
        label={`#${value}`} 
        size="small" 
        sx={{ fontWeight: 'bold', minWidth: 50 }}
      />
    ),
    fechaVencimiento: (value, row) => {
      if (!value) return "****";
      const today = new Date();
      const dueDate = new Date(value);
      const isPast = dueDate < today && row?.estado !== "PAGADO";
      
      return (
        <Box display="flex" alignItems="center" gap={0.5}>
          {isPast && <Warning sx={{ fontSize: 18, color: 'error.main' }} />}
          <Typography variant="body2" color={isPast ? 'error.main' : 'text.primary'}>
            {formatNameDate(value)}
          </Typography>
        </Box>
      );
    },
    abonoCapital: (value) => (
      <Typography variant="body2" fontWeight="medium">
        {value ? "$" + formatCurrency(formatNumber(redondearHaciaArriba(value))) : "$0.00"}
      </Typography>
    ),
    intereses: (value) => (
      <Typography variant="body2" fontWeight="medium">
        {value ? "$" + formatCurrency(formatNumber(redondearHaciaArriba(value))) : "$0.00"}
      </Typography>
    ),
    diasEnMora: (value) => {
      const dias = value ? formatNumber(redondearHaciaArriba(value)) : "0";
      const hasMora = Number(dias) > 0;
      return (
        <Chip 
          label={dias} 
          size="small"
          color={hasMora ? "error" : "default"}
          sx={{ fontWeight: 'bold', minWidth: 50 }}
        />
      );
    },
    mora: (value, row) => {
      const mora = redondearHaciaArriba(calcularMora(row?.monto || 0, row?.diasEnMora || 0));
      const hasMora = mora > 0;
      return (
        <Typography 
          variant="body2" 
          fontWeight="bold" 
          color={hasMora ? "error.main" : "text.secondary"}
        >
          ${formatCurrency(formatNumber(mora))}
        </Typography>
      );
    },
    proteccionCartera: (value) => (
      <Typography variant="body2" fontWeight="medium">
        {value ? "$" + formatCurrency(formatNumber(redondearHaciaArriba(value))) : "$0.00"}
      </Typography>
    ),
    monto: (value, row) => {
      return (
        <Typography variant="body2" fontWeight="bold" color="primary.main">
          ${formatCurrency(formatNumber(redondearHaciaArriba(value || 0)))}
        </Typography>
      );
    },
    abonoExtra: (value, row) => {
      const abonoExtra = row?.presPagos?.[0]?.abonoExtra || 0;
      return abonoExtra > 0 ? (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          ${formatCurrency(formatNumber(redondearHaciaArriba(abonoExtra)))}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary">-</Typography>
      );
    },
    estado: (value) => getEstadoChip(value),
    fechaPago: (value, row) => {
      const fechaPago = row?.presPagos?.[0]?.diaDePago;
      return fechaPago ? (
        <Typography variant="body2" color="success.main" fontWeight="medium">
          {formatNameDate(fechaPago)}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          Pendiente
        </Typography>
      );
    },
    metodoPago: (value, row) => {
      const metodoPago = row?.presPagos?.[0]?.metodoPago?.nombre;
      return metodoPago ? (
        <Chip 
          label={metodoPago} 
          size="small"
          color="info"
          sx={{ fontWeight: 'medium' }}
        />
      ) : (
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          -
        </Typography>
      );
    },
    fechaPago: (value, row) => {
      const fechaPago = row?.presPagos?.[0]?.diaDePago;
      return fechaPago ? (
        <Box display="flex" alignItems="center" gap={0.5}>
          <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
          <Typography variant="body2">{formatNameDate(fechaPago)}</Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          No registrado
        </Typography>
      );
    },
    acciones: (value, row) => {
      const currentIndex = sortedCuotas.findIndex((c) => c.id === row.id);
      const previousCuota = sortedCuotas[currentIndex - 1];
      const isEnabled = !previousCuota || previousCuota.estado === "PAGADO";
      const comprobante = row?.presPagos?.[0]?.comprobante;

      return (
        <Box display="flex" gap={1} alignItems="center">
          {isEnabled && row.estado === "PENDIENTE" ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenModal(row)}
              size="small"
              startIcon={<Payment />}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Registrar
            </Button>
          ) : comprobante ? (
            <Tooltip title="Ver comprobante">
              <IconButton
                color="primary"
                size="small"
                onClick={() => handleOpenComprobante(comprobante)}
              >
                <AttachFile />
              </IconButton>
            </Tooltip>
          ) : (
            <Typography variant="body2" color="text.disabled">-</Typography>
          )}
        </Box>
      );
    },
  };

  return (
    <>
      {/* Estadísticas rápidas */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Paper elevation={2} sx={{ p: 2, flex: 1, minWidth: 150, backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle sx={{ color: 'success.main', fontSize: 30 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">Cuotas Pagadas</Typography>
              <Typography variant="h5" fontWeight="bold" color="success.main">{cuotasPagadas}</Typography>
            </Box>
          </Box>
        </Paper>
        <Paper elevation={2} sx={{ p: 2, flex: 1, minWidth: 150, backgroundColor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <AccessTime sx={{ color: 'warning.main', fontSize: 30 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">Cuotas Pendientes</Typography>
              <Typography variant="h5" fontWeight="bold" color="warning.main">{cuotasPendientes}</Typography>
            </Box>
          </Box>
        </Paper>
        <Paper elevation={2} sx={{ p: 2, flex: 1, minWidth: 150, backgroundColor: '#ffebee', borderLeft: '4px solid #f44336' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning sx={{ color: 'error.main', fontSize: 30 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">Cuotas Atrasadas</Typography>
              <Typography variant="h5" fontWeight="bold" color="error.main">{cuotasAtrasadas}</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: '120vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.field}
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: '#f5f5f5',
                      minWidth: column.width
                    }}
                  >
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row) => (
                <>
                  <TableRow
                    key={row.id}
                    sx={{
                      ...getRowStyle(row),
                      '& > *': { borderBottom: expandedRows.has(row.id) ? 'none' : undefined }
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.field}>
                        {formatRules[column.field]
                          ? formatRules[column.field](row[column.field], row)
                          : row[column.field]}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRows.has(row.id) && (
                    <TableRow sx={{ ...getRowStyle(row), backgroundColor: 'rgba(0,0,0,0.02)' }}>
                      <TableCell colSpan={columns.length} sx={{ py: 3, px: 0 }}>
                        <Box sx={{ width: '100%', px: 3 }}>
                          <Grid container spacing={2} sx={{ width: '100%' }}>
                            <Grid item xs={12} sm={6} md={4}>
                              <Paper elevation={2} sx={{ p: 2, height: '100%', borderLeft: '3px solid #1976d2' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                  Abono Capital
                                </Typography>
                                <Typography variant="h6" fontWeight="medium" color="primary.main" sx={{ mt: 0.5 }}>
                                  {row.abonoCapital ? "$" + formatCurrency(formatNumber(redondearHaciaArriba(row.abonoCapital))) : "$0.00"}
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                              <Paper elevation={2} sx={{ p: 2, height: '100%', borderLeft: '3px solid #1976d2' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                  Intereses
                                </Typography>
                                <Typography variant="h6" fontWeight="medium" color="primary.main" sx={{ mt: 0.5 }}>
                                  {row.intereses ? "$" + formatCurrency(formatNumber(redondearHaciaArriba(row.intereses))) : "$0.00"}
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                              <Paper elevation={2} sx={{ p: 2, height: '100%', borderLeft: '3px solid #4caf50' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                  Protección Cartera
                                </Typography>
                                <Typography variant="h6" fontWeight="medium" color="success.main" sx={{ mt: 0.5 }}>
                                  {row.proteccionCartera ? "$" + formatCurrency(formatNumber(redondearHaciaArriba(row.proteccionCartera))) : "$0.00"}
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                              <Paper elevation={2} sx={{ p: 2, height: '100%', borderLeft: '3px solid #f44336' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                  Días en Mora
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                  {formatRules.diasEnMora(row.diasEnMora, row)}
                                </Box>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                              <Paper elevation={2} sx={{ p: 2, height: '100%', borderLeft: '3px solid #d32f2f' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                  Mora
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                  {formatRules.mora(row.mora, row)}
                                </Box>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                              <Paper elevation={2} sx={{ p: 2, height: '100%', borderLeft: '3px solid #ff9800' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                  Método de Pago
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                  {formatRules.metodoPago(null, row)}
                                </Box>
                              </Paper>
                            </Grid>
                            {row?.presPagos?.[0]?.comprobante && (
                              <Grid item xs={12} sm={6} md={4}>
                                <Paper elevation={2} sx={{ p: 2, height: '100%', borderLeft: '3px solid #9c27b0' }}>
                                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                    Comprobante
                                  </Typography>
                                  <Box sx={{ mt: 0.5 }}>
                                    <Tooltip title="Ver comprobante">
                                      <Button
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        startIcon={<AttachFile fontSize="small" />}
                                        onClick={() => handleOpenComprobante(row.presPagos[0].comprobante)}
                                        sx={{ textTransform: 'none' }}
                                      >
                                        Ver archivo
                                      </Button>
                                    </Tooltip>
                                  </Box>
                                </Paper>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={sortedCuotas.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Filas por página:"
        />
      </Paper>
      {/* Modal para Registrar Pago */}
      <Dialog 
        open={open} 
        onClose={handleCloseModal} 
        maxWidth="md"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            margin: isMobile ? 0 : 2,
            width: isMobile ? '100%' : 'auto',
          }
        }}
      >
        <DialogTitle sx={{ backgroundColor: '#1976d2', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Payment />
          Registrar Pago
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <PresPagosForm 
            pago={selectedRow} 
            creditId={creditId} 
            onSuccess={handlePaymentSuccess}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Button onClick={handleCloseModal} color="secondary" variant="outlined">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para ver comprobante */}
      <Dialog 
        open={comprobanteDialogOpen} 
        onClose={handleCloseComprobante}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#1976d2', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachFile />
          Comprobante de Pago
        </DialogTitle>
        <DialogContent sx={{ mt: 2, textAlign: 'center' }}>
          {selectedComprobante && (
            <Box>
              {selectedComprobante.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={getComprobanteUrl(selectedComprobante)}
                  width="100%"
                  height="600px"
                  style={{ border: 'none' }}
                  title="Comprobante PDF"
                />
              ) : (
                <img
                  src={getComprobanteUrl(selectedComprobante)}
                  alt="Comprobante"
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                />
              )}
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Visibility />}
                href={getComprobanteUrl(selectedComprobante)}
                target="_blank"
                sx={{ mt: 2 }}
              >
                Abrir en nueva pestaña
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Button onClick={handleCloseComprobante} color="secondary" variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PaymentHistoryTable;
