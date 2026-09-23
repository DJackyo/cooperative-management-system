"use client";

import { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import { IconCalendarStats } from "@tabler/icons-react";
import { dashboardService } from "@/services/dashboardService";

/** Opción del selector que representa "Todos los años" (histórico completo). */
export const ALL_YEARS_VALUE = "ALL";

interface YearSelectorProps {
  /** Año seleccionado. `null` indica que se está viendo todo el histórico. */
  value: number | null;
  onChange: (year: number | null) => void;
  /** Años disponibles. Si no se envían, se consultan al backend. */
  years?: number[];
  /** Fondo para temas oscuros/degradados (por defecto claro). */
  variant?: "banner" | "plain";
}

/**
 * Selector de período del dashboard: permite elegir un año específico
 * o ver toda la información histórica ("Todos los años").
 */
const YearSelector = ({ value, onChange, years, variant = "banner" }: YearSelectorProps) => {
  const [availableYears, setAvailableYears] = useState<number[]>(years ?? []);
  const [loading, setLoading] = useState(!years || years.length === 0);

  useEffect(() => {
    if (years && years.length > 0) {
      setAvailableYears(years);
      setLoading(false);
      return;
    }

    let activo = true;
    dashboardService
      .getAvailableYears()
      .then((data) => {
        if (!activo) return;
        setAvailableYears(Array.isArray(data) ? data : []);
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, [years]);

  const currentYear = new Date().getFullYear();
  const options = Array.from(new Set([currentYear, ...(availableYears || [])]))
    .filter((item) => Number.isFinite(item))
    .sort((a, b) => b - a);

  const selectValue = value === null ? ALL_YEARS_VALUE : String(value);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const next = event.target.value;
    onChange(next === ALL_YEARS_VALUE ? null : Number(next));
  };

  const isBanner = variant === "banner";

  if (loading) {
    return (
      <Skeleton
        variant="rounded"
        width={210}
        height={64}
        sx={{
          borderRadius: 2,
          bgcolor: isBanner ? "rgba(255,255,255,0.25)" : undefined,
        }}
      />
    );
  }

  return (
    <Box
      data-tour="dashboard-period"
      sx={{
        minWidth: { xs: "100%", sm: 210 },
        px: 1.5,
        py: 1,
        borderRadius: 2,
        bgcolor: isBanner ? "rgba(255,255,255,0.14)" : "background.paper",
        border: "1px solid",
        borderColor: isBanner ? "rgba(255,255,255,0.3)" : "divider",
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center" mb={0.5}>
        <IconCalendarStats size={16} color={isBanner ? "#ffffff" : undefined} />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: isBanner ? "#ffffff" : "text.secondary",
          }}
        >
          Período
        </Typography>
      </Stack>

      <FormControl fullWidth size="small">
        <Select
          value={selectValue}
          onChange={handleChange}
          displayEmpty
          sx={
            isBanner
              ? {
                  color: "#ffffff",
                  fontWeight: 700,
                  bgcolor: "rgba(255,255,255,0.08)",
                  borderRadius: 1.5,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.45)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.8)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ffffff",
                  },
                  "& .MuiSvgIcon-root": { color: "#ffffff" },
                }
              : { fontWeight: 700 }
          }
        >
          <MenuItem value={ALL_YEARS_VALUE}>Todos los años</MenuItem>
          {options.map((yearOption) => (
            <MenuItem key={yearOption} value={String(yearOption)}>
              {yearOption}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default YearSelector;
