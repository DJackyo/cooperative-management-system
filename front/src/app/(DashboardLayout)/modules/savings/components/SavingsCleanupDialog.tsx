"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert, Box, Button, Checkbox, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField, Typography,
} from "@mui/material";
import { isAxiosError } from "axios";
import { DuplicateSavingsGroup, SavingsCleanupResult } from "@/interfaces/SavingsCleanup";
import { savingsService } from "@/services/savingsService";
import { formatCurrency } from "../../../utilities/utils";

interface Props {
  idAsociado?: number;
  onClose: () => void;
  onChanged: () => Promise<void>;
}

const groupKey = (group: DuplicateSavingsGroup) => `${group.idAsociado}:${group.periodo}`;
const money = (value: number) => `$ ${formatCurrency(value)}`;
const displayTimestamp = (value: string | null) => value ? value.replace("T", " ").slice(0, 19) : "—";

function errorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string; error?: { message?: string | string[] } }>(error)) {
    const details = error.response?.data?.error?.message;
    if (Array.isArray(details)) return details.join(". ");
    return error.response?.data?.message || error.message;
  }
  return error instanceof Error ? error.message : "No se pudo completar la operación";
}

function receiptUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").replace(/\/$/, "");
  return `${base}/aportes-asociados/comprobante/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export default function SavingsCleanupDialog({ idAsociado, onClose, onChanged }: Props) {
  const [groups, setGroups] = useState<DuplicateSavingsGroup[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [result, setResult] = useState<SavingsCleanupResult | null>(null);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("");
  const [page, setPage] = useState(0);
  const [review, setReview] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const request = useRef<AbortController | null>(null);
  const submitting = useRef(false);

  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError("");
    setSelected(new Set());
    setReview(false);
    setConfirmation("");
    setPage(0);
    try {
      const data = await savingsService.fetchDuplicates(idAsociado, controller.signal);
      if (!controller.signal.aborted) {
        setGroups(data);
        setNeedsRefresh(false);
      }
    } catch (failure) {
      if (!controller.signal.aborted) {
        setError(errorMessage(failure));
        setNeedsRefresh(true);
        setGroups([]);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [idAsociado]);

  useEffect(() => {
    void refresh();
    return () => { request.current?.abort(); };
  }, [refresh]);

  const chosenGroups = useMemo(
    () => groups.filter((group) => group.registros.some((record) => selected.has(record.id))),
    [groups, selected],
  );
  const chosenRecords = chosenGroups.flatMap((group) => group.registros.filter((record) => selected.has(record.id)));
  const selectedTotal = chosenRecords.reduce((sum, record) => sum + record.monto, 0);
  const validSelection = selected.size > 0 && selected.size <= 500 && chosenGroups.length <= 100 &&
    chosenGroups.every((group) => group.registros.some((record) => !selected.has(record.id)));
  const filteredGroups = groups.filter((group) => {
    const term = search.trim().toLocaleLowerCase();
    return (!period || group.periodo === period) &&
      (!term || `${group.nombres} ${group.identificacion ?? ""} ${group.idAsociado}`.toLocaleLowerCase().includes(term) ||
        group.registros.some((record) => String(record.id) === term));
  });
  const visibleGroups = review ? chosenGroups : filteredGroups.slice(page * 10, page * 10 + 10);

  const toggleRecord = (group: DuplicateSavingsGroup, id: number) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (group.registros.filter((record) => !next.has(record.id)).length <= 1) return previous;
        next.add(id);
      }
      return next;
    });
  };

  const submit = async () => {
    if (submitting.current || !validSelection || needsRefresh ||
        reason.trim().length < 10 || reason.trim().length > 500 || confirmation !== "ELIMINAR") return;
    submitting.current = true;
    setSaving(true);
    setError("");
    let completed: SavingsCleanupResult;
    try {
      completed = await savingsService.cleanup({
        motivo: reason.trim(),
        grupos: chosenGroups.map((group) => ({
          idAsociado: group.idAsociado,
          periodo: group.periodo,
          version: group.version,
          ids: group.registros.filter((record) => selected.has(record.id)).map((record) => record.id),
        })),
      });
    } catch (failure) {
      setError(`${errorMessage(failure)}. Actualice la lista antes de volver a seleccionar.`);
      setNeedsRefresh(true);
      setSelected(new Set());
      setReview(false);
      setConfirmation("");
      setSaving(false);
      submitting.current = false;
      return;
    }
    setResult(completed);
    setReason("");
    await refresh();
    try {
      await onChanged();
    } catch (failure) {
      setError(`La depuración se guardó, pero no se pudo actualizar el resumen de ahorros: ${errorMessage(failure)}. Cierre y recargue la página.`);
    } finally {
      setSaving(false);
      submitting.current = false;
    }
  };

  return (
    <Dialog open fullWidth maxWidth="xl" onClose={() => { if (!saving) onClose(); }} aria-labelledby="cleanup-title">
      <DialogTitle id="cleanup-title">
        {review ? "Confirmar depuración de ahorros" : "Depurar aportes duplicados"}
        <Typography component="p" variant="body2" color="text.secondary">
          {idAsociado ? `Asociado #${idAsociado}` : "Todos los asociados, incluidos inactivos y retirados"}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="warning">
            Seleccione únicamente los registros que desea eliminar. Debe quedar al menos un aporte por asociado y mes.
            Se incluyen todos los estados y tipos de aporte. No se suman montos ni se trasladan comprobantes automáticamente.
          </Alert>
          {result && (
            <Alert severity="success">
              Se eliminaron {result.cantidad} aportes por {money(result.montoEliminado)}.
              Auditoría: {result.auditoriaId}. Se guardaron los datos originales; los archivos de comprobantes no se eliminan.
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {!review && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField fullWidth size="small" label="Asociado, identificación o ID de aporte"
                value={search} disabled={loading || saving}
                onChange={(event) => { setSearch(event.target.value); setPage(0); }} />
              <TextField type="month" size="small" label="Mes y año" value={period}
                slotProps={{ inputLabel: { shrink: true } }} disabled={loading || saving}
                onChange={(event) => { setPeriod(event.target.value); setPage(0); }} />
              <Button disabled={loading || saving} onClick={() => { setSearch(""); setPeriod(""); setPage(0); }}>Limpiar filtros</Button>
              <Button disabled={loading || saving} onClick={() => void refresh()}>Actualizar</Button>
            </Stack>
          )}
          <Alert severity={selected.size > 500 || chosenGroups.length > 100 ? "error" : "info"}>
            {selected.size} seleccionados en {chosenGroups.length} meses. Suma a eliminar: <strong>{money(selectedTotal)}</strong>.
            {!review && " La selección incluye otras páginas y filtros; la confirmación mostrará todos los registros afectados."}
            {(selected.size > 500 || chosenGroups.length > 100) && " Máximo 500 registros y 100 grupos por operación."}
          </Alert>
          {loading ? <Box textAlign="center" p={4}><CircularProgress aria-label="Cargando duplicados" /></Box> :
            !visibleGroups.length ? <Alert severity="info">{needsRefresh ? "Actualice para volver a consultar los registros." : "No hay meses duplicados con estos filtros."}</Alert> :
            visibleGroups.map((group) => {
              const selectedCount = group.registros.filter((record) => selected.has(record.id)).length;
              const before = group.registros.reduce((sum, record) => sum + record.monto, 0);
              const after = group.registros.filter((record) => !selected.has(record.id)).reduce((sum, record) => sum + record.monto, 0);
              return (
                <Box key={groupKey(group)} sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.5 }}>
                  <Typography fontWeight={700}>{group.nombres || "Asociado"} #{group.idAsociado} · {group.periodo}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Identificación: {group.identificacion ?? "Sin dato"} · {group.registros.length} aportes ·
                    Se conservan {group.registros.length - selectedCount} · Saldo del mes: {money(before)} → {money(after)}
                  </Typography>
                  <TableContainer>
                    <Table size="small" aria-label={`Aportes del asociado ${group.idAsociado} en ${group.periodo}`}>
                      <TableHead><TableRow>
                        <TableCell>Acción</TableCell><TableCell>ID</TableCell><TableCell>Fecha aporte</TableCell>
                        <TableCell align="right">Monto</TableCell><TableCell>Tipo / estado</TableCell>
                        <TableCell>Método / soporte</TableCell><TableCell>Observaciones</TableCell>
                        <TableCell>Registro / modificación</TableCell>
                      </TableRow></TableHead>
                      <TableBody>{group.registros.map((record) => (
                        <TableRow key={record.id} sx={{ bgcolor: selected.has(record.id) ? "action.selected" : undefined }}>
                          <TableCell>
                            {review ? <Chip size="small" label={selected.has(record.id) ? "Eliminar" : "Conservar"} color={selected.has(record.id) ? "error" : "success"} /> :
                              <Checkbox color="error" checked={selected.has(record.id)}
                                disabled={saving || needsRefresh || (!selected.has(record.id) && selectedCount >= group.registros.length - 1)}
                                onChange={() => toggleRecord(group, record.id)}
                                slotProps={{ input: { "aria-label": `Eliminar aporte ${record.id}` } }} />}
                          </TableCell>
                          <TableCell>{record.id}</TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{record.fecha_aporte.slice(0, 10)}</TableCell>
                          <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{money(record.monto)}</TableCell>
                          <TableCell>{record.tipo_aporte ?? "Sin tipo"}<br />{record.estado === null ? "Sin estado" : record.estado ? "Activo" : "Inactivo"}</TableCell>
                          <TableCell>{record.metodo_pago ?? "Sin método"}<br />
                            {record.comprobante ? <Button size="small" href={receiptUrl(record.comprobante)} target="_blank" rel="noopener noreferrer">Ver soporte #{record.id}</Button> : "Sin soporte"}
                          </TableCell>
                          <TableCell sx={{ minWidth: 160, whiteSpace: "pre-wrap" }}>{record.observaciones || "—"}</TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {displayTimestamp(record.fecha_creacion)}<br />{displayTimestamp(record.fecha_modificacion)}<br />
                            Usuario: {record.id_usuario_registro ?? "Sin dato"}
                          </TableCell>
                        </TableRow>
                      ))}</TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              );
            })}
          {!review && <TablePagination component="div" count={filteredGroups.length} page={page}
            rowsPerPage={10} rowsPerPageOptions={[10]} labelRowsPerPage="Meses por página"
            onPageChange={(_, next) => setPage(next)}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count} grupos`} />}
          {review && (
            <>
              <Alert severity="error">Esta operación elimina los registros marcados y reduce el saldo por su suma. Revise los soportes y métodos antes de confirmar. La auditoría no sustituye el respaldo de la base de datos.</Alert>
              <TextField label="Motivo de la depuración" multiline minRows={2} value={reason}
                disabled={saving} onChange={(event) => setReason(event.target.value)}
                helperText="Entre 10 y 500 caracteres. Quedará registrado junto con su usuario."
                error={reason.length > 500} />
              <TextField label="Escriba ELIMINAR para confirmar" value={confirmation}
                disabled={saving} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>
        <Button disabled={saving} onClick={onClose}>Cerrar</Button>
        {review ? <>
          <Button disabled={saving} onClick={() => { setReview(false); setConfirmation(""); }}>Volver a seleccionar</Button>
          <Button color="error" variant="contained" disabled={saving || !validSelection || needsRefresh ||
            reason.trim().length < 10 || reason.trim().length > 500 || confirmation !== "ELIMINAR"}
            onClick={() => void submit()}>{saving ? "Eliminando..." : `Eliminar ${selected.size} registros`}</Button>
        </> : <>
          <Button disabled={saving || !selected.size} onClick={() => setSelected(new Set())}>Limpiar selección</Button>
          <Button color="error" variant="contained" disabled={saving || loading || needsRefresh || !validSelection}
            onClick={() => { setReview(true); setConfirmation(""); setResult(null); }}>Revisar selección ({selected.size})</Button>
        </>}
      </DialogActions>
    </Dialog>
  );
}
