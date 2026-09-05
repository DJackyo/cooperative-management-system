"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Alert,
  Autocomplete,
  Divider,
  Skeleton,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import Swal from "sweetalert2";
import { IconDownload, IconEye, IconCoins, IconCreditCard, IconWallet } from "@tabler/icons-react";
import { asociadosService } from "@/services/asociadosService";
import { Asociado } from "@/interfaces/User";
import {
  descargarCertificadoPDF,
  abrirCertificadoPDF,
  getEstadoCuentaDatos,
  TipoCertificado,
} from "@/services/certificadosService";
import { formatCurrency, formatDateWithoutTime } from "../../utilities/utils";
import GenericLoadingSkeleton from "@/components/GenericLoadingSkeleton";
import { usePageLoading } from "@/hooks/usePageLoading";

interface PreviaDatos {
  asociado: {
    id: number;
    nombres: string;
    numeroDeIdentificacion: string;
  };
  consulta: { tipo: TipoCertificado };
  ahorro: {
    totalAportado: number;
    numAportes: number;
    ultimaFechaAporte: string | null;
    movimientos: any[];
  } | null;
  credito: {
    numCreditos: number;
    creditosActivos: number;
    montoSolicitadoTotal: number;
    totalPagadoGeneral: number;
    saldoPendienteTotal: number;
    creditos: any[];
  } | null;
}

const OPCIONES_TIPO: { value: TipoCertificado; label: string }[] = [
  { value: "completo", label: "Completo (Ahorro y Crédito)" },
  { value: "ahorro", label: "Solo Ahorro" },
  { value: "credito", label: "Solo Crédito" },
];

const toISOFecha = (d: Date | null): string | undefined =>
  d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : undefined;

/** Construye el nombre completo del asociado a partir de los campos devueltos por la API. */
const construirNombreAsociado = (asoc: Asociado | null | undefined): string => {
  if (!asoc) return "";
  const nombres = asoc.nombres?.trim();
  if (nombres) return nombres;
  return [asoc.nombre1, asoc.nombre2, asoc.apellido1, asoc.apellido2]
    .filter(Boolean)
    .join(" ");
};

