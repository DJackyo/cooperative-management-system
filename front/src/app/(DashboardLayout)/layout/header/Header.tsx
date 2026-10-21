import React, { Suspense, useEffect, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Button,
  Skeleton,
  Typography,
} from "@mui/material";
// components
import Profile from "./Profile";
import GuideTourButton from "@/components/GuideTourButton";
import { QuickSearchDialog } from "./QuickSearchDialog";
import { IconMenu, IconSearch } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/app/authentication/services/authService";
import { LoggedUser } from "@/interfaces/User";
import { defaultLoggedUser } from "../../utilities/utils";
import { setupAxiosInterceptors } from "@/services/axiosClient";

interface ItemType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
}

const Header = ({ isSidebarOpen, toggleSidebar, toggleMobileSidebar }: ItemType) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<LoggedUser>(defaultLoggedUser);
  const [isSearchOpen, setSearchOpen] = useState(false);

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "0 2px 12px rgba(30, 55, 90, 0.04)",
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    [theme.breakpoints.up("lg")]: {
      minHeight: "70px",
    },
    borderBottom: "1px solid #e4eaf2",
  }));
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.text.secondary,
  }));

  const fetchData = async () => {
    const hasSession = authService.isAuthenticated();
    if (hasSession) {
      const user = await authService.getCurrentUserData();
      setCurrentUser(user);
    }
  };

  useEffect(() => {
    setupAxiosInterceptors(router);
    fetchData();
  }, [router]);

  // Atajo global de teclado (Ctrl + K o Cmd + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sectionTitle = pathname === "/" ? "Resumen general" : "Gestión de la cooperativa";

  return (
    <>
      <AppBarStyled position="sticky" color="default">
        <ToolbarStyled sx={{ minHeight: { xs: 60, lg: 72 }, px: { xs: 1, sm: 3 } }}>
          <Suspense fallback={<Skeleton variant="text" width="100%" />}>
            <IconButton
              color="inherit"
              aria-label={isSidebarOpen ? "Colapsar menú lateral" : "Expandir menú lateral"}
              onClick={toggleSidebar}
              sx={{
                display: { xs: "none", lg: "inline-flex" },
              }}
            >
              <IconMenu width="20" height="20" />
            </IconButton>

            <IconButton
              color="inherit"
              aria-label="Abrir menú lateral"
              onClick={toggleMobileSidebar}
              sx={{ display: { xs: "inline-flex", lg: "none" } }}
            >
              <IconMenu width="20" height="20" />
            </IconButton>

            <Box data-tour="header-title" sx={{ ml: { xs: 1, lg: 0 }, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {sectionTitle}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                Cooperativa Multiactiva
              </Typography>
            </Box>

            {/* Botón de búsqueda rápida central / responsive */}
            <Box sx={{ ml: { xs: 1, sm: 3 }, mr: "auto" }}>
              <Button
                variant="outlined"
                onClick={() => setSearchOpen(true)}
                startIcon={<IconSearch size={16} />}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  color: "text.secondary",
                  borderColor: "#e2e8f0",
                  backgroundColor: "#f8fafc",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.825rem",
                  borderRadius: "20px",
                  px: 2,
                  py: 0.5,
                  "&:hover": {
                    backgroundColor: "#f1f5f9",
                    borderColor: "#cbd5e1",
                  },
                }}
              >
                Buscar módulo o asociado...
                <Box
                  component="span"
                  sx={{
                    ml: 1.5,
                    px: 0.8,
                    py: 0.2,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    bgcolor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    color: "#64748b",
                  }}
                >
                  Ctrl K
                </Box>
              </Button>
              <IconButton
                color="inherit"
                aria-label="Buscar o saltar"
                onClick={() => setSearchOpen(true)}
                sx={{ display: { xs: "inline-flex", sm: "none" } }}
              >
                <IconSearch size={20} />
              </IconButton>
            </Box>

            <Stack
              spacing={0}
              sx={{
                mr: 2,
                textAlign: "right",
                display: { xs: "none", sm: "flex" },
              }}
            >
              <Typography
                variant="subtitle2"
                color="textPrimary"
                sx={{ fontWeight: 600, lineHeight: 1.2 }}
              >
                {currentUser.username || currentUser.email || "Usuario"}
              </Typography>
              {currentUser.email && (
                <Typography variant="caption" color="textSecondary">
                  {currentUser.email}
                </Typography>
              )}
            </Stack>
            <Stack spacing={1.5} direction="row" alignItems="center">
              <GuideTourButton />
              <Box data-tour="header-user">
                <Profile />
              </Box>
            </Stack>
          </Suspense>
        </ToolbarStyled>
      </AppBarStyled>

      <QuickSearchDialog open={isSearchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
