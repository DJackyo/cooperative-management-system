// src/(DashboardLayout)/modules/credit/components/CreditForm.tsx

import { Box, TextField, Button, Typography } from "@mui/material";

interface CreditFormProps {
  type: "request" | "modify";
  onSubmit: (formData: { amount?: string; term?: string; reason?: string }) => void;
}

const CreditForm = ({ type, onSubmit }: CreditFormProps) => {
  const isRequest = type === "request";
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = {
      amount: (event.target as any).amount?.value,
      term: (event.target as any).term?.value,
      reason: (event.target as any).reason?.value,
    };
    onSubmit(formData);
  };

  return (
    <Box component="form" mt={2} onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        {isRequest ? "Solicitud de Crédito" : "Modificación de Crédito"}
      </Typography>

      {/* Campos comunes */}
      <TextField label="Monto" name="amount" fullWidth margin="normal" required />

      {/* Campo condicional */}
      {isRequest && (
        <TextField label="Motivo" name="reason" fullWidth margin="normal" required />
      )}
      
      <TextField label="Plazo (meses)" name="term" fullWidth margin="normal" required />

      <Button variant="contained" color={isRequest ? "primary" : "secondary"} type="submit">
        {isRequest ? "Enviar Solicitud" : "Modificar Crédito"}
      </Button>
    </Box>
  );
};

export default CreditForm;
