// src/modules/credit/CreditDetailModule.tsx
"use client";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Box, Skeleton, useMediaQuery, Button, Paper, CircularProgress, LinearProgress, Chip, Divider, Alert } from "@mui/material";
import InfoTooltip from "@/components/InfoTooltip";
import { AttachMoney, CalendarToday, AccessTime, Person, BadgeOutlined, TrendingUp, CheckCircle, Warning } from "@mui/icons-material";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
import { defaultLoggedUser, formatCurrencyFixed, formatNameDate } from "@/app/(DashboardLayout)/utilities/utils";
import { authService } from "@/app/authentication/services/authService";
import { Asociado, LoggedUser } from "@/interfaces/User";
import { Cuota, Prestamo } from "@/interfaces/Prestamo";
import { creditsService } from "@/services/creditRequestService";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useRouter } from "next/navigation";
import { setupAxiosInterceptors } from "@/services/axiosClient";
import { IconRefresh } from "@tabler/icons-react";

// Usar `dynamic` para cargar el componente de forma dinámica solo en el cliente.
const PaymentHistoryTable = dynamic(() => import("../components/PaymentHistoryTable"), { ssr: false });

interface CreditDetailModuleProps {
  userId: number;
  creditId: number;
}

const CreditDetailModule: React.FC<CreditDetailModuleProps> = ({ userId, creditId }) => {
  const router = useRouter();
  // Estado para el usuario actual
  const [currentUser, setCurrentUser] = useState<LoggedUser>(defaultLoggedUser);
  const [credit, setCredit] = useState<Prestamo>();
  const [userInfo, setUserInfo] = useState<Asociado>({
    id: 0,
    nombres: "",
    numeroDeIdentificacion: "",
    idEstado: {
      id: 1,
      estado: "",
    },
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
      chart: { type: "donut" },
      labels: ["Pagado", "Pendiente"],
      colors: ["#00C49F", "#FF8042"],
    };

    const series = [montoPagado, montoPendiente];
    setValorPagado(montoPagado);

    return <Chart options={options} series={series} type="donut" width="230" />;
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

          const { saldoPendiente, cuotasPendientes } = calcularSaldoYPendientes(response[0].presCuotas);
          setSaldoPendiente(saldoPendiente);
          setCuotasPendiente(cuotasPendientes);
          setGraficoPagos(getGraficoPagos(response[0].presCuotas));
        } else {
          setError('No se encontró información del crédito');
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar la información del crédito');
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del crédito',
        });
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    }
  }, [userId, creditId, getGraficoPagos]);

  const calcularSaldoYPendientes = (cuotas: Cuota[]) => {
    const saldoPendiente = cuotas.filter((cuota) => cuota.estado === "PENDIENTE").reduce((total, cuota) => total + cuota.monto, 0);

    const cuotasPendientes = cuotas.filter((cuota) => cuota.estado === "PENDIENTE").length;

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

  const isMobile = useMediaQuery("(max-width:600px)");

  // Calcular porcentaje de progreso
  const progressPercent = credit && credit.monto > 0 
    ? ((valorPagado / credit.monto) * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">Cargando información del crédito...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadCreditData}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', overflowX: 'hidden', maxWidth: isMobile ? '99%' : 'calc(99% - 40px)', padding: isMobile ? 2 : 3 }}>
      {refreshing && (
        <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }} />
      )}
      <Grid container spacing={3} sx={{ width: '100%', margin: 0 }}>
        {/* Información del Usuario */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }, width: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <Person sx={{ color: "primary.main", fontSize: 30 }} />
                <Typography variant="h5" color="primary">
                  Información del Usuario
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {userId > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography variant="body1" color="text.secondary" sx={{ minWidth: { xs: 'auto', sm: 130 } }}>
                      <strong>Nombre:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{userInfo.nombres}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <BadgeOutlined sx={{ color: "primary.main" }} />
                    <Typography variant="body1" color="text.secondary" sx={{ minWidth: { xs: 'auto', sm: 115 } }}>
                      <strong>Identificación:</strong>
                    </Typography>
                    <Typography variant="body1">{userInfo.numeroDeIdentificacion}</Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Paper>
        </Grid>

        {/* Información de la Solicitud */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }, width: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <AttachMoney sx={{ color: "success.main", fontSize: 30 }} />
                <Typography variant="h5" color="primary">
                  Información del Crédito
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {credit ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <AttachMoney sx={{ color: "success.main" }} />
                    <Typography variant="body1" color="text.secondary" sx={{ minWidth: { xs: 'auto', sm: 130 } }}>
                      <strong>Monto:</strong>
                    </Typography>
                    <Chip 
                      label={`$${formatCurrencyFixed(credit.monto)}`} 
                      color="success" 
                      size="small"
                    />
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <CalendarToday sx={{ color: "primary.main" }} />
                    <Typography variant="body1" color="text.secondary" sx={{ minWidth: { xs: 'auto', sm: 130 } }}>
                      <strong>Fecha Solicitud:</strong>
                    </Typography>
                    <Typography variant="body1">{formatNameDate(credit.fechaSolicitud)}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <AccessTime sx={{ color: "primary.main" }} />
                    <Typography variant="body1" color="text.secondary" sx={{ minWidth: { xs: 'auto', sm: 130 } }}>
                      <strong>Plazo:</strong>
                    </Typography>
                    <Chip 
                      label={`${credit.plazoMeses} meses`} 
                      color="primary" 
                      size="small"
                    />
                  </Box>
                </Box>
              ) : (
                <Skeleton variant="text" width="100%" height={80} />
              )}
            </CardContent>
          </Paper>
        </Grid>
        {/* Estado del Crédito y Gráfico */}
        <Grid size={{ xs: 12, md: 12 }}>
          <Paper elevation={3} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }, width: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUp sx={{ color: "primary.main", fontSize: 30 }} />
                  <Typography variant="h5" color="primary">
                    Estado del Crédito
                  </Typography>
                </Box>
                {credit && (
                  <Chip 
                    icon={progressPercent === '100.0' ? <CheckCircle /> : <Warning />}
                    label={`${progressPercent}% Completado`}
                    color={progressPercent === '100.0' ? "success" : Number(progressPercent) > 50 ? "primary" : "warning"}
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Suspense fallback={<Skeleton variant="text" width="100%" />}>
                {credit ? (
                  <>
                    {/* Barra de progreso */}
                    <Box sx={{ mb: 3, width: '100%' }}>
                      <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }} flexWrap="wrap">
                        <Typography variant="body2" color="text.secondary">Progreso del pago</Typography>
                        <Typography variant="body2" fontWeight="bold">{progressPercent}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Number(progressPercent)} 
                        sx={{ 
                          height: 10, 
                          borderRadius: 5,
                          backgroundColor: '#e0e0e0',
                          width: '100%',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            background: Number(progressPercent) === 100 
                              ? 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)'
                              : 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)'
                          }
                        }} 
                      />
                    </Box>
                    <Grid container spacing={3} alignItems="center">
                      <Grid size={{ xs: 12, md: 8 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, width: '100%' }}>
                          <Paper elevation={1} sx={{ p: 2, backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50', width: '100%' }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <CheckCircle sx={{ color: "success.main" }} />
                                <Typography variant="body1" color="text.secondary">
                                  <strong>Monto Pagado</strong>
                                </Typography>
                                <InfoTooltip title="Total de dinero que ya ha sido pagado del crédito" />
                              </Box>
                              <Typography variant="h6" color="success.main" fontWeight="bold">
                                ${formatCurrencyFixed(valorPagado)}
                              </Typography>
                            </Box>
                          </Paper>
                          <Paper elevation={1} sx={{ p: 2, backgroundColor: '#fff3e0', borderLeft: '4px solid #ff9800', width: '100%' }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Warning sx={{ color: "warning.main" }} />
                                <Typography variant="body1" color="text.secondary">
                                  <strong>Saldo Pendiente</strong>
                                </Typography>
                                <InfoTooltip title="Monto total que aún falta por pagar del crédito" />
                              </Box>
                              <Typography variant="h6" color="warning.main" fontWeight="bold">
                                ${formatCurrencyFixed(valorSaldoPendiente)}
                              </Typography>
                            </Box>
                          </Paper>
                          {/* <Paper elevation={1} sx={{ p: 2, backgroundColor: '#e3f2fd', borderLeft: '4px solid #1976d2', width: '100%' }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <AccessTime sx={{ color: "primary.main" }} />
                                <Typography variant="body1" color="text.secondary">
                                  <strong>Cuotas Restantes</strong>
                                </Typography>
                                <InfoTooltip title="Número de cuotas que aún faltan por pagar" />
                              </Box>
                              <Chip 
                                label={`${valorCuotasPendiente} cuotas`}
                                color="primary"
                                sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                              />
                            </Box>
                          </Paper> */}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: '100%', width: '100%' }}>
                          <Paper elevation={2} sx={{ p: 2, borderRadius: 2, maxWidth: '100%' }}>
                            {graficoPagos}
                          </Paper>
                        </Box>
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <Skeleton variant="rectangular" width="100%" height={150} />
                )}
              </Suspense>
            </CardContent>
          </Paper>
        </Grid>
        {/* Historial de pagos */}
        <Grid size={{ xs: 12 }}>
          <Paper elevation={3} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }, width: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday sx={{ color: "primary.main", fontSize: 30 }} />
                  <Typography variant="h5" color="primary">
                    Historial de Pagos
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={loadCreditData} 
                  disabled={refreshing} 
                  startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <IconRefresh />}
                  sx={{ minWidth: 140 }}
                >
                  {refreshing ? "Actualizando..." : "Actualizar"}
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={300} />}>
                  {credit ? (
                    <PaymentHistoryTable 
                      presCuotas={credit.presCuotas ? credit.presCuotas : []} 
                      plazoMeses={credit.plazoMeses ? credit.plazoMeses : 10} 
                      creditId={creditId} 
                      onPaymentSuccess={loadCreditData} 
                    />
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Alert severity="info">
                        No se encontró información del crédito
                      </Alert>
                    </Box>
                  )}
                </Suspense>
              </Box>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreditDetailModule;
