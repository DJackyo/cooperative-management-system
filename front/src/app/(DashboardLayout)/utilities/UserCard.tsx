import React from "react";
import { Card, CardContent, Box, Avatar, Typography } from "@mui/material";
import IconUser from "@mui/icons-material/Person";
import { Asociado } from "@/interfaces/User"; // Asegúrate de que esta interfaz existe

interface UserCardProps {
  id: number | string;
  userInfo: Asociado;
}

const UserCard: React.FC<UserCardProps> = ({ id, userInfo }) => {
  return (
    <Card variant="outlined" sx={{ boxShadow: 3 }}>
      <CardContent>
        <Box
          display="flex"
          sx={{
            justifyContent: "start",
            alignItems: "center",
            marginRight: 2,
          }}
        >
          <Box sx={{ width: 40, marginRight: 2 }}>
            <Avatar
              sx={{
                bgcolor: "#e3f2fd",
                width: 36,
                height: 36,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 2,
              }}
            >
              <Typography variant="h5" color="primary.main">
                <IconUser />
              </Typography>
            </Avatar>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ marginTop: 0.5, marginBottom: 1 }}>
              {id} - {userInfo.nombres}
            </Typography>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              sx={{ marginTop: 0.5 }}
            >
              {userInfo.numeroDeIdentificacion}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserCard;
