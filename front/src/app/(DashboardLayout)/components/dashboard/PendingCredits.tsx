import { Typography, Avatar, Box } from "@mui/material";
import { IconAlertTriangle } from "@tabler/icons-react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

interface DashboardData {
  pendingCredits: number;
  overdueCredits?: number;
}

const OverdueCredits = ({
  dashboardData,
}: {
  dashboardData: DashboardData;
}) => {
  return (
    <DashboardCard title="Cartera en Riesgo">
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar
            sx={{ bgcolor: "#ffebee", width: 56, height: 56, marginRight: 2 }}
          >
            <IconAlertTriangle width={24} color="#d32f2f" />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="error">
              {dashboardData.overdueCredits || 0}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Créditos Vencidos
            </Typography>
          </Box>
        </Box> 
      </Box>
    </DashboardCard>
  );
};

export default OverdueCredits;
