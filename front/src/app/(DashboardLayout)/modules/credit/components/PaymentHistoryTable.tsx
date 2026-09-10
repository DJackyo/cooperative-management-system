"use client";
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
  TextField,
  InputAdornment,
  Stack,
} from "@mui/material";
import React from "react";
import { useState } from "react";
import {
  CheckCircle,
  Warning,
  AccessTime,
  Payment,
  AttachFile,
  Visibility,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Search,
  Print,
} from "@mui/icons-material";
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
import TableExportButton from "@/components/TableExportButton";

interface PaymentHistoryProps {
  presCuotas: Cuota[];
  plazoMeses: number;
  creditId: number;
  idAsociado: number;
  onPaymentSuccess?: () => void;
}

// Mini stat component - con mejor balance
const MiniStatBox: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => (
  <Paper
    elevation={0}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      px: 1.5,
      py: 0.75,
      borderRadius: 1.5,
      border: "1px solid",
      borderColor: `${color}30`,
      bgcolor: `${color}06`,
      flex: 1,
      minWidth: 80,
    }}
  >
    <Box sx={{ color, display: "flex", alignItems: "center" }}>{icon}</Box>
    <Box>
      <Typography variant="caption" sx={{ fontSize: 10, color: "text.secondary", display: "block", lineHeight: 1 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ fontSize: 14, lineHeight: 1.2 }}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