const CertificadosModule = () => {
  const { loading, stopLoading } = usePageLoading();
  const [asociados, setAsociados] = useState<Asociado[]>([]);
  const [seleccionado, setSeleccionado] = useState<Asociado | null>(null);
  const [tipo, setTipo] = useState<TipoCertificado>("completo");
  const [desde, setDesde] = useState<Date | null>(null);
  const [hasta, setHasta] = useState<Date | null>(null);
  const [previa, setPrevia] = useState<PreviaDatos | null>(null);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [accion, setAccion] = useState<"descargar" | "ver" | null>(null);
const cargarDatos = useCallback(
    async (asoc: Asociado | null, tipoSel: TipoCertificado) => {
      if (!asoc) {
        setPrevia(null);
        return;
      }
      setCargandoDatos(true);
      try {
        const data = await getEstadoCuentaDatos({
          idAsociado: asoc.id,
          tipo: tipoSel,
          desde: toISOFecha(desde),
          hasta: toISOFecha(hasta),
        });
        setPrevia(data);
      } catch (err) {
        console.error(err);
        setPrevia(null);
      } finally {
        setCargandoDatos(false);
      }
    },
    [desde, hasta],
  );

  useEffect(() => {
    let activo = true;
    asociadosService
      .fetchAll()
      .then((data) => {
        if (activo) setAsociados(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (activo) setAsociados([]);
      })
      .finally(() => stopLoading());
    return () => {
      activo = false;
    };
  }, [stopLoading]);

  // Recarga la vista previa cuando cambian selección/tipo/rango
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarDatos(seleccionado, tipo);
    }, 250);
    return () => clearTimeout(timer);
  }, [seleccionado, tipo, desde, hasta, cargarDatos]);

  const validarRango = (): boolean => {
    if (desde && hasta && desde > hasta) {
      Swal.fire({
        title: "Rango inválido",
        text: "La fecha inicial no puede ser posterior a la final.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return false;
    }
    return Boolean(seleccionado);
  };

  const ejecutar = async (modo: "descargar" | "ver") => {
    if (!seleccionado) {
      Swal.fire({
        title: "Selecciona un asociado",
        text: "Debes elegir un asociado para generar el certificado.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }
    if (!validarRango()) return;
    setAccion(modo);
    const consulta = {
      idAsociado: seleccionado.id,
      tipo,
      desde: toISOFecha(desde),
      hasta: toISOFecha(hasta),
    };
    try {
      if (modo === "descargar") {
        await descargarCertificadoPDF(consulta);
        Swal.fire({
          title: "Certificado generado",
          text: "La descarga del certificado ha comenzado.",
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        await abrirCertificadoPDF(consulta);
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: "No se pudo generar el certificado. Inténtalo de nuevo.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setAccion(null);
    }
  };

  if (loading) {
    return <GenericLoadingSkeleton rows={6} />;
  }
return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Grid container spacing={3}>
        {/* Formulario de generación */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined" sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#0f766e", fontWeight: 600 }}>
                Parámetros del certificado
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <Autocomplete
                    options={asociados}
                    getOptionLabel={(opt) =>
                      `${construirNombreAsociado(opt)} (${opt.numeroDeIdentificacion})`
                    }
                    isOptionEqualToValue={(opt, val) =>
                      opt === val || opt.id === val.id
                    }
                    value={seleccionado}
                    onChange={(_e, val) => setSeleccionado(val)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Asociado"
                        placeholder="Busca por nombre o cédula"
                        size="small"
                      />
                    )}
                    noOptionsText="Sin resultados"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de certificado</InputLabel>
                    <Select
                      label="Tipo de certificado"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as TipoCertificado)}
                    >
                      {OPCIONES_TIPO.map((op) => (
                        <MenuItem key={op.value} value={op.value}>
                          {op.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, md: 2 }}>
                  <DatePicker
                    label="Desde"
                    value={desde}
                    onChange={(v) => setDesde(v)}
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 2 }}>
                  <DatePicker
                    label="Hasta"
                    value={hasta}
                    onChange={(v) => setHasta(v)}
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                  />
                </Grid>
              </Grid>

              <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<IconDownload size={18} />}
                  onClick={() => ejecutar("descargar")}
                  disabled={!seleccionado || !!accion}
                  sx={{ mt: 1 }}
                >
                  {accion === "descargar" ? "Generando..." : "Descargar PDF"}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<IconEye size={18} />}
                  onClick={() => ejecutar("ver")}
                  disabled={!seleccionado || !!accion}
                  sx={{ mt: 1 }}
                >
                  {accion === "ver" ? "Abriendo..." : "Ver en pestaña nueva"}
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => {
                    setSeleccionado(null);
                    setTipo("completo");
                    setDesde(null);
                    setHasta(null);
                    setPrevia(null);
                  }}
                  sx={{ mt: 1 }}
                >
                  Limpiar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Vista previa del estado de cuenta */}
        <Grid size={{ xs: 12 }}>
{cargandoDatos ? (
            <Skeleton variant="rectangular" width="100%" height={220} />
          ) : previa ? (
            <Card variant="outlined" sx={{ boxShadow: 3 }}>
              <CardContent>
                <Box mb={2}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#1f2937" }}>
                    {previa.asociado?.nombres}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Identificación: {previa.asociado?.numeroDeIdentificacion}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {previa.ahorro && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid #c7ece9",
                          bgcolor: "#f0fdfa",
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <IconCoins size={20} color="#0f766e" />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#0f766e" }}>
                            Ahorro
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ color: "#0f766e" }}>
                          {formatCurrency(previa.ahorro.totalAportado)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {previa.ahorro.numAportes} aporte(s) · Último:{" "}
                          {previa.ahorro.ultimaFechaAporte
                            ? formatDateWithoutTime(previa.ahorro.ultimaFechaAporte)
                            : "N/D"}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {previa.credito && (
                    <>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: "1px solid #e9d5ff",
                            bgcolor: "#faf5ff",
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <IconCreditCard size={20} color="#7c3aed" />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#7c3aed" }}>
                              Crédito
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {previa.credito.numCreditos} crédito(s) · {previa.credito.creditosActivos} activo(s)
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Solicitado: {formatCurrency(previa.credito.montoSolicitadoTotal)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Pagado: {formatCurrency(previa.credito.totalPagadoGeneral)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "#fffbeb",
                            border: "1px solid #fde68a",
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <IconWallet size={22} color="#b45309" />
                          <Box>
                            <Typography variant="body2" color="#b45309" sx={{ fontWeight: 600 }}>
                              Saldo pendiente total
                            </Typography>
                            <Typography variant="h6" sx={{ color: "#b45309" }}>
                              {formatCurrency(previa.credito.saldoPendienteTotal)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </>
                  )}
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Alert severity="info" sx={{ mb: 2 }}>
                  La descarga incluye el detalle completo del estado de cuenta. Si no seleccionaste un
                  rango de fechas, se generará con el histórico completo.
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="info">
              Selecciona un asociado para visualizar un resumen de su estado de cuenta antes de generar el
              certificado.
            </Alert>
          )}
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default CertificadosModule;