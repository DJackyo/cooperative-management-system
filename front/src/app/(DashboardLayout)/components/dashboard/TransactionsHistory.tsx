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
import { Box, Link, Typography } from "@mui/material";

const generateTransactions = (numTransactions:number) => {
  const transactionTypes = [
    {
      time: "09:30 am",
      content: "Soporte de pago cargado por Juan Pérez de $100.000",
      color: "success" as const,
    },
    {
      time: "10:00 am",
      content: "Crédito aprobado para María López",
      color: "primary" as const,
      isBold: true,
    },
    {
      time: "11:30 am",
      content: "Ahorro agregado de $300.000 de Carlos",
      color: "warning" as const,
    },
    {
      time: "12:00 pm",
      content: "Pago de cuota por valor de $150.000 por Miguel Urrutia",
      color: "error" as const,
    },
    // Puedes agregar más tipos de transacciones aquí
  ];

  const transactions = [];
  for (let i = 0; i < numTransactions; i++) {
    // Selecciona una transacción aleatoria del array
    const randomTransaction = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    transactions.push(randomTransaction);
  }
  return transactions;
};

const TransactionsHistory = () => {
  const transactions = generateTransactions(15);
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
            <TimelineItem key={index}>
              <TimelineOppositeContent>
                {transaction.time}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={transaction.color} variant="outlined" />
                {index < transactions.length - 1 && <TimelineConnector />}{" "}
                {/* No conectar en el último item */}
              </TimelineSeparator>
              <TimelineContent>
                {transaction.isBold ? (
                  <Typography fontWeight="600">
                    {transaction.content}
                  </Typography>
                ) : (
                  transaction.content
                )}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    </DashboardCard>
  );
};

export default TransactionsHistory;
