import { Grid, Typography, Avatar, Box } from "@mui/material";
import { IconCreditCard } from "@tabler/icons-react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

interface DashboardData {
  activeCredits: number; // Ajusta esto a la estructura real de dashboardData
}

interface ActiveCreditsProps {
  dashboardData: DashboardData; // Usa la interfaz aquí
}

const ActiveCredits: React.FC<ActiveCreditsProps> = ({ dashboardData }) => {
  return (
    <DashboardCard title="Créditos Activos">
      <Box display="flex" alignItems="center" justifyContent="space-between">
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
            Total de Créditos
          </Typography>
        </Box>
      </Box>
    </DashboardCard>
  );
};

export default ActiveCredits;
