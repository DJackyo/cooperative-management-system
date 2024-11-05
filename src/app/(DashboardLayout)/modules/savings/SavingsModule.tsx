import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  TextField,
  Button,
  Modal,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AttachMoney } from "@mui/icons-material";

const SavingsModule = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Estado para el modal de subir soporte de pago
  const [openModal, setOpenModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "date", headerName: "Fecha", width: 150 },
    { field: "amount", headerName: "Monto", width: 150 },
    { field: "type", headerName: "Tipo", width: 130 },
  ];

  const mockTransactionData = [
    { id: 1, date: "2024-09-01", amount: 100, type: "Depósito" },
    { id: 2, date: "2024-10-01", amount: 50, type: "Depósito" },
    { id: 3, date: "2024-11-01", amount: 50, type: "Depósito" },
    { id: 4, date: "2024-12-01", amount: 50, type: "Depósito" },
  ];

  const filteredTransactions = mockTransactionData.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      (!startDate || transactionDate >= startDate) &&
      (!endDate || transactionDate <= endDate)
    );
  });

  // Manejo de la subida de archivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = () => {
    // Aquí se podría implementar la lógica para subir el archivo al servidor
    console.log("Subiendo archivo:", file);
    setOpenModal(false); // Cerrar el modal después de subir
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" color="primary" gutterBottom>
                Saldo Actual
              </Typography>
              <Typography variant="h6" display="flex" alignItems="center">
                <AttachMoney sx={{ mr: 1 }} /> Total ahorrado: 1500.75
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ boxShadow: 3, padding: 2 }}>
            <Typography variant="h5" color="primary" gutterBottom>
              Filtro de fechas
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <DatePicker
                  label="Fecha Inicio"
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <DatePicker
                  label="Fecha Fin"
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Box>
              <Box display="flex">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                >
                  Restablecer
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined" sx={{ boxShadow: 3 }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h5" color="primary" gutterBottom>
                  Historial de Transacciones
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setOpenModal(true)}
                  sx={{ mb: 2 }}
                >
                  Subir Soporte
                </Button>
              </Box>
              <DataGrid
                rows={filteredTransactions}
                columns={columns}
                pageSizeOptions={[5, 10]}
                autoHeight
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal para subir soporte de pago */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2">
            Subir Soporte de Pago
          </Typography>
          <TextField
            type="file"
            onChange={handleFileChange}
            inputProps={{ accept: "image/*,application/pdf" }} // Aceptar PDF o imágenes
            fullWidth
            sx={{ mt: 2 }}
          />
          <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button onClick={() => setOpenModal(false)} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} color="primary" sx={{ ml: 2 }}>
              Subir
            </Button>
          </Box>
        </Box>
      </Modal>
    </LocalizationProvider>
  );
};

export default SavingsModule;
