import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import {
  calcularDiasEnMora,
  calcularMora,
  formatCurrency,
  formatNumber,
  numeroALetras,
  redondearHaciaArriba,
} from "@/app/(DashboardLayout)/utilities/utils";
// 📌 Definir esquema de validación con Zod
const presPagosSchema = z.object({
  id: z.number().optional(),
  numeroCuota: z.number().min(1, "Número de cuota requerido"),
  fechaVencimiento: z.string().optional(),
  diaDePago: z.string().optional(),
  monto: z.number().min(0, "El monto debe ser positivo"),
  diasEnMora: z
    .number()
    .min(0, "Días en mora no pueden ser negativos")
    .optional(),
  mora: z.number().optional(),
  totalPagar: z.number().optional(),
  estado: z.string().optional(),
  proteccionCartera: z.number().min(0),
  abonoCapital: z.number().min(0),
  intereses: z.number().min(0),
  pagado: z.literal(true).refine((value) => value === true, {
    message: "Debe marcar la casilla para registrar el pago",
  }),
});

// 📌 Tipado de datos (TypeScript)
type PresPagosFormData = z.infer<typeof presPagosSchema>;

// 📌 Tipado de Props
interface PresPagosFormProps {
  pago?: PresPagosFormData;
}

export default function PresPagosForm({ pago }: PresPagosFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PresPagosFormData>({
    resolver: zodResolver(presPagosSchema),
    defaultValues: {
      ...pago,
      diaDePago: pago?.diaDePago || new Date().toISOString().split("T")[0], // 📌 Por defecto: hoy
    },
  });

  // 📌 Obtener valores dinámicos
  const monto = watch("monto", 0);
  const fechaVencimiento = watch("fechaVencimiento");
  const diaDePago = watch("diaDePago");
  const proteccionCartera = watch("proteccionCartera", 0);
  const abonoCapital = watch("abonoCapital", 0);
  const intereses = watch("intereses", 0);
  const mora = watch("mora", 0);
  const totalPagar = watch("totalPagar") || 0;

  // 📌 Cargar valores de `pago` en el formulario cuando cambie
  useEffect(() => {
    if (pago) {
      Object.keys(pago).forEach((key) => {
        const valor = pago[key as keyof PresPagosFormData];

        // 📌 Si es un número, redondear hacia arriba
        if (typeof valor === "number") {
          setValue(
            key as keyof PresPagosFormData,
            formatNumber(redondearHaciaArriba(valor))
          );
        }
        // 📌 Si es una fecha en formato string, asegurarse de que sea un string válido
        else if (typeof valor === "string" && !isNaN(Date.parse(valor))) {
          setValue(key as keyof PresPagosFormData, valor.split("T")[0]); // Solo la parte YYYY-MM-DD
        }
        // 📌 Si es un string o boolean, asignarlo sin cambios
        else {
          setValue(key as keyof PresPagosFormData, valor);
        }
      });

      if (fechaVencimiento && diaDePago) {
        const diasEnMora = calcularDiasEnMora(fechaVencimiento, diaDePago);
        setValue("diasEnMora", diasEnMora);

        // 📌 Calcular mora si `diasEnMora` > 0
        if (diasEnMora > 0 && monto > 0) {
          const moraCalculada = calcularMora(monto, diasEnMora);
          setValue("mora", moraCalculada);
        } else {
          setValue("mora", 0);
        }
      }
    }
  }, [pago, fechaVencimiento, diaDePago, monto, setValue]);

  // 📌 Calcular Total a Pagar cuando cambien los valores
  useEffect(() => {
    const total =
      Number(mora) +
      Number(monto) +
      Number(proteccionCartera) +
      Number(intereses) +
      Number(abonoCapital);
    setValue("totalPagar", total);
  }, [mora, monto, proteccionCartera, abonoCapital, intereses, setValue]);

  // 📌 Función de envío de datos (simulada con console.log)
  const onSubmit = (data: PresPagosFormData) => {
    console.log("Datos enviados:", data);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      //   sx={{ p: 3, boxShadow: 3, borderRadius: 2, maxWidth: 800, mx: "auto" }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {pago ? "Cuota # " + pago.numeroCuota : ""}
      </Typography>
      <p>Se registrará el pago con la siguiente información:</p>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Días en Mora */}
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Días en Mora"
            type="number"
            {...register("diasEnMora", { valueAsNumber: true })}
            error={!!errors.diasEnMora}
            helperText={errors.diasEnMora?.message}
            disabled
          />
        </Grid>

        {/* Mora Calculada */}
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Mora Calculada"
            type="number"
            disabled
            value={watch("mora") || 0} // Mostrar el valor actualizado
          />
        </Grid>

        {/* Día de Pago */}
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Día de Pago"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register("diaDePago")}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Fecha de Vencimiento"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register("fechaVencimiento")}
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Monto"
            type="number"
            {...register("monto", { valueAsNumber: true })}
            error={!!errors.monto}
            helperText={errors.monto?.message}
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Protección Cartera"
            type="number"
            {...register("proteccionCartera", { valueAsNumber: true })}
            error={!!errors.proteccionCartera}
            helperText={errors.proteccionCartera?.message}
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Abono Capital"
            type="number"
            {...register("abonoCapital", { valueAsNumber: true })}
            error={!!errors.abonoCapital}
            helperText={errors.abonoCapital?.message}
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Intereses"
            type="number"
            {...register("intereses", { valueAsNumber: true })}
            error={!!errors.intereses}
            helperText={errors.intereses?.message}
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Total a Pagar"
            type="number"
            disabled
            value={watch("totalPagar") || 0}
            sx={{ fontWeight: "bold", backgroundColor: "#f3f3f3" }}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <FormControlLabel
            control={<Checkbox {...register("pagado")} />}
            label={
              <>
                Registrar pago por $ {formatCurrency(totalPagar) + " "}
                <em>({numeroALetras(totalPagar, true)})</em>
              </>
            }
          />
          {errors.pagado && (
            <div style={{ color: "red" }}>
              Debe marcar la casilla para registrar el pago
            </div>
          )}
        </Grid>

        {/* Botón de envío */}
        <Grid item xs={12} sx={{ textAlign: "right", mt: 1 }}>
          <Button type="submit" variant="contained">
            {pago ? "Registrar Pago" : ""}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
