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
  Edit,
  ReceiptLong,
} from "@mui/icons-material";
import {
  calcularDiasEnMora,
  calcularMora,
  formatCurrency,
  formatDateToISO,
  formatDateTime,
  formatNameDate,
  formatNumber,
  getEstadoChip,
  redondearHaciaArriba,
  roleAdmin,
  validateRoles,
} from "@/app/(DashboardLayout)/utilities/utils";
import { authService } from "@/app/authentication/services/authService";
import { logoBase64 } from "@/app/(DashboardLayout)/utilities/logoBase64";
import PresPagosForm from "./PresPagosForm";
import PaymentReceiptModal from "./PaymentReceiptModal";
import TableExportButton from "@/components/TableExportButton";

interface PaymentHistoryProps {
  presCuotas: any[];
  plazoMeses: number;
  creditId: number;
  idAsociado: number;
  creditData?: any;
  userInfo?: {
    nombres?: string;
    numeroDeIdentificacion?: string;
  };
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
  creditData,
  userInfo,
  onPaymentSuccess,
}) => {
  const cleanLogoUrl = logoBase64.replace(/^url\(["']?|["']?\)$/g, "");
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow]: any = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pagoIdToEdit, setPagoIdToEdit] = useState<number | undefined>(undefined);
  const [comprobanteDialogOpen, setComprobanteDialogOpen] = useState(false);
  const [selectedComprobante, setSelectedComprobante] = useState<string | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceiptData, setSelectedReceiptData] = useState<any>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const userRoles = authService.getUserRoles();
  const isAdmin = validateRoles(roleAdmin, userRoles);

  const handleOpenModal = (row: any) => {
    const rowNormalizado = {
      ...row,
      fechaVencimiento: formatDateToISO(row.fechaVencimiento),
      diaDePago: formatDateToISO(row.diaDePago || new Date()),
    };
    setSelectedRow(rowNormalizado);
    setIsEditMode(false);
    setPagoIdToEdit(undefined);
    setOpen(true);
  };

  const handleOpenEditModal = (row: any) => {
    const pagoExistente = row.presPagos?.[0];
    const rowConDatosDePago = {
      ...row,
      fechaVencimiento: formatDateToISO(row.fechaVencimiento),
      diaDePago: pagoExistente?.diaDePago ? formatDateToISO(pagoExistente.diaDePago) : formatDateToISO(row.diaDePago || new Date()),
      diasEnMora: pagoExistente?.diasEnMora ?? row.diasEnMora,
      mora: pagoExistente?.mora ?? row.mora,
      abonoExtra: pagoExistente?.abonoExtra ?? row.abonoExtra,
      abonoCapital: pagoExistente?.abonoCapital ?? row.abonoCapital,
      intereses: pagoExistente?.intereses ?? row.intereses,
      proteccionCartera: pagoExistente?.proteccionCartera ?? row.proteccionCartera,
      monto: pagoExistente?.monto ?? row.monto,
      metodoPagoId: pagoExistente?.metodoPago?.id || pagoExistente?.metodoPagoId,
    };
    setSelectedRow(rowConDatosDePago);
    setIsEditMode(true);
    setPagoIdToEdit(pagoExistente?.idPago || pagoExistente?.id);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedRow(null);
    setIsEditMode(false);
    setPagoIdToEdit(undefined);
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

  const handleOpenReceiptModal = (row: any) => {
    setSelectedReceiptData({
      cuota: row,
      pago: row.presPagos?.[0],
      creditId,
      creditData,
      userInfo,
    });
    setReceiptModalOpen(true);
  };

  const handleCloseReceiptModal = () => {
    setReceiptModalOpen(false);
    setSelectedReceiptData(null);
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

  let sortedCuotas = (presCuotas as any[]).slice().sort(
    (a: any, b: any) => a.numeroCuota - b.numeroCuota
  );

  sortedCuotas = sortedCuotas.map((cuota: any) => {
    const extraCalculado =
      cuota.presPagos?.reduce(
        (sum: number, p: any) => sum + (Number(p.abonoExtra) || 0),
        0
      ) || Number(cuota?.abonoExtra) || 0;

    const pagoRegistrado = cuota.presPagos?.[0];
    const proteccionReal =
      pagoRegistrado && typeof pagoRegistrado.proteccionCartera === "number"
        ? pagoRegistrado.proteccionCartera
        : cuota.proteccionCartera;

    return {
      ...cuota,
      proteccionCartera: proteccionReal,
      abonoExtra: extraCalculado,
      diasEnMora: (cuota.estado === "PAGADO" || cuota.estado === "CANCELADO") ? 0 : calcularDiasEnMora(
        cuota.fechaVencimiento,
        formatDateTime(new Date())
      ),
    };
  });

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
    const printWindow = window.open("", "_blank", "width=1000,height=1100");
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
    const money = (value: unknown) => `$${new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0)}`;
    const date = (value: unknown) => value
      ? formatNameDate(value as any) || "-"
      : "-";

    const tasaCredito = creditData ? (parseFloat((creditData as any).tasa || creditData.idTasa?.tasa || "0") * 100).toFixed(2) : "0.00";
    const fechaSolicitudFmt = creditData?.fechaSolicitud ? formatNameDate(creditData.fechaSolicitud) : "Sin fecha";
    const fechaDesembolsoFmt = creditData?.fechaDesembolso ? formatNameDate(creditData.fechaDesembolso) : (creditData?.fechaCredito ? formatNameDate(creditData.fechaCredito) : "No desembolsado");
    const aplicaProteccionTexto = creditData?.aplicaProteccionCartera !== false ? "Aplica (0.1%)" : "No aplica";

    const totalCuotasMonto = filteredCuotas.reduce((sum, c: any) => sum + (Number(c.monto) || 0), 0);
    const totalProteccionMonto = filteredCuotas.reduce((sum, c: any) => sum + (Number(c.proteccionCartera) || 0), 0);
    const totalExtraMonto = filteredCuotas.reduce((sum, c: any) => sum + (Number(c.abonoExtra) || 0), 0);
    const totalCapitalMonto = filteredCuotas.reduce((sum, c: any) => sum + (Number(c.abonoCapital) || 0), 0);
    const totalInteresesMonto = filteredCuotas.reduce((sum, c: any) => sum + (Number(c.intereses) || 0), 0);
    const totalMoraMonto = filteredCuotas.reduce((sum, c: any) => sum + (Number(c.mora) || 0), 0);

    const paymentRows = filteredCuotas.map((cuota: any) => {
      const payments = cuota.presPagos || [];
      const paymentDetails = payments.length
        ? payments.map((pago: any) => `
            <div class="pay-item">
              <div class="pay-line-top">
                <span class="pay-date">${date(pago.diaDePago || pago.fechaPago)}</span>
                <span class="pay-val">${money(pago.totalPagado || pago.montoPagado)}</span>
              </div>
              <div class="pay-meth">${escapeHtml(pago.metodoPago?.nombre || "EFECTIVO")}</div>
            </div>
          `).join("")
        : '<span class="text-muted center-text">-</span>';
      
      const extra = Number(cuota.abonoExtra) || 0;
      const prot = Number(cuota.proteccionCartera) || 0;
      const estadoClass = cuota.estado === "PAGADO" ? "badge-success" : cuota.estado === "PENDIENTE" ? "badge-warning" : "badge-secondary";

      return `<tr>
        <td class="center font-bold">#${escapeHtml(cuota.numeroCuota)}</td>
        <td class="center">${date(cuota.fechaVencimiento)}</td>
        <td class="right font-semibold">${money(cuota.monto)}</td>
        ${aplicaProteccion ? `<td class="right">${prot > 0 ? money(prot) : "-"}</td>` : ""}
        <td class="right ${extra > 0 ? "text-purple font-semibold" : "text-muted"}">${extra > 0 ? money(extra) : "-"}</td>
        <td class="center"><span class="badge ${estadoClass}">${escapeHtml(cuota.estado)}</span></td>
        <td class="right">${money(cuota.abonoCapital)}</td>
        <td class="right">${money(cuota.intereses)}</td>
        <td class="right ${Number(cuota.mora) > 0 ? "text-danger font-semibold" : ""}">${Number(cuota.mora) > 0 ? money(cuota.mora) : "-"}</td>
        <td>${paymentDetails}</td>
      </tr>`;
    }).join("");

    printWindow.document.write(`<!doctype html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Historial de Pagos - Crédito #${escapeHtml(creditId)}</title>
      <style>
        @page { size: letter portrait; margin: 8mm 10mm; }
        * { box-sizing: border-box; }
        body { font-family: 'Roboto', 'Segoe UI', Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; font-size: 9px; line-height: 1.25; background: #fff; }
        
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f766e; padding-bottom: 8px; margin-bottom: 10px; }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand img { width: 50px; height: 50px; object-fit: contain; }
        .brand-title { color: #0f766e; font-weight: 800; font-size: 8.5px; line-height: 1.15; }
        .brand-subtitle { color: #0f766e; font-weight: 800; font-size: 9.5px; letter-spacing: 0.3px; }
        .brand-nit { color: #64748b; font-size: 7.5px; }

        .doc-info { text-align: right; }
        .doc-info .doc-label { font-size: 7.5px; color: #64748b; font-weight: 700; text-transform: uppercase; }
        .doc-info .credit-num { font-size: 13px; font-weight: 900; color: #0f766e; }

        .user-card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; background: #f8fafc; margin-bottom: 10px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 10px; }
        .user-info-item { font-size: 8px; color: #475569; }
        .user-info-item strong { color: #0f172a; font-size: 8.5px; font-weight: 700; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
        .stat-card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; background: #f8fafc; }
        .stat-card.success { border-color: #bbf7d0; background: #f0fdf4; }
        .stat-card.warning { border-color: #fef08a; background: #fefce8; }
        .stat-card.danger { border-color: #fecdd3; background: #fef2f2; }
        .stat-label { font-size: 7.5px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.3px; }
        .stat-value { font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 1px; }

        .section-title { font-size: 10px; font-weight: 800; color: #0f766e; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; }

        table { border-collapse: collapse; width: 100%; table-layout: fixed; margin-bottom: 10px; font-size: 8.5px; }
        th { background: #0f766e; color: #ffffff; text-align: left; font-weight: 700; text-transform: uppercase; font-size: 7.5px; letter-spacing: 0.3px; padding: 5px 4px; border: 1px solid #0f766e; }
        td { border: 1px solid #cbd5e1; padding: 4px 4px; vertical-align: middle; overflow-wrap: anywhere; }
        tr:nth-child(even) { background: #f8fafc; }
        
        .totals-row td { background: #f1f5f9; font-weight: 800; border-top: 2px solid #0f766e; color: #0f172a; }

        .center { text-align: center; }
        .right { text-align: right; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .text-muted { color: #94a3b8; }
        .text-purple { color: #7e22ce; }
        .text-danger { color: #dc2626; }

        .badge { display: inline-block; padding: 2px 5px; border-radius: 4px; font-size: 7px; font-weight: 700; text-transform: uppercase; }
        .badge-success { background: #dcfce7; color: #15803d; }
        .badge-warning { background: #fef9c3; color: #a16207; }
        .badge-secondary { background: #f1f5f9; color: #475569; }

        .pay-item { font-size: 7.5px; line-height: 1.15; padding: 2px 0; border-bottom: 1px dashed #e2e8f0; }
        .pay-item:last-child { border-bottom: none; }
        .pay-line-top { display: flex; justify-content: space-between; align-items: center; gap: 4px; }
        .pay-date { font-weight: 600; color: #334155; font-size: 7.5px; }
        .pay-val { font-weight: 800; color: #15803d; font-size: 8px; }
        .pay-meth { color: #64748b; font-size: 6.5px; font-weight: 600; text-transform: uppercase; margin-top: 1px; }
        .center-text { display: block; text-align: center; }

        .footer { margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">
          <img src="${cleanLogoUrl}" alt="Logo Cooperativa" />
          <div>
            <div class="brand-title">COOPERATIVA MULTIACTIVA DE PRODUCCIÓN Y PRESTACIÓN DE SERVICIOS</div>
            <div class="brand-subtitle">INTEGRACIÓN SIGLO XXI</div>
            <div class="brand-nit">NIT. 08301055337</div>
          </div>
        </div>
        <div class="doc-info">
          <div class="doc-label">HISTORIAL DE PAGOS</div>
          <div class="credit-num">CRÉDITO #${escapeHtml(creditId)}</div>
          <div style="font-size: 8.5px; color: #475569;">Plazo: <strong>${escapeHtml(plazoMeses)} meses</strong></div>
        </div>
      </div>

      <div class="user-card">
        <div class="user-info-item">
          Afiliado / Socio: <strong>${escapeHtml(userInfo?.nombres || "Socio Registrado")}</strong>
        </div>
        <div class="user-info-item">
          No. Identificación: <strong>${escapeHtml(userInfo?.numeroDeIdentificacion || "Sin datos")}</strong>
        </div>
        <div class="user-info-item">
          Monto Crédito: <strong>$${formatCurrency(redondearHaciaArriba(creditData?.monto || 0))}</strong>
        </div>
        <div class="user-info-item">
          Tasa Aplicada: <strong>${tasaCredito}% mensual</strong>
        </div>
        <div class="user-info-item">
          Protección Cartera: <strong>${aplicaProteccionTexto}</strong>
        </div>
        <div class="user-info-item">
          Fecha Solicitud: <strong>${fechaSolicitudFmt}</strong>
        </div>
        <div class="user-info-item">
          Fecha Desembolso: <strong>${fechaDesembolsoFmt}</strong>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card success">
          <div class="stat-label">Cuotas Pagadas</div>
          <div class="stat-value" style="color:#15803d;">${cuotasPagadas}</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">Cuotas Pendientes</div>
          <div class="stat-value" style="color:#a16207;">${cuotasPendientes}</div>
        </div>
        <div class="stat-card danger">
          <div class="stat-label">Cuotas Atrasadas</div>
          <div class="stat-value" style="color:#dc2626;">${cuotasAtrasadas}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Cuotas Canceladas</div>
          <div class="stat-value">${cuotasCanceladas}</div>
        </div>
      </div>

      <div class="section-title">Detalle de Amortización y Pagos Registrados</div>
      
      <table>
        <thead>
          <tr>
            <th class="center" style="width: 5%;">Cuota</th>
            <th class="center" style="width: 10%;">Vencimiento</th>
            <th class="right" style="width: 10%;">Monto</th>
            ${aplicaProteccion ? `<th class="right" style="width: 9%;">Protección</th>` : ""}
            <th class="right" style="width: 10%;">Abono Extra</th>
            <th class="center" style="width: 9%;">Estado</th>
            <th class="right" style="width: 10%;">Capital</th>
            <th class="right" style="width: 10%;">Intereses</th>
            <th class="right" style="width: 8%;">Mora</th>
            <th style="width: ${aplicaProteccion ? "19%" : "28%"};">Pagos Registrados</th>
          </tr>
        </thead>
        <tbody>
          ${paymentRows}
          <tr class="totals-row">
            <td colspan="2" class="center">TOTALES</td>
            <td class="right">${money(totalCuotasMonto)}</td>
            ${aplicaProteccion ? `<td class="right">${money(totalProteccionMonto)}</td>` : ""}
            <td class="right">${money(totalExtraMonto)}</td>
            <td class="center">-</td>
            <td class="right">${money(totalCapitalMonto)}</td>
            <td class="right">${money(totalInteresesMonto)}</td>
            <td class="right">${money(totalMoraMonto)}</td>
            <td>-</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <div>COOPERATIVA MULTIACTIVA INTEGRACIÓN SIGLO XXI - Sistema de Gestión de Créditos</div>
        <div>Generado el: ${escapeHtml(new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }))}</div>
      </div>
    </body>
    </html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      try {
        printWindow.print();
        printWindow.close();
      } catch (e) {
        console.error("Error al ejecutar impresion:", e);
      }
    }, 250);
  };

  const filteredCuotas = sortedCuotas.filter((cuota: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const numeroCuota = cuota.numeroCuota?.toString() || "";
    const estado = cuota.estado?.toLowerCase() || "";
    const monto = cuota.monto?.toString() || "";
    const abonoExtra = cuota.abonoExtra?.toString() || "";
    const fechaVenc = formatNameDate(cuota.fechaVencimiento)?.toLowerCase() || "";
    return (
      numeroCuota.includes(searchLower) ||
      estado.includes(searchLower) ||
      monto.includes(searchLower) ||
      abonoExtra.includes(searchLower) ||
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

  const aplicaProteccion =
    creditData?.aplicaProteccionCartera !== false ||
    sortedCuotas.some((c: any) => (Number(c.proteccionCartera) || 0) > 0);

  const columns = [
    { field: "expand", headerName: "", width: 40 },
    { field: "numeroCuota", headerName: "Cuota", width: 70 },
    { field: "fechaVencimiento", headerName: "Vencimiento", width: 120 },
    { field: "monto", headerName: "Valor", width: 100 },
    ...(aplicaProteccion
      ? [{ field: "proteccionCartera", headerName: "Protección", width: 100 }]
      : []),
    { field: "abonoExtra", headerName: "Abono Extra", width: 110 },
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
    proteccionCartera: (value) => {
      const prot = Number(value) || 0;
      return prot > 0 ? (
        <Typography variant="body2" fontWeight={600} color="text.primary">
          ${formatCurrency(formatNumber(redondearHaciaArriba(prot)))}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.disabled">-</Typography>
      );
    },
    abonoExtra: (value) => {
      const extra = Number(value) || 0;
      return extra > 0 ? (
        <Typography variant="body2" fontWeight={700} color="success.main">
          ${formatCurrency(formatNumber(redondearHaciaArriba(extra)))}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.disabled">-</Typography>
      );
    },
    estado: (value, row) => {
      if (value === "PAGADO") {
        const totalPagado =
          (row as any)?.presPagos?.reduce(
            (sum: number, p: any) => sum + (Number(p.totalPagado) || 0),
            0
          ) || Number(row.monto) || 0;

        return (
          <Box display="flex" flexDirection="column" alignItems="flex-start" gap={0.25}>
            {getEstadoChip(value)}
            <Typography variant="caption" fontWeight={700} color="success.dark" sx={{ fontSize: "0.75rem" }}>
              ${formatCurrency(formatNumber(redondearHaciaArriba(totalPagado)))}
            </Typography>
          </Box>
        );
      }
      return getEstadoChip(value);
    },
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
      const tienePagoRegistrado = row.estado === "PAGADO" && row.presPagos && row.presPagos.length > 0;

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
          ) : (
            <>
              {row.estado === "PAGADO" && (
                <Tooltip title="Ver recibo de pago">
                  <IconButton size="small" color="success" onClick={() => handleOpenReceiptModal(row)}>
                    <ReceiptLong fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {isAdmin && tienePagoRegistrado && (
                <Tooltip title="Editar pago">
                  <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(row)}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {hasValidComprobante && (
                <Tooltip title="Ver comprobante">
                  <IconButton size="small" onClick={() => handleOpenComprobante(comprobante)}>
                    <AttachFile fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
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
                          <Grid size={{ xs: 6, sm: aplicaProteccion ? 2 : 2.4 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#f0fdf4' }}>
                              <Typography variant="caption" color="text.secondary">Capital</Typography>
                              <Typography variant="subtitle2" fontWeight={600}>
                                ${formatCurrency(formatNumber(redondearHaciaArriba(row.abonoCapital || 0)))}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 6, sm: aplicaProteccion ? 2 : 2.4 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#ecfdf5' }}>
                              <Typography variant="caption" color="text.secondary">Abono Extra</Typography>
                              <Typography variant="subtitle2" fontWeight={600} color={row.abonoExtra > 0 ? "success.main" : "text.primary"}>
                                ${formatCurrency(formatNumber(redondearHaciaArriba(row.abonoExtra || 0)))}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 6, sm: aplicaProteccion ? 2 : 2.4 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#eff6ff' }}>
                              <Typography variant="caption" color="text.secondary">Intereses</Typography>
                              <Typography variant="subtitle2" fontWeight={600}>
                                ${formatCurrency(formatNumber(redondearHaciaArriba(row.intereses || 0)))}
                              </Typography>
                            </Paper>
                          </Grid>
                          {aplicaProteccion && (
                            <Grid size={{ xs: 6, sm: 2 }}>
                              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#f0fdfa' }}>
                                <Typography variant="caption" color="text.secondary">Protección</Typography>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  ${formatCurrency(formatNumber(redondearHaciaArriba(row.proteccionCartera || 0)))}
                                </Typography>
                              </Paper>
                            </Grid>
                          )}
                          <Grid size={{ xs: 6, sm: aplicaProteccion ? 2 : 2.4 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#fef2f2' }}>
                              <Typography variant="caption" color="text.secondary">Mora</Typography>
                              <Typography variant="subtitle2" fontWeight={600} color="error.main">
                                ${formatCurrency(formatNumber(redondearHaciaArriba(calcularMora(row?.monto || 0, row?.diasEnMora || 0))))}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 6, sm: aplicaProteccion ? 2 : 2.4 }}>
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

      {/* Modal de Pago / Edición */}
      <Dialog open={open} onClose={handleCloseModal} maxWidth="md" fullScreen={isMobile}>
        <DialogTitle sx={{ bgcolor: isEditMode ? 'warning.main' : 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          {isEditMode ? <Edit /> : <Payment />} {isEditMode ? "Editar Pago Registrado" : "Registrar Pago"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <PresPagosForm 
            pago={selectedRow} 
            creditId={creditId}
            idAsociado={idAsociado}
            isEditMode={isEditMode}
            pagoIdToEdit={pagoIdToEdit}
            cuotas={sortedCuotas}
            onSuccess={handlePaymentSuccess}
            onClose={handleCloseModal}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
          <Button onClick={handleCloseModal} variant="outlined">Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Recibo Oficial de Pago */}
      <PaymentReceiptModal
        open={receiptModalOpen}
        onClose={handleCloseReceiptModal}
        data={selectedReceiptData}
      />

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