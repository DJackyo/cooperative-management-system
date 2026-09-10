import React from "react";
import { Paper, Box, Avatar, Typography, Stack } from "@mui/material";
import IconUser from "@mui/icons-material/Person";
import { Asociado } from "@/interfaces/User"; // Asegúrate de que esta interfaz existe

interface UserCardProps {
  id: number | string;
  userInfo: Asociado;
}

const UserCard: React.FC<UserCardProps> = ({ id, userInfo }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} minWidth={0}>
        <Avatar sx={{ width: 40, height: 40, bgcolor: "#3b82f618", color: "#3b82f6" }}>
          <IconUser />
        </Avatar>
        <Box minWidth={0}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontWeight: 700,
            }}
          >
            Asociado
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Código {id}
          </Typography>
          <Typography
            variant="h6"
            fontWeight={800}
            lineHeight={1.2}
            sx={{
              display: "-webkit-box",
              overflow: "hidden",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              minHeight: { xs: "2.4em", sm: "auto" },
              maxWidth: "100%",
              overflowWrap: "anywhere",
            }}
          >
            {userInfo.nombres || "Sin nombre"}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {userInfo.numeroDeIdentificacion || "Sin identificación"}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default UserCard;
