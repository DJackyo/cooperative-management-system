// src/modules/credit/CreditDetailModule.tsx
"use client";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Box, Skeleton, useMediaQuery, Button } from "@mui/material";
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

    return <Chart options={options} series={series} type="donut" width="230" />;
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
      {/* Información del Usuario */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card variant="outlined" sx={{ boxShadow: 3, height: "fit-content" }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Información del Usuario
            </Typography>
            <Suspense fallback={<Skeleton variant="text" width="100%" />}>
              {userId > 0 && (
                <>
                  <Typography variant="body1" sx={{ mb: 1 }} display="flex" alignItems="center">
                    <Person sx={{ mr: 1, color: "primary.main" }} />
                    <strong>Nombre:</strong>&nbsp;{userInfo.nombres}
                  </Typography>
                  <Typography variant="body1" display="flex" alignItems="center">
                    <BadgeOutlined sx={{ mr: 1, color: "primary.main" }} />
                    <strong>Identificación:</strong>&nbsp;{userInfo.numeroDeIdentificacion}
                  </Typography>
                </>
              )}
            </Suspense>
          </CardContent>
        </Card>
      </Grid>

      {/* Información de la Solicitud */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card variant="outlined" sx={{ boxShadow: 3, height: "fit-content" }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Información del Crédito
            </Typography>
            <Suspense fallback={<Skeleton variant="text" width="100%" />}>
              {credit ? (
                <>
                  <Typography variant="body1" display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <AttachMoney sx={{ mr: 1, color: "success.main" }} />
                    <strong>Monto:</strong>&nbsp;${formatCurrencyFixed(credit.monto)}
                  </Typography>
                  <Typography variant="body1" display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: "primary.main" }} />
                    <strong>Fecha Solicitud:</strong>&nbsp;{formatNameDate(credit.fechaSolicitud)}
                  </Typography>
                  <Typography variant="body1" display="flex" alignItems="center">
                    <AccessTime sx={{ mr: 1, color: "primary.main" }} />
                    <strong>Plazo:</strong>&nbsp;{credit.plazoMeses} meses
                  </Typography>
                </>
              ) : (
                <Skeleton variant="text" width="100%" height={80} />
              )}
            </Suspense>
          </CardContent>
        </Card>
      </Grid>

      {/* Estado del Crédito y Gráfico */}
      <Grid size={{ xs: 12, md: 12 }}>
        <Card variant="outlined" sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Estado del Crédito
            </Typography>
            <Suspense fallback={<Skeleton variant="text" width="100%" />}>
              {credit ? (
                <Grid container spacing={3} alignItems="center">
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Typography variant="body1" display="flex" alignItems="center">
                        <AttachMoney sx={{ mr: 1, color: "success.main" }} />
                        <strong>Monto Pagado:</strong>&nbsp;${formatCurrencyFixed(valorPagado)}
                        <InfoTooltip title="Total de dinero que ya ha sido pagado del crédito" />
                      </Typography>
                      <Typography variant="body1" display="flex" alignItems="center">
                        <AttachMoney sx={{ mr: 1, color: "warning.main" }} />
                        <strong>Saldo Pendiente:</strong>&nbsp;${formatCurrencyFixed(valorSaldoPendiente)}
                        <InfoTooltip title="Monto total que aún falta por pagar del crédito" />
                      </Typography>
                      <Typography variant="body1" display="flex" alignItems="center">
                        <AccessTime sx={{ mr: 1, color: "primary.main" }} />
                        <strong>Cuotas Restantes:</strong>&nbsp;{valorCuotasPendiente}
                        <InfoTooltip title="Número de cuotas que aún faltan por pagar" />
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      {graficoPagos}
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Skeleton variant="rectangular" width="100%" height={150} />
              )}
            </Suspense>
          </CardContent>
        </Card>
      </Grid>
      {/* Historial de pagos */}
      <Grid size={{ xs: 12 }}>
        <Card variant="outlined" sx={{ boxShadow: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h5" color="primary">
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
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No se encontró información del crédito
                  </Typography>
                </Box>
              )}
            </Suspense>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CreditDetailModule;
