import Chip, { ChipProps } from "@mui/material/Chip";
import Box from "@mui/material/Box";

type StatusValue = string | boolean | null | undefined;

interface StatusChipProps extends Omit<ChipProps, "color" | "label"> {
  status: StatusValue;
  label?: string;
  showDot?: boolean;
}

interface StatusPalette {
  label: string;
  bg: string;
  color: string;
  border: string;
  dot: string;
}

const statusConfig: Record<string, StatusPalette> = {
  ACTIVO: { label: "Activo", bg: "rgba(19, 222, 185, 0.14)", color: "#047857", border: "rgba(19, 222, 185, 0.4)", dot: "#10b981" },
  APROBADO: { label: "Aprobado", bg: "rgba(19, 222, 185, 0.14)", color: "#047857", border: "rgba(19, 222, 185, 0.4)", dot: "#10b981" },
  CONFIRMADO: { label: "Confirmado", bg: "rgba(19, 222, 185, 0.14)", color: "#047857", border: "rgba(19, 222, 185, 0.4)", dot: "#10b981" },
  PAGADO: { label: "Pagado", bg: "rgba(19, 222, 185, 0.14)", color: "#047857", border: "rgba(19, 222, 185, 0.4)", dot: "#10b981" },
  SOLICITADO: { label: "Solicitado", bg: "rgba(255, 174, 31, 0.14)", color: "#b45309", border: "rgba(255, 174, 31, 0.4)", dot: "#f59e0b" },
  PENDIENTE: { label: "Pendiente", bg: "rgba(255, 174, 31, 0.14)", color: "#b45309", border: "rgba(255, 174, 31, 0.4)", dot: "#f59e0b" },
  RECHAZADO: { label: "Rechazado", bg: "rgba(250, 137, 107, 0.14)", color: "#c2410c", border: "rgba(250, 137, 107, 0.4)", dot: "#f97316" },
  INACTIVO: { label: "Inactivo", bg: "rgba(250, 137, 107, 0.14)", color: "#c2410c", border: "rgba(250, 137, 107, 0.4)", dot: "#f97316" },
  EXCLUIDO: { label: "Excluido", bg: "rgba(239, 68, 68, 0.14)", color: "#b91c1c", border: "rgba(239, 68, 68, 0.4)", dot: "#ef4444" },
  RETIRADO: { label: "Retirado", bg: "rgba(100, 116, 139, 0.14)", color: "#475569", border: "rgba(100, 116, 139, 0.35)", dot: "#64748b" },
  RSD: { label: "RSD", bg: "rgba(99, 102, 241, 0.14)", color: "#4338ca", border: "rgba(99, 102, 241, 0.35)", dot: "#6366f1" },
  SUS: { label: "Suspendido", bg: "rgba(168, 85, 247, 0.14)", color: "#7e22ce", border: "rgba(168, 85, 247, 0.35)", dot: "#a855f7" },
  SUSPENDIDO: { label: "Suspendido", bg: "rgba(168, 85, 247, 0.14)", color: "#7e22ce", border: "rgba(168, 85, 247, 0.35)", dot: "#a855f7" },
  EXASOCIADO: { label: "Exasociado", bg: "rgba(245, 158, 11, 0.14)", color: "#b45309", border: "rgba(245, 158, 11, 0.35)", dot: "#f59e0b" },
  CANCELADO: { label: "Cancelado", bg: "rgba(100, 116, 139, 0.14)", color: "#475569", border: "rgba(100, 116, 139, 0.35)", dot: "#64748b" },
  FINALIZADO: { label: "Finalizado", bg: "rgba(59, 130, 246, 0.14)", color: "#1d4ed8", border: "rgba(59, 130, 246, 0.35)", dot: "#3b82f6" },
  MORA: { label: "En mora", bg: "rgba(239, 68, 68, 0.14)", color: "#b91c1c", border: "rgba(239, 68, 68, 0.4)", dot: "#ef4444" },
  AL_DIA: { label: "Al día", bg: "rgba(19, 222, 185, 0.14)", color: "#047857", border: "rgba(19, 222, 185, 0.4)", dot: "#10b981" },
};

const DEFAULT_PALETTE: StatusPalette = {
  label: "Desconocido",
  bg: "rgba(148, 163, 184, 0.14)",
  color: "#475569",
  border: "rgba(148, 163, 184, 0.35)",
  dot: "#94a3b8",
};

const StatusChip = ({ status, label, showDot = true, sx, ...props }: StatusChipProps) => {
  const statusKey = typeof status === "boolean"
    ? status ? "ACTIVO" : "INACTIVO"
    : String(status ?? "").trim().toUpperCase();
  const config = statusConfig[statusKey] ?? DEFAULT_PALETTE;
  const displayLabel = label ?? config.label;

  return (
    <Chip
      {...props}
      icon={
        showDot ? (
          <Box
            component="span"
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: config.dot,
              boxShadow: `0 0 0 2px ${config.bg}`,
              ml: "6px !important",
              mr: "-2px !important",
            }}
          />
        ) : undefined
      }
      label={displayLabel}
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontWeight: 600,
        fontSize: "0.75rem",
        height: 24,
        borderRadius: "12px",
        transition: "all 0.15s ease",
        "& .MuiChip-label": {
          px: showDot ? 1 : 1.2,
        },
        "&:hover": {
          backgroundColor: config.bg,
          filter: "brightness(0.96)",
        },
        ...sx,
      }}
    />
  );
};

export default StatusChip;