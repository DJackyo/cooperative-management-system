"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
  Stack,
  Divider,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Skeleton,
  Fade,
  Tabs,
  Tab,
} from "@mui/material";
import {
  IconCalculator,
  IconCash,
  IconEye,
  IconFileDescription,
  IconSearch,
  IconX,
  IconCheck,
  IconBan,
  IconRefresh,
  IconAlertTriangle,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconFilter,
  IconUserOff,
  IconArrowUpRight,
  IconArrowDownLeft,
} from "@tabler/icons-react";
import PageHeader from "@/app/(DashboardLayout)/components/shared/PageHeader";
import StyledTable from "@/components/StyledTable";
import StatusChip from "@/components/StatusChip";
import { asociadosService } from "@/services/asociadosService";
import { retirosService } from "@/services/retirosService";
import { formatCurrency } from "@/app/(DashboardLayout)/utilities/utils";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

const today = new Date().toISOString().slice(0, 10);

// Stat card reutilizable
const StatCard: React.FC<{
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ label, value, icon, color, subtitle }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "divider",
      transition: "all 0.2s",
      height: "100%",
      "&:hover": {
        borderColor: color,
        transform: "translateY(-2px)",
        boxShadow: (theme) => theme.shadows[2],
      },
    }}
  >
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Avatar sx={{ width: 40, height: 40, bgcolor: `${color}15`, color }}>
        {icon}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}
        >
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  </Paper>
);

