import {
  Typography,
  Avatar,
  Box,
} from "@mui/material";
import { IconEye } from "@tabler/icons-react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboardService";

const PaymentSupportsCard = () => {
  const [pendingSupportsCount, setPendingSupportsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPendingSupports = async () => {
      try {
        const count = await dashboardService.getPendingPaymentSupports();
        setPendingSupportsCount(count);
      } catch (error) {
        console.error('Error loading pending supports:', error);
        setPendingSupportsCount(0);
      } finally {
        setLoading(false);
      }
    };
    
    loadPendingSupports();
  }, []);

  return (
    <DashboardCard title="Soportes pendientes de validación">
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex">
          <Avatar
            sx={{
              bgcolor: "#e3f2fd",
              width: 36,
              height: 36,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 1,
            }}
          >
            <Typography variant="h4" color="primary.main">
              {loading ? '...' : pendingSupportsCount}
            </Typography>
          </Avatar>
          <Typography
            variant="subtitle2"
            color="textSecondary"
            sx={{ marginTop: 0.5 }}
          >
            Soportes pendientes
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
          <IconEye width={24} color="white" />
        </Avatar>
      </Box>
      {/* count={pendingSupportsCount} */}
      {/* <Typography variant="subtitle1" color="text.secondary" mt={1}>
            Estos son los soportes que necesitan validación.
          </Typography> */}
      {/* <Grid container alignItems="end" gap={2}>
        <Grid  alignItems="end">
          <IconButton size="small" color="primary" sx={{ mt: 1 }}>
            <IconFileInvoice /> Ver detalles
          </IconButton>
        </Grid>
      </Grid> */}
    </DashboardCard>
  );
};

export default PaymentSupportsCard;
