import React from "react";
import { Avatar, Box, Paper, Stack, Typography } from "@mui/material";

interface ModuleStatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  highlight?: boolean;
}

const ModuleStatCard = ({
  label,
  value,
  icon,
  color,
  subtitle,
  highlight = false,
}: ModuleStatCardProps) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      height: "100%",
      borderRadius: 2,
      border: "1px solid",
      borderColor: highlight ? `${color}55` : "divider",
      bgcolor: highlight ? `${color}08` : "background.paper",
    }}
  >
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Avatar sx={{ width: 40, height: 40, bgcolor: `${color}18`, color }}>
        {icon}
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
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={800} lineHeight={1.2} noWrap>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  </Paper>
);

export default ModuleStatCard;
