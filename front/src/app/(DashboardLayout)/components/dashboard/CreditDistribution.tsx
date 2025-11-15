import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from "@mui/material/styles";
import { Grid, Stack, Typography, Avatar } from "@mui/material";
import { DashboardData } from "@/services/dashboardService";
import { IconArrowUpLeft } from "@tabler/icons-react";

import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

interface CreditDistributionProps {
  dashboardData: DashboardData;
}

const CreditDistribution: React.FC<CreditDistributionProps> = ({ dashboardData }) => {
  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = "#ecf2ff";
  const successlight = theme.palette.success.light;

  // chart
  const optionscolumnchart: any = {
    chart: {
      type: "donut",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: {
        show: false,
      },
      height: 155,
    },
    colors: [primary, primarylight, "#f44336"],
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

  // Datos reales del backend
  const totalCredits = dashboardData.activeCredits + dashboardData.pendingCredits + (dashboardData.overdueCredits || 0);
  const activePercentage = totalCredits > 0 ? Math.round((dashboardData.activeCredits / totalCredits) * 100) : 0;
  const seriescolumnchart: any = [dashboardData.activeCredits, dashboardData.pendingCredits, dashboardData.overdueCredits || 0];

  return (
    <DashboardCard title="Distribución de Créditos">
      <Grid container spacing={3}>
        {/* columna */}
        <Grid size={{ xs: 7, sm: 7 }}>
          <Typography variant="h3" fontWeight="700">
            {activePercentage}%
          </Typography>
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Avatar sx={{ bgcolor: successlight, width: 27, height: 27 }}>
              <IconArrowUpLeft width={20} color="#39B69A" />
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              +5%
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              desde el año pasado
            </Typography>
          </Stack>
          <Stack spacing={3} mt={5} direction="row">
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 9, height: 9, bgcolor: primary, svg: { display: "none" } }}></Avatar>
              <Typography variant="subtitle2" color="textSecondary">
                Activos
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 9, height: 9, bgcolor: primarylight, svg: { display: "none" } }}></Avatar>
              <Typography variant="subtitle2" color="textSecondary">
                Pendientes
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 9, height: 9, bgcolor: "#ffcdd2", svg: { display: "none" } }}></Avatar>
              <Typography variant="subtitle2" color="textSecondary">
                Vencidos
              </Typography>
            </Stack>
          </Stack>
        </Grid>
        {/* columna */}
        <Grid size={{ xs: 5,  sm:5}}>
          <Chart options={optionscolumnchart} series={seriescolumnchart} type="donut" height={130} width={"100%"} />
        </Grid>
      </Grid>
    </DashboardCard>
  );
};

export default CreditDistribution;
