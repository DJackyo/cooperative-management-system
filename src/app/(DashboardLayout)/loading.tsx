import React from "react";
import { Grid, Card, CardContent, Skeleton, Box } from "@mui/material";

const Loading = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Grid container spacing={3}>
        {/* Skeleton para las tarjetas del dashboard */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" height={30} />
              <Skeleton variant="text" width="80%" height={30} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" height={30} />
              <Skeleton variant="text" width="80%" height={30} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" height={30} />
              <Skeleton variant="text" width="80%" height={30} />
            </CardContent>
          </Card>
        </Grid>

        {/* Skeleton para la tabla */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="40%" height={30} />
              <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Loading;
