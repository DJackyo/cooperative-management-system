import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
} from "@mui/material";
import {
  formatCurrencyFixed,
  formatDateToISO,
  formatNameDate,
} from "@/app/(DashboardLayout)/utilities/utils";

interface PaymentPlanProps {
  monto: number;
  tasaInteres: number; // Tasa mensual (por ejemplo, 1.4%)
  plazoMeses: number;
  fechaCredito: Date;
}

const PaymentPlan: React.FC<PaymentPlanProps> = ({
  monto,
  tasaInteres,
  plazoMeses,
  fechaCredito,
}) => {
  // Usar la tasa mensual directamente
  const tasaMensual = tasaInteres; // Convertir porcentaje a decimal
  const porcentajeProteccionCartera = 0.001;
  // Calcular cuota mensual usando la fórmula de amortización
  const cuotaMensual: any =
    (monto * tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) /
    (Math.pow(1 + tasaMensual, plazoMeses) - 1);

  // Redondear la cuota mensual a dos decimales
  const cuotaMensualRedondeada =
    Math.round(cuotaMensual.toFixed(0) * 100) / 100;

  // Generar el plan de pagos
  const pagos = [];
  let saldoCapital: any = monto;
  let saldoCapitalTmp: any = monto;
  let fechaVencimiento = new Date(fechaCredito); // Usar la fecha de crédito para calcular las fechas de vencimiento
  pagos.push({
    cuota: 0,
    vencimiento: new Date(fechaVencimiento),
    saldoCapital: saldoCapital.toFixed(0),
    proteccionCartera: "",
    abonoCapital: "",
    intereses: "",
    totalCuota: cuotaMensualRedondeada,
  });

  let totalProteccionCartera = 0;
  let totalAbonoCapital = 0;
  let totalIntereses = 0;
  let totalTotalCuota = 0;

  for (let i = 1; i <= plazoMeses; i++) {
    const intereses = saldoCapital * tasaMensual;
    const abonoCapital = cuotaMensualRedondeada - intereses;
    const totalCuota = cuotaMensualRedondeada; // Total de la cuota no cambia, es constante
    const proteccionCartera =
      saldoCapitalTmp.toFixed(0) * porcentajeProteccionCartera;
    saldoCapital -= abonoCapital;

    // Incrementamos un mes a la fecha de vencimiento
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

    pagos.push({
      cuota: i,
      vencimiento: new Date(fechaVencimiento),
      saldoCapital: saldoCapital.toFixed(0),
      proteccionCartera,
      abonoCapital: abonoCapital.toFixed(0),
      intereses: intereses.toFixed(0),
      totalCuota: totalCuota.toFixed(0),
    });

    saldoCapitalTmp -= abonoCapital;

    // Sumamos los valores para la fila final

    totalProteccionCartera += proteccionCartera;
    totalAbonoCapital += parseFloat(abonoCapital.toFixed(0));
    totalIntereses += parseFloat(intereses.toFixed(0));
    totalTotalCuota += parseFloat(totalCuota.toFixed(0));
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Plan de Pagos
      </Typography>
      <Table
        size="small"
        sx={{
          "&:last-child td, &:last-child th": {
            border: 1,
            borderColor: "#CCC",
            paddingLeft: 1.3,
            paddingRight: 1.3,
          },
        }}
      >
        <TableHead>
          <TableRow sx={{
              fontWeight: "bolder",
              backgroundColor: "#f0f0f0",
            }}>
            <TableCell sx={{ fontWeight: "bolder" }}>Cuota</TableCell>
            <TableCell sx={{ fontWeight: "bolder" }}>Vencimiento</TableCell>
            <TableCell sx={{ fontWeight: "bolder" }}>Saldo Capital</TableCell>
            <TableCell sx={{ fontWeight: "bolder" }}>
              Protección de Cartera
            </TableCell>
            <TableCell sx={{ fontWeight: "bolder" }}>Abono Capital</TableCell>
            <TableCell sx={{ fontWeight: "bolder" }}>Intereses</TableCell>
            <TableCell sx={{ fontWeight: "bolder" }}>Total Cuota</TableCell>
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
              <TableCell sx={{ textAlign: "right" }}>
                {pago.saldoCapital > 0 &&
                  formatCurrencyFixed(pago.saldoCapital)}
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
            <TableCell colSpan={3} align="right" sx={{ fontWeight: "bolder" }}>
              Total
            </TableCell>
            <TableCell sx={{ textAlign: "right", fontWeight: "bolder" }}>
              {formatCurrencyFixed(totalProteccionCartera.toFixed(0))}
            </TableCell>
            <TableCell sx={{ textAlign: "right", fontWeight: "bolder" }}>
              {formatCurrencyFixed(totalAbonoCapital.toFixed(0))}
            </TableCell>
            <TableCell sx={{ textAlign: "right", fontWeight: "bolder" }}>
              {formatCurrencyFixed(totalIntereses.toFixed(0))}
            </TableCell>
            <TableCell sx={{ textAlign: "right", fontWeight: "bolder" }}>
              {formatCurrencyFixed(totalTotalCuota.toFixed(0))}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
};

export default PaymentPlan;
