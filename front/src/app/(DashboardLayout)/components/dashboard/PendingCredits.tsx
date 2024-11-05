import { Grid, Typography, Avatar, Box } from "@mui/material";
import { IconClipboardList, IconCreditCard } from "@tabler/icons-react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { DashboardData } from "@/interfaces/DashboardData";

const PendingCredits = ({
  dashboardData,
}: {
  dashboardData: DashboardData;
}) => {
  return (
    <DashboardCard title="Créditos Pendientes">
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Avatar
          sx={{ bgcolor: "#e3f2fd", width: 56, height: 56, marginRight: 2 }}
        >
          <IconClipboardList width={24} color="#1976d2" />
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {dashboardData.pendingCredits}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Total de Créditos
          </Typography>
        </Box>
      </Box>
    </DashboardCard>
  );
};

export default PendingCredits;
