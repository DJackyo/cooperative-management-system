"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Chip from "@mui/material/Chip";
import StyledTable from "@/components/StyledTable";
import GenericLoadingSkeleton from "@/components/GenericLoadingSkeleton";
import { asociadosService } from "@/services/asociadosService";

interface AttendanceRecord {
  idAsociado: number;
  fecha: string | null;
  asistio: string | null;
  asociado?: {
    nombre1?: string;
    nombre2?: string | null;
    apellido1?: string;
    apellido2?: string | null;
    numeroDeIdentificacion?: string;
    idEstado?: { estado?: string };
  };
}

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("es-CO") : "Sin fecha";

const toDateInput = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const AsistenciaAsambleaList = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [search, setSearch] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("TODOS");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      setRecords(await asociadosService.fetchAssemblyAttendance());
    } catch (loadError) {
      console.error("Error al cargar asistencia a asamblea:", loadError);
      setError("No fue posible cargar el registro de asistencia.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return records.filter((record) => {
      const asociado = record.asociado;
      const name = [asociado?.nombre1, asociado?.nombre2, asociado?.apellido1, asociado?.apellido2]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const identification = asociado?.numeroDeIdentificacion || "";
      const matchesSearch = !normalizedSearch
        || name.includes(normalizedSearch)
        || identification.toLowerCase().includes(normalizedSearch)
        || String(record.idAsociado).includes(normalizedSearch);
      const matchesAttendance = attendanceFilter === "TODOS"
        || (record.asistio || "").toUpperCase() === attendanceFilter;
      const date = toDateInput(record.fecha);
      const matchesFrom = !fromDate || (date && date >= fromDate);
      const matchesTo = !toDate || (date && date <= toDate);
      return matchesSearch && matchesAttendance && matchesFrom && matchesTo;
    });
  }, [records, search, attendanceFilter, fromDate, toDate]);

  if (loading) return <GenericLoadingSkeleton type="table" rows={5} />;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        Registro de asistencia a asamblea
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Consulta y filtra las asistencias registradas por asociado y fecha.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Buscar asociado o identificación"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="attendance-filter-label">Asistencia</InputLabel>
            <Select
              labelId="attendance-filter-label"
              value={attendanceFilter}
              label="Asistencia"
              onChange={(event) => setAttendanceFilter(event.target.value)}
            >
              <MenuItem value="TODOS">Todas</MenuItem>
              <MenuItem value="SI">Asistió</MenuItem>
              <MenuItem value="NO">No asistió</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Desde"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Hasta"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
      </Grid>

      <StyledTable
        columns={[
          { field: "idAsociado", headerName: "ID asociado", width: 110 },
          { field: "nombre", headerName: "Asociado", width: 220 },
          { field: "identificacion", headerName: "Identificación", width: 150 },
          { field: "fecha", headerName: "Fecha", width: 130 },
          { field: "asistio", headerName: "Asistencia", width: 130 },
          { field: "estado", headerName: "Estado", width: 130 },
        ]}
        rows={filteredRecords}
        withPagination
        pageSizeOptions={[10, 25, 50]}
        exportFilename="registro-asistencia-asamblea"
        exportSheetName="Asistencia"
        emptyMessage="No hay registros de asistencia con los filtros seleccionados."
        renderCell={(column, record) => {
          const asociado = record.asociado;
          const nombre = [asociado?.nombre1, asociado?.nombre2, asociado?.apellido1, asociado?.apellido2]
            .filter(Boolean)
            .join(" ");
          if (column.field === "nombre") return nombre || "Sin nombre";
          if (column.field === "identificacion") return asociado?.numeroDeIdentificacion || "Sin identificación";
          if (column.field === "fecha") return formatDate(record.fecha);
          if (column.field === "asistio") {
            const attended = (record.asistio || "").toUpperCase() === "SI";
            return <Chip size="small" label={attended ? "Asistió" : "No asistió"} color={attended ? "success" : "default"} />;
          }
          if (column.field === "estado") return asociado?.idEstado?.estado || "Sin estado";
          return record[column.field as keyof AttendanceRecord] || "";
        }}
      />
    </Box>
  );
};

export default AsistenciaAsambleaList;
