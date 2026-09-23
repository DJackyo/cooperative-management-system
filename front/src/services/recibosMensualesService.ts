import { axiosClient } from "@/services/axiosClient";

export interface ConsultaReciboMensual {
  idAsociado: number;
  mes: number;
  anio: number;
}

export interface ReciboMensual {
  asociado: {
    id: number;
    nombres: string;
    numeroDeIdentificacion: string;
    estado: string | null;
    calidad: string;
  };
  periodo: { mes: number; anio: number; nombreMes: string };
  ahorro: {
    movimientos: Array<{ id: number; fecha: string; monto: number; tipo: string | null; metodo: string | null }>;
    total: number;
  };
  credito: {
    pagos: Array<{
      id: number;
      creditoId: number;
      cuota: number | null;
      fecha: string | null;
      capital: number;
      intereses: number;
      mora: number;
      proteccionCartera: number;
      abonoExtra: number;
      total: number;
      saldoCapital: number;
    }>;
    creditos: Array<{ id: number; monto: number; cuotaMensual: number; estado: string | null; saldoCapital: number }>;
    totalMes: number;
    saldoCapital: number;
  };
  totalRecibido: number;
  generadoEl: string;
}

const baseURL = "/recibos-mensuales";

export const getReciboMensualDatos = async (consulta: ConsultaReciboMensual): Promise<ReciboMensual> => {
  const response = await axiosClient.get(`${baseURL}/${consulta.idAsociado}/datos`, {
    params: { mes: consulta.mes, anio: consulta.anio },
  });
  return response.data?.data;
};

export const getReciboMensualPDF = async (consulta: ConsultaReciboMensual): Promise<Blob> => {
  const response = await axiosClient.get(`${baseURL}/${consulta.idAsociado}`, {
    params: { mes: consulta.mes, anio: consulta.anio },
    responseType: "blob",
  });
  return response.data as Blob;
};

const nombreArchivo = (consulta: ConsultaReciboMensual) =>
  `recibo-mensual-${consulta.idAsociado}-${consulta.anio}-${String(consulta.mes).padStart(2, "0")}.pdf`;

export const descargarReciboMensualPDF = async (consulta: ConsultaReciboMensual) => {
  const blob = await getReciboMensualPDF(consulta);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo(consulta);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const abrirReciboMensualPDF = async (consulta: ConsultaReciboMensual) => {
  const blob = await getReciboMensualPDF(consulta);
  const url = window.URL.createObjectURL(blob);
  window.open(url, "_blank");
  window.setTimeout(() => window.URL.revokeObjectURL(url), 30000);
};
