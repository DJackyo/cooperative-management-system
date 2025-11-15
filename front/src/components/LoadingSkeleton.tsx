import React from 'react';
import { Skeleton, Card, CardContent, Grid, Box } from '@mui/material';

const LoadingSkeleton = () => {
  return (
    <Grid container spacing={3}>
      {/* Skeleton para sección usuarios */}
      <Grid size={{ xs: 12 }}>
        <Skeleton variant="text" width={200} height={40} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" width="100%" height={120} />
          </CardContent>
        </Card>
      </Grid>

      {/* Skeleton para sección cartera */}
      <Grid size={{ xs: 12 }}>
        <Skeleton variant="text" width={250} height={40} />
      </Grid>
      {[1, 2, 3].map((item) => (
        <Grid size={{ xs: 12, md: 4 }} key={item}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Skeleton variant="text" width={120} height={24} />
                  <Skeleton variant="text" width={80} height={48} />
                  <Skeleton variant="text" width={100} height={20} />
                </Box>
                <Skeleton variant="circular" width={56} height={56} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Skeleton para gráficos */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" width="100%" height={200} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default LoadingSkeleton;