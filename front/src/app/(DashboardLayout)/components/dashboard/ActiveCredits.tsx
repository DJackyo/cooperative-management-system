import { Typography, Avatar, Box } from "@mui/material";
import { IconCreditCard } from "@tabler/icons-react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

interface DashboardData {
  activeCredits: number;
  totalCreditAmount?: number;
}

interface ActiveCreditsProps {
  dashboardData: DashboardData;
  fullHeight?: boolean;
}

const ActiveCredits: React.FC<ActiveCreditsProps> = ({ dashboardData, fullHeight }) => {
  return (
    <DashboardCard title="Cartera Activa" fullHeight={fullHeight}>
      <Box
        sx={{
          background: "linear-gradient(135deg, #eff6ff 0%, #f8faff 100%)",
          borderRadius: 2,
          p: 2,
          mb: 2,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Avatar
            sx={{
              background:
                "linear-gradient(135deg, #5D87FF 0%, #49BEFF 100%)",
              width: 56,
              height: 56,
              boxShadow: "0 6px 14px rgba(93,135,255,0.35)",
            }}
          >
            <IconCreditCard width={26} color="#fff" />
          </Avatar>
          <Box textAlign="right">
            <Typography variant="h4" fontWeight="bold">
              {dashboardData.activeCredits}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Créditos Activos
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box px={1} pb={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold" color="primary">
            ${(dashboardData.totalCreditAmount || 0).toLocaleString()}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Monto total en cartera
          </Typography>
        </Box>
      </Box>
    </DashboardCard>
  );
};

export default ActiveCredits;
