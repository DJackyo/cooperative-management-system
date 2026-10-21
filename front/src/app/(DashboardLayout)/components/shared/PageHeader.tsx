import React from "react";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import { usePathname } from "next/navigation";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: string;
  dataTour?: string;
  action?: React.ReactNode;
}

const PATH_LABELS: Record<string, string> = {
  modules: "Módulos",
  savings: "Ahorros",
  credit: "Créditos",
  users: "Asociados",
  "recibos-mensuales": "Recibos Mensuales",
  certificados: "Certificados",
  withdrawals: "Retiros y Liquidaciones",
  "assembly-attendance": "Asistencia a Asamblea",
  parametros: "Parámetros",
  admin: "Administración",
  backups: "Copias de Seguridad",
  user: "Detalle",
};

// Encabezado de página reutilizable con degradado y breadcrumb
const PageHeader = ({
  title,
  subtitle,
  icon,
  gradient,
  dataTour,
  action,
}: PageHeaderProps) => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Determinar la clave de data-tour automáticamente según la ruta
  const autoTourKey = segments.length > 0 ? `${segments.slice(-2).join("-")}-header` : "page-header";
  const tourAttribute = dataTour || autoTourKey;

  const nonRoutablePaths = new Set(["/modules", "/modules/admin"]);

  return (
    <Box
      data-tour={tourAttribute}
      sx={{
        background: gradient || "primary.main",
        borderRadius: 3,
        p: { xs: 2.5, md: 3 },
        mb: 3,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        boxShadow: "0 8px 24px rgba(36, 71, 168, 0.15)",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            mb: 0.5,
            "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.7)" },
          }}
        >
          <Link
            href="/"
            underline="hover"
            sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 500, fontSize: "0.825rem" }}
          >
            Inicio
          </Link>
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            const targetPath = `/${segments.slice(0, index + 1).join("/")}`;
            const label = PATH_LABELS[segment] || segment.replace(/-/g, " ");

            if (isLast) {
              return (
                <Typography
                  key={segment}
                  sx={{ color: "#fff", fontWeight: 700, fontSize: "0.825rem", textTransform: "capitalize" }}
                >
                  {label}
                </Typography>
              );
            }

            if (nonRoutablePaths.has(targetPath)) {
              return (
                <Typography
                  key={segment}
                  sx={{ color: "rgba(255,255,255,0.75)", fontWeight: 500, fontSize: "0.825rem" }}
                >
                  {label}
                </Typography>
              );
            }

            return (
              <Link
                key={segment}
                underline="hover"
                href={targetPath}
                sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 500, fontSize: "0.825rem" }}
              >
                {label}
              </Link>
            );
          })}
        </Breadcrumbs>
        <Box display="flex" alignItems="center" gap={1.5} mt={0.5}>
          {icon && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: 2,
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.25 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.92, mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
  );
};

export default PageHeader;