import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import { Aporte } from "@/interfaces/Aporte";
import { formatDateToISO } from "@/app/(DashboardLayout)/utilities/utils";
import { defaultAporteValue as defaultValues } from "@/app/(DashboardLayout)/utilities/AportesUtils";

interface AporteModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (aporte: Aporte) => void;
  initialData: Aporte | null;
}

const AporteModal: React.FC<AporteModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [aporte, setAporte] = useState<Aporte>(defaultValues);
  const [errors, setErrors] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Función para calcular la próxima fecha de aporte
  const calculateNextPaymentDate = async (asociadoId: number) => {
    try {
      const { savingsService } = await import('@/services/savingsService');
      const aportes = await savingsService.fetchByFilters({ idAsociadoId: asociadoId });
      
      if (aportes && aportes.length > 0) {
        // Ordenar por fecha más reciente
        const sortedAportes = aportes.sort((a: any, b: any) => 
          new Date(b.fechaAporte).getTime() - new Date(a.fechaAporte).getTime()
        );
        
        const lastAporte = sortedAportes[0];
        const lastDate = new Date(lastAporte.fechaAporte);
        
        // Calcular próxima fecha basada en el tipo de aporte
        let nextDate = new Date(lastDate);
        
        switch (lastAporte.tipoAporte) {
          case 'MENSUAL':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case 'ANUAL':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
          default:
            // Para extraordinario, sugerir el próximo mes
            nextDate.setMonth(nextDate.getMonth() + 1);
        }
        
        return nextDate.toISOString().split('T')[0];
      }
    } catch (error) {
      console.error('Error calculando próxima fecha:', error);
    }
    
    // Si no hay aportes previos, usar fecha actual
    return new Date().toISOString().split('T')[0];
  };

  // Array de métodos de pago disponibles
  const paymentMethods = [
    { value: "EFECTIVO", label: "Efectivo" },
    { value: "TRANSFERENCIA", label: "Transferencia" },
    { value: "TARJETA", label: "Tarjeta" },
  ];

  // Métodos de pago que requieren comprobante
  const paymentMethodsWithComprobante = ["TRANSFERENCIA", "TARJETA"];

  useEffect(() => {
    const initializeAporte = async () => {
      // Si es edición (tiene ID > 0), usar datos existentes
      if (initialData && initialData.id > 0) {
        setAporte({
          ...initialData,
          fechaAporte: initialData.fechaAporte
            ? formatDateToISO(initialData.fechaAporte)
            : "",
        });
      } else {
        // Para nuevo aporte (ID = 0 o null), calcular fecha sugerida
        const aporteData = initialData || defaultValues;
        const aporteWithDate = { ...aporteData };
        const asociadoId = aporteData.asociado?.idAsociado?.id || aporteData.asociado?.id;
        
        if (asociadoId) {
          const suggestedDate = await calculateNextPaymentDate(asociadoId);
          aporteWithDate.fechaAporte = suggestedDate;
        } else {
          aporteWithDate.fechaAporte = new Date().toISOString().split('T')[0];
        }
        setAporte(aporteWithDate);
      }
    };
    
    initializeAporte();
  }, [initialData]);

  const handleChange: any = (
    event: React.ChangeEvent<
      HTMLInputElement | { name?: string; value: unknown }
    >
  ) => {
    const { name, value } = event.target;
    setAporte({
      ...aporte,
      [name as string]: value,
    });
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Validación monto > 0
    if (aporte.monto <= 0) {
      newErrors.monto = "El monto debe ser mayor que 0.";
    }

    // Validación fecha de aporte no puede ser en el futuro
    const currentDate = new Date();
    const selectedDate = new Date(aporte.fechaAporte);
    if (!aporte.fechaAporte) {
      newErrors.fechaAporte = "La fecha de aporte es obligatoria.";
    } else if (selectedDate > currentDate) {
      newErrors.fechaAporte = "La fecha no puede ser en el futuro.";
    }

    // Validación selectores
    if (!aporte.tipoAporte) {
      newErrors.tipoAporte = "Debe seleccionar un tipo de aporte.";
    }
    if (!aporte.estado) {
      newErrors.estado = "Debe seleccionar un estado.";
    }
    if (!aporte.metodoPago) {
      newErrors.metodoPago = "Debe seleccionar un método de pago.";
    }

    // Validación para el campo comprobante solo si el metodoPago es 'TRANSFERENCIA' o 'TARJETA'
    if (
      paymentMethodsWithComprobante.includes(aporte.metodoPago) &&
      !aporte.comprobante
    ) {
      newErrors.comprobante =
        "El comprobante es obligatorio para este método de pago.";
    }

    // Si hay errores, devolver false
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const aporteData = { ...aporte, file: selectedFile };
      onSubmit(aporteData);
      onClose();
      setAporte(defaultValues);
      setSelectedFile(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setAporte(defaultValues);
    setSelectedFile(null);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="modal-title" variant="h6" component="h2">
          {aporte.id ? "Editar Aporte" : "Nuevo Aporte"}
        </Typography>
        <form>
          <Grid container spacing={3}>
            {/* Primera columna */}
            <Grid size={{ xs: 12, md: 6 }}>
              {/* Fecha de aporte */}
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Fecha del Aporte"
                  type="date"
                  fullWidth
                  name="fechaAporte"
                  value={aporte.fechaAporte}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={!!errors.fechaAporte}
                  helperText={errors.fechaAporte || (!initialData ? "Fecha calculada automáticamente" : "")}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <Button
                        size="small"
                        onClick={async () => {
                          const asociadoId = aporte.asociado?.idAsociado?.id || aporte.asociado?.id;
                          if (asociadoId) {
                            const newDate = await calculateNextPaymentDate(asociadoId);
                            setAporte({ ...aporte, fechaAporte: newDate });
                          }
                        }}
                        sx={{ minWidth: 'auto', p: 0.5 }}
                      >
                        🔄
                      </Button>
                    )
                  }}
                />
              </Box>
            </Grid>
            <Grid  size={{ xs: 12, md: 6 }}>
              {/* Monto */}
              <TextField
                label="Monto"
                type="number"
                fullWidth
                name="monto"
                value={aporte.monto}
                onChange={handleChange}
                sx={{ mt: 2 }}
                error={!!errors.monto}
                helperText={errors.monto}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>

            <Grid  size={{ xs: 12, md: 6 }}>
              {/* Tipo de aporte */}
              <FormControl fullWidth sx={{ mt: 2 }} error={!!errors.tipoAporte}>
                <InputLabel>Tipo Aporte</InputLabel>
                <Select
                  label="Tipo Aporte"
                  name="tipoAporte"
                  value={aporte.tipoAporte}
                  onChange={handleChange}
                  size="small"
                >
                  <MenuItem value="MENSUAL">Mensual</MenuItem>
                  <MenuItem value="ANUAL">Anual</MenuItem>
                  <MenuItem value="EXTRAORDINARIO">Extraordinario</MenuItem>
                </Select>
                {errors.tipoAporte && (
                  <Typography color="error">{errors.tipoAporte}</Typography>
                )}
              </FormControl>
            </Grid>

            <Grid  size={{ xs: 12, md: 6 }}>
              {/* Metodo de pago */}
              <FormControl fullWidth sx={{ mt: 2 }} error={!!errors.metodoPago}>
                <InputLabel>Metodo de Pago</InputLabel>
                <Select
                  label="Metodo de Pago"
                  name="metodoPago"
                  value={aporte.metodoPago}
                  onChange={handleChange}
                  size="small"
                >
                  {/* Mapeo dinámico de los métodos de pago */}
                  {paymentMethods.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.metodoPago && (
                  <Typography color="error">{errors.metodoPago}</Typography>
                )}
              </FormControl>
            </Grid>

            {/* Comprobante solo si es Transferencia o Tarjeta */}
            {paymentMethodsWithComprobante.includes(aporte.metodoPago) && (
              <Grid size={{ xs: 12, md: 12 }}>
                <Box sx={{ mt: 2 }}>
                  <InputLabel sx={{ mb: 1, color: errors.comprobante ? 'error.main' : 'text.primary' }}>
                    Comprobante *
                  </InputLabel>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ 
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderColor: errors.comprobante ? 'error.main' : 'grey.300',
                      color: errors.comprobante ? 'error.main' : 'text.primary'
                    }}
                  >
                    {selectedFile ? selectedFile.name : 'Seleccionar archivo'}
                    <input
                      type="file"
                      hidden
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          setAporte({ ...aporte, comprobante: file.name });
                        }
                      }}
                    />
                  </Button>
                  {errors.comprobante && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.comprobante}
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}

            <Grid  size={{ xs: 12, md: 12}}>
              {/* Observaciones */}
              <TextField
                label="Observaciones"
                fullWidth
                name="observaciones"
                value={aporte.observaciones || ""}
                onChange={handleChange}
                sx={{ mt: 2 }}
                size="small"
              />
            </Grid>
          </Grid>

          {/* Botones de acción */}
          <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              {aporte.id > 0 ? "Actualizar" : "Registrar"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AporteModal;
