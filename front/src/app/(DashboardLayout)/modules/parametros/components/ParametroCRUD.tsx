"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Modal,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import StyledTable from "@/components/StyledTable";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

export interface ParametroField {
  key: string;
  label: string;
  type?: "text" | "number";
  required?: boolean;
}
interface ParametroService {
  fetchAll: () => Promise<any[]>;
  create: (data: any) => Promise<any>;
  update: (id: number, data: any) => Promise<any>;
  delete: (id: number) => Promise<any>;
}

interface ParametroCRUDProps {
  service: ParametroService;
  title: string;
  subtitle?: string;
  idField?: string;
  fields: ParametroField[];
}

const ParametroCRUD: React.FC<ParametroCRUDProps> = ({
  service,
  title,
  subtitle,
  idField = "id",
  fields,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await service.fetchAll();
      setData(resp || []);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    loadData();
  }, [loadData]);
const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({});
    setOpen(true);
  };

  const handleOpenEdit = (row: any) => {
    setEditingId(row[idField]);
    const form: Record<string, any> = {};
    fields.forEach((f) => {
      form[f.key] = row[f.key] ?? "";
    });
    setFormData(form);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => {
    const payload: Record<string, any> = { ...formData };
    fields.forEach((f) => {
      if (f.type === "number" && payload[f.key] != null && payload[f.key] !== "") {
        payload[f.key] = Number(payload[f.key]);
      }
    });
    return payload;
  };

  const handleSubmit = async () => {
    try {
      const payload = buildPayload();
      if (editingId !== null) {
        await service.update(editingId, payload);
      } else {
        await service.create(payload);
      }
      await loadData();
      handleClose();

      const Swal = (await import("sweetalert2")).default;
      Swal.fire({
        title: "¡Éxito!",
        text:
          editingId !== null
            ? "Registro actualizado correctamente"
            : "Registro creado correctamente",
        icon: "success",
        confirmButtonText: "OK",
        zIndex: 10001,
      } as any);
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  const handleDelete = async (row: any) => {
    const Swal = (await import("sweetalert2")).default;
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      zIndex: 10001,
    } as any);

    if (confirm.isConfirmed) {
      try {
        await service.delete(row[idField]);
        await loadData();
        Swal.fire({
          title: "¡Eliminado!",
          text: "Registro eliminado correctamente",
          icon: "success",
          confirmButtonText: "OK",
          zIndex: 10001,
        } as any);
      } catch (err) {
        console.error("Error deleting:", err);
      }
    }
  };

  const columns = [
    { field: idField, headerName: "ID", width: 60, sortable: false },
    ...fields
      .filter((f) => f.key !== idField)
      .map((f) => ({ field: f.key, headerName: f.label, sortable: true })),
  ];
return (
    <Box>
      <Button
        variant="contained"
        startIcon={<IconPlus size={18} />}
        onClick={handleOpenCreate}
        sx={{ mb: 2 }}
      >
        Nuevo {title}
      </Button>

      <DashboardCard title="">
        <StyledTable
          columns={columns}
          rows={data}
          withPagination
          pageSizeOptions={[5, 10, 25, 50]}
          emptyMessage="No hay registros para mostrar"
          actions={(row: any) => (
            <>
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleOpenEdit(row)}
                >
                  <IconEdit size={16} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(row)}
                >
                  <IconTrash size={16} />
                </IconButton>
              </Tooltip>
            </>
          )}
        />
      </DashboardCard>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            bgcolor: "background.paper",
            boxShadow: 24,
            p: { xs: 2, sm: 3 },
            width: { xs: "calc(100% - 32px)", sm: "min(560px, calc(100% - 48px))" },
            maxHeight: "calc(100vh - 32px)",
            overflowY: "auto",
            margin: "auto",
            marginTop: { xs: 2, sm: 6 },
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {editingId !== null ? "Editar" : "Crear"} {title}
          </Typography>

          <Box component="form" noValidate autoComplete="off">
            {fields.map((f) => (
              <TextField
                key={f.key}
                label={f.label}
                name={f.key}
                value={formData[f.key] ?? ""}
                onChange={handleChange}
                required={f.required}
                fullWidth
                margin="normal"
                type={f.type === "number" ? "number" : "text"}
                InputLabelProps={
                  f.type === "number" ? { shrink: true } : undefined
                }
              />
            ))}
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={1} sx={{ mt: 3 }}>
            <Button variant="outlined" color="inherit" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editingId !== null ? "Actualizar" : "Crear"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ParametroCRUD;