import React from "react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface SavingsTransactionsCardProps {
  savingsTransactions?: number[];
  savingsLabels?: string[];
  savingsContributions?: number[];
  savingsWithdrawals?: number[];
  /** Agrupamiento de los datos: por mes (año seleccionado) o por año (histórico). */
  groupBy?: "month" | "year";
  /** Ahorro total del período (para el encabezado). */
  total?: number;
  /** Etiqueta del período analizado (ej: "Año 2024" o "Histórico completo"). */
  periodLabel?: string;
}

const SavingsTransactionsCard = ({
  savingsTransactions = [],
  savingsLabels = [],
  savingsContributions,
  savingsWithdrawals = [],
  groupBy = "year",
  total,
  periodLabel,
}: SavingsTransactionsCardProps) => {
  const chartTitle =
    groupBy === "month"
      ? `Aportes mensuales${periodLabel ? ` · ${periodLabel}` : ""}`
      : `Aportes por año${periodLabel ? ` · ${periodLabel}` : ""}`;

  const totalLabel =
    typeof total === "number"
      ? `Saldo neto: $${total.toLocaleString("es-CO")}`
      : undefined;
  const contributionValues =
    savingsContributions ?? savingsTransactions.map((value) => Math.max(value, 0));
  const withdrawalValues =
    savingsWithdrawals.length > 0
      ? savingsWithdrawals
      : savingsContributions
        ? []
        : savingsTransactions.map((value) => Math.max(-value, 0));
  const hasWithdrawals = withdrawalValues.some((value) => value > 0);

  // chart
  const optionscolumnchart: any = {
    chart: {
      type: "bar",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: {
        show: false,
      },
      height: 270,
    },
    colors: ["#13b8a6", "#ef6c5b"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "48%",
        borderRadius: [6],
        borderRadiusApplication: "end",
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
      show: hasWithdrawals,
      position: "top",
      horizontalAlign: "right",
      markers: {
        radius: 12,
      },
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
      min: 0,
      labels: {
        formatter: (value: number) => `$${Math.round(value).toLocaleString("es-CO")}`,
      },
    },
    xaxis: {
      categories: savingsLabels.length > 0 ? savingsLabels : ["Sin datos"],
      axisBorder: {
        show: false,
      },
    },
    tooltip: {
      theme: "dark",
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => `$${Math.round(value).toLocaleString("es-CO")}`,
      },
    },
  };

  const seriescolumnchart: { name: string; data: number[] }[] = [
    {
      name: "Aportes",
      data: contributionValues.length > 0 ? contributionValues : [0],
    },
  ];
  if (hasWithdrawals) {
    seriescolumnchart.push({
      name: "Retiros",
      data: withdrawalValues,
    });
  }

  return (
    <DashboardCard
      title={chartTitle}
      subtitle={totalLabel}
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
