import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";

const PaymentHistoryTable = () => {
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleOpenModal = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "date", headerName: "Fecha de Pago", width: 180 },
    { field: "amount", headerName: "Monto", width: 150 },
    { field: "status", headerName: "Estado", width: 130 },
    {
      field: "actions",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        params.row.status !== "Pagado" ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenModal(params.row)}
          >
            Registrar Pago
          </Button>
        ) : null
      ),
    },
  ];

  const rows = [
    { id: 1, date: "2024-11-01", amount: "$100", status: "Pagado" },
    { id: 2, date: "2024-12-01", amount: "$100", status: "Pendiente" },
    { id: 3, date: "2025-01-01", amount: "$100", status: "Pendiente" },
    { id: 4, date: "2025-02-01", amount: "$100", status: "Pendiente" },
  ];

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
      />

      {/* Modal para Registrar Pago */}
      <Dialog open={open} onClose={handleCloseModal}>
        <DialogTitle>Registrar Pago</DialogTitle>
        <DialogContent>
          <p>
            ¿Deseas registrar el pago para el registro con ID: {selectedRow?.id}?
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              console.log("Pago registrado para el registro con ID:", selectedRow?.id);
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
