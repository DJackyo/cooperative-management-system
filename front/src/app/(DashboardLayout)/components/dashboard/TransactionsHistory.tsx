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
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { dashboardService, Transaction } from "@/services/dashboardService";

const getTransactionColor = (type: string) => {
  switch (type) {
    case 'payment_support': return 'success' as const;
    case 'credit_approved': return 'primary' as const;
    case 'savings': return 'warning' as const;
    case 'payment': return 'error' as const;
    default: return 'primary' as const;
  }
};

const formatDateTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('es-CO', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const TransactionsHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await dashboardService.getRecentTransactions();
        console.log('Transactions response:', data);
        
        // Manejar diferentes formatos de respuesta
        let transactionsArray = [];
        if (Array.isArray(data)) {
          transactionsArray = data;
        } else if (data && Array.isArray(data.data)) {
          transactionsArray = data.data;
        } else if (data && data.data) {
          transactionsArray = [data.data];
        }
        
        console.log('Processed transactions:', transactionsArray);
        setTransactions(transactionsArray);
      } catch (error) {
        console.error('Error loading transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadTransactions();
  }, []);

  if (loading) {
    return (
      <DashboardCard title="Últimas Transacciones">
        <Typography>Cargando...</Typography>
      </DashboardCard>
    );
  }
  return (
    <DashboardCard title="Últimas Transacciones">
      <Box
        sx={{
          minHeight: "500px", // Ajusta la altura según tus necesidades
          maxHeight: "500px", // Ajusta la altura según tus necesidades
          overflowY: "auto", // Permite el scroll vertical
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
        }}
      >
        {transactions.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No hay transacciones recientes
          </Typography>
        ) : (
          <Timeline
            className="theme-timeline"
            sx={{
              p: 0,
              mb: "-40px",
              "& .MuiTimelineConnector-root": {
                width: "1px",
                backgroundColor: "#efefef",
              },
              [`& .${timelineOppositeContentClasses.root}`]: {
                flex: 0.5,
                paddingLeft: 0,
              },
            }}
          >
            {transactions.map((transaction, index) => (
              <TimelineItem key={transaction.id}>
                <TimelineOppositeContent>
                  {formatDateTime(transaction.timestamp)}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={getTransactionColor(transaction.type)} variant="outlined" />
                  {index < transactions.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography fontWeight={transaction.type === 'credit_approved' ? '600' : '400'}>
                    {transaction.description}
                  </Typography>
                  {transaction.user && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {transaction.user}
                    </Typography>
                  )}
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </Box>
    </DashboardCard>
  );
};

export default TransactionsHistory;
