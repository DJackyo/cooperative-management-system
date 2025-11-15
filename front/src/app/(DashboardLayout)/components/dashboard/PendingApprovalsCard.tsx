import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Avatar } from '@mui/material';
import { IconHourglass } from '@tabler/icons-react';
import DashboardCard from '../shared/DashboardCard';

interface PendingApprovalsCardProps {
  count: number;
}

const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ count }) => {
  return (
     <DashboardCard title="Pendientes de Aprobación">
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar
            sx={{ bgcolor: "#ffebee", width: 56, height: 56, marginRight: 2 }}
          >
            <IconHourglass size={24} color="#ed6c02" />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="error">
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