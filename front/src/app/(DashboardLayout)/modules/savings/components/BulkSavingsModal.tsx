import React, { useEffect, useMemo, useState } from "react";
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
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
} from "@mui/material";
import { IconArrowBackUp, IconBolt, IconTrash } from "@tabler/icons-react";
import {
  formatCurrency,
  formatDateToISO,
} from "@/app/(DashboardLayout)/utilities/utils";
import { savingsService } from "@/services/savingsService";

interface BulkSavingsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  allUsers: any[];
  /** Asociado preseleccionado (opcional) */
  initialUserId?: number;
  /** Usuario que registra los ahorros (opcional) */
  currentUserId?: number | null;
}

type SavingsMode = "ANIO" | "RANGO";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const MAX_MONTHS = 600;
const YEARS_BACK = 15;

/** Construye la fecha del primer día del mes en formato YYYY-MM-DD */
const buildMonthISO = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, "0")}-01`;

/** Etiqueta legible de un mes (las fechas generadas siempre son día 1) */
const formatMonthLabel = (iso: string) => {
  const [year, month] = iso.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
};

/** Solo se permiten valores enteros positivos (la columna monto es entera) */
const sanitizeAmount = (raw: string) => raw.replace(/[^\d]/g, "");

const BulkSavingsModal: React.FC<BulkSavingsModalProps> = ({
  open,
  onClose,
  onSuccess,
  allUsers,
  initialUserId,
  currentUserId,
}) => {
  const todayISO = useMemo(() => formatDateToISO(new Date()), []);
  const currentYear = Number(todayISO.substring(0, 4));

  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [mode, setMode] = useState<SavingsMode>("ANIO");
  const [formData, setFormData] = useState({
    anio: currentYear,
    fechaInicio: buildMonthISO(currentYear, 1),
    fechaFin: todayISO,
    tipoAporte: "MENSUAL",
    estado: true,
    metodoPago: "EFECTIVO",
    observaciones: "",
  });
  // values[asociadoId][fechaISO] = monto (string para permitir el estado vacío)
  const [values, setValues] = useState<Record<number, Record<string, string>>>(
    {}
  );
  const [quickValues, setQuickValues] = useState<Record<number, string>>({});
  // Meses que el usuario decidió no registrar (se quitan de la lista)
  const [removedDates, setRemovedDates] = useState<string[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [totalToCreate, setTotalToCreate] = useState(0);

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let year = currentYear; year >= currentYear - YEARS_BACK; year--) {
      years.push(year);
    }
    return years;
  }, [currentYear]);

  const paymentMethods = [
    { value: "EFECTIVO", label: "Efectivo" },
    { value: "TRANSFERENCIA", label: "Transferencia" },
    { value: "TARJETA", label: "Tarjeta" },
  ];

  // Reinicia el formulario cada vez que se abre el modal
  useEffect(() => {
    if (open) {
      setSelectedUsers(
        initialUserId && initialUserId > 0 ? [initialUserId] : []
      );
      setSearchTerm("");
      setMode("ANIO");
      setFormData({
        anio: currentYear,
        fechaInicio: buildMonthISO(currentYear, 1),
        fechaFin: todayISO,
        tipoAporte: "MENSUAL",
        estado: true,
        metodoPago: "EFECTIVO",
        observaciones: "",
      });
      setValues({});
      setQuickValues({});
      setRemovedDates([]);
      setErrors({});
      setSuccessCount(0);
      setErrorCount(0);
      setTotalToCreate(0);
      setLoading(false);
    }
  }, [open, initialUserId, currentYear, todayISO]);

  // Meses (siempre día 1) del año seleccionado o del rango de fechas
  const { dates: monthlyDates, truncated } = useMemo(() => {
    const todayMonth = Number(todayISO.substring(5, 7));

    if (mode === "ANIO") {
      const baseYear = Number(formData.anio);
      const result: string[] = [];
      let omitted = false;
      for (let month = 1; month <= 12; month++) {
        if (baseYear === currentYear && month > todayMonth) {
          omitted = true;
          break;
        }
        result.push(buildMonthISO(baseYear, month));
      }
      return { dates: result, truncated: omitted };
    }

    if (!formData.fechaInicio || !formData.fechaFin) {
      return { dates: [], truncated: false };
    }

    const [startYear, startMonth] = formData.fechaInicio.split("-").map(Number);
    const [endYear, endMonth] = formData.fechaFin.split("-").map(Number);
    if (!startYear || !startMonth || !endYear || !endMonth) {
      return { dates: [], truncated: false };
    }

    const startIndex = startYear * 12 + (startMonth - 1);
    const endIndex = endYear * 12 + (endMonth - 1);
    if (endIndex < startIndex) {
      return { dates: [], truncated: false };
    }

    const result: string[] = [];
    let omitted = false;
    for (let index = startIndex; index <= endIndex; index++) {
      const year = Math.floor(index / 12);
      const month = (index % 12) + 1;
      const iso = buildMonthISO(year, month);
      // No se generan meses futuros (mismo criterio del modal de aportes en masa)
      if (iso > todayISO) {
        omitted = true;
        break;
      }
      result.push(iso);
      if (result.length >= MAX_MONTHS) {
        omitted = true;
        break;
      }
    }
    return { dates: result, truncated: omitted };
  }, [
    mode,
    formData.anio,
    formData.fechaInicio,
    formData.fechaFin,
    todayISO,
    currentYear,
  ]);

  // Descarta los valores que ya no pertenecen al rango de meses vigente
  useEffect(() => {
    setValues((prev) => {
      let changed = false;
      const next: Record<number, Record<string, string>> = {};
      Object.keys(prev).forEach((key) => {
        const userId = Number(key);
        const source = prev[userId] || {};
        const filtered: Record<string, string> = {};
        Object.keys(source).forEach((fecha) => {
          if (monthlyDates.includes(fecha)) {
            filtered[fecha] = source[fecha];
          } else {
            changed = true;
          }
        });
        next[userId] = filtered;
      });
      return changed ? next : prev;
    });
  }, [monthlyDates]);

  // Mantiene solo los meses eliminados que siguen dentro del rango vigente
  useEffect(() => {
    setRemovedDates((prev) => {
      const filtered = prev.filter((fecha) => monthlyDates.includes(fecha));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [monthlyDates]);

  // Meses que sí se van a procesar (los eliminados quedan fuera)
  const visibleDates = useMemo(
    () => monthlyDates.filter((fecha) => !removedDates.includes(fecha)),
    [monthlyDates, removedDates]
  );

  const selectedUserObjects = useMemo(
    () => allUsers.filter((user) => selectedUsers.includes(user.id)),
    [allUsers, selectedUsers]
  );

  const filteredUsers = allUsers.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.nombres?.toLowerCase().includes(searchLower) ||
      user.numeroDeIdentificacion?.toLowerCase().includes(searchLower) ||
      user.id?.toString().includes(searchLower)
    );
  });

  const getUserName = (user: any) => user?.nombres || `Asociado ${user?.id}`;

  const getValue = (userId: number, fecha: string) =>
    values[userId]?.[fecha] ?? "";

  // Un valor vacío significa "sin ahorro" (no se registra ese mes);
  // un 0 explícito sí se guarda como aporte en cero.
  const hasValue = (userId: number, fecha: string) => {
    const raw = values[userId]?.[fecha];
    return raw !== undefined && raw !== "";
  };

  const columnTotal = (userId: number) =>
    visibleDates.reduce(
      (total, fecha) => total + (Number(values[userId]?.[fecha]) || 0),
      0
    );

  const plannedCount = selectedUsers.reduce(
    (total, userId) =>
      total + visibleDates.filter((fecha) => hasValue(userId, fecha)).length,
    0
  );

  const rowHasValues = (fecha: string) =>
    selectedUsers.some((userId) => hasValue(userId, fecha));

  const grandTotal = selectedUsers.reduce(
    (total, userId) => total + columnTotal(userId),
    0
  );

  const handleUserToggle = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
    setErrors((prev: any) => ({ ...prev, users: undefined, values: undefined }));
  };

  const handleSelectAll = () => {
    setSelectedUsers(filteredUsers.map((user) => user.id));
    setErrors((prev: any) => ({ ...prev, users: undefined }));
  };

  const handleDeselectAll = () => {
    setSelectedUsers([]);
  };

  const handleValueChange = (userId: number, fecha: string, raw: string) => {
    setValues((prev) => ({
      ...prev,
      [userId]: { ...(prev[userId] || {}), [fecha]: sanitizeAmount(raw) },
    }));
  };

  const handleQuickValueChange = (userId: number, raw: string) => {
    setQuickValues((prev) => ({ ...prev, [userId]: sanitizeAmount(raw) }));
  };

  const handleApplyToAllMonths = (userId: number) => {
    const raw = quickValues[userId];
    if (!raw) return;
    setValues((prev) => {
      const userValues = { ...(prev[userId] || {}) };
      visibleDates.forEach((fecha) => {
        userValues[fecha] = raw;
      });
      return { ...prev, [userId]: userValues };
    });
  };

  const handleRemoveMonth = (fecha: string) => {
    setRemovedDates((prev) =>
      prev.includes(fecha) ? prev : [...prev, fecha]
    );
    setErrors((prev: any) => ({ ...prev, dates: undefined, values: undefined }));
  };

  const handleRestoreMonths = () => {
    setRemovedDates([]);
  };

  const handleClearValues = () => {
    setValues({});
    setErrors((prev: any) => ({ ...prev, values: undefined }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (selectedUsers.length === 0) {
      newErrors.users = "Debe seleccionar al menos un asociado.";
    }

    if (monthlyDates.length === 0) {
      newErrors.dates =
        "Debe seleccionar un año o un rango de fechas válido para generar los meses.";
    } else if (visibleDates.length === 0) {
      newErrors.dates =
        "Debe mantener al menos un mes en la lista para registrar ahorros.";
    }

    if (mode === "RANGO") {
      if (!formData.fechaInicio) {
        newErrors.fechaInicio = "La fecha de inicio es obligatoria.";
      }
      if (!formData.fechaFin) {
        newErrors.fechaFin = "La fecha de fin es obligatoria.";
      }
      if (
        formData.fechaInicio &&
        formData.fechaFin &&
        formData.fechaInicio > formData.fechaFin
      ) {
        newErrors.fechaFin =
          "La fecha de fin debe ser posterior a la fecha de inicio.";
      }
    }

    if (
      visibleDates.length > 0 &&
      selectedUsers.length > 0 &&
      plannedCount === 0
    ) {
      newErrors.values =
        "Debe asignar un valor (puede ser 0) en al menos un mes para continuar. Los meses que queden vacíos no se registran.";
    }

    if (!formData.tipoAporte) {
      newErrors.tipoAporte = "Debe seleccionar un tipo de ahorro.";
    }

    if (!formData.metodoPago) {
      newErrors.metodoPago = "Debe seleccionar un método de pago.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessCount(0);
    setErrorCount(0);

    // Plan de registros: un ahorro por cada asociado y mes con valor definido.
    // Los meses vacíos se omiten y un 0 explícito sí se registra.
    const plan: { userId: number; fecha: string; monto: number }[] = [];
    selectedUsers.forEach((userId) => {
      visibleDates.forEach((fecha) => {
        if (!hasValue(userId, fecha)) return;
        plan.push({
          userId,
          fecha,
          monto: Number(values[userId][fecha]) || 0,
        });
      });
    });

    setTotalToCreate(plan.length);

    let success = 0;
    let failed = 0;

    for (const item of plan) {
      try {
        // Cada valor se persiste únicamente para el asociado seleccionado
        await savingsService.create({
          fechaAporte: item.fecha,
          monto: item.monto,
          observaciones: formData.observaciones || null,
          tipoAporte: formData.tipoAporte,
          estado: formData.estado,
          metodoPago: formData.metodoPago,
          comprobante: null,
          idUsuarioRegistro: currentUserId ?? null,
          idAsociado: item.userId,
        } as any);
        success++;
        setSuccessCount(success);
      } catch (error) {
        console.error(
          `Error registrando ahorro para el asociado ${item.userId} en ${item.fecha}:`,
          error
        );
        failed++;
        setErrorCount(failed);
      }
    }

    setLoading(false);
    onSuccess();

    if (failed === 0) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const showValuesTable = visibleDates.length > 0 && selectedUsers.length > 0;

  return (
    <Modal open={open} onClose={loading ? undefined : onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: 3,
          boxShadow: 24,
          maxWidth: 1200,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Registrar Ahorros por Mes
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Registra el ahorro de uno o varios asociados por año completo o por
          rango de fechas. Cada mes tiene su propio valor y no se comparte ni se
          hereda entre asociados.
        </Typography>

        {loading && (
          <Alert severity="info" sx={{ my: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <CircularProgress size={20} />
              <Typography>
                Procesando... {successCount + errorCount} de {totalToCreate}
              </Typography>
            </Box>
          </Alert>
        )}

        {!loading && successCount > 0 && (
          <Alert
            severity={errorCount > 0 ? "warning" : "success"}
            sx={{ my: 2 }}
          >
            {successCount} ahorro(s) registrado(s) exitosamente
            {errorCount > 0 && ` - ${errorCount} fallido(s)`}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Selección de Asociados */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}
            >
              <Typography variant="h6" gutterBottom>
                Seleccionar Asociados ({selectedUsers.length})
              </Typography>

              <TextField
                fullWidth
                label="Buscar asociado"
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
                <Button
                  size="small"
                  onClick={handleDeselectAll}
                  variant="outlined"
                  color="error"
                >
                  Limpiar
                </Button>
              </Box>

              {errors.users && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.users}
                </Alert>
              )}

              <Box
                sx={{
                  maxHeight: 380,
                  overflow: "auto",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
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
                          secondary={`${user.numeroDeIdentificacion || ""} · Ahorro: $ ${formatCurrency(
                            user.totalAhorrado || 0
                          )}`}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </Grid>

          {/* Datos del Ahorro */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box
              sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}
            >
              <Typography variant="h6" gutterBottom>
                Datos del Ahorro
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel id="modo-ahorro-label">
                      Modo de registro
                    </InputLabel>
                    <Select
                      labelId="modo-ahorro-label"
                      value={mode}
                      onChange={(e) => setMode(e.target.value as SavingsMode)}
                      label="Modo de registro"
                    >
                      <MenuItem value="ANIO">Año completo</MenuItem>
                      <MenuItem value="RANGO">Rango de fechas</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {mode === "ANIO" ? (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel id="anio-ahorro-label">Año</InputLabel>
                      <Select
                        labelId="anio-ahorro-label"
                        value={formData.anio}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            anio: Number(e.target.value),
                          })
                        }
                        label="Año"
                      >
                        {yearOptions.map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                ) : (
                  <>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Fecha inicio"
                        name="fechaInicio"
                        type="date"
                        value={formData.fechaInicio}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fechaInicio: e.target.value,
                          })
                        }
                        error={!!errors.fechaInicio}
                        helperText={
                          errors.fechaInicio || "Se toma el día 1 del mes"
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Fecha fin"
                        name="fechaFin"
                        type="date"
                        value={formData.fechaFin}
                        onChange={(e) =>
                          setFormData({ ...formData, fechaFin: e.target.value })
                        }
                        error={!!errors.fechaFin}
                        helperText={
                          errors.fechaFin || "Se toma el día 1 del mes"
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </>
                )}

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth error={!!errors.tipoAporte}>
                    <InputLabel id="tipo-ahorro-label">Tipo de Ahorro</InputLabel>
                    <Select
                      labelId="tipo-ahorro-label"
                      value={formData.tipoAporte}
                      onChange={(e) =>
                        setFormData({ ...formData, tipoAporte: e.target.value })
                      }
                      label="Tipo de Ahorro"
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

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="estado-ahorro-label">Estado</InputLabel>
                    <Select
                      labelId="estado-ahorro-label"
                      value={formData.estado ? "true" : "false"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estado: e.target.value === "true",
                        })
                      }
                      label="Estado"
                    >
                      <MenuItem value="true">Aprobado</MenuItem>
                      <MenuItem value="false">Pendiente</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth error={!!errors.metodoPago}>
                    <InputLabel id="metodo-ahorro-label">
                      Método de Pago
                    </InputLabel>
                    <Select
                      labelId="metodo-ahorro-label"
                      value={formData.metodoPago}
                      onChange={(e) =>
                        setFormData({ ...formData, metodoPago: e.target.value })
                      }
                      label="Método de Pago"
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

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Observaciones (opcional)"
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={(e) =>
                      setFormData({ ...formData, observaciones: e.target.value })
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Alert severity="info">
                    Se generarán {monthlyDates.length} mes(es) tomando siempre el
                    día 1 de cada mes
                    {truncated &&
                      ". No se generan meses posteriores a la fecha actual"}
                    . Deja vacío el mes que no tenga ahorro, escríbelo en 0 para
                    registrarlo en cero o usa la papelera para quitarlo de la
                    lista.
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        {/* Valores por mes (independientes por asociado) */}
        <Box
          sx={{ mt: 3, border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
          >
            <Typography variant="h6">Valores por mes</Typography>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Typography variant="body2" color="text.secondary">
                {visibleDates.length} mes(es)
                {removedDates.length > 0 &&
                  ` (${removedDates.length} eliminado(s))`}
                {` · ${selectedUsers.length} asociado(s) · ${plannedCount} ahorro(s)`}
              </Typography>
              {removedDates.length > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<IconArrowBackUp size={16} />}
                  onClick={handleRestoreMonths}
                  disabled={loading}
                >
                  Restaurar meses ({removedDates.length})
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={handleClearValues}
                disabled={loading || plannedCount === 0}
              >
                Limpiar valores
              </Button>
            </Box>
          </Box>

          {errors.dates && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {errors.dates}
            </Alert>
          )}
          {errors.values && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.values}
            </Alert>
          )}

          {!showValuesTable ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {selectedUsers.length === 0
                ? "Selecciona al menos un asociado y un año o rango de fechas para capturar el valor de cada mes."
                : "Quitaste todos los meses de la lista. Usa «Restaurar meses» para volver a mostrarlos."}
            </Typography>
          ) : (
            <TableContainer
              sx={{
                mt: 2,
                maxHeight: 850,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 215, fontWeight: 600 }}>
                      Mes
                    </TableCell>
                    {selectedUserObjects.map((user) => (
                      <TableCell key={`head-${user.id}`} sx={{ minWidth: 215 }}>
                        <Typography variant="subtitle2">
                          {getUserName(user)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.numeroDeIdentificacion}
                        </Typography>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                          mt={0.5}
                        >
                          <TextField
                            size="small"
                            placeholder="Valor"
                            value={quickValues[user.id] ?? ""}
                            onChange={(e) =>
                              handleQuickValueChange(user.id, e.target.value)
                            }
                            inputProps={{ inputMode: "numeric" }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  $
                                </InputAdornment>
                              ),
                            }}
                            sx={{ width: 110 }}
                          />
                          <Tooltip title="Aplicar este valor a todos los meses">
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleApplyToAllMonths(user.id)}
                                disabled={loading || !quickValues[user.id]}
                              >
                                <IconBolt size={16} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleDates.map((fecha) => (
                    <TableRow key={fecha}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {formatMonthLabel(fecha)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {fecha}
                              {!rowHasValues(fecha) && " · sin ahorro"}
                            </Typography>
                          </Box>
                          <Tooltip title="Quitar este mes de la lista">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveMonth(fecha)}
                                disabled={loading}
                                aria-label={`Quitar ${formatMonthLabel(fecha)}`}
                              >
                                <IconTrash size={16} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      {selectedUserObjects.map((user) => (
                        <TableCell key={`${user.id}-${fecha}`}>
                          <TextField
                            size="small"
                            placeholder="0"
                            value={getValue(user.id, fecha)}
                            onChange={(e) =>
                              handleValueChange(user.id, fecha, e.target.value)
                            }
                            inputProps={{ inputMode: "numeric" }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  $
                                </InputAdornment>
                              ),
                            }}
                            sx={{ width: 150 }}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                    {selectedUserObjects.map((user) => (
                      <TableCell
                        key={`total-${user.id}`}
                        sx={{ fontWeight: 600, color: "#2e7d32" }}
                      >
                        $ {formatCurrency(columnTotal(user.id))}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Botones de acción */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          flexWrap="wrap"
          sx={{ mt: 3 }}
        >
          <Typography variant="body2" color="text.secondary">
            {showValuesTable
              ? `Se registrarán ${plannedCount} ahorro(s) para ${
                  selectedUsers.length
                } asociado(s) en ${visibleDates.length} mes(es).${
                  grandTotal > 0
                    ? ` Total: $ ${formatCurrency(grandTotal)}.`
                    : ""
                }`
              : "Selecciona asociados y fechas para continuar."}
            {showValuesTable &&
              " Los meses que dejes vacíos no se registrarán."}
          </Typography>
          <Box display="flex" gap={2} ml="auto">
            <Button onClick={onClose} variant="outlined" disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={
                loading ||
                selectedUsers.length === 0 ||
                monthlyDates.length === 0
              }
            >
              {loading
                ? "Procesando..."
                : plannedCount > 0
                  ? `Guardar ${plannedCount} Ahorro(s)`
                  : "Guardar Ahorros"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default BulkSavingsModal;
