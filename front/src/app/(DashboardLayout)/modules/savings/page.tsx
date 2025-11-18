// app/modules/savings/page.tsx
"use client";

import React from "react";
import { useSearchParams } from "next/navigation"; // Importamos el hook para obtener parámetros de la URL
import SavingsModule from "./SavingsModule";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";

const SavingsPage = () => {
  // Obtener los parámetros de la URL
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Obtener el parámetro "id" de la URL

  // Lógica condicional antes del retorno
  if (!id || parseInt(id) < 0) {
    return (
      <Card
        variant="outlined"
        sx={{ boxShadow: 3, maxWidth: 400, margin: "auto", mt: 4 }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center">
            <ErrorOutline sx={{ mr: 1, fontSize: 40, color: "error.main" }} />{" "}
            {/* Ícono de error */}
            <Typography variant="h6" color="error" align="center">
              No se encontró un ID de usuario relacionado para mostrar la
              información
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <SavingsModule id={parseInt(id)} />
    </div>
  );
};

export default SavingsPage;
