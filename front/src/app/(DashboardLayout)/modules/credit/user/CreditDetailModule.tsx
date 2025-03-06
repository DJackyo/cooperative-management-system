// src/modules/credit/CreditDetailModule.tsx
import React, { Suspense, useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Skeleton,
  useMediaQuery,
} from "@mui/material";
import {
  AttachMoney,
  CalendarToday,
  AccessTime,
  Person,
  BadgeOutlined,
} from "@mui/icons-material";
import { mockCreditRequestData, mockCreditInfoData } from "@/mock/mockData";
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

// Usar `dynamic` para cargar el componente de forma dinámica solo en el cliente.
const PaymentHistoryTable = dynamic(
  () => import("../components/PaymentHistoryTable"),
  { ssr: false }
);

// Define los tipos de datos de crédito
interface CreditRequestData {
  amountRequested: number;
  requestDate: string;
  termRequested: number;
}

interface CreditInfoData {
  outstandingBalance: number;
  dueDate: string;
  remainingTerm: number;
}
interface CreditDetailModuleProps {
  userId: number;
  creditId: number;
}
const CreditDetailModule: React.FC<CreditDetailModuleProps> = ({
  userId,
  creditId,
}) => {
  // Estado para el usuario actual
  const [currentUser, setCurrentUser] = useState<LoggedUser>(defaultLoggedUser);
  const [credit, setCredit] = useState<Prestamo>([]);
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
  const [graficoPagos, setGraficoPagos] = useState<JSX.Element | null>(null);

  const loadCreditData = useCallback(async () => {
    if (creditId) {
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
      }
    }
  }, [userId, creditId]);

  const calcularSaldoYPendientes = (cuotas: Cuota[]) => {
    const saldoPendiente = cuotas
      .filter((cuota) => cuota.estado === "PENDIENTE")
      .reduce((total, cuota) => total + cuota.monto, 0);

    const cuotasPendientes = cuotas.filter(
      (cuota) => cuota.estado === "PENDIENTE"
    ).length;

    return { saldoPendiente, cuotasPendientes };
  };

  const fetchData = async () => {
    const hasSession = authService.isAuthenticated();
    if (hasSession) {
      const user = await authService.getCurrentUserData();
      setCurrentUser(user);
      console.log("currentUser->", user);
      loadCreditData();
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, creditId]);

  const getGraficoPagos = (cuotas: Cuota[]) => {
    // Calcular valores
    const totalMonto = cuotas.reduce((sum, cuota) => sum + cuota.monto, 0);
    const montoPagado =
      totalMonto - calcularSaldoYPendientes(cuotas).saldoPendiente;
    const montoPendiente = calcularSaldoYPendientes(cuotas).saldoPendiente;

    const options: ApexOptions = {
      chart: {
        type: "donut",
      },
      labels: ["Pagado", "Pendiente"],
      colors: ["#00C49F", "#FF8042"],
    };

    const series = [montoPagado, montoPendiente];
    setValorPagado(montoPagado);
    return (
      <>
        <Chart options={options} series={series} type="donut" width="250" />
        {/* <Typography variant="body2" mt={2}>
          Pagado: {montoPagado}, Pendiente: {montoPendiente}
        </Typography> */}
      </>
    );
  };

  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Grid container spacing={3}>
      {/* Información de la Solicitud */}
      <Grid item xs={12} md={5}>
        <Card variant="outlined" sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Información de la Solicitud
            </Typography>
            <Suspense fallback={<Skeleton variant="text" width="100%" />}>
              {userId > 0 && (
                <>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ marginTop: 0.5, marginBottom: 0.5 }}
                      display="flex"
                      alignItems="center"
                    >
                      <Person sx={{ mr: 1 }} />
                      {userId} - {userInfo.nombres}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      display="flex"
                      alignItems="center"
                    >
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
                    <strong>Monto Solicitado: </strong>${" "}
                    {formatCurrencyFixed(credit.monto)}
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
        </Card>
      </Grid>

      {/* Información del Crédito */}
      <Grid item xs={12} md={7}>
        <Card variant="outlined" sx={{ boxShadow: 3 }}>
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
                        <strong>Monto Pagado </strong> $
                        {formatCurrencyFixed(valorPagado)}
                      </Typography>
                      <Typography display="flex" alignItems="center">
                        <AttachMoney sx={{ mr: 1 }} />
                        <strong>Saldo Pendiente: </strong> $
                        {formatCurrencyFixed(valorSaldoPendiente)}
                      </Typography>
                      <Typography display="flex" alignItems="center">
                        <CalendarToday sx={{ mr: 1 }} />
                        <strong> Fecha de Vencimiento: </strong>
                        {formatNameDate(credit.fechaVencimiento)}
                      </Typography>
                      <Typography display="flex" alignItems="center">
                        <AccessTime sx={{ mr: 1 }} />{" "}
                        <strong>Plazo Restante: </strong>
                        {valorCuotasPendiente} meses
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
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
        </Card>
      </Grid>
      {/* Gráfico de Pagos */}

      {/* Historial de pagos */}
      <Grid item xs={12} md={12}>
        <Card variant="outlined" sx={{ boxShadow: 3 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" color="primary" gutterBottom>
                Historial de Pagos
              </Typography>
              {/* <Button
                variant="outlined"
                color="secondary"
                onClick={handleOpenModifyModal}
              >
                Modificar crédito
              </Button> */}
            </Box>
            <Suspense
              fallback={
                <Skeleton variant="rectangular" width="100%" height={300} />
              }
            >
              <PaymentHistoryTable
                presCuotas={credit.presCuotas ? credit.presCuotas : []}
                plazoMeses={credit.plazoMeses ? credit.plazoMeses : 10}
              />
            </Suspense>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CreditDetailModule;
