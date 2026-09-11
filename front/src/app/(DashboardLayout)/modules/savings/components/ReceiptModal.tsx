import React, { useEffect, useState } from "react";
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
  TableHead,
  TableRow,
  Grid,
  CircularProgress,
  IconButton,
  Paper,
} from "@mui/material";
import {
  formatCurrency,
  formatDateToISO,
  numeroALetras,
  redondearHaciaArriba,
} from "@/app/(DashboardLayout)/utilities/utils";
import { logoBase64 } from "@/app/(DashboardLayout)/utilities/logoBase64";
import { obtenerInformacionAportes } from "@/app/(DashboardLayout)/utilities/AportesUtils";
import { IconPrinter, IconFileTypePdf, IconX } from "@tabler/icons-react";

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ open, onClose, data }) => {
  const [fechaAporte, setFechaAporte] = useState<string>("FECHA APORTE");
  const [anyoAporte, setAnyoAporte] = useState<number>(new Date().getFullYear());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const selectedRow = data?.selectedRow;
  const savings = data?.savings;

  useEffect(() => {
    if (selectedRow?.fechaAporte) {
      const fecha = new Date(selectedRow.fechaAporte);
      if (!isNaN(fecha.getTime())) {
        const month = fecha.toLocaleString("default", { month: "long" });
        const formatted =
          month.charAt(0).toUpperCase() +
          month.slice(1) +
          " de " +
          fecha.getFullYear();
        setFechaAporte(formatted.toUpperCase());
        setAnyoAporte(fecha.getFullYear());
      }
    }
  }, [selectedRow]);

  if (!open || !data || !selectedRow || !savings) return null;

  const cleanLogoUrl = logoBase64.replace(/^url\(["']?|["']?\)$/g, "");
  const estadoAportes = obtenerInformacionAportes(
    savings,
    selectedRow.fechaCreacion
  );

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      const printWindow: any = window.open("", "", "height=750,width=1000");
      const modalContent =
        document.getElementById("savings-receipt-content")?.innerHTML || "";

      printWindow.document.write("<html><head><title>Recibo de Aportes</title>");
      printWindow.document.write(
        '<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">'
      );
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
      const element = document.getElementById("savings-receipt-content");
      if (!element) {
        alert("No se pudo encontrar el contenido del recibo");
        return;
      }

      const opt = {
        margin: [6, 8, 6, 8] as [number, number, number, number],
        filename: `recibo_aporte_${selectedRow.asociado?.nombres || "socio"}_${formatDateToISO(selectedRow.fechaCreacion)}.pdf`,
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
      alert("Error al generar el PDF. Por favor, intente con el botón Imprimir.");
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
              Recibo Oficial de Aportes
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Socio: {selectedRow.asociado?.nombres || "Socio Registrado"}
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: "white",
            bgcolor: "rgba(255,255,255,0.1)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
          }}
        >
          <IconX size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: "#fafafa" }}>
        <Paper
          id="savings-receipt-content"
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
                <Typography
                  variant="subtitle2"
                  fontWeight={800}
                  color="#0f766e"
                  sx={{ fontSize: "0.8rem", lineHeight: 1.15 }}
                >
                  COOPERATIVA MULTIACTIVA DE PRODUCCIÓN Y PRESTACIÓN DE SERVICIOS
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={800}
                  color="#0f766e"
                  sx={{ letterSpacing: 0.3, fontSize: "0.85rem" }}
                >
                  INTEGRACIÓN SIGLO XXI
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                  NIT. 08301055337
                </Typography>
              </Box>
            </Box>

            <Box textAlign="right">
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
                display="block"
                sx={{ fontSize: "0.7rem" }}
              >
                RECIBO NO.
              </Typography>
              <Typography variant="subtitle1" fontWeight={900} color="#0f766e">
                #APO-{selectedRow.id || selectedRow.asociado?.id || "1"}
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
            Comprobante Oficial de Aportes
          </Typography>

          {/* DATOS DEL ASOCIADO Y APORTE */}
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
                    <TableCell
                      sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569", width: "45%" }}
                    >
                      Código Socio:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                      #{selectedRow.asociado?.id}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                      No. Identificación:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {selectedRow.asociado?.numeroDeIdentificacion}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                      Afiliado / Socio:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {selectedRow.asociado?.nombres}
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
                    <TableCell
                      sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569", width: "45%" }}
                    >
                      Tipo de Aporte:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {selectedRow.tipoAporte || "Aporte Ordinario"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                      Periodo:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {fechaAporte}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
                      Fecha de Pago:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {formatDateToISO(selectedRow.fechaCreacion || selectedRow.fechaAporte)}
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
            Estado y Resumen Acumulado de Aportes
          </Typography>

          {/* ESTADO Y RESUMEN DE APORTES */}
          <Table
            size="small"
            sx={{
              border: "1px solid #cbd5e1",
              mb: 1.5,
              "& td, & th": { py: 0.5, px: 1, fontSize: "0.78rem", textAlign: "center" },
            }}
          >
            <TableHead>
              <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                <TableCell sx={{ fontWeight: 700, color: "#0f766e" }}>A dic. 2021</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0f766e" }}>Periodo Actual</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0f766e" }}>Total Año {anyoAporte}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0f766e" }}>Total Histórico</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>${formatCurrency(redondearHaciaArriba(estadoAportes.montoDiciembre2021))}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>${formatCurrency(redondearHaciaArriba(selectedRow.monto))}</TableCell>
                <TableCell>${formatCurrency(redondearHaciaArriba(estadoAportes.sumatoriaAportesAnoCreacion))}</TableCell>
                <TableCell>${formatCurrency(redondearHaciaArriba(estadoAportes.sumatoriaAportesHastaFechaCreacion))}</TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: "#f0fdf4", borderTop: "2px solid #16a34a" }}>
                <TableCell colSpan={2} sx={{ textAlign: "left !important", fontWeight: 900, fontSize: "0.85rem", color: "#15803d" }}>
                  TOTAL RECIBIDO EN APORTE
                </TableCell>
                <TableCell colSpan={2} sx={{ textAlign: "right !important", fontWeight: 900, fontSize: "0.95rem", color: "#15803d" }}>
                  ${formatCurrency(redondearHaciaArriba(selectedRow.monto))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* VALOR EN LETRAS */}
          <Box
            sx={{
              p: 1.25,
              bgcolor: "#f8fafc",
              borderRadius: 1.5,
              border: "1px dashed #cbd5e1",
            }}
          >
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
              fontWeight={800}
              sx={{ letterSpacing: 0.5, mb: 0.25, fontSize: "0.68rem" }}
            >
              VALOR RECIBIDO EN LETRAS:
            </Typography>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{
                fontStyle: "italic",
                color: "#0f172a",
                textTransform: "uppercase",
                fontSize: "0.75rem",
              }}
            >
              {numeroALetras(selectedRow.monto, true)}
            </Typography>
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          bgcolor: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          justifyContent: "space-between",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          disabled={isGeneratingPDF}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Cerrar
        </Button>
        <Box display="flex" gap={1.5}>
          <Button
            onClick={handlePrint}
            variant="outlined"
            color="primary"
            startIcon={<IconPrinter size={18} />}
            disabled={isGeneratingPDF}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}
          >
            Imprimir Recibo
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="contained"
            color="primary"
            startIcon={
              isGeneratingPDF ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <IconFileTypePdf size={18} />
              )
            }
            disabled={isGeneratingPDF}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 700,
              bgcolor: "#0f766e",
              "&:hover": { bgcolor: "#0d6e67" },
            }}
          >
            {isGeneratingPDF ? "Generando..." : "Descargar PDF"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptModal;
