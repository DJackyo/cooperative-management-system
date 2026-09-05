// app/modules/certificados/page.tsx
"use client";
import React from "react";
import { IconCertificate } from "@tabler/icons-react";
import PageHeader from "@/app/(DashboardLayout)/components/shared/PageHeader";
import CertificadosModule from "./CertificadosModule";

const CertificadosPage = () => {
  return (
    <div>
      <PageHeader
        title="Certificados de Estado de Cuenta"
        subtitle="Genera certificados de ahorro y crédito de los asociados"
        icon={<IconCertificate size={22} />}
        gradient="linear-gradient(135deg, #0f766e 0%, #13DEB9 120%)"
      />
      <CertificadosModule />
    </div>
  );
};

export default CertificadosPage;