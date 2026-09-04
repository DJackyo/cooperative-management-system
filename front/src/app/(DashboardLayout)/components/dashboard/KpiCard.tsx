import React from "react";
import { Box, Typography, Avatar, LinearProgress, SxProps, Theme } from "@mui/material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { IconArrowUpRight, IconArrowDownRight, IconMinus, IconTrendingUp } from "@tabler/icons-react";

interface KpiCardProps {
  title: string;
  value: string;
  sublabel?: string;
  icon: React.ReactNode;
  /** Degradado CSS para el avatar y la barra de progreso. */
  gradient?: string;
  /** Valor 0-100 opcional para mostrar una barra de progreso. */
  progress?: number;
  /** Cambio porcentual opcional (ej: +12). */
  trend?: number;
  /** Dirección / color de la tendencia. */
  trendDirection?: "up" | "down" | "warning" | "neutral";
  /** Texto que acompaña la tendencia (ej: "vs mes anterior"). */
  trendLabel?: string;
  fullHeight?: boolean;
  sx?: SxProps<Theme>;
}

const KpiCard = ({
  title,
  value,
  sublabel,
  icon,
  gradient = "linear-gradient(135deg, #5D87FF 0%, #49BEFF 100%)",
  progress,
  trend,
  trendDirection = "neutral",
  trendLabel,
  fullHeight = false,
  sx,
}: KpiCardProps) => {
  const trendColor =
    trendDirection === "up"
      ? "#13DEB9"
      : trendDirection === "warning"
      ? "#FFAE1F"
      : trendDirection === "down"
      ? "#FA896B"
      : "#7C8FAC";

  const TrendIcon =
    trendDirection === "up"
      ? IconArrowUpRight
      : trendDirection === "down"
      ? IconArrowDownRight
      : trendDirection === "warning"
      ? IconTrendingUp
      : IconMinus;

  return (
    <DashboardCard fullHeight={fullHeight} sx={sx}>
      <Box
        sx={{
          position: "relative",
          minHeight: 178,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -24,
            left: -24,
            right: -24,
            height: 4,
            background: gradient,
            borderRadius: "0 0 6px 6px",
          },
        }}
      >
        <Box
          sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
          }}
        >
        <Box>
          <Typography
            variant="subtitle2"
            color="textSecondary"
            sx={{ fontWeight: 500 }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mt: 0.5, color: "textPrimary" }}
          >
            {value}
          </Typography>
          {sublabel && (
            <Typography variant="caption" color="textSecondary">
              {sublabel}
            </Typography>
          )}
        </Box>
        <Avatar
            sx={{
            flexShrink: 0,
            background: gradient,
            width: 48,
            height: 48,
            boxShadow: "0 7px 16px rgba(0,0,0,0.14)",
            border: "4px solid #fff",
          }}
        >
          {icon}
        </Avatar>
        </Box>

      {typeof progress === "number" && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(Math.max(progress, 0), 100)}
            sx={{
              height: 7,
              borderRadius: 6,
              backgroundColor: "rgba(0,0,0,0.06)",
              "& .MuiLinearProgress-bar": {
                backgroundImage: gradient,
                borderRadius: 6,
              },
            }}
          />
        </Box>
      )}

      {typeof trend === "number" && (
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.25,
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              bgcolor: `${trendColor}18`,
              color: trendColor,
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          >
            <TrendIcon size={14} />
            {trend > 0 ? "+" : ""}
            {trend}%
          </Box>
          {trendLabel && (
            <Typography variant="caption" color="textSecondary">
              {trendLabel}
            </Typography>
          )}
        </Box>
      )}
      </Box>
    </DashboardCard>
  );
};

export default KpiCard;