const PaymentHistoryTable: React.FC<PaymentHistoryProps> = ({
  presCuotas,
  plazoMeses,
  creditId,
  idAsociado,
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

  const handleOpenComprobante = (filename: unknown) => {
    const filenameStr = typeof filename === 'string' ? filename : '';
    const isValid = !!filenameStr && /\.(pdf|png|jpg|jpeg)$/i.test(filenameStr);
    if (!isValid) {
      console.warn('Comprobante inválido o no disponible:', filename);
      return;
    }
    setSelectedComprobante(filenameStr);
    setComprobanteDialogOpen(true);
  };

  const handleCloseComprobante = () => {
    setComprobanteDialogOpen(false);
    setSelectedComprobante(null);
  };

  const getComprobanteUrl = (value: string) => {
    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/$/, '');
    if (!value) return '';
    const parts = value.split('/');
    if (parts.length === 3) {
      let [loan, year, name] = parts;
      if (/^\d{4}$/.test(loan) && /^\d+$/.test(year)) {
        [loan, year] = [year, loan];
      }
      return `${base}/pagos/comprobante/${encodeURIComponent(loan)}/${encodeURIComponent(year)}/${encodeURIComponent(name)}`;
    }
    return `${base}/pagos/comprobante/${encodeURIComponent(value)}`;
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

  sortedCuotas = sortedCuotas.map((cuota) => ({
    ...cuota,
    diasEnMora: (cuota.estado === "PAGADO" || cuota.estado === "CANCELADO") ? 0 : calcularDiasEnMora(
      cuota.fechaVencimiento,
      formatDateTime(new Date())
    ),
  }));

  const rowsPage = 20;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(rowsPage);
  const [searchTerm, setSearchTerm] = useState("");

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, rowsPage));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handlePrintPaymentHistory = () => {
    const printWindow = window.open("", "_blank", "width=900,height=1100");
    if (!printWindow) {
      window.alert("Permite las ventanas emergentes para generar el PDF.");
      return;
    }

    const escapeHtml = (value: unknown) => String(value ?? "-")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    const money = (value: unknown) => `$ ${new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0)}`;
    const date = (value: unknown) => value
      ? new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(String(value)))
      : "-";
    const paymentRows = filteredCuotas.map((cuota: any) => {
      const payments = cuota.presPagos || [];
      const paymentDetails = payments.length
        ? payments.map((pago: any) => `${date(pago.diaDePago || pago.fechaPago)} - ${money(pago.totalPagado || pago.montoPagado)} - ${pago.metodoPago?.nombre || "-"}`).join("<br>")
        : "-";
      return `<tr>
        <td>${escapeHtml(cuota.numeroCuota)}</td>
        <td>${date(cuota.fechaVencimiento)}</td>
        <td class="right">${money(cuota.monto)}</td>
        <td>${escapeHtml(cuota.estado)}</td>
        <td class="right">${money(cuota.abonoCapital)}</td>
        <td class="right">${money(cuota.intereses)}</td>
        <td class="right">${money(cuota.mora)}</td>
        <td>${paymentDetails}</td>
      </tr>`;
    }).join("");

    printWindow.document.write(`<!doctype html><html><head><title>Historial de pagos - Crédito #${escapeHtml(creditId)}</title><style>
      @page { size: portrait; margin: 12mm; } * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; color: #1f2937; margin: 0; font-size: 9px; }
      h1 { color: #0f766e; margin: 0 0 4px; font-size: 19px; } .subtitle { color: #6b7280; margin-bottom: 14px; }
      .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 14px; }
      .summary div { border: 1px solid #cbd5e1; border-radius: 3px; padding: 6px; } .label { color: #6b7280; font-size: 8px; text-transform: uppercase; } .value { font-weight: bold; margin-top: 2px; }
      h2 { color: #0f766e; border-bottom: 2px solid #13deb9; padding-bottom: 4px; margin: 14px 0 8px; font-size: 13px; }
      table { border-collapse: collapse; width: 100%; table-layout: fixed; } th { background: #0f766e; color: #fff; text-align: left; } th, td { border: 1px solid #cbd5e1; padding: 4px 3px; overflow-wrap: anywhere; vertical-align: top; } tr:nth-child(even) { background: #f0fdfa; }
      th:nth-child(1), td:nth-child(1) { width: 7%; } th:nth-child(2), td:nth-child(2) { width: 12%; } th:nth-child(3), td:nth-child(3) { width: 13%; } th:nth-child(4), td:nth-child(4) { width: 11%; } th:nth-child(5), td:nth-child(5), th:nth-child(6), td:nth-child(6), th:nth-child(7), td:nth-child(7) { width: 12%; } th:nth-child(8), td:nth-child(8) { width: 21%; }
      .right { text-align: right; } .footer { color: #6b7280; margin-top: 10px; font-size: 8px; }
    </style></head><body>
      <h1>Historial de pagos</h1><div class="subtitle">Crédito #${escapeHtml(creditId)} | Plazo: ${escapeHtml(plazoMeses)} meses</div>
      <div class="summary"><div><div class="label">Cuotas pagadas</div><div class="value">${cuotasPagadas}</div></div><div><div class="label">Cuotas pendientes</div><div class="value">${cuotasPendientes}</div></div><div><div class="label">Cuotas canceladas</div><div class="value">${cuotasCanceladas}</div></div><div><div class="label">Cuotas atrasadas</div><div class="value">${cuotasAtrasadas}</div></div></div>
      <h2>Detalle de cuotas y pagos registrados</h2>
      <table><thead><tr><th>Cuota</th><th>Vencimiento</th><th>Monto</th><th>Estado</th><th>Capital</th><th>Intereses</th><th>Mora</th><th>Pagos registrados</th></tr></thead><tbody>${paymentRows}</tbody></table>
      <div class="footer">Documento generado el ${escapeHtml(new Date().toLocaleString("es-CO"))}</div>
    </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const filteredCuotas = sortedCuotas.filter((cuota: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const numeroCuota = cuota.numeroCuota?.toString() || "";
    const estado = cuota.estado?.toLowerCase() || "";
    const monto = cuota.monto?.toString() || "";
    const fechaVenc = formatNameDate(cuota.fechaVencimiento)?.toLowerCase() || "";
    return (
      numeroCuota.includes(searchLower) ||
      estado.includes(searchLower) ||
      monto.includes(searchLower) ||
      fechaVenc.includes(searchLower)
    );
  });

  const paginatedRows = filteredCuotas.slice(page * pageSize, page * pageSize + pageSize);

  const cuotasPagadas = sortedCuotas.filter(c => c.estado === "PAGADO").length;
  const cuotasPendientes = sortedCuotas.filter(c => c.estado === "PENDIENTE").length;
  const cuotasCanceladas = sortedCuotas.filter(c => c.estado === "CANCELADO").length;
  const cuotasAtrasadas = sortedCuotas.filter(c => {
    if (c.estado === "PENDIENTE") {
      const today = new Date();
      const dueDate = new Date(c.fechaVencimiento);
      return dueDate < today;
    }
    return false;
  }).length;

  const getRowStyle = (cuota: any) => {
    if (cuota.estado === "PAGADO") {
      return {
        backgroundColor: "#f0fdf4",
        "&:hover": { backgroundColor: "#dcfce7" }
      };
    }
    if (cuota.estado === "CANCELADO") {
      return {
        backgroundColor: "#f8fafc",
        opacity: 0.6,
        "&:hover": { backgroundColor: "#f1f5f9" }
      };
    }
    if (cuota.estado === "PENDIENTE") {
      const today = new Date();
      const dueDate = new Date(cuota.fechaVencimiento);
      if (dueDate < today) {
        return {
          backgroundColor: "#fef2f2",
          "&:hover": { backgroundColor: "#fee2e2" }
        };
      }
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7 && diffDays > 0) {
        return {
          backgroundColor: "#fffbeb",
          "&:hover": { backgroundColor: "#fef3c7" }
        };
      }
    }
    return {};
  };

  const columns = [
    { field: "expand", headerName: "", width: 40 },
    { field: "numeroCuota", headerName: "Cuota", width: 70 },
    { field: "fechaVencimiento", headerName: "Vencimiento", width: 120 },
    { field: "monto", headerName: "Valor", width: 100 },
    { field: "estado", headerName: "Estado", width: 110 },
    { field: "fechaPago", headerName: "Fecha Pago", width: 120 },
    { field: "acciones", headerName: "Acciones", width: 100 },
  ];

  const formatRules: Record<string, (value: any, row?: any) => React.ReactNode> = {
    expand: (value, row) => (
      <IconButton
        size="small"
        onClick={() => toggleRowExpansion(row.id)}
        sx={{ p: 0.5 }}
      >
        {expandedRows.has(row.id) ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      </IconButton>
    ),
    numeroCuota: (value) => (
      <Chip label={`#${value}`} size="small" sx={{ fontWeight: 600, height: 24 }} />
    ),
    fechaVencimiento: (value, row) => {
      if (!value) return "-";
      const today = new Date();
      const dueDate = new Date(value);
      const isPast = dueDate < today && row?.estado !== "PAGADO";
      return (
        <Typography variant="body2" color={isPast ? 'error.main' : 'text.primary'}>
          {formatNameDate(value)}
        </Typography>
      );
    },
    monto: (value) => (
      <Typography variant="body2" fontWeight={600} color="primary.main">
        ${formatCurrency(formatNumber(redondearHaciaArriba(value || 0)))}
      </Typography>
    ),
    estado: (value) => getEstadoChip(value),
    fechaPago: (value, row) => {
      const fechaPago = (row as any)?.presPagos?.[0]?.diaDePago;
      return fechaPago ? (
        <Typography variant="body2">{formatNameDate(fechaPago)}</Typography>
      ) : (
        <Typography variant="body2" color="text.disabled">-</Typography>
      );
    },
    acciones: (value, row) => {
      const currentIndex = sortedCuotas.findIndex((c) => c.id === row.id);
      const previousCuota = sortedCuotas[currentIndex - 1];
      const isEnabled = !previousCuota || previousCuota.estado === "PAGADO";
      const comprobante = (row as any)?.presPagos?.[0]?.comprobante;
      const hasValidComprobante = typeof comprobante === 'string' && /\.(pdf|png|jpg|jpeg)$/i.test(comprobante);

      return (
        <Box display="flex" gap={0.5} alignItems="center">
          {isEnabled && row.estado === "PENDIENTE" ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenModal(row)}
              size="small"
              sx={{ textTransform: 'none', minWidth: 70 }}
            >
              Pagar
            </Button>
          ) : hasValidComprobante ? (
            <Tooltip title="Ver comprobante">
              <IconButton size="small" onClick={() => handleOpenComprobante(comprobante)}>
                <AttachFile fontSize="small" />
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
      {/* Stats en línea - mejor balance */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <MiniStatBox label="Pagadas" value={cuotasPagadas} icon={<CheckCircle sx={{ fontSize: 18 }} />} color="#22c55e" />
        <MiniStatBox label="Pendientes" value={cuotasPendientes} icon={<AccessTime sx={{ fontSize: 18 }} />} color="#eab308" />
        {cuotasCanceladas > 0 && (
          <MiniStatBox label="Canceladas" value={cuotasCanceladas} icon={<CheckCircle sx={{ fontSize: 18 }} />} color="#94a3b8" />
        )}
        {cuotasAtrasadas > 0 && (
          <MiniStatBox label="Atrasadas" value={cuotasAtrasadas} icon={<Warning sx={{ fontSize: 18 }} />} color="#ef4444" />
        )}
      </Stack>

      {/* Buscador y acciones */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Buscar cuota, estado, monto..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flex: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
          }}
        />
        <Button
          variant="outlined"
          size="small"
          startIcon={<Print />}
          onClick={handlePrintPaymentHistory}
        >
          PDF
        </Button>
        <TableExportButton
          columns={columns}
          rows={filteredCuotas}
          filename="historial_pagos"
          sheetName="Pagos"
        />
      </Box>

      {searchTerm && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Mostrando {filteredCuotas.length} de {sortedCuotas.length} cuotas
        </Typography>
      )}

      {/* Tabla */}
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
        <TableContainer sx={{ maxHeight: 550 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.field}
                    sx={{
                      fontWeight: 600,
                      backgroundColor: '#f8fafc',
                      minWidth: column.width,
                      py: 1,
                    }}
                  >
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row: any) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    sx={{
                      ...getRowStyle(row),
                      '& > *': { borderBottom: expandedRows.has(row.id) ? 'none' : undefined },
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.field} sx={{ py: 1 }}>
                        {(formatRules as any)[column.field]
                          ? (formatRules as any)[column.field]((row as any)[column.field], row as any)
                          : (row as any)[column.field]}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRows.has(row.id) && (
                    <TableRow sx={{ ...getRowStyle(row), backgroundColor: 'rgba(0,0,0,0.02)' }}>
                      <TableCell colSpan={columns.length} sx={{ py: 2, px: 2 }}>
                        <Grid container spacing={1.5} sx={{ width: '100%' }}>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#f0fdf4' }}>
                              <Typography variant="caption" color="text.secondary">Capital</Typography>
                              <Typography variant="subtitle2" fontWeight={600}>
                                ${formatCurrency(formatNumber(redondearHaciaArriba(row.abonoCapital || 0)))}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#eff6ff' }}>
                              <Typography variant="caption" color="text.secondary">Intereses</Typography>
                              <Typography variant="subtitle2" fontWeight={600}>
                                ${formatCurrency(formatNumber(redondearHaciaArriba(row.intereses || 0)))}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#fef2f2' }}>
                              <Typography variant="caption" color="text.secondary">Mora</Typography>
                              <Typography variant="subtitle2" fontWeight={600} color="error.main">
                                ${formatCurrency(formatNumber(redondearHaciaArriba(calcularMora(row?.monto || 0, row?.diasEnMora || 0))))}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#f5f3ff' }}>
                              <Typography variant="caption" color="text.secondary">Método de Pago</Typography>
                              <Typography variant="subtitle2" fontWeight={500}>
                                {row?.presPagos?.[0]?.metodoPago?.nombre || '-'}
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredCuotas.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[20, 30, 50]}
          labelRowsPerPage="Filas por página"
        />
      </Paper>

      {/* Modal de Pago */}
      <Dialog open={open} onClose={handleCloseModal} maxWidth="md" fullScreen={isMobile}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Payment /> Registrar Pago
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <PresPagosForm 
            pago={selectedRow} 
            creditId={creditId}
            idAsociado={idAsociado}
            onSuccess={handlePaymentSuccess}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
          <Button onClick={handleCloseModal} variant="outlined">Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Comprobante */}
      <Dialog open={comprobanteDialogOpen} onClose={handleCloseComprobante} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachFile /> Comprobante de Pago
        </DialogTitle>
        <DialogContent sx={{ mt: 2, textAlign: 'center' }}>
          {selectedComprobante && (
            <Box>
              {selectedComprobante.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={getComprobanteUrl(selectedComprobante)}
                  width="100%"
                  height="500px"
                  style={{ border: 'none', borderRadius: 4 }}
                  title="Comprobante PDF"
                />
              ) : (
                <img
                  src={getComprobanteUrl(selectedComprobante)}
                  alt="Comprobante"
                  style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 4 }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
          <Button onClick={handleCloseComprobante} variant="outlined">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PaymentHistoryTable;