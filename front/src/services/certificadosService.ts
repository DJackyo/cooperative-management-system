// src/services/certificadosService.ts
import { axiosClient } from "@/services/axiosClient";

export type TipoCertificado = "ahorro" | "credito" | "completo";

export interface ConsultaCertificado {
  idAsociado: number;
  tipo?: TipoCertificado;
  desde?: string;
  hasta?: string;
}

const baseURL = "/certificados";

export const getEstadoCuentaDatos = async ({
  idAsociado,
  tipo = "completo",
  desde,
  hasta,
}: ConsultaCertificado) => {
  const response = await axiosClient.get(
    `${baseURL}/estado-cuenta/${idAsociado}/datos`,
    {
      params: { tipo, desde: desde || undefined, hasta: hasta || undefined },
    },
  );
  return response.data?.data;
};

/** Devuelve el PDF del certificado como Blob */
export const getCertificadoPDF = async ({
  idAsociado,
  tipo = "completo",
  desde,
  hasta,
}: ConsultaCertificado): Promise<Blob> => {
  const response = await axiosClient.get(
    `${baseURL}/estado-cuenta/${idAsociado}`,
    {
      params: { tipo, desde: desde || undefined, hasta: hasta || undefined },
      responseType: "blob",
    },
  );
  return response.data as Blob;
};

const construirNombreArchivo = (consulta: ConsultaCertificado): string => {
  const tipo = consulta.tipo || "completo";
  const fecha = new Date().toISOString().slice(0, 10);
  return `certificado-estado-cuenta-${tipo}-${consulta.idAsociado}-${fecha}.pdf`;
};

/** Descarga el certificado como archivo PDF */
export const descargarCertificadoPDF = async (
  consulta: ConsultaCertificado,
): Promise<void> => {
  const blob = await getCertificadoPDF(consulta);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = construirNombreArchivo(consulta);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/** Abre el certificado PDF en una pestaña nueva */
export const abrirCertificadoPDF = async (
  consulta: ConsultaCertificado,
): Promise<void> => {
  const blob = await getCertificadoPDF(consulta);
  const url = window.URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => window.URL.revokeObjectURL(url), 30000);
};