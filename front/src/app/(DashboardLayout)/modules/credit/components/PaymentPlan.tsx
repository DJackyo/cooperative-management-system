import React, { useMemo } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import {
  formatCurrencyFixed,
  formatNameDate,
  formatNumber,
  redondearHaciaAbajo,
  redondearHaciaArriba,
} from "@/app/(DashboardLayout)/utilities/utils";
import { IconChevronDown } from "@tabler/icons-react";
interface Payment {
  cuota: number;
  vencimiento: Date;
  saldoCapital: number;
  proteccionCartera: number;
  abonoCapital: number;
  intereses: number;
  totalCuota: number;
}
interface PaymentPlanProps {
  monto: number;
  tasaInteres: number; // Tasa mensual (por ejemplo, 1.4%)
  plazoMeses: number;
  fechaCredito: Date;
  mode: "create" | "edit" | "approve";
}

// ✅ Función para calcular el plan de pagos
const calculatePayments = (
  monto: number,
  tasaMensual: number,
  plazoMeses: number,
  fechaCredito: Date,
  porcentajeProteccionCartera = 0.001
): { pagos: Payment[]; totals: any } => {
  const cuotaMensual =
    (monto * tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) /
    (Math.pow(1 + tasaMensual, plazoMeses) - 1);

  let saldoCapital = monto;
  let saldoCapitalTmp = monto;
  let fechaVencimiento = new Date(fechaCredito);

  let totalProteccionCartera = 0;
  let totalAbonoCapital = 0;
  let totalIntereses = 0;
  let totalTotalCuota = 0;

  const pagos: Payment[] = [];

  // Primer fila (saldo inicial)
  pagos.push({
    cuota: 0,
    vencimiento: new Date(fechaVencimiento),
    saldoCapital: saldoCapital,
    proteccionCartera: 0,
    abonoCapital: 0,
    intereses: 0,
    totalCuota: cuotaMensual,
  });

  for (let i = 1; i <= plazoMeses; i++) {
    const intereses = saldoCapital * tasaMensual;
    const abonoCapital = cuotaMensual - intereses;
    const totalCuota = cuotaMensual;
    const proteccionCartera = saldoCapitalTmp * porcentajeProteccionCartera;
    saldoCapital -= abonoCapital;

    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

    pagos.push({
      cuota: i,
      vencimiento: new Date(fechaVencimiento),
      saldoCapital: saldoCapital,
      proteccionCartera,
      abonoCapital,
      intereses,
      totalCuota,
    });

    saldoCapitalTmp -= abonoCapital;

    // Sumar totales
    totalProteccionCartera += proteccionCartera;
    totalAbonoCapital += abonoCapital;
    totalIntereses += intereses;
  }
  
  totalTotalCuota =
    formatNumber(redondearHaciaArriba(cuotaMensual)) * plazoMeses;

  return {
    pagos,
    totals: {
      totalProteccionCartera,
      totalAbonoCapital,
      totalIntereses,
      totalTotalCuota,
    },
  };
};

const PaymentPlan: React.FC<PaymentPlanProps> = ({
  monto,
  tasaInteres,
  plazoMeses,
  fechaCredito,
  mode,
}) => {
  const [expanded, setExpanded] = React.useState(mode !== "approve");

  // ✅ Usamos useMemo para evitar cálculos innecesarios en cada render
  const { pagos, totals } = useMemo(() => {
    const data = calculatePayments(
      monto,
      tasaInteres,
      plazoMeses,
      fechaCredito
    );

    // Formatear los valores después del cálculo
    const formattedPagos = data.pagos.map((pago) => ({
      ...pago,
      saldoCapital: formatNumber(pago.saldoCapital),
      proteccionCartera: formatNumber(pago.proteccionCartera),
      abonoCapital: formatNumber(pago.abonoCapital),
      intereses: formatNumber(pago.intereses),
      totalCuota: formatNumber(pago.totalCuota),
    }));

    const formattedTotals = {
      totalProteccionCartera: formatNumber(data.totals.totalProteccionCartera),
      totalAbonoCapital: formatNumber(data.totals.totalAbonoCapital),
      totalIntereses: formatNumber(data.totals.totalIntereses),
      totalTotalCuota: formatNumber(data.totals.totalTotalCuota),
    };

    return { pagos: formattedPagos, totals: formattedTotals };
  }, [monto, tasaInteres, plazoMeses, fechaCredito]);

  console.log(pagos);

  const handleChange = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Accordion expanded={expanded} onChange={handleChange} elevation={2}>
        <AccordionSummary expandIcon={<IconChevronDown />}>
          <Typography variant="h6" gutterBottom>
            TABLA DE AMORTIZACION CUOTA FIJA CREDITO
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="subtitle1">
            POR $ {formatCurrencyFixed(monto)} A {plazoMeses} MESES
          </Typography>
          <Box sx={{ p: 2 }}>
            <Table
              size="small"
              sx={{
                "&:last-child td, &:last-child th": {
                  border: 1,
                  borderColor: "#CCC",
                  paddingLeft: 1.3,
                  paddingRight: 1.3,
                },
                mt: 2,
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    fontWeight: "bolder",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  <TableCell sx={{ fontWeight: "bolder" }}>Cuota</TableCell>
                  <TableCell sx={{ fontWeight: "bolder" }}>
                    Vencimiento
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bolder" }}>
                    Saldo Capital
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bolder" }}>
                    Protección de Cartera
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bolder" }}>
                    Abono Capital
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bolder" }}>Intereses</TableCell>
                  <TableCell sx={{ fontWeight: "bolder" }}>
                    Total Cuota
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagos.map((pago, index) => (
                  <TableRow
                    key={pago.cuota}
                    sx={{
                      ...(index === 0 && {
                        fontWeight: "bolder",
                        backgroundColor: "#f0f0f0",
                      }),
                    }}
                  >
                    <TableCell>{pago.cuota}</TableCell>
                    <TableCell>{formatNameDate(pago.vencimiento)}</TableCell>
                    <TableCell
                      sx={{
                        textAlign: "right",
                        ...(pago.saldoCapital <= 0 && {
                          fontWeight: "bolder",
                          backgroundColor: "#f0f0f0",
                        }),
                      }}
                    >
                      {pago.saldoCapital > 0 &&
                        formatCurrencyFixed(pago.saldoCapital)}
                      {pago.saldoCapital <= 0 && "Cancelado"}
                    </TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      {formatCurrencyFixed(pago.proteccionCartera)}
                    </TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      {formatCurrencyFixed(pago.abonoCapital)}
                    </TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      {formatCurrencyFixed(pago.intereses)}
                    </TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      {formatCurrencyFixed(pago.totalCuota)}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Fila de sumatoria */}
                <TableRow
                  sx={{
                    fontWeight: "bolder",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  <TableCell
                    colSpan={3}
                    align="right"
                    sx={{ fontWeight: "bolder" }}
                  >
                    Total
                  </TableCell>
                  <TableCell sx={{ textAlign: "right", fontWeight: "bolder" }}>
                    {formatCurrencyFixed(totals.totalProteccionCartera)}
                  </TableCell>
                  <TableCell sx={{ textAlign: "right", fontWeight: "bolder" }}>
                    {formatCurrencyFixed(totals.totalAbonoCapital)}
                  </TableCell>
                  <TableCell sx={{ textAlign: "right", fontWeight: "bolder" }}>
                    {formatCurrencyFixed(totals.totalIntereses)}
                  </TableCell>
                  <TableCell sx={{ textAlign: "right", fontWeight: "bolder" }}>
                    {formatCurrencyFixed(totals.totalTotalCuota)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default PaymentPlan;
