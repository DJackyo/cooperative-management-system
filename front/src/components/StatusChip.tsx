import Chip, { ChipProps } from "@mui/material/Chip";

type StatusValue = string | boolean | null | undefined;

interface StatusChipProps extends Omit<ChipProps, "color" | "label"> {
  status: StatusValue;
  label?: string;
}

const statusConfig: Record<string, { label: string; color: ChipProps["color"] }> = {
  ACTIVO: { label: "Activo", color: "success" },
  APROBADO: { label: "Aprobado", color: "success" },
  CONFIRMADO: { label: "Confirmado", color: "success" },
  PAGADO: { label: "Pagado", color: "success" },
  SOLICITADO: { label: "Solicitado", color: "warning" },
  PENDIENTE: { label: "Pendiente", color: "warning" },
  RECHAZADO: { label: "Rechazado", color: "error" },
  INACTIVO: { label: "Inactivo", color: "error" },
  EXCLUIDO: { label: "Excluido", color: "error" },
  RETIRADO: { label: "Retirado", color: "default" },
  RSD: { label: "RSD", color: "info" },
  EXASOCIADO: { label: "Exasociado", color: "warning" },
  CANCELADO: { label: "Cancelado", color: "info" },
};

const StatusChip = ({ status, label, ...props }: StatusChipProps) => {
  const statusKey = typeof status === "boolean"
    ? status ? "ACTIVO" : "INACTIVO"
    : String(status ?? "").trim().toUpperCase();
  const config = statusConfig[statusKey] ?? { label: "Desconocido", color: "info" as const };

  return (
    <Chip
      {...props}
      label={label ?? config.label}
      color={config.color}
      variant="outlined"
    />
  );
};

export default StatusChip;