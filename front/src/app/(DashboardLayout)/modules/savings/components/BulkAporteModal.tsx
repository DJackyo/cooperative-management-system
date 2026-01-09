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
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { formatDateToISO } from "@/app/(DashboardLayout)/utilities/utils";
import { savingsService } from "@/services/savingsService";

interface BulkAporteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  allUsers: any[];
}

const BulkAporteModal: React.FC<BulkAporteModalProps> = ({
  open,
  onClose,
  onSuccess,
  allUsers,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [multiMonth, setMultiMonth] = useState(false);
  const [formData, setFormData] = useState({
    fechaAporte: formatDateToISO(new Date()),
    fechaAporteInicio: formatDateToISO(new Date()),
    fechaAporteFin: formatDateToISO(new Date()),
    monto: 0,
    tipoAporte: "MENSUAL",
    estado: true,
    metodoPago: "EFECTIVO",
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [totalToCreate, setTotalToCreate] = useState(0);

  const paymentMethods = [
    { value: "EFECTIVO", label: "Efectivo" },
    { value: "TRANSFERENCIA", label: "Transferencia" },
    { value: "TARJETA", label: "Tarjeta" },
  ];

  useEffect(() => {
    if (!open) {
      // Limpiar estado al cerrar
      setSelectedUsers([]);
      setSearchTerm("");
      setMultiMonth(false);
      setFormData({
        fechaAporte: formatDateToISO(new Date()),
        fechaAporteInicio: formatDateToISO(new Date()),
        fechaAporteFin: formatDateToISO(new Date()),
        monto: 0,
        tipoAporte: "MENSUAL",
        estado: true,
        metodoPago: "EFECTIVO",
      });
      setErrors({});
      setSuccessCount(0);
      setErrorCount(0);
      setTotalToCreate(0);
    }
  }, [open]);

  const handleUserToggle = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const filtered = getFilteredUsers();
    const allIds = filtered.map((user) => user.id);
    setSelectedUsers(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedUsers([]);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name as string]: value,
    });
  };

  const getFilteredUsers = () => {
    return allUsers.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.nombres?.toLowerCase().includes(searchLower) ||
        user.numeroDeIdentificacion?.includes(searchLower) ||
        user.id?.toString().includes(searchLower)
      );
    });
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (selectedUsers.length === 0) {
      newErrors.users = "Debe seleccionar al menos un usuario.";
    }

    if (formData.monto <= 0) {
      newErrors.monto = "El monto debe ser mayor que 0.";
    }

    const currentDate = new Date();
    
    if (multiMonth) {
      const startDate = new Date(formData.fechaAporteInicio);
      const endDate = new Date(formData.fechaAporteFin);
      
      if (!formData.fechaAporteInicio) {
        newErrors.fechaAporteInicio = "La fecha de inicio es obligatoria.";
      } else if (startDate > currentDate) {
        newErrors.fechaAporteInicio = "La fecha no puede ser en el futuro.";
      }
      
      if (!formData.fechaAporteFin) {
        newErrors.fechaAporteFin = "La fecha de fin es obligatoria.";
      } else if (endDate > currentDate) {
        newErrors.fechaAporteFin = "La fecha no puede ser en el futuro.";
      }
      
      if (startDate > endDate) {
        newErrors.fechaAporteFin = "La fecha de fin debe ser posterior a la fecha de inicio.";
      }
    } else {
      const selectedDate = new Date(formData.fechaAporte);
      if (!formData.fechaAporte) {
        newErrors.fechaAporte = "La fecha de aporte es obligatoria.";
      } else if (selectedDate > currentDate) {
        newErrors.fechaAporte = "La fecha no puede ser en el futuro.";
      }
    }

    if (!formData.tipoAporte) {
      newErrors.tipoAporte = "Debe seleccionar un tipo de aporte.";
    }

    if (!formData.estado) {
      newErrors.estado = "Debe seleccionar un estado.";
    }

    if (!formData.metodoPago) {
      newErrors.metodoPago = "Debe seleccionar un método de pago.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateMonthlyDates = (startDate: string, endDate: string): string[] => {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    
    while (current <= endMonth) {
      dates.push(formatDateToISO(current));
      current.setMonth(current.getMonth() + 1);
    }
    
    return dates;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessCount(0);
    setErrorCount(0);

    let success = 0;
    let failed = 0;
    
    const datesToCreate = multiMonth 
      ? generateMonthlyDates(formData.fechaAporteInicio, formData.fechaAporteFin)
      : [formData.fechaAporte];
    
    const total = selectedUsers.length * datesToCreate.length;
    setTotalToCreate(total);

    for (const userId of selectedUsers) {
      for (const fecha of datesToCreate) {
        try {
          const aporteData = {
            idAsociado: userId,
            fechaAporte: fecha,
            monto: formData.monto,
            tipoAporte: formData.tipoAporte,
            estado: formData.estado,
            metodoPago: formData.metodoPago,
            fechaModificacion: formatDateToISO(new Date()),
            fechaCreacion: formatDateToISO(new Date()),
          };

          await savingsService.create(aporteData as any);
          success++;
          setSuccessCount(success);
        } catch (error) {
          console.error(`Error creando aporte para usuario ${userId} en ${fecha}:`, error);
          failed++;
          setErrorCount(failed);
        }
      }
    }

    setLoading(false);

    if (failed === 0) {
      // Todos se crearon exitosamente
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    }
  };

  const filteredUsers = getFilteredUsers();

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: 3,
          boxShadow: 24,
          maxWidth: 900,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Crear Aportes en Masa
        </Typography>

        {loading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <CircularProgress size={20} />
              <Typography>
                Procesando... {successCount + errorCount} de {totalToCreate}
              </Typography>
            </Box>
          </Alert>
        )}

        {!loading && successCount > 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successCount} aporte(s) creado(s) exitosamente
            {errorCount > 0 && ` - ${errorCount} fallido(s)`}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Selección de Usuarios */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Seleccionar Usuarios ({selectedUsers.length})
              </Typography>

              <TextField
                fullWidth
                label="Buscar usuario"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre, documento o código..."
                size="small"
                sx={{ mb: 2 }}
              />

              <Box display="flex" gap={1} mb={2}>
                <Button size="small" onClick={handleSelectAll} variant="outlined">
                  Seleccionar todos ({filteredUsers.length})
                </Button>
                <Button size="small" onClick={handleDeselectAll} variant="outlined" color="error">
                  Limpiar
                </Button>
              </Box>

              {errors.users && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.users}
                </Alert>
              )}

              <Box sx={{ maxHeight: 300, overflow: "auto", border: 1, borderColor: "divider", borderRadius: 1 }}>
                <List dense>
                  {filteredUsers.map((user) => (
                    <ListItem key={user.id} disablePadding>
                      <ListItemButton onClick={() => handleUserToggle(user.id)}>
                        <Checkbox
                          edge="start"
                          checked={selectedUsers.includes(user.id)}
                          tabIndex={-1}
                          disableRipple
                        />
                        <ListItemText
                          primary={`${user.id} - ${user.nombres}`}
                          secondary={user.numeroDeIdentificacion}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </Grid>

          {/* Datos del Aporte */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Datos del Aporte
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Checkbox
                        checked={multiMonth}
                        onChange={(e) => setMultiMonth(e.target.checked)}
                      />
                      <Typography>Crear aportes para múltiples meses</Typography>
                    </Box>
                  </FormControl>
                </Grid>

                {!multiMonth ? (
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Fecha de Aporte"
                      name="fechaAporte"
                      type="date"
                      value={formData.fechaAporte}
                      onChange={handleChange}
                      error={!!errors.fechaAporte}
                      helperText={errors.fechaAporte}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                ) : (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Mes Inicio"
                        name="fechaAporteInicio"
                        type="month"
                        value={formData.fechaAporteInicio?.substring(0, 7) || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({
                            ...formData,
                            fechaAporteInicio: `${value}-01`,
                          });
                        }}
                        error={!!errors.fechaAporteInicio}
                        helperText={errors.fechaAporteInicio}
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Mes Fin"
                        name="fechaAporteFin"
                        type="month"
                        value={formData.fechaAporteFin?.substring(0, 7) || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({
                            ...formData,
                            fechaAporteFin: `${value}-01`,
                          });
                        }}
                        error={!!errors.fechaAporteFin}
                        helperText={errors.fechaAporteFin}
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Grid>
                  </>
                )}

                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth error={!!errors.monto}>
                    <InputLabel htmlFor="monto">Monto</InputLabel>
                    <OutlinedInput
                      id="monto"
                      name="monto"
                      type="number"
                      value={formData.monto}
                      onChange={handleChange}
                      startAdornment={<InputAdornment position="start">$</InputAdornment>}
                      label="Monto"
                      required
                    />
                    {errors.monto && (
                      <Typography variant="caption" color="error">
                        {errors.monto}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth error={!!errors.tipoAporte}>
                    <InputLabel id="tipoAporte-label">Tipo de Aporte</InputLabel>
                    <Select
                      labelId="tipoAporte-label"
                      name="tipoAporte"
                      value={formData.tipoAporte}
                      onChange={handleChange as any}
                      label="Tipo de Aporte"
                      required
                    >
                      <MenuItem value="MENSUAL">Mensual</MenuItem>
                      <MenuItem value="EXTRAORDINARIO">Extraordinario</MenuItem>
                      <MenuItem value="ANUAL">Anual</MenuItem>
                    </Select>
                    {errors.tipoAporte && (
                      <Typography variant="caption" color="error">
                        {errors.tipoAporte}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth error={!!errors.estado}>
                    <InputLabel id="estado-label">Estado</InputLabel>
                    <Select
                      labelId="estado-label"
                      name="estado"
                      value={formData.estado ? "true" : "false"}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          estado: e.target.value === "true"
                        });
                      }}
                      label="Estado"
                      required
                    >
                      <MenuItem value="true">Aprobado</MenuItem>
                      <MenuItem value="false">Pendiente</MenuItem>
                    </Select>
                    {errors.estado && (
                      <Typography variant="caption" color="error">
                        {errors.estado}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth error={!!errors.metodoPago}>
                    <InputLabel id="metodoPago-label">Método de Pago</InputLabel>
                    <Select
                      labelId="metodoPago-label"
                      name="metodoPago"
                      value={formData.metodoPago}
                      onChange={handleChange as any}
                      label="Método de Pago"
                      required
                    >
                      {paymentMethods.map((method) => (
                        <MenuItem key={method.value} value={method.value}>
                          {method.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.metodoPago && (
                      <Typography variant="caption" color="error">
                        {errors.metodoPago}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        {/* Botones de acción */}
        <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} sx={{ mt: 3 }}>
          {multiMonth && selectedUsers.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              Se crearán {selectedUsers.length} usuarios × {
                (() => {
                  const dates = generateMonthlyDates(formData.fechaAporteInicio, formData.fechaAporteFin);
                  return dates.length;
                })()
              } meses = {
                (() => {
                  const dates = generateMonthlyDates(formData.fechaAporteInicio, formData.fechaAporteFin);
                  return selectedUsers.length * dates.length;
                })()
              } aportes
            </Typography>
          )}
          <Box display="flex" gap={2} ml="auto">
            <Button onClick={onClose} variant="outlined" disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={loading || selectedUsers.length === 0}
            >
              {loading ? "Procesando..." : multiMonth ? "Crear Aportes Mensuales" : `Crear ${selectedUsers.length} Aporte(s)`}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default BulkAporteModal;
