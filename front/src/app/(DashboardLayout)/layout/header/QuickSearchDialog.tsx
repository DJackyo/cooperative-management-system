"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Divider,
} from "@mui/material";
import {
  IconSearch,
  IconLayoutDashboard,
  IconCoins,
  IconCreditCard,
  IconUserCog,
  IconCalendarEvent,
  IconCash,
  IconCertificate,
  IconReceipt,
  IconSettings,
  IconDatabase,
  IconX,
  IconUser,
  IconArrowRight,
  IconFileText,
  IconHelp,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/authentication/services/authService";
import { asociadosService } from "@/services/asociadosService";
import { Asociado } from "@/interfaces/User";

interface QuickSearchDialogProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: "Módulos" | "Acciones rápidas" | "Asociados";
  icon: React.ReactNode;
  roles?: string[];
}

export const QuickSearchDialog: React.FC<QuickSearchDialogProps> = ({ open, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [asociados, setAsociados] = useState<Asociado[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userId, setUserId] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const roles = authService.getUserRoles();
      const user = authService.getCurrentUserData();
      setUserRoles(Array.isArray(roles) ? roles : [roles]);
      setUserId(user.userId || 0);
      setQuery("");
      setSelectedIndex(0);

      // Cargar lista de asociados para búsqueda rápida si es admin
      if (roles.includes("admin") || roles.includes("superAdmin")) {
        asociadosService
          .fetchAll()
          .then((data) => setAsociados(Array.isArray(data) ? data : []))
          .catch(() => setAsociados([]));
      }

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  // Lista base de módulos y accesos
  const baseNavigationItems: NavItem[] = useMemo(() => {
    const isSuperAdmin = userRoles.includes("superAdmin");
    const isAdmin = userRoles.includes("admin") || isSuperAdmin;
    const isUser = userRoles.includes("socio") || userRoles.includes("user");

    const items: NavItem[] = [
      {
        id: "nav-dashboard",
        title: "Centro de Control (Dashboard)",
        subtitle: "Resumen ejecutivo de ahorros, créditos e indicadores",
        href: "/",
        category: "Módulos",
        icon: <IconLayoutDashboard size={20} />,
      },
    ];

    if (isAdmin) {
      items.push({
        id: "nav-savings-admin",
        title: "Gestionar Ahorros",
        subtitle: "Aportes generales, histórico por año y carga masiva",
        href: "/modules/savings?id=0",
        category: "Módulos",
        icon: <IconCoins size={20} />,
      });
      items.push({
        id: "nav-credit-admin",
        title: "Gestionar Créditos",
        subtitle: "Solicitudes, aprobaciones, plan de pagos y recaudos",
        href: "/modules/credit?userId=0",
        category: "Módulos",
        icon: <IconCreditCard size={20} />,
      });
    }

    if (isUser || !isAdmin) {
      items.push({
        id: "nav-my-savings",
        title: "Mis Ahorros",
        subtitle: "Historial de mis aportes personales",
        href: `/modules/savings?id=${userId}`,
        category: "Módulos",
        icon: <IconCoins size={20} />,
      });
      items.push({
        id: "nav-my-credit",
        title: "Mis Créditos",
        subtitle: "Mis solicitudes de crédito y plan de pagos",
        href: `/modules/credit?userId=${userId}`,
        category: "Módulos",
        icon: <IconCreditCard size={20} />,
      });
    }

    if (isSuperAdmin) {
      items.push({
        id: "nav-users",
        title: "Padrón de Asociados",
        subtitle: "Administrar usuarios, perfiles y estados de afiliación",
        href: "/modules/users",
        category: "Módulos",
        icon: <IconUserCog size={20} />,
      });
      items.push({
        id: "nav-assembly",
        title: "Asistencia a Asamblea",
        subtitle: "Control y registro de asistencia presencial o virtual",
        href: "/modules/assembly-attendance",
        category: "Módulos",
        icon: <IconCalendarEvent size={20} />,
      });
      items.push({
        id: "nav-withdrawals",
        title: "Retiros y Liquidaciones",
        subtitle: "Gestión de solicitudes de desvinculación",
        href: "/modules/withdrawals",
        category: "Módulos",
        icon: <IconCash size={20} />,
      });
      items.push({
        id: "nav-backups",
        title: "Copias de Seguridad (Backups)",
        subtitle: "Descarga y restauración de la base de datos",
        href: "/modules/admin/backups",
        category: "Módulos",
        icon: <IconDatabase size={20} />,
      });
      items.push({
        id: "nav-params",
        title: "Parámetros del Sistema",
        subtitle: "Configuración de roles, tasas y catálogos",
        href: "/modules/parametros",
        category: "Módulos",
        icon: <IconSettings size={20} />,
      });
    }

    if (isAdmin) {
      items.push({
        id: "nav-certificados",
        title: "Certificados y Estado de Cuenta",
        subtitle: "Generación y descarga de comprobantes en PDF",
        href: "/modules/certificados",
        category: "Módulos",
        icon: <IconCertificate size={20} />,
      });
      items.push({
        id: "nav-recibos",
        title: "Recibos Mensuales",
        subtitle: "Consulta e impresión de extractos por mes",
        href: "/modules/recibos-mensuales",
        category: "Módulos",
        icon: <IconReceipt size={20} />,
      });
    }

    return items;
  }, [userRoles, userId]);

  // Asociados que coinciden con la búsqueda
  const asociadosResults: NavItem[] = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length < 2) return [];

    return asociados
      .filter((asoc) => {
        const nombre = (asoc.nombres || `${asoc.nombre1 || ""} ${asoc.apellido1 || ""}`).toLowerCase();
        const cedula = (asoc.numeroDeIdentificacion || "").toLowerCase();
        const id = String(asoc.id);
        return nombre.includes(cleanQuery) || cedula.includes(cleanQuery) || id.includes(cleanQuery);
      })
      .slice(0, 5)
      .map((asoc) => {
        const nombre = asoc.nombres || `${asoc.nombre1 || ""} ${asoc.apellido1 || ""}`.trim() || `Asociado #${asoc.id}`;
        return {
          id: `asoc-${asoc.id}`,
          title: nombre,
          subtitle: `Cédula: ${asoc.numeroDeIdentificacion || "N/A"} · ID: ${asoc.id}`,
          href: `/modules/savings?id=${asoc.id}`,
          category: "Asociados" as const,
          icon: <IconUser size={20} />,
        };
      });
  }, [asociados, query]);

  // Filtrado general
  const filteredItems = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    const navFiltered = cleanQuery
      ? baseNavigationItems.filter(
          (item) =>
            item.title.toLowerCase().includes(cleanQuery) ||
            item.subtitle.toLowerCase().includes(cleanQuery)
        )
      : baseNavigationItems;

    return [...navFiltered, ...asociadosResults];
  }, [baseNavigationItems, asociadosResults, query]);

  // Selección por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleNavigate(filteredItems[selectedIndex].href);
      }
    }
  };

  const handleNavigate = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.25)",
          overflow: "hidden",
          p: 0,
        },
      }}
    >
      <Box sx={{ p: 2, pb: 1.5, borderBottom: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Escribe para buscar un módulo o asociado..."
          variant="standard"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={22} color="#5D87FF" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {query ? (
                  <IconButton size="small" onClick={() => setQuery("")}>
                    <IconX size={18} />
                  </IconButton>
                ) : (
                  <Chip
                    label="ESC para salir"
                    size="small"
                    sx={{ fontSize: "0.7rem", height: 22, bgcolor: "#f1f5f9", color: "#64748b" }}
                  />
                )}
              </InputAdornment>
            ),
            sx: { fontSize: "1rem", fontWeight: 500 },
          }}
        />
      </Box>

      <DialogContent sx={{ p: 0, maxHeight: 420, bgcolor: "#f8fafc" }}>
        {filteredItems.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="subtitle2" color="text.secondary">
              No se encontraron resultados para &ldquo;{query}&rdquo;
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Prueba buscando por nombre del módulo, sección o número de identificación.
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ py: 1 }}>
            {filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <ListItemButton
                  key={item.id}
                  selected={isSelected}
                  onClick={() => handleNavigate(item.href)}
                  sx={{
                    px: 2.5,
                    py: 1.25,
                    mx: 1,
                    mb: 0.5,
                    borderRadius: 2,
                    "&.Mui-selected": {
                      bgcolor: "primary.light",
                      color: "primary.main",
                      "& .MuiListItemIcon-root": { color: "primary.main" },
                    },
                    "&:hover": {
                      bgcolor: "rgba(93, 135, 255, 0.08)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 38,
                      color: isSelected ? "primary.main" : "text.secondary",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {item.title}
                        </Typography>
                        <Chip
                          label={item.category}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            bgcolor: item.category === "Asociados" ? "rgba(16, 185, 129, 0.12)" : "rgba(93, 135, 255, 0.12)",
                            color: item.category === "Asociados" ? "#047857" : "#3b82f6",
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {item.subtitle}
                      </Typography>
                    }
                  />
                  <IconArrowRight size={16} opacity={isSelected ? 1 : 0.25} />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </DialogContent>

      <Box
        sx={{
          py: 1,
          px: 2.5,
          borderTop: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Usa <strong>↑</strong> <strong>↓</strong> para navegar y <strong>Enter</strong> para seleccionar
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {filteredItems.length} resultado{filteredItems.length === 1 ? "" : "s"}
        </Typography>
      </Box>
    </Dialog>
  );
};

