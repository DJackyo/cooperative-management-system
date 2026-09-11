import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  IconCashBanknote,
  IconReceipt,
  IconPigMoney,
  IconPercentage,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { LoanCollectionData } from "@/services/dashboardService";

const fmtMoney = (value: number) =>
  "$" + (Number(value) || 0).toLocaleString("es-CO");

interface LoanCollectionCardProps {
  loanCollection?: LoanCollectionData;
  totalCreditAmount?: number;
}

const LoanCollectionCard: React.FC<LoanCollectionCardProps> = ({
  loanCollection,
  totalCreditAmount = 0,
}) => {
  const totalCollected = loanCollection?.totalCollected || 0;
  const totalCapital = loanCollection?.totalCapital || 0;
  const totalInterest = loanCollection?.totalInterest || 0;
  const totalMora = loanCollection?.totalMora || 0;
  const totalPaymentsCount = loanCollection?.totalPaymentsCount || 0;

  // Porcentaje recuperado sobre el capital colocado
  const collectionRate =
    totalCreditAmount > 0
      ? Math.min(Math.round((totalCapital / totalCreditAmount) * 100), 100)
      : 0;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          flexWrap="wrap"
          gap={1}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 16px rgba(16, 185, 129, 0.25)",
              }}
            >
              <IconCashBanknote size={24} color="#ffffff" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
                Recaudo de Créditos
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Resumen acumulado del cobro de cartera
              </Typography>
            </Box>
          </Box>
          <Chip
            label={`${totalPaymentsCount} pagos registrados`}
            size="small"
            color="success"
            variant="light"
            sx={{ fontWeight: 700 }}
          />
        </Box>

        {/* Cifra principal */}
        <Box
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 2.5,
            bgcolor: "#ecfdf5",
            border: "1px solid",
            borderColor: "#a7f3d0",
          }}
        >
          <Typography
            variant="caption"
            sx={{ textTransform: "uppercase", fontWeight: 700, color: "#047857", letterSpacing: 0.5 }}
          >
            Total Recaudado en Créditos
          </Typography>
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{ color: "#065f46", my: 0.5 }}
          >
            {fmtMoney(totalCollected)}
          </Typography>

          <Box mt={1.5}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                Amortización de Capital Colocado
              </Typography>
              <Typography variant="caption" fontWeight={800} color="success.main">
                {collectionRate}% del capital
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={collectionRate}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "#d1fae5",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  bgcolor: "#10b981",
                },
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Desglose por concepto */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#ffffff",
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <IconPigMoney size={18} color="#059669" />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Recuperación Capital
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={800} color="text.primary">
                {fmtMoney(totalCapital)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#ffffff",
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <IconPercentage size={18} color="#2563eb" />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Intereses Ganados
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                {fmtMoney(totalInterest)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#ffffff",
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <IconAlertTriangle size={18} color="#dc2626" />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Intereses por Mora
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={800} color="error.main">
                {fmtMoney(totalMora)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default LoanCollectionCard;
