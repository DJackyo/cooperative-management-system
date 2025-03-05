// src/modules/credit/CreditDetailModule.tsx
import React, { Suspense, useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Skeleton,
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
} from "@/app/(DashboardLayout)/utilities/utils";
import { authService } from "@/app/authentication/services/authService";
import { Asociado, LoggedUser } from "@/interfaces/User";
import { Prestamo } from "@/interfaces/Prestamo";
import { creditsService } from "@/services/creditRequestService";

// Usar `dynamic` para cargar el componente de forma dinámica solo en el cliente.
const PaymentHistoryTable = dynamic(
  () => import("../components/PaymentHistoryTable"),
  { ssr: false }
);
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

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
  // Estados para los datos simulados, permitiendo el tipo null como valor inicial
  const [creditRequestData, setCreditRequestData] =
    useState<CreditRequestData | null>(null);
  const [creditInfoData, setCreditInfoData] = useState<CreditInfoData | null>(
    null
  );
  const loadCreditData = useCallback(async () => {
    let response;
    if (creditId) {
      response = await creditsService.fetchByFilters({
        creditId: creditId,
        userId: userId,
      });
    }
    if (response.length > 0) {
      setCredit(response[0]);
      setUserInfo(response[0].idAsociado);
    }
    console.log(response);
  }, [userId, creditId]);

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
    // Simular la carga de datos con un retardo
    setTimeout(() => {
      setCreditRequestData(mockCreditRequestData);
      setCreditInfoData(mockCreditInfoData);
    }, 2000); // 2 segundos de retardo
    console.log(userId, creditId);
    fetchData();
  }, []);

  // Configuración del gráfico
  const chartOptions = {
    chart: { type: "pie" as const, toolbar: { show: true } },
    labels: ["Pagado", "Pendiente"],
    colors: ["#008FFB", "#FF4560"],
    responsive: [{ breakpoint: 480, options: { chart: { width: 200 } } }],
  };

  const series = [400, 100]; // Datos del gráfico: Pagado y Pendiente

  return (
    <Grid container spacing={3}>
      {/* Información de la Solicitud */}
      <Grid item xs={12} md={6}>
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
                    {credit.fechaSolicitud}
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
      <Grid item xs={12} md={6}>
        <Card variant="outlined" sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Información del Crédito
            </Typography>
            <Suspense fallback={<Skeleton variant="text" width="100%" />}>
              {creditInfoData ? (
                <>
                  <Typography variant="h6" display="flex" alignItems="center">
                    <AttachMoney sx={{ mr: 1 }} /> Saldo Pendiente: $
                    {creditInfoData.outstandingBalance.toLocaleString()}
                  </Typography>
                  <Typography display="flex" alignItems="center">
                    <CalendarToday sx={{ mr: 1 }} /> Fecha de Vencimiento:{" "}
                    {creditInfoData.dueDate}
                  </Typography>
                  <Typography display="flex" alignItems="center">
                    <AccessTime sx={{ mr: 1 }} /> Plazo Restante:{" "}
                    {creditInfoData.remainingTerm} meses
                  </Typography>
                </>
              ) : (
                <Skeleton variant="text" width="100%" height={50} />
              )}
            </Suspense>
          </CardContent>
        </Card>
      </Grid>

      {/* Historial de pagos */}
      <Grid item xs={12} md={8}>
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
              <PaymentHistoryTable presCuotas={credit.presCuotas}/>
            </Suspense>
          </CardContent>
        </Card>
      </Grid>
      {/* Gráfico de Pagos */}
      <Grid item xs={12} md={4}>
        <Card variant="outlined" sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Estado de Pagos
            </Typography>
            <Suspense
              fallback={
                <Skeleton variant="circular" width={100} height={100} />
              }
            >
              <Chart
                options={chartOptions}
                series={series}
                type="pie"
                width="100%"
              />
              <Typography variant="body2" mt={2}>
                Pagado: $400, Pendiente: $100
              </Typography>
            </Suspense>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CreditDetailModule;
