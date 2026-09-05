import React, { Suspense, useEffect, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
// components
import Profile from "./Profile";
import { IconMenu } from "@tabler/icons-react";
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
  // const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  // const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<LoggedUser>(defaultLoggedUser);

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

  const handleLogout = () => {
    authService.logout();
    router.push("/authentication/login");
  };
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

  const sectionTitle = pathname === "/" ? "Resumen general" : "Gestión de la cooperativa";

  return (
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

          <Box sx={{ ml: { xs: 1, lg: 0 }, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {sectionTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
              Cooperativa Multiactiva
            </Typography>
          </Box>

          <Box flexGrow={1} />
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
          <Stack spacing={1} direction="row" alignItems="center">
            <Profile />
          </Stack>
        </Suspense>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Header;
