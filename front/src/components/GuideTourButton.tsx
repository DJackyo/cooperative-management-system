"use client";

import React, { useState } from "react";
import {
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Chip,
  Box,
  Typography,
} from "@mui/material";
import {
  IconHelpCircle,
  IconCompass,
  IconMap2,
  IconSparkles,
  IconChevronDown,
  IconTimeline,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { getTourForPath, GENERAL_TOUR, CREDIT_WORKFLOW_TOUR, PAGE_TOURS } from "@/config/tours";

interface GuideTourButtonProps {
  variant?: "icon" | "button" | "chip";
  size?: "small" | "medium" | "large";
}

export const GuideTourButton: React.FC<GuideTourButtonProps> = ({
  variant = "button",
  size = "medium",
}) => {
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const getActiveTourConfig = () => {
    const fullPath =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : pathname;
    return getTourForPath(fullPath);
  };

  const currentTourConfig = getActiveTourConfig();

  // Iniciar un tour específico
  const startTour = (steps: DriveStep[]) => {
    handleCloseMenu();

    // Filtrar pasos cuyos elementos no existan en el DOM actual
    const validSteps = steps.filter((step) => {
      if (!step.element) return true;
      if (typeof step.element === "string") {
        return document.querySelector(step.element) !== null;
      }
      return true;
    });

    if (validSteps.length === 0) {
      console.warn("No se encontraron elementos interactivos para este tour en la vista actual.");
    }

    const stepsToRun = validSteps.length > 0 ? validSteps : steps;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: "rgba(15, 23, 42, 0.65)",
      nextBtnText: "Siguiente →",
      prevBtnText: "← Anterior",
      doneBtnText: "¡Entendido!",
      progressText: "Paso {{current}} de {{total}}",
      popoverClass: "driverjs-theme-coopinsi",
      steps: stepsToRun,
      onDestroyStarted: () => {
        driverObj.destroy();
      },
    });

    // Iniciar driver.js
    setTimeout(() => {
      driverObj.drive();
    }, 100);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Click directo en el botón principal: arranca el tour de la pantalla actual
  const handleClickMain = () => {
    startTour(getActiveTourConfig().steps);
  };

  return (
    <>
      <div data-tour="header-tour-btn" style={{ display: "inline-block" }}>
        {variant === "icon" ? (
          <Tooltip title={`Guía de pantalla: ${currentTourConfig.title}`}>
            <IconButton
              onClick={handleClickMain}
              color="primary"
              size={size}
              aria-label="Abrir guía interactiva"
              sx={{
                background: "rgba(36, 71, 168, 0.06)",
                border: "1px solid rgba(36, 71, 168, 0.15)",
                "&:hover": {
                  background: "rgba(36, 71, 168, 0.12)",
                },
              }}
            >
              <IconHelpCircle size={20} />
            </IconButton>
          </Tooltip>
        ) : variant === "chip" ? (
          <Chip
            icon={<IconHelpCircle size={16} />}
            label="Ayuda"
            onClick={handleClickMain}
            color="primary"
            variant="outlined"
            size="small"
            sx={{
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: "16px",
            }}
          />
        ) : (
          <Button
            onClick={handleOpenMenu}
            variant="outlined"
            color="primary"
            size={size}
            startIcon={<IconHelpCircle size={18} />}
            endIcon={<IconChevronDown size={14} />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              px: 1.8,
              py: 0.6,
              borderColor: "rgba(36, 71, 168, 0.25)",
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
              "&:hover": {
                borderColor: "#2447a8",
                background: "rgba(36, 71, 168, 0.04)",
              },
            }}
          >
            Guía / Ayuda
          </Button>
        )}
      </div>

      {/* Menú desplegable de guías disponibles */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 1,
            borderRadius: 2.5,
            minWidth: 260,
            overflow: "visible",
            filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.1))",
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1.2,
              borderRadius: 1.5,
              mx: 1,
              my: 0.3,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: "1px solid #f0f4f8", mb: 0.5 }}>
          <Typography variant="subtitle2" fontWeight={700} color="primary.main">
            Centro de Ayuda e Instrucción
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Selecciona el tipo de guía interactiva
          </Typography>
        </Box>

        {/* Opción 1: Guía de la pantalla actual */}
        <MenuItem
          onClick={() => startTour(getActiveTourConfig().steps)}
          sx={{ background: "rgba(36, 71, 168, 0.04)" }}
        >
          <ListItemIcon>
            <IconCompass size={20} color="#2447a8" />
          </ListItemIcon>
          <ListItemText
            primary={currentTourConfig.title}
            secondary="Aprende sobre las funciones de esta vista"
            primaryTypographyProps={{ fontWeight: 600, fontSize: "0.88rem" }}
            secondaryTypographyProps={{ fontSize: "0.75rem" }}
          />
        </MenuItem>

        {/* Opción 2: Proceso del Crédito */}
        <MenuItem onClick={() => startTour(CREDIT_WORKFLOW_TOUR.steps)}>
          <ListItemIcon>
            <IconTimeline size={20} color="#10b981" />
          </ListItemIcon>
          <ListItemText
            primary="Proceso de Préstamo"
            secondary="Aprende el ciclo de vida y etapas de un crédito"
            primaryTypographyProps={{ fontWeight: 600, fontSize: "0.88rem" }}
            secondaryTypographyProps={{ fontSize: "0.75rem" }}
          />
        </MenuItem>

        {/* Opción 3: Guía General */}
        <MenuItem onClick={() => startTour(GENERAL_TOUR.steps)}>
          <ListItemIcon>
            <IconMap2 size={20} color="#3567d6" />
          </ListItemIcon>
          <ListItemText
            primary="Recorrido General"
            secondary="Conoce la estructura básica del sistema"
            primaryTypographyProps={{ fontWeight: 600, fontSize: "0.88rem" }}
            secondaryTypographyProps={{ fontSize: "0.75rem" }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default GuideTourButton;
