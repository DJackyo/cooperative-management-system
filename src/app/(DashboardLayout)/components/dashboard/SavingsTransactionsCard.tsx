import React from "react";
import { Select, MenuItem } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const SavingsTransactionsCard = () => {
  // select
  const [month, setMonth] = React.useState("1");

  const handleChange = (event: any) => {
    setMonth(event.target.value);
  };

  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  // chart
  const optionscolumnchart: any = {
    chart: {
      type: "bar",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: {
        show: true,
      },
      height: 270,
    },
    colors: [primary, secondary],
    plotOptions: {
      bar: {
        horizontal: false,
        barHeight: "60%",
        columnWidth: "42%",
        borderRadius: [6],
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "all",
      },
    },
    stroke: {
      show: true,
      width: 5,
      lineCap: "butt",
      colors: ["transparent"],
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    grid: {
      borderColor: "rgba(0,0,0,0.1)",
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    yaxis: {
      tickAmount: 4,
    },
    xaxis: {
      categories: [
        "16/08",
        "17/08",
        "18/08",
        "19/08",
        "20/08",
        "21/08",
        "22/08",
        "23/08",
      ],
      axisBorder: {
        show: false,
      },
    },
    tooltip: {
      theme: "dark",
      fillSeriesColor: false,
    },
  };

  const seriescolumnchart: any = [
    {
      name: "Cuota de Ahorro",
      data: [355, 390, 300, 350, 390, 180, 355, 390],
    },
    {
      name: "Cuota de Crédito",
      data: [280, 250, 325, 215, 250, 310, 280, 250],
    },
  ];

  return (
    <DashboardCard
      title="Ahorros en los últimos 6 meses"
      // action={
      //   <Select
      //     labelId="month-dd"
      //     id="month-dd"
      //     value={month}
      //     size="small"
      //     onChange={handleChange}
      //   >
      //     <MenuItem value={1}>Marzo 2023</MenuItem>
      //     <MenuItem value={2}>Abril 2023</MenuItem>
      //     <MenuItem value={3}>Mayo 2023</MenuItem>
      //   </Select>
      // }
    >
      <Chart
        options={optionscolumnchart}
        series={seriescolumnchart}
        type="bar"
        height={270}
        width={"100%"}
      />
    </DashboardCard>
  );
};

export default SavingsTransactionsCard;
