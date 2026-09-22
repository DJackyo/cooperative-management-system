import { Estado } from "@/interfaces/User";

/**
 * Estados de asociado por defecto (respaldo cuando la API no responde).
 * Los ids deben coincidir con la tabla `estados_asociado`:
 * 1 = ACTIVO, 2 = RETIRADO, 3 = RSD, 4 = EXASOCIADO, 5 = INACTIVO, 6 = EXCLUIDO
 */
export const defaultEstadosAsociado: Estado[] = [
  { id: 1, estado: "ACTIVO" },
  { id: 2, estado: "RETIRADO" },
  { id: 3, estado: "RSD" },
  { id: 4, estado: "EXASOCIADO" },
  { id: 5, estado: "INACTIVO" },
  { id: 6, estado: "EXCLUIDO" },
];

// Orden en el que se muestran los estados en los formularios
const preferredOrder = [
  "ACTIVO",
  "INACTIVO",
  "EXASOCIADO",
  "RETIRADO",
  "RSD",
  "EXCLUIDO",
];

/**
 * Ordena los estados para mostrarlos en un orden lógico en los selects.
 */
export const sortEstadosAsociado = (estados: Estado[] = []): Estado[] =>
  [...estados].sort((a, b) => {
    const indexA = preferredOrder.indexOf((a.estado || "").toUpperCase());
    const indexB = preferredOrder.indexOf((b.estado || "").toUpperCase());
    return (
      (indexA === -1 ? preferredOrder.length : indexA) -
      (indexB === -1 ? preferredOrder.length : indexB)
    );
  });

// Etiquetas amigables para mostrar en los selects (solo presentación)
const estadoLabels: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  EXASOCIADO: "Exasociado",
  RETIRADO: "Retirado",
  RSD: "RSD",
  EXCLUIDO: "Excluido",
};

/**
 * Devuelve la etiqueta a mostrar para un estado del asociado.
 */
export const formatEstadoAsociadoLabel = (estado?: string | null): string => {
  const name = (estado || "").toUpperCase();
  return estadoLabels[name] ?? (estado || "");
};

/**
 * Obtiene el id del estado del asociado a partir de un número, de un objeto
 * { id, estado } o del nombre del estado. De esta forma se evita depender de
 * mapas hardcodeados que pueden quedar desalineados con la base de datos.
 */
export const getEstadoAsociadoId = (
  estado: unknown,
  estados: Estado[] = defaultEstadosAsociado
): number | undefined => {
  if (estado === null || estado === undefined || estado === "") return undefined;

  if (typeof estado === "number") return estado;

  if (typeof estado === "object") {
    const typed = estado as Partial<Estado>;
    if (typeof typed.id === "number") return typed.id;
    return getEstadoAsociadoId(typed.estado, estados);
  }

  if (typeof estado === "string") {
    const name = estado.trim().toUpperCase();
    return estados.find((item) => (item.estado || "").toUpperCase() === name)?.id;
  }

  return undefined;
};
