import React, { useEffect, useState, useCallback } from "react";
import { Avatar, Box, Menu, Button, IconButton, MenuItem, ListItemIcon, ListItemText, Skeleton } from "@mui/material";
import { useRouter } from "next/navigation";
import { IconBriefcase, IconSettings, IconUser } from "@tabler/icons-react";
import { authService } from "@/app/authentication/services/authService";
import { useTheme } from "@mui/material/styles";
import { validateRoles, roleAdmin, roleUser, roleSuperAdmin } from "../../utilities/utils";

const Profile = () => {
  const theme = useTheme();
  const router = useRouter();

  const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string[]>([]);
  const [roleIcon, setRoleIcon] = useState<React.ReactNode | null>(null);
  const [loading, setLoading] = useState(true);

  const handleClick2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleLogout = () => {
    authService.logout();
    router.push("/authentication/login");
  };

  const getRoleIcon = useCallback(
    (userRoles: string[]) => {
      let image = "/images/profile/user-1.jpg";
      let icon = <IconUser width={20} color={theme.palette.primary.main} />;

      if (validateRoles(roleUser, userRoles)) {
        icon = <IconSettings width={20} color={theme.palette.primary.main} />;
      }

      if (validateRoles(roleSuperAdmin, userRoles)) {
        image = "/images/profile/admin.jpg";
        icon = <IconBriefcase width={20} color={theme.palette.primary.main} />;
      }

      if (validateRoles(roleAdmin, userRoles)) {
        image = "/images/profile/gestor.jpg";
        icon = <IconUser width={20} color={theme.palette.primary.main} />;
      }

      const img = new Image();
      img.src = image;
      img.onload = () => {
        setProfileImage(image);
        setRoleIcon(icon);
        setLoading(false);
      };
    },
    [theme]
  );

  useEffect(() => {
    const userRoles = authService.getUserRoles();
    setUserRole(userRoles);
    getRoleIcon(userRoles);
  }, [getRoleIcon]);

  return (
    <Box>
      <IconButton size="large" color="inherit" aria-controls="msgs-menu" aria-haspopup="true" sx={{ ...(anchorEl2 && { color: "primary.main" }) }} onClick={handleClick2}>
        {loading ? <Skeleton variant="circular" width={35} height={35} /> : <Avatar src={profileImage || ""} alt="Profile image" sx={{ width: 35, height: 35 }} />}
      </IconButton>

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
            width: "250px",
          },
        }}
      >
        <MenuItem>
          <ListItemIcon sx={{ color: theme.palette.primary.main }}>{roleIcon}</ListItemIcon>
          <ListItemText
            primaryTypographyProps={{
              sx: { fontWeight: "bold", color: "primary.main" },
            }}
          >
            {userRole.join(", ")}
          </ListItemText>
        </MenuItem>

        <MenuItem>
          <ListItemIcon>
            <IconUser width={20} />
          </ListItemIcon>
          <ListItemText>Mi perfil</ListItemText>
        </MenuItem>

        <Box mt={1} py={1} px={2}>
          <Button onClick={handleLogout} variant="outlined" color="primary" fullWidth>
            Salir
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
