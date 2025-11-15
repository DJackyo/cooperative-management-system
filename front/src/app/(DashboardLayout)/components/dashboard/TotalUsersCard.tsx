import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from "@mui/material/styles";
import { Grid, Stack, Typography, Avatar } from "@mui/material";
import { IconArrowUpLeft } from "@tabler/icons-react";

import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

interface UserStatus {
  status: string;
  count: number;
}

interface TotalUsersCardProps {
  totalUsers?: number;
  usersByStatus?: UserStatus[];
}

const TotalUsersCard = ({ totalUsers = 0, usersByStatus = [] }: TotalUsersCardProps) => {
  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const success = theme.palette.success.main;
  const warning = theme.palette.warning.main;
  const error = theme.palette.error.main;
  
  // Generar colores dinámicamente
  const colors = [primary, secondary, success, warning, error];

  const growthPercentage = 9; // Porcentaje de crecimiento
  const options = {
    chart: {
      type: "donut" as const,
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: {
        show: false,
      },
      height: 155,
    },
    colors: colors.slice(0, usersByStatus.length || 2),
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        donut: {
          size: "75%",
          background: "transparent",
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode === "dark" ? "dark" : "light",
      fillSeriesColor: false,
    },
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 991,
        options: {
          chart: {
            width: 120,
          },
        },
      },
    ],
  };

  // Datos de usuarios por estado
  const series = usersByStatus.length > 0 
    ? usersByStatus.map(item => item.count)
    : [totalUsers || 1]; // Fallback si no hay datos por estado

  return (
    <DashboardCard title="Total de usuarios">
      <Grid container spacing={2}>
        {/* columna para total de usuarios y crecimiento */}
        <Grid  size={{ xs: 12,  sm:5}}>          
        <Typography variant="h3" fontWeight="700">
            {totalUsers}
          </Typography>
          <Stack spacing={1} mt={2} direction="column">
            {usersByStatus.length > 0 ? (
              usersByStatus.map((item, index) => (
                <Stack key={item.status} direction="row" spacing={1} alignItems="center">
                  <Avatar
                    sx={{
                      width: 9,
                      height: 9,
                      bgcolor: colors[index] || primary,
                      svg: { display: "none" },
                    }}
                  ></Avatar>
                  <Typography variant="subtitle2" color="textSecondary">
                    {item.status} ({item.count})
                  </Typography>
                </Stack>
              ))
            ) : (
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar
                  sx={{
                    width: 9,
                    height: 9,
                    bgcolor: primary,
                    svg: { display: "none" },
                  }}
                ></Avatar>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Usuarios
                </Typography>
              </Stack>
            )}
          </Stack>
        </Grid>
        {/* columna para gráfico de dona */}
        <Grid  size={{ xs: 12,  sm:7}}>
          <Chart
            options={options}
            series={series}
            type="donut"
            height={100}
            width={"100%"}
          />
        </Grid>
      </Grid>
    </DashboardCard>
  );
};

export default TotalUsersCard;
