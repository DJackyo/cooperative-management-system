"use client";
import React, { useEffect, useState } from "react";
import {
  generateBackup,
  listBackups,
  downloadBackup,
  triggerFileDownload,
  BackupItem,
} from "@/services/backupService";
import {
  Grid,
  Paper,
  Button,
  Checkbox,
  FormControlLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  CircularProgress,
} from "@mui/material";

export default function BackupManager() {
  const [loadingGen, setLoadingGen] = useState(false);
  const [includeFiles, setIncludeFiles] = useState(false);
  const [items, setItems] = useState<BackupItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const refresh = async () => {
    setLoadingList(true);
    try {
      const data = await listBackups();
      setItems(data || []);
    } catch (e) {
      console.error(e);
      alert("Error al listar backups");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onGenerate = async () => {
    setLoadingGen(true);
    try {
      const { file } = await generateBackup(includeFiles);
      await refresh();
      alert(`Backup generado: ${file}`);
    } catch (e) {
      console.error(e);
      alert("Error al generar backup");
    } finally {
      setLoadingGen(false);
    }
  };

  const onDownload = async (name: string) => {
    try {
      const blob = await downloadBackup(name);
      triggerFileDownload(blob, name);
    } catch (e) {
      console.error(e);
      alert("Error al descargar backup");
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3, backgroundColor: "white" }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} sm={6}>
              {/* <Typography variant="h6">Gestión de Backups</Typography> */}
            </Grid>
            <Grid item xs={12} sm={12}>
              <Grid container justifyContent="flex-end" spacing={1}>
                <Grid item>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeFiles}
                        onChange={(e) => setIncludeFiles(e.target.checked)}
                      />
                    }
                    label="Incluir archivos (uploads)"
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onGenerate}
                    disabled={loadingGen}
                    startIcon={loadingGen ? <CircularProgress size={16} /> : null}
                  >
                    {loadingGen ? "Generando..." : "Generar Backup"}
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="outlined" onClick={refresh} disabled={loadingList}>
                    {loadingList ? <CircularProgress size={16} /> : "Actualizar Lista"}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Archivo</TableCell>
                <TableCell>Tamaño (MB)</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(!Array.isArray(items) || items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4}>Sin backups aún</TableCell>
                </TableRow>
              )}

              {Array.isArray(items) &&
                items.map((b) => (
                  <TableRow key={String(b.name)}>
                    <TableCell>{b.name}</TableCell>
                    <TableCell>{b.sizeMB}</TableCell>
                    <TableCell>{new Date(b.date).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => onDownload(b.name)}>
                        Descargar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid>
    </Grid>
  );
}
