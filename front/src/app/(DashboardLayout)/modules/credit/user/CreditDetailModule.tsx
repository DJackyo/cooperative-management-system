// src/modules/credit/CreditDetailModule.tsx
"use client";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Box, Skeleton, useMediaQuery, Button } from "@mui/material";
import AnimatedCard from "@/components/AnimatedCard";
import InfoTooltip from "@/components/InfoTooltip";
import { AttachMoney, CalendarToday, AccessTime, Person, BadgeOutlined } from "@mui/icons-material";
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

    return <Chart options={options} series={series} type="donut" width="250" />;
  }, []);

  const loadCreditData = useCallback(async () => {
    if (creditId) {
      setRefreshing(true);
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
        }
      } finally {
        setRefreshing(false);
      }
    }
  }, [userId, creditId, getGraficoPagos]); // 🔧 SOLUCIÓN: Agregar getGraficoPagos a las dependencias

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

  return (
    <Grid container spacing={3}>
      {/* Información de la Solicitud */}
      <Grid size={{ xs: 12, md: 5 }}>
        <AnimatedCard variant="outlined" sx={{ boxShadow: 3 }} animationType="fade" delay={0}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Información de la Solicitud
            </Typography>
            <Suspense fallback={<Skeleton variant="text" width="100%" />}>
              {userId > 0 && (
                <>
                  <Box>
                    <Typography variant="h6" sx={{ marginTop: 0.5, marginBottom: 0.5 }} display="flex" alignItems="center">
                      <Person sx={{ mr: 1 }} />
                      {userId} - {userInfo.nombres}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary" display="flex" alignItems="center">
                      <BadgeOutlined sx={{ mr: 1, display: "inline-flex" }} />
                      {userInfo.numeroDeIdentificacion}
                    </Typography>
                  </Box>
                </>
              )}
              {credit ? (
                <>
                  <Typography display="flex" alignItems="center">
                    <AttachMoney sx={{ mr: 1 }} />
                    <strong>Monto Solicitado: </strong>$ {formatCurrencyFixed(credit.monto)}
                  </Typography>
                  <Typography display="flex" alignItems="center">
                    <CalendarToday sx={{ mr: 1 }} />
                    <strong>Fecha de Solicitud: </strong>
                    {formatNameDate(credit.fechaSolicitud)}
                  </Typography>
                  <Typography display="flex" alignItems="center">
                    <AccessTime sx={{ mr: 1 }} />
                    <strong>Plazo: </strong>
                    {credit.plazoMeses} meses
                  </Typography>
                </>
              ) : (
                <Skeleton variant="text" width="100%" height={50} />
              )}
            </Suspense>
          </CardContent>
        </AnimatedCard>
      </Grid>

      {/* Información del Crédito */}
      <Grid size={{ xs: 12, md: 7 }}>
        <AnimatedCard variant="outlined" sx={{ boxShadow: 3 }} animationType="fade" delay={200}>
          <CardContent>
            <Suspense fallback={<Skeleton variant="text" width="100%" />}>
              {credit ? (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row", // Columna en móvil, fila en escritorio
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" color="primary" gutterBottom>
                        Información del Crédito
                      </Typography>
                      <Typography display="flex" alignItems="center">
                        <AttachMoney sx={{ mr: 1 }} />
                        <strong>Monto Pagado </strong> ${formatCurrencyFixed(valorPagado)}
                        <InfoTooltip title="Total de dinero que ya ha sido pagado del crédito" />
                      </Typography>
                      <Typography display="flex" alignItems="center">
                        <AttachMoney sx={{ mr: 1 }} />
                        <strong>Saldo Pendiente: </strong> ${formatCurrencyFixed(valorSaldoPendiente)}
                        <InfoTooltip title="Monto total que aún falta por pagar del crédito" />
                      </Typography>
                      <Typography display="flex" alignItems="center">
                        <CalendarToday sx={{ mr: 1 }} />
                        <strong> Fecha de Vencimiento: </strong>
                        {formatNameDate(credit.fechaVencimiento)}
                      </Typography>
                      <Typography display="flex" alignItems="center">
                        <AccessTime sx={{ mr: 1 }} /> <strong>Plazo Restante: </strong>
                        {valorCuotasPendiente} meses
                        <InfoTooltip title="Número de cuotas que aún faltan por pagar" />
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        paddingTop: 2,
                      }}
                    >
                      {graficoPagos}
                    </Box>
                  </Box>
                </>
              ) : (
                <Skeleton variant="text" width="100%" height={50} />
              )}
            </Suspense>
          </CardContent>
        </AnimatedCard>
      </Grid>
      {/* Gráfico de Pagos */}

      {/* Historial de pagos */}
      <Grid size={{ xs: 12, md: 12}}>
        <AnimatedCard variant="outlined" sx={{ boxShadow: 3 }} animationType="slide" delay={400}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" color="primary" gutterBottom>
                Historial de Pagos
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={loadCreditData}
                disabled={refreshing}
                startIcon={<IconRefresh />}
              >
                {refreshing ? "Actualizando..." : "Actualizar"}
              </Button>
            </Box>
            <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={300} />}>
              {credit ? (
                <PaymentHistoryTable 
                  presCuotas={credit.presCuotas ? credit.presCuotas : []} 
                  plazoMeses={credit.plazoMeses ? credit.plazoMeses : 10} 
                  creditId={creditId}
                  onPaymentSuccess={loadCreditData}
                />
              ) : (
                <></>
              )}
            </Suspense>
          </CardContent>
        </AnimatedCard>
      </Grid>
    </Grid>
  );
};

export default CreditDetailModule;
