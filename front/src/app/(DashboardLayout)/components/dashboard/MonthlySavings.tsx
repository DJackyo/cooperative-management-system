import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Fab } from '@mui/material';
import { IconArrowUpRight, IconCurrencyDollar } from '@tabler/icons-react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

const MonthlySavings = () => {
  // chart color
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const secondarylight = '#f5fcff';
  const successlight = '#e8f5e9';

  // chart
  const optionscolumnchart: any = {
    chart: {
      type: 'area',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 60,
      sparkline: {
        enabled: true,
      },
      group: 'sparklines',
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      colors: [secondarylight],
      type: 'solid',
      opacity: 0.05,
    },
    markers: {
      size: 0,
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
    },
  };
  
  // Datos mockeados para el crecimiento de ahorros
  const seriescolumnchart: any = [
    {
      name: '',
      color: secondary,
      data: [1500, 2000, 1700, 2200, 2500, 3000, 4000],
    },
  ];

  return (
    <DashboardCard
      title="Crecimiento de Ahorros Mensuales"
      action={
        <Fab color="secondary" size="medium" sx={{color: '#ffffff'}}>
          <IconCurrencyDollar width={24} />
        </Fab>
      }
      footer={
        <Chart options={optionscolumnchart} series={seriescolumnchart} type="area" height={60} width={"100%"} />
      }
    >
      <>
        <Typography variant="h3" fontWeight="700" mt="-20px">
          $22,000
        </Typography>
        <Stack direction="row" spacing={1} my={1} alignItems="center">
          <Avatar sx={{ bgcolor: successlight, width: 27, height: 27 }}>
            <IconArrowUpRight width={20} color="#4CAF50" />
          </Avatar>
          <Typography variant="subtitle2" fontWeight="600">
            +15%
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            desde el año pasado
          </Typography>
        </Stack>
      </>
    </DashboardCard>
  );
};

export default MonthlySavings;
