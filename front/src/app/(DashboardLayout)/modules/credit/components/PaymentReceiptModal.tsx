import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Grid,
  CircularProgress,
  IconButton,
  Divider,
  Paper,
} from "@mui/material";
import {
  formatCurrency,
  formatDateToISO,
  formatNameDate,
  numeroALetras,
  redondearHaciaArriba,
} from "@/app/(DashboardLayout)/utilities/utils";
import { logoBase64 } from "@/app/(DashboardLayout)/utilities/logoBase64";
import { IconPrinter, IconFileTypePdf, IconX } from "@tabler/icons-react";

interface PaymentReceiptModalProps {
  open: boolean;
  onClose: () => void;
  data: {
    cuota: any;
    pago?: any;
    creditId: number;
    creditData?: any;
    userInfo?: {
      nombres?: string;
      numeroDeIdentificacion?: string;
    };
  } | null;
}

const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  open,
  onClose,
  data,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!open || !data || !data.cuota) return null;

  const { cuota, pago: pagoProp, creditId, creditData, userInfo } = data;
  const pago = pagoProp || cuota.presPagos?.[0] || {};

  const numCuota = cuota.numeroCuota;
  const fechaPagoStr = pago.diaDePago || pago.fechaPago || cuota.diaDePago || new Date();
  const fechaPagoFmt = formatNameDate(fechaPagoStr);

  const montoCredito = creditData?.monto || 0;
  const plazoCredito = creditData?.plazoMeses || 0;
  const tasaCredito = creditData ? (parseFloat((creditData as any).tasa || creditData.idTasa?.tasa || "0") * 100).toFixed(2) : 0;
  const cuotaMensualCredito = creditData?.cuotaMensual || cuota.monto || 0;
  const fechaSolicitudFmt = creditData?.fechaSolicitud ? formatNameDate(creditData.fechaSolicitud) : "Sin fecha";
  const fechaDesembolsoFmt = creditData?.fechaDesembolso ? formatNameDate(creditData.fechaDesembolso) : "No desembolsado";
  const aplicaProteccionTexto = creditData?.aplicaProteccionCartera !== false ? "Aplica (0.1%)" : "No aplica";

  const abonoCapital = Number(pago.abonoCapital ?? cuota.abonoCapital ?? 0);
  const intereses = Number(pago.intereses ?? cuota.intereses ?? 0);
  const proteccionCartera = Number(pago.proteccionCartera ?? cuota.proteccionCartera ?? 0);
  const mora = Number(pago.mora ?? cuota.mora ?? 0);
  const abonoExtra = Number(pago.abonoExtra ?? cuota.abonoExtra ?? 0);
  
  const totalPagado =
    Number(pago.totalPagado) ||
    abonoCapital + intereses + proteccionCartera + mora + abonoExtra ||
    Number(cuota.monto) ||
    0;

  const metodoPagoNombre = pago.metodoPago?.nombre || "Efectivo / Transferencia";

  const cleanLogoUrl = logoBase64.replace(/^url\(["']?|["']?\)$/g, "");

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      const printWindow: any = window.open("", "", "height=750,width=1000");
      const modalContent = document.getElementById("payment-receipt-content")?.innerHTML || "";

      printWindow.document.write("<html><head><title>Recibo de Pago - Crédito #${creditId}</title>");
      printWindow.document.write('<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">');
      printWindow.document.write(`
        <style> 
          @page { margin: 8mm 10mm; size: letter portrait; }
          * { box-sizing: border-box; }
          body { font-size: 10px; font-family: Roboto, sans-serif; padding: 0; margin: 0; color: #1e293b; line-height: 1.25; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
          td, th { border: 1px solid #cbd5e1; padding: 4px 6px; font-size: 9.5px; }
          th { background-color: #f1f5f9; font-weight: 700; color: #0f766e; }
          .right { text-align: right; }
          .center { text-align: center; }
        </style>
      `);

      printWindow.document.write("</head><body>");
      printWindow.document.write(modalContent);
      printWindow.document.write("</body></html>");

      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        try {
          printWindow.print();
          printWindow.close();
        } catch (e) {
          console.error("Error al imprimir recibo:", e);
        }
      }, 250);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("payment-receipt-content");
      if (!element) {
        alert("No se pudo encontrar el contenido del recibo");
        return;
      }

      const opt = {
        margin: [6, 8, 6, 8] as [number, number, number, number],
        filename: `recibo_pago_credito_${creditId}_cuota_${numCuota}_${userInfo?.nombres || "socio"}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm" as const, format: "letter" as const, orientation: "portrait" as const },
      };

      const pdf = await html2pdf().set(opt).from(element).outputPdf("blob");
      const blobUrl = URL.createObjectURL(pdf);
      const newWindow = window.open(blobUrl, "_blank");

      if (!newWindow) {
        alert("Por favor, permite ventanas emergentes para ver el PDF");
      }
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Ocurrió un error al generar el PDF del recibo");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
          px: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: "rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconFileTypePdf size={22} color="#fff" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
              Recibo Oficial de Pago
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Crédito #{creditId} — Cuota #{numCuota}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}>
          <IconX size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: "#fafafa" }}>
        <Paper
          id="payment-receipt-content"
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            bgcolor: "#ffffff",
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
          }}
        >
          {/* Header Institucional */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pb: 1.5,
              mb: 1.5,
              borderBottom: "2px solid #0f766e",
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <img
                src={cleanLogoUrl}
                alt="Logo Cooperativa"
                style={{ width: "50px", height: "50px", objectFit: "contain" }}
              />
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="#0f766e" sx={{ fontSize: "0.8rem", lineHeight: 1.15 }}>
                  COOPERATIVA MULTIACTIVA DE PRODUCCIÓN Y PRESTACIÓN DE SERVICIOS
                </Typography>
                <Typography variant="body2" fontWeight={800} color="#0f766e" sx={{ letterSpacing: 0.3, fontSize: "0.85rem" }}>
                  INTEGRACIÓN SIGLO XXI
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                  NIT. 08301055337
                </Typography>
              </Box>
            </Box>

            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ fontSize: "0.7rem" }}>
                RECIBO NO.
              </Typography>
              <Typography variant="subtitle1" fontWeight={900} color="#0f766e">
                #{creditId}-{numCuota}
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="subtitle2"
            align="center"
            sx={{
              fontWeight: 800,
              color: "#0f766e",
              letterSpacing: 0.5,
              mb: 1.5,
              textTransform: "uppercase",
              fontSize: "0.85rem",
            }}
          >
            Comprobante Oficial de Pago de Crédito
          </Typography>

          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ width: "50%" }}>
              <Table
                size="small"
                sx={{
                  width: "100%",
                  border: "1px solid #e2e8f0",
                  "& td": { py: 0.5, px: 1, fontSize: "0.75rem" },
                }}
              >
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569", width: "45%" }}>
                      Afiliado / Socio:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {userInfo?.nombres || "Socio Registrado"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                      No. Identificación:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {userInfo?.numeroDeIdentificacion || "Sin datos"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                      Crédito No.:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#0f766e" }}>
                      #{creditId}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                      Monto del Crédito:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      ${formatCurrency(redondearHaciaArriba(montoCredito))}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                      Fecha Solicitud:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {fechaSolicitudFmt}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                      Fecha Desembolso:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {fechaDesembolsoFmt}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} sx={{ width: "50%" }}>
              <Table
                size="small"
                sx={{
                  width: "100%",
                  border: "1px solid #e2e8f0",
                  "& td": { py: 0.5, px: 1, fontSize: "0.75rem" },
                }}
              >
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569", width: "45%" }}>
                      Cuota Aplicada:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                      #{numCuota} de {plazoCredito || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                      Fecha de Pago:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {fechaPagoFmt}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                      Método de Pago:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {metodoPagoNombre}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                      Tasa de Interés:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {tasaCredito}% mensual
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                      Protección Cartera:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {aplicaProteccionTexto}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                      Cuota Mensual Ref.:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      ${formatCurrency(redondearHaciaArriba(cuotaMensualCredito))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Grid>

          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: "#0f766e",
              letterSpacing: 0.5,
              textTransform: "uppercase",
              display: "block",
              mb: 0.75,
              fontSize: "0.75rem",
            }}
          >
            Desglose del Pago Recibido
          </Typography>

          <Table
            size="small"
            sx={{
              border: "1px solid #cbd5e1",
              mb: 1.5,
              "& td": { py: 0.5, px: 1, fontSize: "0.78rem" },
            }}
          >
            <TableBody>
              <TableRow>
                <TableCell sx={{ width: "65%", fontWeight: 600, color: "#334155" }}>
                  Abono a Capital Ordinario
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  ${formatCurrency(redondearHaciaArriba(abonoCapital))}
                </TableCell>
              </TableRow>
              {abonoExtra > 0 && (
                <TableRow sx={{ bgcolor: "#fcf4ff" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#7e22ce" }}>
                    Abono Extraordinario a Capital
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: "#7e22ce" }}>
                    ${formatCurrency(redondearHaciaArriba(abonoExtra))}
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: "#334155" }}>
                  Intereses Corrientes
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  ${formatCurrency(redondearHaciaArriba(intereses))}
                </TableCell>
              </TableRow>
              {proteccionCartera > 0 && (
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: "#334155" }}>
                    Protección de Cartera
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    ${formatCurrency(redondearHaciaArriba(proteccionCartera))}
                  </TableCell>
                </TableRow>
              )}
              {mora > 0 && (
                <TableRow sx={{ bgcolor: "#fef2f2" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#dc2626" }}>
                    Intereses por Mora
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: "#dc2626" }}>
                    ${formatCurrency(redondearHaciaArriba(mora))}
                  </TableCell>
                </TableRow>
              )}
              <TableRow sx={{ bgcolor: "#f0fdf4", borderTop: "2px solid #16a34a" }}>
                <TableCell sx={{ fontWeight: 900, fontSize: "0.85rem", color: "#15803d" }}>
                  TOTAL RECIBIDO Y APLICADO
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, fontSize: "0.95rem", color: "#15803d" }}>
                  ${formatCurrency(redondearHaciaArriba(totalPagado))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Box
            sx={{
              p: 1.25,
              bgcolor: "#f8fafc",
              borderRadius: 1.5,
              border: "1px dashed #cbd5e1",
            }}
          >
            <Typography variant="caption" display="block" color="text.secondary" fontWeight={800} sx={{ letterSpacing: 0.5, mb: 0.25, fontSize: "0.68rem" }}>
              VALOR RECIBIDO EN LETRAS:
            </Typography>
            <Typography variant="body2" fontWeight={700} sx={{ fontStyle: "italic", color: "#0f172a", textTransform: "uppercase", fontSize: "0.75rem" }}>
              {numeroALetras(totalPagado, true)}
            </Typography>
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: "#ffffff", borderTop: "1px solid #e2e8f0", justifyContent: "space-between" }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ textTransform: "none", borderRadius: 2 }}>
          Cerrar
        </Button>
        <Box display="flex" gap={1.5}>
          <Button
            onClick={handlePrint}
            variant="outlined"
            color="primary"
            startIcon={<IconPrinter size={18} />}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}
          >
            Imprimir Recibo
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="contained"
            color="primary"
            startIcon={isGeneratingPDF ? <CircularProgress size={18} color="inherit" /> : <IconFileTypePdf size={18} />}
            disabled={isGeneratingPDF}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, bgcolor: "#0f766e", "&:hover": { bgcolor: "#0d6e67" } }}
          >
            {isGeneratingPDF ? "Generando..." : "Descargar PDF"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentReceiptModal;
