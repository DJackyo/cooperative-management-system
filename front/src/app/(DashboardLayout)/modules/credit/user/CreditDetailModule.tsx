// src/modules/credit/CreditDetailModule.tsx
"use client";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Box,
  Skeleton,
  Button,
  Paper,
  CircularProgress,
  LinearProgress,
  Chip,
  Divider,
  Alert,
  Avatar,
  Stack,
  Fade,
  Tooltip,
} from "@mui/material";
import InfoTooltip from "@/components/InfoTooltip";
import {
  AttachMoney,
  CalendarToday,
  Person,
  BadgeOutlined,
  TrendingUp,
  CheckCircle,
  Warning,
  ReceiptLong,
  Percent,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
import {
  defaultLoggedUser,
  formatCurrencyFixed,
  formatNameDate,
} from "@/app/(DashboardLayout)/utilities/utils";
import { authService } from "@/app/authentication/services/authService";
import { Asociado, LoggedUser } from "@/interfaces/User";
import { Cuota, Prestamo } from "@/interfaces/Prestamo";
import { creditsService } from "@/services/creditRequestService";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useRouter } from "next/navigation";
import { setupAxiosInterceptors } from "@/services/axiosClient";
import { IconRefresh } from "@tabler/icons-react";

const PaymentHistoryTable = dynamic(
  () => import("../components/PaymentHistoryTable"),
  { ssr: false }
);

interface CreditDetailModuleProps {
  userId: number;
  creditId: number;
}