const WithdrawalsPage = () => {
  const [associates, setAssociates] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [negativeBalances, setNegativeBalances] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVO");
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [selected, setSelected] = useState<any | null>(null);
  const [calculation, setCalculation] = useState<any | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [fechaRetiro, setFechaRetiro] = useState(today);
  const [motivo, setMotivo] = useState("");
  const [adjunto, setAdjunto] = useState<File | null>(null);
  const [rejection, setRejection] = useState<any | null>(null);
  const [detailWithdrawal, setDetailWithdrawal] = useState<any | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [associateData, withdrawalData, negativeData] = await Promise.all([
        asociadosService.fetchAll(),
        retirosService.fetchAll(),
        retirosService.fetchNegativeBalances(),
      ]);
      setAssociates(associateData || []);
      setWithdrawals(withdrawalData || []);
      setNegativeBalances(negativeData || []);
    } catch (loadError) {
      console.error("Error al cargar retiros:", loadError);
      setError("No fue posible cargar la información de retiros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredAssociates = useMemo(() => associates.filter((associate) => {
    const normalized = search.trim().toLowerCase();
    const name = [associate.nombre1, associate.nombre2, associate.apellido1, associate.apellido2, associate.nombres]
      .filter(Boolean).join(" ").toLowerCase();
    const status = associate.idEstado?.estado || associate.estado || "";
    return (!normalized || name.includes(normalized) || String(associate.id).includes(normalized) || String(associate.numeroDeIdentificacion || "").includes(normalized))
      && (!statusFilter || status.toUpperCase() === statusFilter);
  }), [associates, search, statusFilter]);

  const filteredWithdrawals = useMemo(
    () => withdrawals.filter((withdrawal) => !withdrawalStatusFilter || withdrawal.estadoSolicitud === withdrawalStatusFilter),
    [withdrawals, withdrawalStatusFilter],
  );

  const openRequest = (associate: any) => {
    setSelected(associate);
    setCalculation(null);
    setSelectedWithdrawal(null);
    setMotivo("");
    setAdjunto(null);
    setFechaRetiro(today);
    setError(null);
  };

  const openCalculation = async (withdrawal: any) => {
    setSelected(withdrawal.asociado);
    setSelectedWithdrawal(withdrawal);
    setCalculation(null);
    setSuccess(null);
    setError(null);
    setCalculating(true);
    try {
      setCalculation(await retirosService.calculate(withdrawal.asociado.id));
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message || "No fue posible calcular el cruce de cuentas.");
    } finally {
      setCalculating(false);
    }
  };

  const requestWithdrawal = async () => {
    if (!selected || !motivo.trim() || !adjunto) return;
    setSaving(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("fechaRetiro", fechaRetiro);
      data.append("motivo", motivo.trim());
      data.append("adjunto", adjunto);
      await retirosService.request(selected.id, data);
      setSelected(null);
      setSuccess("La solicitud de retiro fue registrada y quedó pendiente de aprobación.");
      await loadData();
    } catch (saveError: any) {
      setError(saveError?.response?.data?.message || "No fue posible registrar la solicitud de retiro.");
    } finally {
      setSaving(false);
    }
  };

  const confirmWithdrawal = async () => {
    if (!selectedWithdrawal?.id) return;
    setSaving(true);
    setError(null);
    try {
      await retirosService.confirm(selectedWithdrawal.id);
      setSelected(null);
      setSelectedWithdrawal(null);
      setSuccess("El cruce fue confirmado y el asociado pasó a estado RETIRADO.");
      await loadData();
    } catch (confirmError: any) {
      setError(confirmError?.response?.data?.message || "No fue posible confirmar el retiro.");
    } finally {
      setSaving(false);
    }
  };

  const approveWithdrawal = async (withdrawal: any) => {
    setSaving(true);
    try {
      await retirosService.approve(withdrawal.id);
      setSuccess("El retiro fue aprobado. Ahora puede calcularse el cruce.");
      await loadData();
    } catch (approveError: any) {
      setError(approveError?.response?.data?.message || "No fue posible aprobar el retiro.");
    } finally {
      setSaving(false);
    }
  };

  const rejectWithdrawal = async () => {
    if (!rejection || !motivoRechazo.trim()) return;
    setSaving(true);
    try {
      await retirosService.reject(rejection.id, motivoRechazo.trim());
      setRejection(null);
      setMotivoRechazo("");
      setSuccess("El retiro fue rechazado y el motivo quedó registrado.");
      await loadData();
    } catch (rejectError: any) {
      setError(rejectError?.response?.data?.message || "No fue posible rechazar el retiro.");
    } finally {
      setSaving(false);
    }
  };

  const getAttachmentUrl = (attachment: string) => {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").replace(/\/$/, "");
    return `${baseUrl}/uploads/${attachment.replace(/^\//, "")}`;
  };

  const openAttachment = (attachment: string) => {
    window.open(getAttachmentUrl(attachment), "_blank", "noopener,noreferrer");
  };

  const clearFilters = () => { setSearch(""); setStatusFilter("ACTIVO"); setWithdrawalStatusFilter(""); };

  const totalDevoluciones = withdrawals.filter((item) => item.estado === "PAGAR_DEVOLUCION").length;
  const totalCobros = withdrawals.filter((item) => item.estado === "COBRAR_SALDO").length;
  const totalPendientes = withdrawals.filter((item) => item.estadoSolicitud === "PENDIENTE").length;
  const totalAprobadas = withdrawals.filter((item) => item.estadoSolicitud === "APROBADO").length;
  const totalRechazadas = withdrawals.filter((item) => item.estadoSolicitud === "RECHAZADO").length;

  return (
    <Box>
      <PageHeader
        title="Retiros y liquidaciones"
        subtitle="Cruza aportes y créditos antes de finalizar el retiro de un asociado"
        icon={<IconCash size={22} />}
        gradient="linear-gradient(135deg, #0f766e 0%, #14b8a6 120%)"
      />

      {error && (
        <Fade in>
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </Fade>
      )}
      {success && (
        <Fade in>
          <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Fade>
      )}

      {/* Stats mejoradas */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Pendientes"
            value={totalPendientes}
            icon={<IconClock size={20} />}
            color="#f59e0b"
            subtitle="Por aprobar"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Aprobadas"
            value={totalAprobadas}
            icon={<IconCircleCheck size={20} />}
            color="#10b981"
            subtitle="Listas para cruce"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Rechazadas"
            value={totalRechazadas}
            icon={<IconCircleX size={20} />}
            color="#ef4444"
            subtitle="No procedentes"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Devoluciones / Cobros"
            value={`${totalDevoluciones} / ${totalCobros}`}
            icon={<IconCash size={20} />}
            color="#3b82f6"
            subtitle="Resultado del cruce"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, px: 1 }}>
            <Tabs
              value={activeTab}
              onChange={(_event, value) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Secciones de retiros"
            >
              <Tab label={`Solicitudes (${withdrawals.length})`} />
              <Tab label={`Asociados para retiro (${filteredAssociates.length})`} />
              <Tab label={`Saldos negativos (${negativeBalances.length})`} />
            </Tabs>
          </Paper>
        </Grid>

        {/* Saldos negativos */}
        {activeTab === 2 && <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "error.light",
              bgcolor: "#fef2f2",
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "error.main" }}>
                  <IconAlertTriangle size={18} color="white" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="error.dark">
                    Asociados con saldo negativo
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Aportes insuficientes para cubrir el capital pendiente de créditos aprobados
                  </Typography>
                </Box>
              </Stack>
              <Chip
                label={`${negativeBalances.length} ${negativeBalances.length === 1 ? "caso" : "casos"}`}
                size="small"
                color="error"
                variant="outlined"
              />
            </Stack>
            <StyledTable
              columns={[
                { field: "asociado.id", headerName: "ID", width: 70 },
                { field: "asociado.nombres", headerName: "Asociado", width: 250 },
                { field: "asociado.numeroDeIdentificacion", headerName: "Identificación", width: 160 },
                { field: "totalAportes", headerName: "Aportes", width: 140 },
                { field: "saldoCreditos", headerName: "Crédito pendiente", width: 160 },
                { field: "saldoNeto", headerName: "Saldo negativo", width: 150 },
              ]}
              rows={negativeBalances}
              withPagination
              pageSizeOptions={[10, 25, 50]}
              exportFilename="saldos_negativos_aportes"
              exportSheetName="Saldos negativos"
              renderCell={(column, item) => {
                if (column.field === "asociado.nombres") return item.asociado?.nombres || "";
                if (column.field === "totalAportes" || column.field === "saldoCreditos" || column.field === "saldoNeto") {
                  const value = Math.abs(item[column.field]);
                  const isNegative = column.field === "saldoNeto";
                  return (
                    <Typography
                      variant="body2"
                      fontWeight={isNegative ? 700 : 500}
                      color={isNegative ? "error.main" : "text.primary"}
                    >
                      $ {formatCurrency(value)}
                    </Typography>
                  );
                }
                return column.field.split(".").reduce((value: any, key: string) => value?.[key], item) || "";
              }}
              actions={(item) => (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<IconUserOff size={14} />}
                  onClick={() => openRequest({
                    id: item.asociado.id,
                    nombre1: item.asociado.nombres,
                    numeroDeIdentificacion: item.asociado.numeroDeIdentificacion,
                    idEstado: { estado: item.asociado.estado },
                  })}
                >
                  Solicitar retiro
                </Button>
              )}
            />
          </Paper>
        </Grid>}

        {/* Filtros */}
        {activeTab === 1 && <>
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <IconFilter size={18} color="#64748b" />
              <Typography variant="subtitle2" fontWeight={600}>
                Filtros de búsqueda
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Button
                size="small"
                color="inherit"
                startIcon={<IconX size={16} />}
                onClick={clearFilters}
                disabled={!search && statusFilter === "ACTIVO"}
              >
                Limpiar
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<IconRefresh size={16} />}
                onClick={loadData}
                disabled={loading}
              >
                Actualizar
              </Button>
            </Stack>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 7 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar por nombre, identificación o ID"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={18} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Select
                  fullWidth
                  size="small"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <MenuItem value="">Todos los estados</MenuItem>
                  <MenuItem value="ACTIVO">Activos</MenuItem>
                  <MenuItem value="RETIRADO">Retirados</MenuItem>
                  <MenuItem value="EXASOCIADO">Exasociados</MenuItem>
                </Select>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }} display="flex" alignItems="center">
                <Chip
                  label={`${filteredAssociates.length} resultado${filteredAssociates.length === 1 ? "" : "s"}`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Asociados */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                <IconCash size={18} color="white" />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Asociados para retiro
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {filteredAssociates.length} resultado{filteredAssociates.length === 1 ? "" : "s"} con los filtros actuales
                </Typography>
              </Box>
            </Stack>

            {loading ? (
              <Box sx={{ py: 4 }}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
              </Box>
            ) : (
              <StyledTable
                columns={[
                  { field: "id", headerName: "ID", width: 70 },
                  { field: "nombres", headerName: "Asociado", width: 240 },
                  { field: "numeroDeIdentificacion", headerName: "Identificación", width: 160 },
                  { field: "estado", headerName: "Estado", width: 130 },
                ]}
                rows={filteredAssociates}
                withPagination
                pageSizeOptions={[10, 25, 50]}
                exportFilename="asociados_retiros"
                exportSheetName="Retiros"
                renderCell={(column, associate) => {
                  if (column.field === "nombres") {
                    return associate.nombres || [associate.nombre1, associate.nombre2, associate.apellido1, associate.apellido2].filter(Boolean).join(" ");
                  }
                  if (column.field === "estado") return <StatusChip status={associate.idEstado?.estado || associate.estado} size="small" />;
                  return associate[column.field] || "";
                }}
                actions={(associate) => (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<IconCash size={14} />}
                    onClick={() => openRequest(associate)}
                    disabled={(associate.idEstado?.estado || associate.estado) !== "ACTIVO"}
                  >
                    Solicitar retiro
                  </Button>
                )}
              />
            )}
          </Paper>
        </Grid>
        </>}

        {/* Solicitudes */}
        {activeTab === 0 && <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "info.main" }}>
                  <IconFileDescription size={18} color="white" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Solicitudes de retiro
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {filteredWithdrawals.length} de {withdrawals.length} solicitudes
                  </Typography>
                </Box>
              </Stack>
              <Select
                size="small"
                value={withdrawalStatusFilter}
                onChange={(event) => setWithdrawalStatusFilter(event.target.value)}
                displayEmpty
                sx={{ minWidth: 190 }}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                <MenuItem value="PENDIENTE">Pendientes</MenuItem>
                <MenuItem value="APROBADO">Aprobadas</MenuItem>
                <MenuItem value="RECHAZADO">Rechazadas</MenuItem>
              </Select>
            </Stack>

            <StyledTable
              columns={[
                { field: "id", headerName: "ID", width: 70 },
                { field: "asociado.nombre1", headerName: "Asociado", width: 220 },
                { field: "fechaSolicitud", headerName: "Solicitud", width: 130 },
                { field: "estadoSolicitud", headerName: "Estado solicitud", width: 150 },
                { field: "motivo", headerName: "Motivo", width: 240 },
                { field: "motivoRechazo", headerName: "Motivo rechazo", width: 240 },
                { field: "estado", headerName: "Resultado cruce", width: 160 },
              ]}
              rows={filteredWithdrawals}
              withPagination
              pageSizeOptions={[10, 25, 50]}
              exportFilename="solicitudes_retiros"
              exportSheetName="Retiros"
              renderCell={(column, item) => {
                if (column.field === "asociado.nombre1") return [item.asociado?.nombre1, item.asociado?.apellido1].filter(Boolean).join(" ");
                if (column.field === "estadoSolicitud") return <StatusChip status={item.estadoSolicitud} size="small" />;
                if (column.field === "estado") return item.estado && item.estado !== "PENDIENTE" ? <StatusChip status={item.estado} size="small" /> : <Typography variant="caption" color="text.secondary">Pendiente de cálculo</Typography>;
                if (column.field === "fechaSolicitud" || column.field === "fechaRetiro") return item[column.field] ? new Date(item[column.field]).toLocaleDateString("es-CO") : "";
                return item[column.field] || "";
              }}
              actions={(item) => (
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  <Tooltip title="Ver detalle">
                    <IconButton size="small" onClick={() => setDetailWithdrawal(item)}>
                      <IconEye size={16} />
                    </IconButton>
                  </Tooltip>
                  {item.estadoSolicitud === "PENDIENTE" && (
                    <>
                      <Tooltip title="Aprobar">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => approveWithdrawal(item)}
                          disabled={saving}
                        >
                          <IconCheck size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rechazar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => { setRejection(item); setMotivoRechazo(""); }}
                        >
                          <IconBan size={16} />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {item.estadoSolicitud === "APROBADO" && !item.fechaLiquidacion && (
                    <Button
                      size="small"
                      variant="contained"
                      color="warning"
                      startIcon={<IconCalculator size={14} />}
                      onClick={() => openCalculation(item)}
                      sx={{ textTransform: "none" }}
                    >
                      Calcular
                    </Button>
                  )}
                </Stack>
              )}
            />
          </Paper>
        </Grid>}
      </Grid>

      {/* Modal solicitud/cálculo */}
      <Dialog
        open={Boolean(selected)}
        onClose={saving ? undefined : () => setSelected(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
          {calculation ? <IconCalculator size={20} /> : <IconCash size={20} />}
          <Typography variant="h6" fontWeight={600}>
            {calculation ? "Calcular cruce del retiro" : "Solicitar retiro"}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {calculating ? (
            <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" p={4} gap={2}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary">
                Calculando cruce de cuentas...
              </Typography>
            </Box>
          ) : calculation ? (
            <>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: "primary.main" }}>{calculation.asociado.nombres?.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {calculation.asociado.nombres}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {calculation.asociado.numeroDeIdentificacion}
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 4 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#f0fdf4", borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                      Aportes
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700} color="success.main">
                      ${formatCurrency(calculation.totalAportes)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fef2f2", borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                      Créditos
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700} color="error.main">
                      ${formatCurrency(calculation.saldoCreditos)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#eff6ff", borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                      Resultado
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color={calculation.saldoNeto >= 0 ? "success.main" : "error.main"}
                    >
                      ${formatCurrency(Math.abs(calculation.saldoNeto))}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Alert
                severity={
                  calculation.resultado === "PAGAR_DEVOLUCION" ? "success" :
                  calculation.resultado === "COBRAR_SALDO" ? "warning" : "info"
                }
                icon={
                  calculation.resultado === "PAGAR_DEVOLUCION" ? <IconArrowUpRight /> :
                  calculation.resultado === "COBRAR_SALDO" ? <IconArrowDownLeft /> : undefined
                }
                sx={{ borderRadius: 1.5 }}
              >
                {calculation.resultado === "PAGAR_DEVOLUCION"
                  ? "El asociado tiene un valor a devolver."
                  : calculation.resultado === "COBRAR_SALDO"
                  ? "El asociado mantiene un saldo pendiente por cobrar."
                  : "El cruce queda en cero."}
              </Alert>
            </>
          ) : selected && (
            <>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  {(selected.nombres || selected.nombre1)?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {selected.nombres || [selected.nombre1, selected.nombre2, selected.apellido1, selected.apellido2].filter(Boolean).join(" ")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {selected.numeroDeIdentificacion}
                  </Typography>
                </Box>
              </Stack>

              <TextField
                fullWidth
                required
                type="date"
                label="Fecha del retiro"
                value={fechaRetiro}
                onChange={(event) => setFechaRetiro(event.target.value)}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                helperText="Fecha en la que se hará efectivo el retiro."
              />
              <TextField
                fullWidth
                required
                multiline
                minRows={3}
                label="Motivo del retiro"
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
                margin="normal"
                helperText="Explica brevemente por qué se solicita el retiro."
              />
              <Button
                component="label"
                variant="outlined"
                fullWidth
                startIcon={<IconFileDescription size={18} />}
                sx={{ mt: 2, justifyContent: "flex-start", textTransform: "none", py: 1.5 }}
              >
                {adjunto ? `Adjunto: ${adjunto.name}` : "Adjuntar soporte *"}
                <input
                  hidden
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) => setAdjunto(event.target.files?.[0] || null)}
                />
              </Button>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                Formatos permitidos: PDF, JPG o PNG. Máximo 5 MB.
              </Typography>
            </>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelected(null)} disabled={saving} color="inherit">
            Cancelar
          </Button>
          {calculation ? (
            <Button
              variant="contained"
              color="warning"
              onClick={confirmWithdrawal}
              disabled={calculating || saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <IconCheck size={16} />}
            >
              {saving ? "Procesando..." : "Confirmar cruce"}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={requestWithdrawal}
              disabled={!motivo.trim() || !fechaRetiro || !adjunto || saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <IconCash size={16} />}
            >
              {saving ? "Registrando..." : "Solicitar retiro"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal rechazo */}
      <Dialog
        open={Boolean(rejection)}
        onClose={saving ? undefined : () => setRejection(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "error.main" }}>
          <IconBan size={20} />
          <Typography variant="h6" fontWeight={600}>
            Rechazar retiro
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 1.5 }}>
            Indique el motivo del rechazo para que quede visible en la solicitud.
          </Alert>
          <TextField
            fullWidth
            required
            multiline
            minRows={3}
            label="Motivo de rechazo"
            value={motivoRechazo}
            onChange={(event) => setMotivoRechazo(event.target.value)}
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejection(null)} disabled={saving} color="inherit">
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={rejectWithdrawal}
            disabled={!motivoRechazo.trim() || saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <IconBan size={16} />}
          >
            {saving ? "Guardando..." : "Rechazar retiro"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal detalle */}
      <Dialog
        open={Boolean(detailWithdrawal)}
        onClose={() => setDetailWithdrawal(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconEye size={20} />
          <Typography variant="h6" fontWeight={600}>
            Detalle de solicitud
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {detailWithdrawal && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {detailWithdrawal.asociado?.nombre1?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {[detailWithdrawal.asociado?.nombre1, detailWithdrawal.asociado?.nombre2, detailWithdrawal.asociado?.apellido1, detailWithdrawal.asociado?.apellido2].filter(Boolean).join(" ")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {detailWithdrawal.asociado?.numeroDeIdentificacion || "No disponible"}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">Fecha de solicitud</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {detailWithdrawal.fechaSolicitud ? new Date(detailWithdrawal.fechaSolicitud).toLocaleDateString("es-CO") : "No disponible"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">Fecha del retiro</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {detailWithdrawal.fechaRetiro ? new Date(detailWithdrawal.fechaRetiro).toLocaleDateString("es-CO") : "No disponible"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">Estado</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusChip status={detailWithdrawal.estadoSolicitud} size="small" />
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">Motivo</Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {detailWithdrawal.motivo || "No disponible"}
                </Typography>
              </Grid>

              {detailWithdrawal.motivoRechazo && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                    <Typography variant="caption" fontWeight={700}>Motivo de rechazo</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {detailWithdrawal.motivoRechazo}
                    </Typography>
                  </Alert>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<IconFileDescription size={18} />}
                  onClick={() => openAttachment(detailWithdrawal.adjunto)}
                  disabled={!detailWithdrawal.adjunto}
                  sx={{ textTransform: "none" }}
                >
                  {detailWithdrawal.adjunto ? "Abrir adjunto" : "Sin adjunto"}
                </Button>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailWithdrawal(null)} color="inherit">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WithdrawalsPage;