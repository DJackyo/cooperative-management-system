"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { IconDownload, IconEye, IconPrinter, IconReceipt } from "@tabler/icons-react";
import Swal from "sweetalert2";
import { asociadosService } from "@/services/asociadosService";
import { Asociado } from "@/interfaces/User";
import {
  abrirReciboMensualPDF,
  descargarReciboMensualPDF,
  getReciboMensualDatos,
  ReciboMensual,
} from "@/services/recibosMensualesService";
import { formatCurrency, formatDateWithoutTime, numeroALetras } from "../../utilities/utils";
import { logoBase64 } from "../../utilities/logoBase64";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const ANIOS = Array.from({ length: 8 }, (_, index) => new Date().getFullYear() - index);

const nombreAsociado = (asociado: Asociado) => asociado.nombres?.trim() || [asociado.nombre1, asociado.nombre2, asociado.apellido1, asociado.apellido2].filter(Boolean).join(" ");

const agruparPagosPorCredito = (pagos: ReciboMensual["credito"]["pagos"]) =>
  Object.values(pagos.reduce<Record<string, typeof pagos>>((grupos, pago) => {
    const clave = String(pago.creditoId);
    (grupos[clave] ||= []).push(pago);
    return grupos;
  }, {}));

const RecibosMensualesModule = () => {
  const hoy = new Date();
  const [asociados, setAsociados] = useState<Asociado[]>([]);
  const [seleccionado, setSeleccionado] = useState<Asociado | null>(null);
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [recibo, setRecibo] = useState<ReciboMensual | null>(null);
  const [cargandoAsociados, setCargandoAsociados] = useState(true);
  const [cargandoRecibo, setCargandoRecibo] = useState(false);
  const [accion, setAccion] = useState<"pdf" | "descargar" | "imprimir" | null>(null);

  useEffect(() => {
    asociadosService.fetchAll().then((data) => setAsociados(Array.isArray(data) ? data : [])).catch(() => setAsociados([])).finally(() => setCargandoAsociados(false));
  }, []);

  useEffect(() => {
    if (!seleccionado) {
      setRecibo(null);
      return;
    }
    let activo = true;
    setCargandoRecibo(true);
    getReciboMensualDatos({ idAsociado: seleccionado.id, mes, anio })
      .then((data) => { if (activo) setRecibo(data); })
      .catch(() => { if (activo) setRecibo(null); })
      .finally(() => { if (activo) setCargandoRecibo(false); });
    return () => { activo = false; };
  }, [seleccionado, mes, anio]);

  const consulta = useMemo(() => seleccionado ? { idAsociado: seleccionado.id, mes, anio } : null, [seleccionado, mes, anio]);

  const ejecutar = async (tipo: "pdf" | "descargar" | "imprimir") => {
    if (!consulta || !recibo) return;
    setAccion(tipo);
    try {
      if (tipo === "pdf") await abrirReciboMensualPDF(consulta);
      if (tipo === "descargar") await descargarReciboMensualPDF(consulta);
      if (tipo === "imprimir") imprimirRecibo();
    } catch {
      Swal.fire({ title: "No se pudo generar el recibo", text: "Verifica la conexión con el servidor e inténtalo nuevamente.", icon: "error", confirmButtonText: "OK" });
    } finally {
      setAccion(null);
    }
  };

  const imprimirRecibo = () => {
    const contenido = document.getElementById("recibo-mensual-preview")?.innerHTML;
    if (!contenido) return;
    const ventana = window.open("", "", "height=800,width=1100");
    if (!ventana) return;
    ventana.document.write(`<html><head><title>Recibo mensual</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;800&display=swap" rel="stylesheet"><style>@page{size:letter portrait;margin:8mm}*{box-sizing:border-box}body{font-family:Roboto,Arial,sans-serif;color:#1e293b;font-size:10px;margin:0;line-height:1.25}table{width:100%;border-collapse:collapse}td,th{border:1px solid #cbd5e1;padding:4px 6px}th{background:#f1f5f9;color:#0f766e;font-weight:700}.right{text-align:right}.center{text-align:center}.section{background:#f1f5f9;color:#0f766e;font-weight:800;text-align:center}.red{color:#e11d2e;font-weight:800}.receipt-header{border-bottom:2px solid #0f766e}.receipt-title{color:#0f766e;letter-spacing:.5px;font-weight:800;text-align:center}.receipt-total{background:#f0fdf4;border-top:2px solid #16a34a;color:#15803d;font-weight:800}.receipt-note{background:#f8fafc;border:1px dashed #cbd5e1;padding:8px}</style></head><body>${contenido}</body></html>`);
    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.close();
  };

  return (
    <Box>
      <Card variant="outlined" sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} color="#0f766e" gutterBottom>Parámetros del recibo</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={asociados}
                loading={cargandoAsociados}
                value={seleccionado}
                onChange={(_, value) => setSeleccionado(value)}
                getOptionLabel={(option) => `${nombreAsociado(option)} (${option.numeroDeIdentificacion})`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText="Sin resultados"
                renderInput={(params) => <TextField {...params} label="Asociado" placeholder="Busca por nombre o identificación" InputProps={{ ...params.InputProps, endAdornment: <>{cargandoAsociados ? <CircularProgress size={18} /> : null}{params.InputProps.endAdornment}</> }} />}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Select fullWidth value={mes} onChange={(event) => setMes(Number(event.target.value))}>
                {MESES.map((nombre, index) => <MenuItem key={nombre} value={index + 1}>{nombre}</MenuItem>)}
              </Select>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Select fullWidth value={anio} onChange={(event) => setAnio(Number(event.target.value))}>
                {ANIOS.map((valor) => <MenuItem key={valor} value={valor}>{valor}</MenuItem>)}
              </Select>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {cargandoRecibo && <Skeleton variant="rectangular" height={500} />}
      {!cargandoRecibo && !seleccionado && <Alert severity="info">Selecciona un asociado para consultar el recibo mensual.</Alert>}
      {!cargandoRecibo && seleccionado && recibo && <ReciboPreview recibo={recibo} />}
      {!cargandoRecibo && seleccionado && !recibo && <Alert severity="warning">No fue posible consultar la información del recibo para este período.</Alert>}

      {recibo && <Box display="flex" gap={1.5} flexWrap="wrap" mt={2}>
        <Button variant="contained" startIcon={<IconEye size={18} />} onClick={() => ejecutar("pdf")} disabled={!!accion}>{accion === "pdf" ? "Abriendo..." : "Ver PDF"}</Button>
        <Button variant="outlined" startIcon={<IconDownload size={18} />} onClick={() => ejecutar("descargar")} disabled={!!accion}>{accion === "descargar" ? "Descargando..." : "Descargar PDF"}</Button>
        <Button variant="outlined" startIcon={<IconPrinter size={18} />} onClick={() => ejecutar("imprimir")} disabled={!!accion}>Imprimir</Button>
      </Box>}
    </Box>
  );
};

const ReciboPreview = ({ recibo }: { recibo: ReciboMensual }) => (
  <Card variant="outlined" sx={{ overflow: "auto", boxShadow: 3 }}>
    <CardContent>
      <Box id="recibo-mensual-preview" sx={{ minWidth: 820, color: "#1e293b", fontSize: 12, fontFamily: "Roboto, Arial, sans-serif", "& table": { tableLayout: "fixed", width: "100%" }, "& td, & th": { borderColor: "#cbd5e1" } }}>
        <Box className="receipt-header" display="flex" alignItems="center" justifyContent="space-between" pb={1.5} mb={1.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box component="img" src={logoBase64.replace(/^url\(["']?|["']?\)$/g, "")} alt="Logo Cooperativa" sx={{ width: 50, height: 50, objectFit: "contain" }} />
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="#0f766e" sx={{ fontSize: "0.8rem", lineHeight: 1.15 }}>COOPERATIVA MULTIACTIVA DE PRODUCCIÓN Y PRESTACIÓN DE SERVICIOS</Typography>
              <Typography variant="body2" fontWeight={800} color="#0f766e" sx={{ letterSpacing: 0.3, fontSize: "0.85rem" }}>INTEGRACIÓN SIGLO XXI</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>NIT. 08301055337</Typography>
            </Box>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">RECIBO NO.</Typography>
            <Typography variant="subtitle1" fontWeight={900} color="#0f766e">#REC-{recibo.asociado.id}-{recibo.periodo.anio}{String(recibo.periodo.mes).padStart(2, "0")}</Typography>
          </Box>
        </Box>
        <Typography className="receipt-title" variant="subtitle2" mb={1.5}>Comprobante Oficial de Aportes y Crédito</Typography>
        <Box sx={{ borderTop: "4px solid #0f766e", mb: 1 }} />
        <Box textAlign="center" mb={1}>
          <Typography variant="caption" fontWeight={800} color="#0f766e">RECIBO MENSUAL DE APORTES Y CRÉDITO</Typography>
        </Box>
        <Table size="small"><TableBody><TableRow>
          <TableCell><b>Código</b><br />{recibo.asociado.id}</TableCell><TableCell><b>N° DE IDENTIFICACIÓN</b><br />{recibo.asociado.numeroDeIdentificacion}</TableCell><TableCell><b>APELLIDOS Y NOMBRES</b><br />{recibo.asociado.nombres}</TableCell><TableCell><b>CALIDAD</b><br />{recibo.asociado.calidad}</TableCell><TableCell><b>ESTADO</b><br />{recibo.asociado.estado || "ACTIVO"}</TableCell>
        </TableRow></TableBody></Table>
        <Table sx={{ mt: 1 }} size="small"><TableBody><TableRow><TableCell className="section">CUOTA CORRESPONDIENTE A:</TableCell><TableCell className="red">{recibo.periodo.nombreMes}</TableCell><TableCell><b>AÑO</b><br />{recibo.periodo.anio}</TableCell><TableCell><b>CUOTA MENSUAL</b><br />{formatCurrency(recibo.ahorro.total)}</TableCell></TableRow></TableBody></Table>
        <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 1, mt: 1, alignItems: "start" }}>
          <Table size="small"><TableHead><TableRow><TableCell colSpan={4} className="section">ESTADO APORTES</TableCell></TableRow><TableRow><TableCell>FECHA</TableCell><TableCell>TIPO</TableCell><TableCell>MÉTODO</TableCell><TableCell align="right">TOTAL</TableCell></TableRow></TableHead><TableBody>{recibo.ahorro.movimientos.length ? recibo.ahorro.movimientos.map((aporte) => <TableRow key={aporte.id}><TableCell>{formatDateWithoutTime(aporte.fecha)}</TableCell><TableCell>{aporte.tipo || "MENSUAL"}</TableCell><TableCell>{aporte.metodo || "-"}</TableCell><TableCell align="right">{formatCurrency(aporte.monto)}</TableCell></TableRow>) : <TableRow><TableCell colSpan={4} align="center">Sin aportes en el período</TableCell></TableRow>}<TableRow><TableCell colSpan={3}><b>TOTAL APORTES</b></TableCell><TableCell align="right"><b>{formatCurrency(recibo.ahorro.total)}</b></TableCell></TableRow></TableBody></Table>
          <Table size="small"><TableHead><TableRow><TableCell colSpan={5} className="section">CRÉDITO</TableCell></TableRow><TableRow><TableCell>CRÉDITO</TableCell><TableCell>CUOTA</TableCell><TableCell>CAPITAL</TableCell><TableCell>INTERÉS</TableCell><TableCell align="right">TOTAL</TableCell></TableRow></TableHead><TableBody>{recibo.credito.pagos.length ? agruparPagosPorCredito(recibo.credito.pagos).flatMap((pagosCredito) => { const totalCredito = pagosCredito.reduce((total, pago) => total + pago.total, 0); const ultimoPago = pagosCredito[pagosCredito.length - 1]; return [<React.Fragment key={`credito-${ultimoPago.creditoId}`}><>{pagosCredito.map((pago) => <TableRow key={pago.id}><TableCell>#{pago.creditoId}</TableCell><TableCell>{pago.cuota || "-"}</TableCell><TableCell>{formatCurrency(pago.capital)}</TableCell><TableCell>{formatCurrency(pago.intereses)}</TableCell><TableCell align="right">{formatCurrency(pago.total)}</TableCell></TableRow>)}</><TableRow><TableCell colSpan={4}><b>TOTAL CRÉDITO #{ultimoPago.creditoId}</b></TableCell><TableCell align="right"><b>{formatCurrency(totalCredito)}</b></TableCell></TableRow><TableRow><TableCell colSpan={4}><b>SALDO A CAPITAL CUOTA #{ultimoPago.cuota || "-"}</b></TableCell><TableCell align="right"><b>{formatCurrency(ultimoPago.saldoCapital)}</b></TableCell></TableRow></React.Fragment>]; }) : <TableRow><TableCell colSpan={5} align="center">Sin pagos de crédito en el período</TableCell></TableRow>}</TableBody></Table>
        </Box>
        <Divider sx={{ my: 1.5, borderColor: "#cbd5e1" }} />
        <Box className="receipt-total" display="flex" justifyContent="space-between" p={1}><span>TOTAL RECIBIDO</span><span>{formatCurrency(recibo.totalRecibido)}</span></Box>
        <Box sx={{ p: 1.25, mt: 1.5, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px dashed #cbd5e1" }}>
          <Typography variant="caption" display="block" color="text.secondary" fontWeight={800} sx={{ letterSpacing: 0.5, mb: 0.25, fontSize: "0.68rem" }}>
            VALOR RECIBIDO EN LETRAS:
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ fontStyle: "italic", color: "#0f172a", textTransform: "uppercase", fontSize: "0.75rem" }}>
            {numeroALetras(recibo.totalRecibido, true)}
          </Typography>
        </Box>
        <Box className="receipt-note" mt={2}><Typography variant="caption" display="block" color="text.secondary" fontWeight={800}>OBSERVACIONES:</Typography><Typography variant="body2" fontSize="0.75rem">Sin observaciones.</Typography></Box>
        <Box mt={5} pt={1} borderTop="1px solid #cbd5e1"><Typography variant="caption" display="block">Fecha de generación: {formatDateWithoutTime(recibo.generadoEl)}</Typography><Box display="flex" justifyContent="space-between" mt={4}><Typography variant="caption">______________________________<br />Presidente / Administración</Typography><Typography variant="caption">______________________________<br />Firma</Typography></Box></Box>
      </Box>
    </CardContent>
  </Card>
);

export default RecibosMensualesModule;
