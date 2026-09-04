import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  timelineOppositeContentClasses,
} from "@mui/lab";
import {
  Box,
  Typography,
  Skeleton,
  SxProps,
  Theme,
  Tooltip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { dashboardService, Transaction } from "@/services/dashboardService";
import {
  AttachMoney,
  CheckCircle,
  Savings,
  Payment,
} from "@mui/icons-material";

// Configuración de colores e íconos
const transactionConfig = {
  payment_support: { color: "success" as const, icon: <CheckCircle /> },
  credit_approved: { color: "primary" as const, icon: <AttachMoney /> },
  savings: { color: "warning" as const, icon: <Savings /> },
  payment: { color: "error" as const, icon: <Payment /> },
  default: { color: "primary" as const, icon: <AttachMoney /> },
};

const getTransactionConfig = (type: string) => {
  return transactionConfig[type as keyof typeof transactionConfig] || transactionConfig.default;
};

// Formato de fecha: "3 de sept" o "1 de mar/23"
const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const isCurrentYear = date.getFullYear() === now.getFullYear();

  const day = date.getDate();
  const month = date.toLocaleDateString("es-CO", { month: "short" }).replace(".", "");

  let formatted = `${day} de ${month}`;

  if (!isCurrentYear) {
    formatted += `/${date.getFullYear().toString().slice(-2)}`;
  }

  return formatted;
};

// Formato de hora: "12:00 a.m." o "05:48 p.m."
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Formato de moneda
const formatCurrency = (amount?: number) => {
  if (amount === undefined || amount === null) return "";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

const TransactionsHistory = ({
  sx,
  fullHeight,
}: {
  sx?: SxProps<Theme>;
  fullHeight?: boolean;
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await dashboardService.getRecentTransactions();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading transactions:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  if (loading) {
    return (
      <DashboardCard title="Últimas Transacciones" sx={sx} fullHeight={fullHeight}>
        <Box display="flex" flexDirection="column" gap={2} py={1}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} display="flex" alignItems="center" gap={2}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box flex={1}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={16} />
                <Skeleton variant="text" width="50%" height={14} />
              </Box>
            </Box>
          ))}
        </Box>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title={`Últimas ${transactions.length} Transacciones `} sx={sx} fullHeight={fullHeight}>
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 180,
          maxHeight: fullHeight ? "none" : 360,
          overflowY: "auto",
          pr: 1,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "#555" : "#ccc",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
        }}
      >
        {transactions.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            No hay transacciones recientes
          </Typography>
        ) : (
          <Timeline
            className="theme-timeline"
            sx={{
              p: 0,
              m: 0,
              [`& .${timelineOppositeContentClasses.root}`]: {
                flex: 0.35,
                paddingLeft: 0,
                paddingRight: 1.5,
              },
              "& .MuiTimelineItem-root": {
                minHeight: 70,
                "&:before": {
                  display: "none",
                },
              },
              "& .MuiTimelineConnector-root": {
                width: "2px",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#444" : "#e0e0e0",
              },
            }}
          >
            {transactions.map((transaction, index) => {
              const config = getTransactionConfig(transaction.type);
              const isLast = index === transactions.length - 1;
              const amount = transaction.amount || 0;

              return (
                <TimelineItem key={transaction.id}>
                  {/* Columna izquierda: Fecha, Hora, Monto */}
                  <TimelineOppositeContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      lineHeight: 1.2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 500,
                        color: "text.primary",
                      }}
                    >
                      {formatDate(transaction.timestamp)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.6rem",
                        color: "text.disabled",
                      }}
                    >
                      {formatTime(transaction.timestamp)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "success.main",
                        mt: 0.3,
                      }}
                    >
                      +{formatCurrency(amount)}
                    </Typography>
                  </TimelineOppositeContent>

                  {/* Separador */}
                  <TimelineSeparator>
                    <Tooltip title={transaction.type} arrow placement="left">
                      <TimelineDot
                        color={config.color}
                        variant="outlined"
                        sx={{
                          width: 36,
                          height: 36,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: (theme) =>
                            theme.palette.mode === "dark"
                              ? "0 0 0 2px #333"
                              : "0 0 0 2px #fff",
                        }}
                      >
                        {config.icon}
                      </TimelineDot>
                    </Tooltip>
                    {!isLast && <TimelineConnector />}
                  </TimelineSeparator>

                  {/* Columna derecha: Descripción + Usuario */}
                  <TimelineContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      py: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 400,
                        lineHeight: 1.3,
                        color: "text.primary",
                      }}
                    >
                      {transaction.description}
                    </Typography>
                    {transaction.user && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.65rem",
                          color: "text.secondary",
                          mt: 0.2,
                          lineHeight: 1.2,
                        }}
                      >
                        {transaction.user}
                      </Typography>
                    )}
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        )}
      </Box>
    </DashboardCard>
  );
};

export default TransactionsHistory;