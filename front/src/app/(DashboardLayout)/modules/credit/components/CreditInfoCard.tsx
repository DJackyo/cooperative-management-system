// src/(DashboardLayout)/modules/credit/components/CreditInfoCard.tsx

import { Card, CardContent, Typography } from '@mui/material';

const CreditInfoCard = () => {
  const creditInfo = {
    saldoPendiente: '5,000 USD',
    proximaCuota: '2024-11-15',
    plazoRestante: '18 meses',
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Saldo Pendiente: {creditInfo.saldoPendiente}</Typography>
        <Typography variant="body1">Próxima Cuota: {creditInfo.proximaCuota}</Typography>
        <Typography variant="body1">Plazo Restante: {creditInfo.plazoRestante}</Typography>
      </CardContent>
    </Card>
  );
};

export default CreditInfoCard;
