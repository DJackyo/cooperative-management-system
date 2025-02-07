import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
} from "@mui/material";
import {
  formatCurrency,
  formatDateToISO,
  numeroALetras,
} from "@/app/(DashboardLayout)/utilities/utils";
import { logoBase64 } from "@/app/(DashboardLayout)/utilities/logoBase64";
import { obtenerInformacionAportes } from "@/app/(DashboardLayout)/utilities/AportesUtils";
import { IconPrinter } from "@tabler/icons-react";

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ open, onClose, data }) => {
  const [fechaAporte, setFechaAporte] = useState<string>("fechaAporte");
  const [anyoAporte, setAnyoAporte] = useState<number>(0);

  // Asegúrate de no llamar hooks condicionalmente
  if (!data) return null; // Este return debe ir después de que los hooks se hayan llamado

  const { selectedRow, savings } = data;

  const getMonthYear = (fechaAporte: string) => {
    let fecha = new Date(fechaAporte);
    let formateada =
      fecha
        .toLocaleString("default", { month: "long" })
        .charAt(0)
        .toUpperCase() +
      fecha.toLocaleString("default", { month: "long" }).slice(1);
    formateada += " de " + fecha.getFullYear();
    setFechaAporte(formateada.toLocaleUpperCase());
  };

  const getYear = (fechaAporte: string) => {
    let fecha = new Date(fechaAporte);
    setAnyoAporte(fecha.getFullYear());
  };

  // El useEffect debe ser siempre ejecutado, aunque `data` esté vacío
  useEffect(() => {
    if (selectedRow && selectedRow.fechaAporte) {
      getMonthYear(selectedRow.fechaAporte);
      getYear(selectedRow.fechaAporte);
    }
  }, [selectedRow]);

  let estadoAportes = obtenerInformacionAportes(
    savings,
    selectedRow.fechaCreacion
  );
  console.log(estadoAportes);

  // Función para imprimir el contenido del modal
  const handlePrint = () => {
    const printWindow: any = window.open("", "", "height=600,width=1000");
    const modalContent =
      document.getElementById("modal-content")?.innerHTML || "";

    printWindow.document.write("<html><head><title></title>");

    printWindow.document.write(
      '<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap">'
    );
    printWindow.document.write(
      '<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@mui/material@5.0.0/dist/material-ui.min.css">'
    );
    // También puedes agregar otros estilos locales o personalizados aquí si los necesitas
    printWindow.document.write(`
        <style> 
      @page {
        margin: 20mm; 
      }
        body { font-family: Roboto, sans-serif; padding: 10px; }
        .MuiTypography-h6.MuiTypography-alignCenter {
            margin: 0;
            font-weight: 600;
            font-size: 0.9rem;
            line-height: 1.2rem;              
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
            line-height: 1.5rem;
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
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: 3,
          boxShadow: 24,
          maxWidth: 1000,
          width: "100%",
        }}
      >
        <div id="modal-content">
          <Typography
            variant="h6"
            gutterBottom
            align="center"
            sx={{ marginBottom: 2 }}
          >
            RECIBO MENSUAL DE APORTES
          </Typography>
          <Grid container spacing={3}>
            {/* Primera columna */}
            <Grid item xs={12} md={12}>
              <Table
                size="small"
                sx={{
                  "&:last-child td, &:last-child th": {
                    border: 1,
                    borderColor: "#CCC",
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Código</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Nº DE IDENTIFICACIÓN</strong>
                    </TableCell>
                    <TableCell>
                      <strong>NOMBRES Y APELLIDOS</strong>
                    </TableCell>
                    <TableCell>
                      <strong>TIPO DE APORTE</strong>
                    </TableCell>
                    <TableCell>
                      <strong>MONTO</strong>
                    </TableCell>
                    <TableCell>
                      <strong>FECHA DE PAGO</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{selectedRow.asociado?.id || "#N/A"}</TableCell>
                    <TableCell>
                      {selectedRow.asociado?.numeroDeIdentificacion || "#N/A"}
                    </TableCell>
                    <TableCell>
                      {selectedRow.asociado?.nombres || "#N/A"}
                    </TableCell>
                    <TableCell>{selectedRow.tipoAporte || "#N/A"}</TableCell>
                    <TableCell>${formatCurrency(selectedRow.monto)}</TableCell>
                    <TableCell>
                      {formatDateToISO(selectedRow.fechaCreacion)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}>
                      <strong>APORTE CORRESPONDIENTE A: </strong>
                    </TableCell>
                    <TableCell colSpan={4}>{fechaAporte}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
            <Grid item xs={12} md={6}>
              <Table
                size="small"
                sx={{
                  "&:last-child td, &:last-child th": {
                    border: 1,
                    borderColor: "#CCC",
                    paddingLeft: 0.5,
                    paddingRight: 0.5,
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell align="center" colSpan={4}>
                      <strong>ESTADO DE APORTES</strong>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center">
                      <strong>
                        A DICIEMBRE <br></br>DE 2021
                      </strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>
                        APORTE <br></br>
                        {fechaAporte}
                      </strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>TOTAL {anyoAporte}</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>TOTAL APORTES</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell align="center">
                      <Typography variant="body2" component="strong">
                        ${formatCurrency(estadoAportes.montoDiciembre2021)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" component="strong">
                        ${formatCurrency(selectedRow.monto)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" component="strong">
                        $
                        {formatCurrency(
                          estadoAportes.sumatoriaAportesAnoCreacion
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" component="strong">
                        $
                        {formatCurrency(
                          estadoAportes.sumatoriaAportesHastaFechaCreacion
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
            <Grid item xs={12} md={6}>
              <Table
                size="small"
                sx={{
                  "&:last-child td, &:last-child th": {
                    border: 1,
                    borderColor: "#CCC",
                    paddingLeft: 0.5,
                    paddingRight: 0.5,
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell align="center" colSpan={4}>
                      <strong>INFORMACIÓN DEL APORTE</strong>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center">
                      <strong>
                        TOTAL RECIBIDO <br></br>
                        {fechaAporte}
                      </strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>${formatCurrency(selectedRow.monto)}</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell align="center">
                      <strong>TOTAL RECIBIDO (LETRAS):</strong>{" "}
                    </TableCell>
                    <TableCell align="center">
                      <strong>{numeroALetras(selectedRow.monto, true)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </div>
        {/* Botones de acción */}
        <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
          <Button
            color="secondary"
            variant="contained"
            onClick={handlePrint}
            sx={{ mt: 2 }}
            startIcon={<IconPrinter />}
          >
            Imprimir
          </Button>
          <Button
            onClick={onClose}
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}
          >
            Cerrar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ReceiptModal;
