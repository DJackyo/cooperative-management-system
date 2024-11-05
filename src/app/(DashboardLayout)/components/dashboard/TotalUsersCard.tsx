import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from "@mui/material/styles";
import { Grid, Stack, Typography, Avatar } from "@mui/material";
import { IconArrowUpLeft } from "@tabler/icons-react";

import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

const TotalUsersCard = () => {
  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primaryLight = "#ecf2ff";
  const successLight = theme.palette.success.light;

  // Datos mockeados
  const totalUsers = 1200; // Total de usuarios
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
    colors: [primary, primaryLight],
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

  // Porcentaje de usuarios activos e inactivos
  const series = [80, 20]; // 80% activos, 20% inactivos

  return (
    <DashboardCard title="Total de usuarios">
      <Grid container spacing={2}>
        {/* columna para total de usuarios y crecimiento */}
        <Grid item xs={12} sm={5}>          
        <Typography variant="h3" fontWeight="700">
            {totalUsers}
          </Typography>
          <Stack spacing={1} mt={2} direction="column">
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
                Activos
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  width: 9,
                  height: 9,
                  bgcolor: primaryLight,
                  svg: { display: "none" },
                }}
              ></Avatar>
              <Typography variant="subtitle2" color="textSecondary">
                Retirados
              </Typography>
            </Stack>
          </Stack>
        </Grid>
        {/* columna para gráfico de dona */}
        <Grid item xs={12} sm={7}>
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
