// src/(DashboardLayout)/modules/credit/components/CreditRequestForm.tsx

import { Box, TextField, Button } from '@mui/material';

const CreditRequestForm = () => {
  return (
    <Box component="form" mt={2}>
      <TextField label="Monto Solicitado" fullWidth margin="normal" />
      <TextField label="Plazo (meses)" fullWidth margin="normal" />
      <TextField label="Motivo" fullWidth margin="normal" />

      <Button variant="contained" color="primary" type="submit">
        Enviar Solicitud
      </Button>
    </Box>
  );
};

export default CreditRequestForm;
