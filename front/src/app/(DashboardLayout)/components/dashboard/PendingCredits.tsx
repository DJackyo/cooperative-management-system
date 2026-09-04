import { Typography, Avatar, Box } from "@mui/material";
import { IconAlertTriangle } from "@tabler/icons-react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

interface DashboardData {
  pendingCredits: number;
  overdueCredits?: number;
}

const OverdueCredits = ({
  dashboardData,
  fullHeight,
}: {
  dashboardData: DashboardData;
  fullHeight?: boolean;
}) => {
  return (
    <DashboardCard title="Cartera en Riesgo" fullHeight={fullHeight}>
      <Box
        sx={{
          background: "linear-gradient(135deg, #fef2f2 0%, #fffbfb 100%)",
          borderRadius: 2,
          p: 2,
          mb: 1,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Avatar
            sx={{
              background: "linear-gradient(135deg, #FA896B 0%, #f3704d 100%)",
              width: 56,
              height: 56,
              boxShadow: "0 6px 14px rgba(250,137,107,0.4)",
            }}
          >
            <IconAlertTriangle width={26} color="#fff" />
          </Avatar>
          <Box textAlign="right">
            <Typography variant="h4" fontWeight="bold" color="error">
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
