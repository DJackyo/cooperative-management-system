// src/app/credit-requests/page.tsx
"use client";
import React from "react";
import CreditRequests from "./CreditRequests"; // Ajusta la ruta según tu estructura de carpetas

const CreditRequestsPage = () => {
  return (
    <div>
      <h1>Solicitudes de Crédito</h1>
      <CreditRequests />
    </div>
  );
};

export default CreditRequestsPage;
