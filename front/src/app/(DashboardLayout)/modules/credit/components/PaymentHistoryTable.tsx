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
} from "@mui/material";
import { useState } from "react";
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

  let sortedCuotas = [...presCuotas].sort(
    (a: any, b: any) => a.numeroCuota - b.numeroCuota
  );
  console.log("sortedCuotas->", sortedCuotas);

  sortedCuotas = sortedCuotas.map((cuota) => ({
    ...cuota,
    diasEnMora: calcularDiasEnMora(
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

  // Función para obtener el estilo de fila según el estado de pagos
  const getRowStyle = (cuota: any) => {
    if (cuota.estado === "PAGADO") {
      return {
        backgroundColor: "#e8f5e8",
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
    { field: "numeroCuota", headerName: "# Cuota", width: 40 },
    { field: "fechaVencimiento", headerName: "Vencimiento", width: 100 },
    { field: "abonoCapital", headerName: "Abono Capital", width: 100 },
    { field: "intereses", headerName: "Intereses", width: 100 },
    { field: "diasEnMora", headerName: "Días Mora", width: 70 },
    { field: "mora", headerName: "Mora", width: 100 },
    { field: "proteccionCartera", headerName: "Protección", width: 100 },
    { field: "monto", headerName: "Monto Total", width: 120 },
    { field: "estado", headerName: "Estado", width: 100 },
    { field: "fechaPago", headerName: "Fecha Pago", width: 120 },
    { field: "acciones", headerName: "Acciones", width: 120 },
  ];

  const formatRules: Record<string, (value: any, row?: any) => React.ReactNode> = {
    numeroCuota: (value) => value,
    fechaVencimiento: (value) => value ? formatNameDate(value) : "****",
    abonoCapital: (value) => value ? "$" + formatCurrency(formatNumber(redondearHaciaArriba(value))) : "$0.00",
    intereses: (value) => value ? "$" + formatCurrency(formatNumber(redondearHaciaArriba(value))) : "$0.00",
    diasEnMora: (value) => value ? formatNumber(redondearHaciaArriba(value)) : "0",
    mora: (value, row) => {
      const mora = redondearHaciaArriba(calcularMora(row?.monto || 0, row?.diasEnMora || 0));
      return "$" + formatCurrency(formatNumber(mora));
    },
    proteccionCartera: (value) => value ? "$" + formatCurrency(formatNumber(redondearHaciaArriba(value))) : "$0.00",
    monto: (value) => value ? "$" + formatCurrency(formatNumber(redondearHaciaArriba(value))) : "$0.00",
    estado: (value) => getEstadoChip(value),
    fechaPago: (value, row) => {
      const fechaPago = row?.presPagos?.diaDePago;
      return fechaPago ? formatNameDate(fechaPago) : "No registrado";
    },
    acciones: (value, row) => {
      const currentIndex = sortedCuotas.findIndex((c) => c.id === row.id);
      const previousCuota = sortedCuotas[currentIndex - 1];
      const isEnabled = !previousCuota || previousCuota.estado === "PAGADO";

      return isEnabled && row.estado === "PENDIENTE" ? (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenModal(row)}
          size="small"
        >
          Registrar Pago
        </Button>
      ) : (
        <span>***</span>
      );
    },
  };

  return (
    <>
      <Box sx={{ width: '99%', overflow: 'auto', overflowX: 'auto', overflowY: 'hidden' }}>
        <StyledTable
          columns={columns}
          rows={sortedCuotas}
          withPagination={true}
          pageSizeOptions={[5, 10, 25]}
          renderCell={(column, row) => {
            return formatRules[column.field] ? formatRules[column.field](row[column.field], row) : row[column.field];
          }}
          rowSx={(row) => {
            return getRowStyle(row);
          }}
        />
      </Box>
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
        <DialogTitle>Registrar Pago</DialogTitle>
        <DialogContent>
          <PresPagosForm 
            pago={selectedRow} 
            creditId={creditId} 
            onSuccess={handlePaymentSuccess}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PaymentHistoryTable;
