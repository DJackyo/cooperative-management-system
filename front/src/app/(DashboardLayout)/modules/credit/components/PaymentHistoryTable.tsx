import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import {
  formatCurrency,
  formatNameDate,
  formatNumber,
  getEstadoChip,
  redondearHaciaArriba,
} from "@/app/(DashboardLayout)/utilities/utils";
import { Cuota } from "@/interfaces/Prestamo";

interface PaymentHistoryProps {
  presCuotas: Cuota[];
  plazoMeses: number;
}

const PaymentHistoryTable: React.FC<PaymentHistoryProps> = ({
  presCuotas,
  plazoMeses,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow]: any = useState(null);

  const handleOpenModal = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const sortedCuotas = [...presCuotas].sort(
    (a: any, b: any) => a.numeroCuota - b.numeroCuota
  );
  console.log("sortedCuotas->", sortedCuotas);
  const columns: GridColDef[] = [
    {
      field: "numeroCuota",
      headerName: "# Cuota",
      width: 80,
      headerClassName: "multiline-header",
    },
    {
      field: "fechaVencimiento",
      headerName: "Fecha de Vencimiento",
      width: 110,
      valueFormatter: (params: any) => {
        if (!params) return "****";
        return formatNameDate(params);
      },
      headerClassName: "multiline-header",
    },
    {
      field: "abonoCapital",
      headerName: "Abono a Capital",
      width: 110,
      valueFormatter: (params: any) => {
        if (!params) return "$0.00";
        return "$" + formatCurrency(formatNumber(redondearHaciaArriba(params)));
      },
      headerClassName: "multiline-header",
      cellClassName: "align-right",
    },
    {
      field: "intereses",
      headerName: "Intereses",
      width: 100,
      valueFormatter: (params: any) => {
        if (!params) return "$0.00";
        return "$" + formatCurrency(formatNumber(redondearHaciaArriba(params)));
      },
      cellClassName: "align-right",
    },
    {
      field: "proteccionCartera",
      headerName: "Protección de Cartera",
      width: 100,
      valueFormatter: (params: any) => {
        if (!params) return "$0.00";
        return "$" + formatCurrency(formatNumber(redondearHaciaArriba(params)));
      },
      headerClassName: "multiline-header",
      cellClassName: "align-right",
    },
    {
      field: "monto",
      headerName: "Monto",
      width: 110,
      valueFormatter: (params: any) => {
        if (!params) return "$0.00";
        return "$" + formatCurrency(formatNumber(redondearHaciaArriba(params)));
      },
      cellClassName: "align-right",
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 110,
      renderCell: (params) => getEstadoChip(params.value),
    },
    {
      field: "presPagos.diaDePago",
      headerName: "Fecha de Pago",
      width: 130,
      valueFormatter: (params: any) => {
        if (!params) return "No registrado";
        return formatNameDate(params);
      },
    },
    {
      field: "pagado",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => {
        const currentRow = params.row;
        const currentIndex = sortedCuotas.findIndex(
          (c) => c.id === currentRow.id
        );
        const previousCuota = sortedCuotas[currentIndex - 1];

        // Habilitar solo si la cuota anterior está PAGADA o es la primera cuota
        const isEnabled = !previousCuota || previousCuota.estado === "PAGADO";

        return isEnabled && currentRow.estado === "PENDIENTE" ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenModal(currentRow)}
            size="small"
          >
            Registrar Pago
          </Button>
        ) : (
          <>***</>
        );
      },
    },
  ];

  const styles = {
    "& .MuiDataGrid-columnHeaders": {
      borderBottom: "2px solid #ccc",
      textAlign: "center",
    },
    "& .MuiDataGrid-columnHeader": {
      borderRight: "1px solid #ddd",
      backgroundColor: "#f5f5f5",
      textAlign: "center",
    },
    "& .MuiDataGrid-columnHeader:last-child": {
      borderRight: "none",
    },
    "& .MuiDataGrid-cell": {
      borderRight: "1px solid #ddd",
    },
    "& .MuiDataGrid-row:last-child .MuiDataGrid-cell": {
      borderBottom: "1px solid #ddd",
    },
    "& .multiline-header .MuiDataGrid-columnHeaderTitle": {
      whiteSpace: "normal",
      lineHeight: "1.2",
    },
    "& .align-right": {
      textAlign: "right",
      justifyContent: "flex-end",
    },
  };

  return (
    <>
      <Box
        sx={{
          maxWidth: 1020,
          overflowX: "auto",
        }}
      >
        <DataGrid
          rows={sortedCuotas}
          columns={columns}
          sx={styles}
          showCellVerticalBorder={true}
          showColumnVerticalBorder={true}
          initialState={{
            pagination: {
              paginationModel: { pageSize: plazoMeses },
            },
          }}
          pageSizeOptions={[plazoMeses]}
        />
      </Box>
      {/* Modal para Registrar Pago */}
      <Dialog open={open} onClose={handleCloseModal}>
        <DialogTitle>Registrar Pago</DialogTitle>
        <DialogContent>
          <p>
            ¿Deseas registrar el pago para el registro con ID: {selectedRow?.id}
            ?
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              console.log(
                "Pago registrado para el registro con ID:",
                selectedRow?.id
              );
              handleCloseModal();
            }}
            color="primary"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PaymentHistoryTable;
