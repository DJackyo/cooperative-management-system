"use client";
import React, { useEffect, useState } from "react";
import { generateBackup, listBackups, downloadBackup, triggerFileDownload, BackupItem } from "@/services/backupService";

export default function BackupManager() {
  const [loadingGen, setLoadingGen] = useState(false);
  const [includeFiles, setIncludeFiles] = useState(false);
  const [items, setItems] = useState<BackupItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const refresh = async () => {
    setLoadingList(true);
    try {
      const data = await listBackups();
      setItems(data);
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
    <div style={{ display: "grid", gap: 16 }}>
      <h2>Gestión de Backups</h2>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={includeFiles} onChange={(e) => setIncludeFiles(e.target.checked)} />
          Incluir archivos (uploads)
        </label>
        <button onClick={onGenerate} disabled={loadingGen}>
          {loadingGen ? "Generando..." : "Generar Backup"}
        </button>
        <button onClick={refresh} disabled={loadingList}>Actualizar Lista</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Archivo</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Tamaño (MB)</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Fecha</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {!Array.isArray(items) || items.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: 12 }}>Sin backups aún</td>
            </tr>
          ) : (
            items.map((b) => (
            <tr key={String(b.name)}>
              <td style={{ padding: 8 }}>{b.name}</td>
              <td style={{ padding: 8 }}>{b.sizeMB}</td>
              <td style={{ padding: 8 }}>{new Date(b.date).toLocaleString()}</td>
              <td style={{ padding: 8 }}>
                <button onClick={() => onDownload(b.name)}>Descargar</button>
              </td>
            </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