// Ultra compact stat item
const StatItem: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      p: 0.5,
      borderRadius: 1,
      flex: 1,
      minWidth: 0,
    }}
  >
    <Box sx={{ color, display: "flex", alignItems: "center" }}>{icon}</Box>
    <Box sx={{ minWidth: 0, lineHeight: 1.2 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.3 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: 13 }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const CreditDetailModule: React.FC<CreditDetailModuleProps> = ({
  userId,
  creditId,
}) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<LoggedUser>(defaultLoggedUser);
  const [credit, setCredit] = useState<Prestamo>();
  const [userInfo, setUserInfo] = useState<Asociado>({
    id: 0,
    nombres: "",
    numeroDeIdentificacion: "",
    idEstado: { id: 1, estado: "" },
  });
  const [valorSaldoPendiente, setSaldoPendiente] = useState<number>(0);
  const [valorCuotasPendiente, setCuotasPendiente] = useState<number>(0);
  const [valorPagado, setValorPagado] = useState<number>(0);
  const [graficoPagos, setGraficoPagos] = useState<React.ReactNode | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getGraficoPagos = useCallback((cuotas: Cuota[]) => {
    const totalMonto = cuotas.reduce((sum, cuota) => sum + cuota.monto, 0);
    const montoPendiente = calcularSaldoYPendientes(cuotas).saldoPendiente;
    const montoPagado = totalMonto - montoPendiente;

    const options: ApexOptions = {
      chart: { 
        type: "donut", 
        animations: { enabled: true, speed: 500 },
        sparkline: { enabled: true },
      },
      labels: ["Pagado", "Pendiente"],
      colors: ["#10b981", "#f59e0b"],
      legend: { show: false },
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            size: "75%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "",
                fontSize: "10px",
                fontWeight: 700,
                color: "#1e293b",
                formatter: (w) =>
                  formatCurrencyFixed(
                    w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                  ),
              },
            },
          },
        },
      },
      tooltip: { enabled: false },
    };

    const series = [montoPagado, montoPendiente];
    setValorPagado(montoPagado);

    return <Chart options={options} series={series} type="donut" width="100%" height={100} />;
  }, []);

  const loadCreditData = useCallback(async () => {
    if (creditId) {
      setRefreshing(true);
      setError(null);
      try {
        const response = await creditsService.fetchByFilters({
          creditId: creditId,
          userId: userId,
        });
        if (response.length > 0) {
          setCredit(response[0]);
          setUserInfo(response[0].idAsociado);

          const { saldoPendiente, cuotasPendientes } = calcularSaldoYPendientes(
            response[0].presCuotas
          );
          setSaldoPendiente(saldoPendiente);
          setCuotasPendiente(cuotasPendientes);
          setGraficoPagos(getGraficoPagos(response[0].presCuotas));
        } else {
          setError("No se encontró información del crédito");
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setError("Error al cargar la información del crédito");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar la información del crédito",
        });
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    }
  }, [userId, creditId, getGraficoPagos]);

  const calcularSaldoYPendientes = (cuotas: Cuota[]) => {
    const saldoPendiente = cuotas
      .filter((cuota) => cuota.estado === "PENDIENTE")
      .reduce((total, cuota) => total + cuota.monto, 0);
    const cuotasPendientes = cuotas.filter(
      (cuota) => cuota.estado === "PENDIENTE"
    ).length;
    return { saldoPendiente, cuotasPendientes };
  };

  const fetchData = useCallback(async () => {
    const hasSession = authService.isAuthenticated();
    if (hasSession) {
      const user = await authService.getCurrentUserData();
      setCurrentUser(user);
      loadCreditData();
    }
  }, [loadCreditData]);

  useEffect(() => {
    setupAxiosInterceptors(router);
    fetchData();
  }, [fetchData, router]);

  const progressPercent =
    credit && Number(credit.monto) > 0
      ? ((valorPagado / Number(credit.monto)) * 100).toFixed(1)
      : "0";

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
        <CircularProgress size={32} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Fade in>
        <Box sx={{ p: 1.5, maxWidth: 400, mx: "auto" }}>
          <Alert severity="error" size="small" action={
            <Button color="inherit" size="small" onClick={loadCreditData}>
              Reintentar
            </Button>
          }>
            {error}
          </Alert>
        </Box>
      </Fade>
    );
  }

  return (
    <Box sx={{ position: "relative", px: { xs: 0.5, sm: 1 } }}>
      {refreshing && (
        <LinearProgress sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, height: 1.5 }} />
      )}

      {/* Header ultra compacto - una sola línea */}
      {credit && (
        <Paper
          elevation={0}
          sx={{
            p: 1,
            mb: 1,
            borderRadius: 1.5,
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 15 }}>
              ${formatCurrencyFixed(credit.monto)}
            </Typography>
            <Chip
              size="small"
              label={`${credit.plazoMeses}m`}
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", height: 20, fontSize: 10 }}
            />
            <Chip
              size="small"
              label={`${progressPercent}%`}
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", height: 20, fontSize: 10 }}
            />
          </Stack>
          <Box sx={{ width: 80 }}>
            <LinearProgress
              variant="determinate"
              value={Number(progressPercent)}
              sx={{
                height: 3,
                borderRadius: 1.5,
                bgcolor: "rgba(255,255,255,0.2)",
                "& .MuiLinearProgress-bar": { bgcolor: "white" },
              }}
            />
          </Box>
        </Paper>
      )}

      {/* Grid con 2 columnas: Info + Estado */}
      <Grid container spacing={1}>
        {/* Columna izquierda: Usuario + Crédito */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Person sx={{ fontSize: 16, color: "primary.main" }} />
                <Typography variant="caption" fontWeight={600}>Usuario</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                {userInfo.nombres}
              </Typography>
            </Stack>
            <Divider sx={{ mb: 1 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Box display="flex" alignItems="center" gap={0.5}>
                <BadgeOutlined sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">ID:</Typography>
                <Typography variant="caption" fontWeight={500}>{userInfo.numeroDeIdentificacion}</Typography>
              </Box>
              {credit && (
                <>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CalendarToday sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">Fecha:</Typography>
                    <Typography variant="caption" fontWeight={500}>{formatNameDate(credit.fechaSolicitud)}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <AttachMoney sx={{ fontSize: 14, color: "success.main" }} />
                    <Typography variant="caption" fontWeight={600} color="success.main">
                      ${formatCurrencyFixed(credit.monto)}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Columna derecha: Estado + Gráfico en una sola fila */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              gap: 1,
              height: "100%",
              minHeight: 70,
            }}
          >
            {/* Stats en línea */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
              <StatItem
                label="Pagado"
                value={`$${formatCurrencyFixed(valorPagado)}`}
                icon={<CheckCircle sx={{ fontSize: 14 }} />}
                color="#10b981"
              />
              <StatItem
                label="Pendiente"
                value={`$${formatCurrencyFixed(valorSaldoPendiente)}`}
                icon={<Warning sx={{ fontSize: 14 }} />}
                color="#f59e0b"
              />
              <StatItem
                label="Cuotas"
                value={valorCuotasPendiente}
                icon={<ReceiptLong sx={{ fontSize: 14 }} />}
                color="#3b82f6"
              />
            </Box>

            {/* Gráfico mini */}
            <Box sx={{ width: 80, flexShrink: 0 }}>{graficoPagos}</Box>
          </Paper>
        </Grid>

        {/* Historial - Ocupa todo el ancho */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <ReceiptLong sx={{ fontSize: 16, color: "primary.main" }} />
                <Typography variant="caption" fontWeight={600}>Pagos</Typography>
                {credit && (
                  <Chip
                    size="small"
                    label={`${credit.presCuotas?.filter(c => c.estado === "PAGADO").length || 0}/${credit.presCuotas?.length || 0}`}
                    sx={{ height: 16, fontSize: 9 }}
                  />
                )}
              </Stack>
              <Button
                size="small"
                variant="text"
                onClick={loadCreditData}
                disabled={refreshing}
                sx={{ textTransform: "none", minWidth: 0, p: 0.5 }}
              >
                {refreshing ? <CircularProgress size={14} /> : <IconRefresh size={14} />}
              </Button>
            </Stack>
            <Divider sx={{ mb: 1 }} />

            <Suspense fallback={<Skeleton variant="rectangular" height={120} />}>
              {credit ? (
                <PaymentHistoryTable
                  presCuotas={credit.presCuotas || []}
                  plazoMeses={credit.plazoMeses || 10}
                  creditId={creditId}
                  idAsociado={userInfo.id}
                  onPaymentSuccess={loadCreditData}
                />
              ) : (
                <Alert severity="info" sx={{ py: 0.5, fontSize: 12 }}>
                  No se encontró información
                </Alert>
              )}
            </Suspense>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreditDetailModule;