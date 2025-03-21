import React, { Suspense, useEffect, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Badge,
  Button,
  Skeleton,
} from "@mui/material";
import PropTypes from "prop-types";
import Link from "next/link";
// components
import Profile from "./Profile";
import { IconBellRinging, IconMenu } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/authentication/services/authService";
import { LoggedUser } from "@/interfaces/User";
import { defaultLoggedUser } from "../../utilities/utils";
import { setupAxiosInterceptors } from "@/services/axiosClient";

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  // const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  // const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<LoggedUser>(defaultLoggedUser);

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    [theme.breakpoints.up("lg")]: {
      minHeight: "70px",
    },
    borderBottom: "1px solid #dadde1",
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
  }, []);

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <Suspense fallback={<Skeleton variant="text" width="100%" />}>
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={toggleMobileSidebar}
            sx={{
              display: {
                lg: "none",
                xs: "inline",
              },
            }}
          >
            <IconMenu width="20" height="20" />
          </IconButton>

          {/* <IconButton
          size="large"
          aria-label="show 11 new notifications"
          color="inherit"
          aria-controls="msgs-menu"
          aria-haspopup="true"
        >
          <Badge variant="dot" color="primary">
            <IconBellRinging size="21" stroke="1.5" />
          </Badge>

        </IconButton> */}
          <Box flexGrow={1} />
          <Stack spacing={1} sx={{ mr: 2 }}>
            {currentUser.email}
          </Stack>
          <Stack spacing={1} direction="row" alignItems="center">
            {/* <Button
              variant="contained"
              onClick={handleLogout}
              disableElevation
              color="primary"
            >
              Salir
            </Button> */}
            <Profile />
          </Stack>
        </Suspense>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;
