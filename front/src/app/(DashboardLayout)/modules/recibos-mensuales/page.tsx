"use client";

import React from "react";
import { IconReceipt } from "@tabler/icons-react";
import PageHeader from "@/app/(DashboardLayout)/components/shared/PageHeader";
import RecibosMensualesModule from "./RecibosMensualesModule";

export default function RecibosMensualesPage() {
  return (
    <div>
      <PageHeader
        title="Recibos mensuales"
        subtitle="Genera el comprobante de aportes y crédito de un asociado"
        icon={<IconReceipt size={22} />}
        gradient="linear-gradient(135deg, #0f766e 0%, #13DEB9 120%)"
      />
      <RecibosMensualesModule />
    </div>
  );
}
