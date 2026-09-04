import {
  Typography,
  Avatar,
  Box,
  SxProps,
  Theme,
} from "@mui/material";
import { IconEye } from "@tabler/icons-react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboardService";

const PaymentSupportsCard = ({
  sx,
  fullHeight,
}: {
  sx?: SxProps<Theme>;
  fullHeight?: boolean;
}) => {
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
    <DashboardCard title="Soportes pendientes de validación" sx={sx} fullHeight={fullHeight}>
      <Box
        sx={{
          background: "linear-gradient(135deg, #e6fffa 0%, #f2fffd 100%)",
          borderRadius: 2,
          p: 2,
          height: "100%",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              sx={{
                background: "linear-gradient(135deg, #13DEB9 0%, #02b3a9 100%)",
                width: 40,
                height: 40,
                boxShadow: "0 5px 12px rgba(19,222,185,0.35)",
              }}
            >
              <Typography variant="h5" color="#fff" fontWeight="bold">
                {loading ? "..." : pendingSupportsCount}
              </Typography>
            </Avatar>
            <Typography variant="subtitle2" color="textSecondary">
              Pendientes de revisión
            </Typography>
          </Box>
          <Avatar
            sx={{
              background: "linear-gradient(135deg, #5D87FF 0%, #49BEFF 100%)",
              width: 56,
              height: 56,
              boxShadow: "0 6px 14px rgba(93,135,255,0.35)",
            }}
          >
            <IconEye width={26} color="white" />
          </Avatar>
        </Box>
      </Box>
    </DashboardCard>
  );
};

export default PaymentSupportsCard;
