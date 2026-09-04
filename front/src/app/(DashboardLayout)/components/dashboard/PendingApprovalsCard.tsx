import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Avatar } from '@mui/material';
import { IconHourglass } from '@tabler/icons-react';
import DashboardCard from '../shared/DashboardCard';

interface PendingApprovalsCardProps {
  count: number;
  fullHeight?: boolean;
}

const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ count, fullHeight }) => {
  return (
     <DashboardCard title="Pendientes de Aprobación" fullHeight={fullHeight}>
      <Box
        sx={{
          background: "linear-gradient(135deg, #fff7ed 0%, #fffdf9 100%)",
          borderRadius: 2,
          p: 2,
          mb: 1,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Avatar
            sx={{
              background: "linear-gradient(135deg, #FFAE1F 0%, #FFC24B 100%)",
              width: 56,
              height: 56,
              boxShadow: "0 6px 14px rgba(255,174,31,0.4)",
            }}
          >
            <IconHourglass size={26} color="#fff" />
          </Avatar>
          <Box textAlign="right">
            <Typography variant="h4" fontWeight="bold" color="warning.dark">
              {count}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Solicitudes por revisar
            </Typography>
          </Box>
        </Box>
      </Box>
    </DashboardCard>
  );
};

export default PendingApprovalsCard;