"use client";

import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { IconFileDownload } from "@tabler/icons-react";
import * as XLSX from "xlsx-js-style";

export interface ExportColumn {
  field: string;
  headerName: string;
}

interface TableExportButtonProps {
  columns: ExportColumn[];
  rows: any[];
  filename: string;
  sheetName?: string;
}

const getNestedValue = (row: any, path: string): unknown =>
  path.split(".").reduce((value, key) => value?.[key], row);

const formatValue = (value: unknown): string | number | boolean => {
  if (value == null) return "";
  if (value instanceof Date) return value.toLocaleString();
  if (Array.isArray(value)) {
    return value
      .map((item) => formatValue(item))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    return String(
      objectValue.nombres ??
        objectValue.nombre ??
        objectValue.estado ??
        objectValue.nombreDeMetodo ??
        JSON.stringify(value),
    );
  }
  return value as string | number | boolean;
};

const TableExportButton: React.FC<TableExportButtonProps> = ({
  columns,
  rows,
  filename,
  sheetName = "Datos",
}) => {
  const exportTable = () => {
    const exportColumns = columns.filter(
      (column) => !["acciones", "actions", "expand"].includes(column.field),
    );

    const data = rows.map((row) =>
      Object.fromEntries(
        exportColumns.map((column) => [
          column.headerName,
          formatValue(getNestedValue(row, column.field)),
        ]),
      ),
    );

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet["!cols"] = exportColumns.map((column) => ({
      wch: Math.max(column.headerName.length + 2, 16),
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
    XLSX.writeFile(
      workbook,
      `${filename.replace(/\.xlsx$/i, "")}_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  return (
    <Tooltip title="Descargar información" arrow>
      <IconButton
        onClick={exportTable}
        disabled={rows.length === 0}
        color="primary"
        size="small"
        aria-label="Descargar información de la tabla"
      >
        <IconFileDownload />
      </IconButton>
    </Tooltip>
  );
};

export default TableExportButton;
