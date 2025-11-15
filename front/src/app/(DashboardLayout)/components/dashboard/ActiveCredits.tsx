import { Typography, Avatar, Box } from "@mui/material";
import { IconCreditCard } from "@tabler/icons-react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

interface DashboardData {
  activeCredits: number;
  totalCreditAmount?: number;
}

interface ActiveCreditsProps {
  dashboardData: DashboardData;
}

const ActiveCredits: React.FC<ActiveCreditsProps> = ({ dashboardData }) => {
  return (
    <DashboardCard title="Cartera Activa">
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar
            sx={{ bgcolor: "#e3f2fd", width: 56, height: 56, marginRight: 2 }}
          >
            <IconCreditCard width={24} color="#1976d2" />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {dashboardData.activeCredits}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Créditos Activos
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="primary">
            ${(dashboardData.totalCreditAmount || 0).toLocaleString()}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Monto Total en Cartera
          </Typography>
        </Box>
      </Box>
    </DashboardCard>
  );
};

export default ActiveCredits;
