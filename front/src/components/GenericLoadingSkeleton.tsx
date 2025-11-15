import React from 'react';
import { Skeleton, Card, CardContent, Grid, Box } from '@mui/material';

interface GenericLoadingSkeletonProps {
  type?: 'table' | 'cards' | 'form' | 'dashboard';
  rows?: number;
}

const GenericLoadingSkeleton: React.FC<GenericLoadingSkeletonProps> = ({ 
  type = 'table', 
  rows = 5 
}) => {
  if (type === 'table') {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
          {Array.from({ length: rows }).map((_, index) => (
            <Box key={index} display="flex" gap={2} mb={1}>
              <Skeleton variant="text" width="15%" height={40} />
              <Skeleton variant="text" width="25%" height={40} />
              <Skeleton variant="text" width="20%" height={40} />
              <Skeleton variant="text" width="15%" height={40} />
              <Skeleton variant="text" width="25%" height={40} />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (type === 'cards') {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: rows }).map((_, index) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={32} sx={{ my: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={60} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (type === 'form') {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 3 }} />
          {Array.from({ length: rows }).map((_, index) => (
            <Box key={index} mb={2}>
              <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={56} />
            </Box>
          ))}
          <Skeleton variant="rectangular" width={120} height={36} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Skeleton variant="text" width={200} height={40} />
      </Grid>
      {Array.from({ length: 3 }).map((_, index) => (
        <Grid size={{ xs: 12, md: 4 }} key={index}>
          <Card>
            <CardContent>
              <Skeleton variant="rectangular" width="100%" height={120} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default GenericLoadingSkeleton;