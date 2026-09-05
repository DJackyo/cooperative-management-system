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
} from "@mui/material";
import { IconCalculator, IconCash, IconSearch, IconX } from "@tabler/icons-react";
import PageHeader from "@/app/(DashboardLayout)/components/shared/PageHeader";
import StyledTable from "@/components/StyledTable";
import StatusChip from "@/components/StatusChip";
import { asociadosService } from "@/services/asociadosService";
import { retirosService } from "@/services/retirosService";
import { formatCurrency } from "@/app/(DashboardLayout)/utilities/utils";

const today = new Date().toISOString().slice(0, 10);

const WithdrawalsPage = () => {
  const [associates, setAssociates] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [negativeBalances, setNegativeBalances] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVO");
  const [selected, setSelected] = useState<any | null>(null);
  const [calculation, setCalculation] = useState<any | null>(null);
  const [fechaRetiro, setFechaRetiro] = useState(today);
  const [observaciones, setObservaciones] = useState("");
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

  const openCalculation = async (associate: any) => {
    setSelected(associate);
    setCalculation(null);
    setSuccess(null);
    setError(null);
    setCalculating(true);
    try {
      setCalculation(await retirosService.calculate(associate.id));
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message || "No fue posible calcular el cruce de cuentas.");
    } finally {
      setCalculating(false);
    }
  };

  const confirmWithdrawal = async () => {
    if (!selected || !calculation) return;
    setSaving(true);
    setError(null);
    try {
      await retirosService.liquidate(selected.id, { fechaRetiro, observaciones });
      setSuccess("El retiro fue liquidado y el asociado pasó a estado RETIRADO.");
      setSelected(null);
      await loadData();
    } catch (saveError: any) {
      setError(saveError?.response?.data?.message || "No fue posible confirmar el retiro.");
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => { setSearch(""); setStatusFilter("ACTIVO"); };
  const totalDevoluciones = withdrawals.filter((item) => item.estado === "PAGAR_DEVOLUCION").length;
  const totalCobros = withdrawals.filter((item) => item.estado === "COBRAR_SALDO").length;

  return (
    <Box>
      <PageHeader title="Retiros y liquidaciones" subtitle="Cruza aportes y créditos antes de finalizar el retiro de un asociado" icon={<IconCash size={22} />} gradient="linear-gradient(135deg, #0f766e 0%, #14b8a6 120%)" />
      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 3 }}>{success}</Alert>}

      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, sm: 4 }}><Card variant="outlined"><CardContent><Typography variant="body2" color="text.secondary">Retiros registrados</Typography><Typography variant="h4" fontWeight={800}>{withdrawals.length}</Typography></CardContent></Card></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><Card variant="outlined"><CardContent><Typography variant="body2" color="text.secondary">Devoluciones por pagar</Typography><Typography variant="h4" fontWeight={800} color="success.main">{totalDevoluciones}</Typography></CardContent></Card></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><Card variant="outlined"><CardContent><Typography variant="body2" color="text.secondary">Saldos por cobrar</Typography><Typography variant="h4" fontWeight={800} color="error.main">{totalCobros}</Typography></CardContent></Card></Grid>

        <Grid size={{ xs: 12 }}>
          <Card variant="outlined"><CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap" mb={2}>
              <Box><Typography variant="h5" color="error.main">Asociados con saldo negativo</Typography><Typography variant="body2" color="text.secondary">Aportes vigentes insuficientes para cubrir el capital pendiente de sus créditos aprobados.</Typography></Box>
              <Typography variant="body2" color="text.secondary">{negativeBalances.length} resultado{negativeBalances.length === 1 ? "" : "s"}</Typography>
            </Box>
            <StyledTable columns={[{ field: "asociado.id", headerName: "ID", width: 70 }, { field: "asociado.nombres", headerName: "Asociado", width: 250 }, { field: "asociado.numeroDeIdentificacion", headerName: "Identificación", width: 160 }, { field: "totalAportes", headerName: "Aportes", width: 140 }, { field: "saldoCreditos", headerName: "Crédito pendiente", width: 160 }, { field: "saldoNeto", headerName: "Saldo negativo", width: 150 }]} rows={negativeBalances} withPagination pageSizeOptions={[10, 25, 50]} exportFilename="saldos_negativos_aportes" exportSheetName="Saldos negativos" renderCell={(column, item) => { if (column.field === "asociado.nombres") return item.asociado?.nombres || ""; if (column.field === "totalAportes" || column.field === "saldoCreditos" || column.field === "saldoNeto") return `$ ${formatCurrency(Math.abs(item[column.field]))}`; return column.field.split(".").reduce((value: any, key: string) => value?.[key], item) || ""; }} actions={(item) => <Button size="small" variant="outlined" startIcon={<IconCalculator size={16} />} onClick={() => openCalculation({ id: item.asociado.id, nombre1: item.asociado.nombres, numeroDeIdentificacion: item.asociado.numeroDeIdentificacion, idEstado: { estado: item.asociado.estado } })}>Revisar</Button>} />
          </CardContent></Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} gap={2} flexWrap="wrap" mb={2}>
                <Box><Typography variant="h5" color="primary">Asociados para retiro</Typography><Typography variant="body2" color="text.secondary">Simula la liquidación y confirma solo cuando el cruce esté revisado.</Typography></Box>
                <Box display="flex" gap={1} flexWrap="wrap"><Button size="small" color="inherit" startIcon={<IconX size={17} />} onClick={clearFilters} disabled={!search && statusFilter === "ACTIVO"}>Limpiar</Button><Button size="small" variant="outlined" onClick={loadData}>Actualizar</Button></Box>
              </Box>
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 7 }}><TextField fullWidth size="small" label="Buscar asociado" placeholder="Nombre, identificación o ID" value={search} onChange={(event) => setSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><IconSearch size={18} /></InputAdornment> }} /></Grid>
                <Grid size={{ xs: 12, md: 3 }}><Select fullWidth size="small" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><MenuItem value="">Todos los estados</MenuItem><MenuItem value="ACTIVO">Activos</MenuItem><MenuItem value="RETIRADO">Retirados</MenuItem><MenuItem value="EXASOCIADO">Exasociados</MenuItem></Select></Grid>
                <Grid size={{ xs: 12, md: 2 }} display="flex" alignItems="center"><Typography variant="body2" color="text.secondary">{filteredAssociates.length} resultado{filteredAssociates.length === 1 ? "" : "s"}</Typography></Grid>
              </Grid>
              {loading ? <CircularProgress /> : <StyledTable columns={[{ field: "id", headerName: "ID", width: 70 }, { field: "nombres", headerName: "Asociado", width: 240 }, { field: "numeroDeIdentificacion", headerName: "Identificación", width: 160 }, { field: "estado", headerName: "Estado", width: 130 }]} rows={filteredAssociates} withPagination pageSizeOptions={[10, 25, 50]} exportFilename="asociados_retiros" exportSheetName="Retiros" renderCell={(column, associate) => { if (column.field === "nombres") return associate.nombres || [associate.nombre1, associate.nombre2, associate.apellido1, associate.apellido2].filter(Boolean).join(" "); if (column.field === "estado") return <StatusChip status={associate.idEstado?.estado || associate.estado} size="small" />; return associate[column.field] || ""; }} actions={(associate) => <Button size="small" variant="outlined" startIcon={<IconCalculator size={16} />} onClick={() => openCalculation(associate)} disabled={(associate.idEstado?.estado || associate.estado) !== "ACTIVO"}>Calcular cruce</Button>} />}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined"><CardContent><Typography variant="h5" color="primary" sx={{ mb: 2 }}>Historial de liquidaciones</Typography><StyledTable columns={[{ field: "id", headerName: "ID", width: 70 }, { field: "asociado.nombre1", headerName: "Asociado", width: 240 }, { field: "fechaLiquidacion", headerName: "Fecha", width: 150 }, { field: "saldoNeto", headerName: "Saldo neto", width: 150 }, { field: "estado", headerName: "Resultado", width: 180 }]} rows={withdrawals} withPagination pageSizeOptions={[10, 25, 50]} exportFilename="historial_liquidaciones" exportSheetName="Liquidaciones" renderCell={(column, item) => { if (column.field === "asociado.nombre1") return [item.asociado?.nombre1, item.asociado?.apellido1].filter(Boolean).join(" "); if (column.field === "saldoNeto") return `$ ${formatCurrency(item.saldoNeto)}`; if (column.field === "estado") return <StatusChip status={item.estado} size="small" />; return item[column.field] ? new Date(item[column.field]).toLocaleDateString("es-CO") : ""; }} /></CardContent></Card>
        </Grid>
      </Grid>

      <Dialog open={Boolean(selected)} onClose={saving ? undefined : () => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>Liquidación de retiro</DialogTitle>
        <DialogContent>
          {calculating ? <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box> : calculation && <>
            <Typography variant="subtitle1" fontWeight={700}>{calculation.asociado.nombres}</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Identificación: {calculation.asociado.numeroDeIdentificacion}</Typography>
            <Grid container spacing={1.5} sx={{ mb: 2 }}><Grid size={{ xs: 12, sm: 4 }}><Card variant="outlined"><CardContent><Typography variant="caption">Aportes</Typography><Typography fontWeight={800}>$ {formatCurrency(calculation.totalAportes)}</Typography></CardContent></Card></Grid><Grid size={{ xs: 12, sm: 4 }}><Card variant="outlined"><CardContent><Typography variant="caption">Saldo créditos</Typography><Typography fontWeight={800}>$ {formatCurrency(calculation.saldoCreditos)}</Typography></CardContent></Card></Grid><Grid size={{ xs: 12, sm: 4 }}><Card variant="outlined"><CardContent><Typography variant="caption">Resultado</Typography><Typography fontWeight={800} color={calculation.saldoNeto >= 0 ? "success.main" : "error.main"}>$ {formatCurrency(Math.abs(calculation.saldoNeto))}</Typography></CardContent></Card></Grid></Grid>
            <Alert severity={calculation.resultado === "PAGAR_DEVOLUCION" ? "success" : calculation.resultado === "COBRAR_SALDO" ? "warning" : "info"} sx={{ mb: 2 }}>{calculation.resultado === "PAGAR_DEVOLUCION" ? "El asociado tiene un valor a devolver." : calculation.resultado === "COBRAR_SALDO" ? "El asociado mantiene un saldo pendiente por cobrar." : "El cruce queda en cero."}</Alert>
            <TextField fullWidth type="date" label="Fecha de retiro" value={fechaRetiro} onChange={(event) => setFechaRetiro(event.target.value)} InputLabelProps={{ shrink: true }} margin="normal" /><TextField fullWidth multiline minRows={2} label="Observaciones" value={observaciones} onChange={(event) => setObservaciones(event.target.value)} margin="normal" />
          </>}
        </DialogContent>
        <DialogActions><Button onClick={() => setSelected(null)} disabled={saving}>Cancelar</Button><Button variant="contained" color="warning" onClick={confirmWithdrawal} disabled={!calculation || calculating || saving}>{saving ? "Procesando..." : "Confirmar retiro"}</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default WithdrawalsPage;
