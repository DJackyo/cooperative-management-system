import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useRouter } from 'next/navigation';
import { IconBriefcase, IconInfoSquareRoundedFilled, IconListCheck, IconMail, IconSettings, IconUser } from "@tabler/icons-react";
import { authService } from "@/app/authentication/services/authService";
import { useTheme } from "@mui/material/styles";

const Profile = () => {
  const theme = useTheme();
  const router = useRouter();
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [profileImage, setProfileImage] = useState("/images/profile/user-1.jpg");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Obtener rol del usuario
    const userRole = localStorage.getItem("userRole") || "Invitado";
    setUserRole(userRole);

    // Asignar imagen según el rol
    switch (userRole) {
      case "socio":
        setProfileImage("/images/profile/user-1.jpg");
        break;
      case "administrador":
        setProfileImage("/images/profile/admin.jpg");
        break;
      case "gestorOperaciones":
        setProfileImage("/images/profile/gestor.jpg");
        break;
      default:
        setProfileImage("/images/profile/socio.jpg");
    }
  }, []);
  
  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "socio":
        return <IconUser width={20} color={theme.palette.primary.main} />;
      case "administrador":
        return <IconSettings width={20} color={theme.palette.primary.main} />;
      case "gestorOperaciones":
        return <IconBriefcase width={20} color={theme.palette.primary.main} />;
      default:
        return <IconUser width={20} color={theme.palette.primary.main} />;
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push("/authentication/login");
  };
  
  return (
    <Box>
      <IconButton
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === "object" && {
            color: "primary.main",
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={profileImage}
          alt="Profile image"
          sx={{
            width: 35,
            height: 35,
          }}
        />
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "200px",
          },
        }}
      >
        <MenuItem>
          <ListItemIcon sx={{ color: theme.palette.primary.main }}>
            {getRoleIcon(userRole)}
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{
              sx: {
                fontWeight: "bold", 
                color: "primary.main",
              },
            }}
          >
            {userRole}
          </ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <IconUser width={20} />
          </ListItemIcon>
          <ListItemText>Mi perfil</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <IconMail width={20} />
          </ListItemIcon>
          <ListItemText>Mis ahorros</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <IconListCheck width={20} />
          </ListItemIcon>
          <ListItemText>Mis créditos</ListItemText>
        </MenuItem>
        <Box mt={1} py={1} px={2}>
          <Button
            onClick={handleLogout}
            variant="outlined"
            color="primary"
            fullWidth
          >
            Salir
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
