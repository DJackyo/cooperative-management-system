import React from 'react';
import { Tooltip, IconButton, TooltipProps } from '@mui/material';
import { Info, Help } from '@mui/icons-material';

interface InfoTooltipProps {
  title: string;
  placement?: TooltipProps['placement'];
  icon?: 'info' | 'help';
  size?: 'small' | 'medium';
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  placement = 'top',
  icon = 'info',
  size = 'small',
}) => {
  const IconComponent = icon === 'info' ? Info : Help;

  return (
    <Tooltip
      title={title}
      placement={placement}
      arrow
      enterDelay={300}
      leaveDelay={200}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'grey.800',
            color: 'white',
            fontSize: '0.875rem',
            maxWidth: 300,
            '& .MuiTooltip-arrow': {
              color: 'grey.800',
            },
          },
        },
      }}
    >
      <IconButton
        size={size}
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
          },
          ml: 0.5,
        }}
      >
        <IconComponent fontSize={size} />
      </IconButton>
    </Tooltip>
  );
};

export default InfoTooltip;