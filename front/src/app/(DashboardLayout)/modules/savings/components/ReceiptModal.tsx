import React, { useEffect, useState } from "react";
import { Modal, Box, Button, Typography, Table, TableBody, TableCell, TableHead, TableRow, Grid, CircularProgress, Divider, Paper } from "@mui/material";
import { formatCurrency, formatDateToISO, numeroALetras } from "@/app/(DashboardLayout)/utilities/utils";
import { logoBase64 } from "@/app/(DashboardLayout)/utilities/logoBase64";
import { obtenerInformacionAportes } from "@/app/(DashboardLayout)/utilities/AportesUtils";
import { IconPrinter, IconFileTypePdf } from "@tabler/icons-react";

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ open, onClose, data }) => {
  const [fechaAporte, setFechaAporte] = useState<string>("fechaAporte");
  const [anyoAporte, setAnyoAporte] = useState<number>(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const selectedRow = data?.selectedRow;
  const savings = data?.savings;

  const getMonthYear = (fechaAporte: string) => {
    const fecha = new Date(fechaAporte);
    const month = fecha.toLocaleString("default", { month: "long" });
    const formatted = month.charAt(0).toUpperCase() + month.slice(1) + " de " + fecha.getFullYear();
    setFechaAporte(formatted.toUpperCase());
  };

  const getYear = (fechaAporte: string) => {
    const fecha = new Date(fechaAporte);
    setAnyoAporte(fecha.getFullYear());
  };

  useEffect(() => {
    if (selectedRow?.fechaAporte) {
      getMonthYear(selectedRow.fechaAporte);
      getYear(selectedRow.fechaAporte);
    }
  }, [selectedRow]);

  if (!data || !selectedRow || !savings) return null; // ✅ Esto va después de los hooks

  const estadoAportes = obtenerInformacionAportes(savings, selectedRow.fechaCreacion);
  console.log(estadoAportes);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      const printWindow: any = window.open("", "", "height=600,width=1000");
      const modalContent = document.getElementById("modal-content")?.innerHTML || "";

      printWindow.document.write("<html><head><title></title>");

      printWindow.document.write('<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap">');
      printWindow.document.write('<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@mui/material@5.0.0/dist/material-ui.min.css">');
      // También puedes agregar otros estilos locales o personalizados aquí si los necesitas
      printWindow.document.write(`
        <style> 
      @page {
        margin: 20mm; 
      }
        body { font-size: 11px; font-family: Roboto, sans-serif; padding: 0.7rem; }
        .MuiTypography-h6.MuiTypography-alignCenter {
            margin: 0;
            font-weight: 600;
            font-size: 0.9rem;
            line-height: 1.1rem;              
            text-align: center;
            margin-bottom: 0.35em;
            margin-bottom: 1rem;
        }         
        .MuiTable-root {
            display: table;
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0;
            margin-bottom: 1rem;
        }
        .MuiTableCell-root.MuiTableCell-body.MuiTableCell-sizeSmall,
        .MuiTable-root:last-child td, .MuiTable-root:last-child th {
            border: 1px solid;
            border-color: #CCC;
            padding: 6px 6px;
            font-size: 0.7rem;
            letter-spacing: 0rem;
            font-weight: 500;
            line-height: 1.2rem;
            display: table-cell;
            vertical-align: inherit;
            color: #2A3547;
        }
        .MuiTableRow-root.MuiTableRow-head {
            color: inherit;
            display: table-row;
            vertical-align: middle;
            outline: 0;
        }
        .MuiGrid-grid-md-6 {
            max-width: 50%;
            width: 49%;
            display: inline-block;            
        }
        .MuiGrid-grid-md-6:nth-last-of-type(1) {
            float:right ;
        }
        .MuiGrid-grid-md-6:nth-last-of-type(2) {
            float: left;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            margin-bottom: 1rem;
        }
        .header .img {
            width: 100px; 
            height: 100px;
            margin-right: 2rem;
            background-image: ${logoBase64};
            background-size: cover;
        }
        .header .text {
            font-size: 0.9rem;
            font-weight: bold;
            text-align: center;
            padding: 0 2rem;
        }
        </style>
      `);

      printWindow.document.write("</head><body>");
      // Escribe el encabezado antes del contenido
      printWindow.document.write(`
        <div class="header">
          <div class="img" ></div>
          <div class="text">
            COOPERATIVA MULTIACTIVA DE PRODUCCIÓN Y PRESTACIÓN DE SERVICIOS <br />
            INTEGRACIÓN SIGLO XXI
            <br />
            Nit. 08301055337
          </div>
        </div>
      `);
      printWindow.document.write(modalContent);
      printWindow.document.write("</body></html>");

      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Cargar html2pdf dinámicamente
      const html2pdf = (await import("html2pdf.js")).default;

      const element = document.getElementById("modal-content");
      if (!element) {
        alert("No se pudo encontrar el contenido del recibo");
        return;
      }

      const opt = {
        margin: 10,
        filename: `recibo_aporte_${selectedRow.asociado?.nombres}_${formatDateToISO(selectedRow.fechaCreacion)}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm" as const, format: "letter" as const, orientation: "portrait" as const },
      };

      // Crear una copia del elemento para agregar el encabezado y estilos
      const container = document.createElement("div");
      container.innerHTML = `
        <style>
          body { font-family: Roboto, sans-serif; font-size: 13px; }
          .MuiTypography-h6 { font-size: 12px; font-weight: 600; text-align: center; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 11px; }
          td, th { border: 1px solid #CCC; padding: 4px; vertical-align: middle; }
          th { font-weight: 600; background-color: #f5f5f5; }
          strong { font-weight: 600; }
        </style>
        <div style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 11px;">
          <div style="width: 80px; height: 80px; margin-right: 25px; background-image: ${logoBase64}; background-size: cover;"></div>
          <div style="font-size: 13px; font-weight: bold; text-align: center; padding: 0 11px;">
            COOPERATIVA MULTIACTIVA DE PRODUCCIÓN Y PRESTACIÓN DE SERVICIOS<br />
            INTEGRACIÓN SIGLO XXI<br />
            Nit. 08301055337
          </div>
        </div>
        ${element.innerHTML}
      `;

      // Generar el PDF y abrirlo en una nueva pestaña
      const pdf = await html2pdf().set(opt).from(container).outputPdf("blob");
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
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: 1000,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <Paper elevation={8} sx={{ padding: 4 }}>
          <div id="modal-content">
            {/* TÍTULO */}
            <Typography
              variant="h6"
              align="center"
              sx={{
                mb: 2,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              RECIBO MENSUAL DE APORTES
            </Typography>

            {/* DATOS DEL ASOCIADO */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* DATOS DEL ASOCIADO */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Table
                  size="small"
                  sx={{
                    "& td": {
                      border: "1px solid #E0E0E0",
                      fontSize: "11px",
                      py: 0.8,
                    },
                    "& th": {
                      border: "1px solid #E0E0E0",
                    },
                    "& td:first-of-type": {
                      backgroundColor: "#F7F7F7",
                      fontWeight: 600,
                      width: "45%",
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>
                        DATOS DEL ASOCIADO
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>{selectedRow.asociado?.id}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>No. Identificación</TableCell>
                      <TableCell>{selectedRow.asociado?.numeroDeIdentificacion}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>{selectedRow.asociado?.nombres}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>

              {/* DATOS DEL APORTE */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Table
                  size="small"
                  sx={{
                    "& td": {
                      border: "1px solid #E0E0E0",
                      fontSize: "11px",
                      py: 0.8,
                    },
                    "& th": {
                      border: "1px solid #E0E0E0",
                    },
                    "& td:first-of-type": {
                      backgroundColor: "#F7F7F7",
                      fontWeight: 600,
                      width: "45%",
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>
                        DATOS DEL APORTE
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Tipo de aporte</TableCell>
                      <TableCell>{selectedRow.tipoAporte}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Periodo</TableCell>
                      <TableCell>{fechaAporte}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Fecha de pago</TableCell>
                      <TableCell>{formatDateToISO(selectedRow.fechaCreacion)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Monto</TableCell>
                      <TableCell>${formatCurrency(selectedRow.monto)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* ESTADO DE APORTES */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Table
                  size="small"
                  sx={{
                    "& th, & td": {
                      border: "1px solid #E0E0E0",
                      fontSize: "11px",
                      py: 0.8,
                      textAlign: "center",
                    },
                    "& th": {
                      backgroundColor: "#F5F5F5",
                      fontWeight: 600,
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={4}>ESTADO DE APORTES</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>A dic. 2021</TableCell>
                      <TableCell>{fechaAporte}</TableCell>
                      <TableCell>Total {anyoAporte}</TableCell>
                      <TableCell>Total histórico</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>${formatCurrency(estadoAportes.montoDiciembre2021)}</TableCell>
                      <TableCell>${formatCurrency(selectedRow.monto)}</TableCell>
                      <TableCell>${formatCurrency(estadoAportes.sumatoriaAportesAnoCreacion)}</TableCell>
                      <TableCell>${formatCurrency(estadoAportes.sumatoriaAportesHastaFechaCreacion)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>

              {/* VALOR DEL APORTE */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    height: "100%",
                    borderColor: "#E0E0E0",
                    p: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontSize: "11px", letterSpacing: 1, mb: 1 }}>
                    VALOR DEL APORTE {fechaAporte}
                  </Typography>

                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    ${formatCurrency(selectedRow.monto)}
                  </Typography>

                  <Typography variant="body2" sx={{ fontSize: "10px" }}>
                    ({numeroALetras(selectedRow.monto, true)})
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </div>
          <Divider sx={{ my: 3 }} />

          {/* Botones de acción */}
          <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
            <Box display="flex" gap={2} flexWrap="wrap">
              {/* <Button 
              color="secondary" 
              variant="contained" 
              onClick={handlePrint} 
              startIcon={<IconPrinter />}
              disabled={isGeneratingPDF}
              size="large"
            >
              Imprimir
            </Button> */}
              <Button
                color="error"
                variant="contained"
                onClick={handleDownloadPDF}
                startIcon={isGeneratingPDF ? <CircularProgress size={20} color="inherit" /> : <IconFileTypePdf />}
                disabled={isGeneratingPDF}
                size="large"
              >
                {isGeneratingPDF ? "Generando PDF..." : "Ver PDF"}
              </Button>
            </Box>
            <Button onClick={onClose} variant="outlined" color="primary" disabled={isGeneratingPDF} size="large">
              Cerrar
            </Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
};

export default ReceiptModal;
