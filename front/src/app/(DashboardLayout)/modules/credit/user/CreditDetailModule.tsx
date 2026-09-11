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
  ArrowBack,
  Shield,
  EventAvailable,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
import {
  defaultLoggedUser,
  formatCurrencyFixed,
  formatNameDate,
  roleAdmin,
  validateRoles,
} from "@/app/(DashboardLayout)/utilities/utils";
import { authService } from "@/app/authentication/services/authService";
import { Asociado, LoggedUser } from "@/interfaces/User";
import { Cuota, Prestamo } from "@/interfaces/Prestamo";
import { creditsService } from "@/services/creditRequestService";
import { useRouter } from "next/navigation";
import { setupAxiosInterceptors } from "@/services/axiosClient";
import { IconRefresh, IconCalculator } from "@tabler/icons-react";

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
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calcularSaldoYPendientes = useCallback((cuotas: Cuota[]) => {
    const saldoPendiente = cuotas
      .filter((cuota) => cuota.estado === "PENDIENTE")
      .reduce((total, cuota) => total + (Number(cuota.monto) || 0), 0);

    const cuotasPendientes = cuotas.filter(
      (cuota) => cuota.estado === "PENDIENTE"
    ).length;

    const totalPagadoReal = cuotas
      .filter((cuota) => cuota.estado === "PAGADO")
      .reduce((total, cuota) => {
        if (cuota.presPagos && cuota.presPagos.length > 0) {
          const pagoSuma = cuota.presPagos.reduce((pSum: number, p: any) => {
            const val = Number(p.totalPagado) || Number(p.montoPagado) || 
              ((Number(p.abonoCapital) || 0) + (Number(p.intereses) || 0) + (Number(p.proteccionCartera) || 0) + (Number(p.mora) || 0) + (Number(p.abonoExtra) || 0));
            return pSum + val;
          }, 0);
          return total + (pagoSuma > 0 ? pagoSuma : (Number(cuota.monto) || 0) + (Number(cuota.abonoExtra) || 0));
        }
        return total + (Number(cuota.monto) || 0) + (Number(cuota.abonoExtra) || 0);
      }, 0);

    return { saldoPendiente, cuotasPendientes, totalPagadoReal };
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

          const { saldoPendiente, cuotasPendientes, totalPagadoReal } = calcularSaldoYPendientes(
            response[0].presCuotas || []
          );
          setSaldoPendiente(saldoPendiente);
          setCuotasPendiente(cuotasPendientes);
          setValorPagado(totalPagadoReal);
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
  }, [userId, creditId, calcularSaldoYPendientes]);

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

  const userRoles = authService.getUserRoles();
  const isUserAdmin = validateRoles(roleAdmin, userRoles);

  const tienePagosRegistrados = credit?.presCuotas?.some(
    (cuota) =>
      cuota.estado === "PAGADO" ||
      (cuota.presPagos && cuota.presPagos.length > 0)
  );

  const handleRecalculateCuotas = async () => {
    if (!credit) return;
    const result = await Swal.fire({
      title: "¿Recalcular Cuotas?",
      text: `Se volverán a generar las cuotas del préstamo #${credit.id} con los valores actuales (monto, plazo, tasa y protección de cartera). Esta opción solo aplica si no hay pagos registrados.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, Recalcular",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Procesando...",
          text: "Recalculando cuotas del crédito",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await creditsService.recalcularCuotas(credit.id);

        await Swal.fire({
          title: "¡Cuotas Recalculadas!",
          text: `Las cuotas del préstamo #${credit.id} han sido recalculadas exitosamente.`,
          icon: "success",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#4caf50",
        });

        await loadCreditData();
      } catch (error: any) {
        console.error("Error al recalcular cuotas:", error);
        Swal.fire({
          title: "Error",
          text: error.message || "No se pudieron recalcular las cuotas.",
          icon: "error",
          confirmButtonText: "Entendido",
        });
      }
    }
  };

  const progressPercent =
    credit && Number(credit.monto) > 0
      ? (
          valorCuotasPendiente === 0 && valorSaldoPendiente === 0 && tienePagosRegistrados
            ? "100.0"
            : Math.min(100, Math.max(0, (valorPagado / (valorPagado + valorSaldoPendiente || Number(credit.monto))) * 100)).toFixed(1)
        )
      : "0";

  const porcentajeProteccion = credit?.porcentajeProteccionCartera
    ? (credit.porcentajeProteccionCartera < 1
        ? Number((credit.porcentajeProteccionCartera * 100).toFixed(2))
        : credit.porcentajeProteccionCartera)
    : 0.1;

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
          <Alert severity="error" sx={{ fontSize: 13 }} action={
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

      {/* Resumen principal del crédito */}
      {credit && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2.25 },
            mb: 2,
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "primary.light",
            background: "linear-gradient(120deg, #eef4ff 0%, #ffffff 72%)",
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
            <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
              <Avatar sx={{ bgcolor: "primary.main", width: 44, height: 44 }}>
                <AttachMoney />
              </Avatar>
              <Box minWidth={0}>
                <Typography variant="overline" color="text.secondary" fontWeight={700} lineHeight={1.2}>
                  Detalle del crédito #{credit.id}
                </Typography>
                <Typography variant="h6" fontWeight={800} noWrap>
                  {userInfo.nombres || "Asociado"}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {userInfo.numeroDeIdentificacion || "Identificación no disponible"}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip
                size="small"
                label={credit.estado || "En proceso"}
                color={
                  credit.estado === "APROBADO"
                    ? "success"
                    : credit.estado === "FINALIZADO"
                    ? "info"
                    : "default"
                }
                sx={{ fontWeight: 700 }}
              />
              {isUserAdmin &&
                credit.presCuotas &&
                credit.presCuotas.length > 0 &&
                !tienePagosRegistrados && (
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    startIcon={<IconCalculator size={16} />}
                    onClick={handleRecalculateCuotas}
                    sx={{ textTransform: "none" }}
                  >
                    Recalcular cuotas
                  </Button>
                )}
              <Button
                size="small"
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => router.back()}
                sx={{ textTransform: "none" }}
              >
                Volver
              </Button>
            </Stack>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1, sm: 3 }} mt={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">Monto solicitado</Typography>
              <Typography variant="h6" fontWeight={800}>${formatCurrencyFixed(credit.monto)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Plazo</Typography>
              <Typography variant="h6" fontWeight={800}>{credit.plazoMeses} meses</Typography>
            </Box>
            <Box flex={1} minWidth={180}>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" color="text.secondary">Progreso de pago</Typography>
                <Typography variant="caption" fontWeight={800}>{progressPercent}%</Typography>
              </Stack>
            <LinearProgress
              variant="determinate"
              value={Number(progressPercent)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "primary.100",
              }}
            />
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Grid con 2 columnas: Info + Estado */}
      <Grid container spacing={1}>
        {/* Columna izquierda: Usuario + Crédito */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1.5, border: "1px solid", borderColor: "divider", height: "100%" }}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CalendarToday sx={{ fontSize: 16, color: "primary.main" }} />
                <Typography variant="caption" fontWeight={600}>Datos del crédito</Typography>
              </Stack>
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Cuota mensual
                </Typography>
                <Typography variant="body2" fontWeight={700} noWrap>
                  ${formatCurrencyFixed(credit?.cuotaMensual || 0)}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 4 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Percent sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">Tasa de interés</Typography>
                </Stack>
                <Typography variant="body2" fontWeight={700} noWrap>
                  {credit
                    ? `${(
                        parseFloat(
                          (credit as any).tasa || credit.idTasa?.tasa || "0"
                        ) * 100
                      ).toFixed(2)}%${
                        credit.idTasa?.anio ? ` [${credit.idTasa.anio}]` : ""
                      }`
                    : "-"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 4 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Shield sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">Protección de cartera</Typography>
                </Stack>
                <Typography variant="body2" fontWeight={700} noWrap>
                  {credit?.aplicaProteccionCartera !== false
                    ? `Aplica (${porcentajeProteccion}%)`
                    : "No aplica"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 4 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <CalendarToday sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">Fecha de solicitud</Typography>
                </Stack>
                <Typography variant="body2" fontWeight={700} noWrap>
                  {credit?.fechaSolicitud ? formatNameDate(credit.fechaSolicitud) : "Sin fecha"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 4 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <EventAvailable sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">Fecha de desembolso</Typography>
                </Stack>
                <Typography variant="body2" fontWeight={700} noWrap>
                  {credit?.fechaDesembolso ? formatNameDate(credit.fechaDesembolso) : "No desembolsado"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 4 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <BadgeOutlined sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">Identificación</Typography>
                </Stack>
                <Typography variant="body2" fontWeight={700} noWrap>
                  {userInfo.numeroDeIdentificacion || "Sin identificación"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Columna derecha: resumen financiero */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
            }}
          >
            <Typography variant="subtitle2" fontWeight={800} mb={1.25}>
              Resumen de pagos
            </Typography>
            <Stack spacing={1.25}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
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
                  label="Cuotas pendientes"
                  value={valorCuotasPendiente}
                  icon={<ReceiptLong sx={{ fontSize: 14 }} />}
                  color="#3b82f6"
                />
              </Stack>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Distribución del saldo
                  </Typography>
                  <Typography variant="caption" fontWeight={700}>
                    {valorPagado + valorSaldoPendiente > 0
                      ? `${((valorPagado / (valorPagado + valorSaldoPendiente)) * 100).toFixed(0)}% pagado`
                      : "Sin movimientos"}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    display: "flex",
                    height: 10,
                    overflow: "hidden",
                    borderRadius: 5,
                    bgcolor: "#f59e0b20",
                  }}
                  aria-label="Distribución entre monto pagado y pendiente"
                >
                  <Box
                    sx={{
                      width: `${valorPagado + valorSaldoPendiente > 0 ? (valorPagado / (valorPagado + valorSaldoPendiente)) * 100 : 0}%`,
                      bgcolor: "#10b981",
                      transition: "width 0.4s ease",
                    }}
                  />
                </Box>
                <Stack direction="row" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="success.main">Pagado</Typography>
                  <Typography variant="caption" color="warning.dark">Pendiente</Typography>
                </Stack>
              </Box>
            </Stack>
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
                  creditData={credit}
                  userInfo={userInfo}
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