import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";

interface PaymentHistoryProps {
  presCuotas: [];
}

const PaymentHistoryTable: React.FC<PaymentHistoryProps> = ({ presCuotas }) => {
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

  const columns: GridColDef[] = [
    { field: "numeroCuota", headerName: "# Cuota", width: 50 },
    {
      field: "fechaVencimiento",
      headerName: "Fecha de Vencimiento",
      width: 180,
    },
    { field: "presPagos.diaDePago", headerName: "Fecha de Pago", width: 180 },
    { field: "monto", headerName: "Monto", width: 150 },
    { field: "estado", headerName: "Estado", width: 130 },
    {
      field: "actions",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) =>
        params.row.estado == "PENDIENTE" ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenModal(params.row)}
            size="small"
          >
            Registrar Pago
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <DataGrid
        rows={presCuotas}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 24, 48]}
      />

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
