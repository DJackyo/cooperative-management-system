import React, { useState } from "react";
import { TextField, Button } from "@mui/material";

const SavingsForm = ({ onSubmit }: { onSubmit: (data: { amount: string; date: string }) => void }) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ amount, date });
    setAmount("");
    setDate("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Monto"
        variant="outlined"
        fullWidth
        margin="normal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <TextField
        label="Fecha"
        type="date"
        variant="outlined"
        fullWidth
        margin="normal"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <Button type="submit" variant="contained" color="primary">
        Guardar
      </Button>
    </form>
  );
};

export default SavingsForm;
