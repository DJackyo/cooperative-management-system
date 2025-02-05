import { Aporte } from "@/interfaces/Aporte";
import { formatDateToISO } from "./utils";

export let defaultAporteValue: Aporte = {
  id: 0,
  fechaAporte: formatDateToISO(new Date()),
  monto: 0,
  observaciones: null,
  fechaModificacion: formatDateToISO(new Date()),
  fechaCreacion: formatDateToISO(new Date()),
  tipoAporte: "MENSUAL",
  estado: true,
  metodoPago: "EFECTIVO",
  comprobante: null,
  idUsuarioRegistro: null,
  asociado: {
    id: 0,
    nombres: "",
    numeroDeIdentificacion: "",
  },
  idAsociado: 0,
};

export function obtenerInformacionAportes(aportes: any[], fechaCreacion: string) {
  // Parseamos la fecha de creación a formato Date
  const fechaCreacionDate = new Date(fechaCreacion);

  // Aporte correspondiente a diciembre de 2021
  const aporteDiciembre2021 = aportes.filter(item => {
    const fechaAporte = new Date(item.fechaAporte);
    return fechaAporte.getFullYear() === 2021 && fechaAporte.getMonth() === 11;  // 11 es diciembre (0 es enero)
  });

  const montoDiciembre2021 = aporteDiciembre2021.reduce((acc, item) => acc + parseFloat(item.monto), 0);

   // Sumatoria de aportes correspondientes al año de creacion y que sean menores a la fecha de creación
   const sumatoriaAportesAnoCreacion = aportes.reduce((acumulado, aporte) => {
    const fecha = new Date(aporte.fechaAporte);
    if (fecha.getFullYear() === fechaCreacionDate.getFullYear() && fecha <= fechaCreacionDate) {
      return acumulado + parseFloat(aporte.monto);
    }
    return acumulado;
  }, 0);

  // Sumatoria de aportes hasta la fecha de pago (fechaCreacion)
  const sumatoriaAportesHastaFechaCreacion = aportes.reduce(
    (acumulado, aporte) => {
      const fecha = new Date(aporte.fechaAporte);
      if (fecha <= fechaCreacionDate) {
        return acumulado + parseFloat(aporte.monto);
      }
      return acumulado;
    },
    0
  );

  // Retornar la información
  return {
    montoDiciembre2021,
    sumatoriaAportesAnoCreacion,
    sumatoriaAportesHastaFechaCreacion,
  };
}
