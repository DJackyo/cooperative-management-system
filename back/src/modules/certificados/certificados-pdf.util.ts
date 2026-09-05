import PDFDocument from 'pdfkit';
import { EstadoCuentaAsociado, EstadoCuentaAhorro, EstadoCuentaCredito, DetalleCredito, MovimientoAhorro } from './certificados.service';

const MARGEN = 50;
const COLOR_PRIMARIO = '#0f766e';
const COLOR_SECUNDARIO = '#13DEB9';
const COLOR_TEXTO = '#1f2937';
const COLOR_GRIS = '#6b7280';
const COLOR_FILA_ALTERNA = '#e6f5f1';

const formatearMoneda = (valor: number, simbolo = '$'): string => {
  const num = new Intl.NumberFormat('es', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(valor) || 0);
  return `${simbolo} ${num}`;
};

const formatearFecha = (fecha: Date | string | null | undefined): string => {
  if (!fecha) return '-';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return String(fecha);
  return d.toLocaleDateString('es', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const formatearFechaLarga = (fecha: Date | string | null | undefined): string => {
  if (!fecha) return '-';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return String(fecha);
  return d.toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
/** Verifica si queda espacio en la página y, si no, crea una nueva. */
const asegurarEspacio = (doc: PDFKit.PDFDocument, altoRequerido = 80, enPie = 90): boolean => {
  const margenInferior = doc.page.height - doc.page.margins.bottom - enPie;
  if (doc.y + altoRequerido > margenInferior) {
    doc.addPage();
    return true;
  }
  return false;
};

/** Dibuja una fila simple de etiqueta/valor en una coordenada Y explícita. */
const dibujarLineaDato = (
  doc: PDFKit.PDFDocument,
  etiqueta: string,
  valor: string,
  y: number,
  xEtiqueta = MARGEN,
  xValor = MARGEN + 175,
): number => {
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(COLOR_GRIS)
    .text(etiqueta, xEtiqueta, y, { lineBreak: false });
  const xInicio = doc.x;
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(COLOR_TEXTO)
    .text(valor, xValor, y, { width: 320 });
  doc.y = y + 14;
  return xInicio;
};
/** Dibuja una celda de tabla en una coordenada Y fija, sin desplazar el cursor de forma errática. */
const dibujarCelda = (
  doc: PDFKit.PDFDocument,
  texto: string,
  x: number,
  y: number,
  ancho: number,
  alinear: 'left' | 'right' | 'center' = 'left',
) => {
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(COLOR_TEXTO)
    .text(texto || '-', x, y + 1, {
      width: ancho,
      height: 14,
      lineBreak: false,
      ellipsis: true,
      align: alinear,
    });
  doc.x = x;
  doc.y = y + 16;
};

/** Dibuja un encabezado de sección con barra decorativa. */
const dibujarTituloSeccion = (doc: PDFKit.PDFDocument, titulo: string) => {
  asegurarEspacio(doc, 40);
  doc.moveDown(0.6);
  const y = doc.y;
  doc.roundedRect(MARGEN, y, 4, 16, 2).fill(COLOR_SECUNDARIO);
  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor(COLOR_PRIMARIO)
    .text(titulo, MARGEN + 14, y, { lineBreak: false });
  doc.moveDown(0.8);
};

/** Encabezado superior del certificado. */
const dibujarEncabezado = (
  doc: PDFKit.PDFDocument,
  data: EstadoCuentaAsociado,
  tipoTexto: string,
) => {
  // Franja decorativa superior
  doc
    .rect(0, 0, doc.page.width, 8)
    .fill(COLOR_PRIMARIO);
  doc
    .rect(0, 8, doc.page.width, 4)
    .fill(COLOR_SECUNDARIO);

  doc.moveDown(1.2);

  // Título
  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .fillColor(COLOR_PRIMARIO)
    .text('CERTIFICADO DE ESTADO DE CUENTA', MARGEN, doc.y, {
      align: 'center',
    });

  doc
    .font('Helvetica')
    .fontSize(11)
    .fillColor(COLOR_TEXTO)
    .text(tipoTexto, MARGEN, doc.y + 4, { align: 'center' });

  doc.moveDown(1);

  // Datos del asociado en marco
  const boxY = doc.y;
  doc
    .roundedRect(MARGEN, boxY, doc.page.width - MARGEN * 2, 64, 6)
    .lineWidth(1)
    .strokeColor(COLOR_SECUNDARIO)
    .stroke();
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(COLOR_PRIMARIO)
    .text('DATOS DEL ASOCIADO', MARGEN + 14, boxY + 8);

  dibujarLineaDato(
    doc,
    'Nombre:',
    data.asociado.nombres,
    boxY + 27,
    MARGEN + 14,
    MARGEN + 14 + 100,
  );
  dibujarLineaDato(
    doc,
    'Identificación:',
    data.asociado.numeroDeIdentificacion,
    boxY + 44,
    MARGEN + 14,
    MARGEN + 14 + 100,
  );
  doc.y = boxY + 64;
  doc.moveDown(0.5);
};

/** Firma/pie del certificado. */
const dibujarFirma = (
  doc: PDFKit.PDFDocument,
  data: EstadoCuentaAsociado,
  numeroCertificado: string,
) => {
  if (doc.y > doc.page.height - doc.page.margins.bottom - 130) {
    doc.addPage();
  }
  doc.moveDown(2);
  doc
    .strokeColor(COLOR_GRIS)
    .lineWidth(0.6)
    .moveTo(MARGEN, doc.y + 40)
    .lineTo(MARGEN + 220, doc.y + 40)
    .stroke();
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(COLOR_TEXTO)
    .text('Presidente / Administración', MARGEN, doc.y + 42);

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(COLOR_GRIS)
    .text(
      `Emitido el ${formatearFechaLarga(data.generadoEl)} - Certificado No. ${numeroCertificado}`,
      MARGEN,
      doc.page.height - doc.page.margins.bottom - 30,
      { align: 'center', width: doc.page.width - MARGEN * 2 },
    );
};
/** Caja resumen (etiqueta + valor) usada en los detalles. */
const dibujarTarjetaResumen = (
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  ancho: number,
  etiqueta: string,
  valor: string,
  color = COLOR_PRIMARIO,
) => {
  doc
    .roundedRect(x, y, ancho, 46, 5)
    .lineWidth(0.8)
    .strokeColor('#cbd5e1')
    .stroke();
  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(COLOR_GRIS)
    .text(etiqueta.toUpperCase(), x + 8, y + 7, { width: ancho - 16 });
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(color)
    .text(valor, x + 8, y + 20, { width: ancho - 16 });
};

/** Sección de estado de cuenta de AHORRO. */
const dibujarAhorro = (
  doc: PDFKit.PDFDocument,
  ahorro: EstadoCuentaAhorro,
  simbolo: string,
) => {
  dibujarTituloSeccion(doc, '1. ESTADO DE CUENTA DE AHORRO');

  const yCards = doc.y;
  const ancho = (doc.page.width - MARGEN * 2 - 16) / 3;
  dibujarTarjetaResumen(doc, MARGEN, yCards, ancho, 'Total ahorrado', formatearMoneda(ahorro.totalAportado, simbolo));
  dibujarTarjetaResumen(doc, MARGEN + ancho + 8, yCards, ancho, 'N°. de aportes', String(ahorro.numAportes));
  dibujarTarjetaResumen(doc, MARGEN + (ancho + 8) * 2, yCards, ancho, 'Último aporte', formatearFecha(ahorro.ultimaFechaAporte));
  doc.y = yCards + 46;
  doc.moveDown(0.4);

  // Tabla de movimientos
  dibujarTituloSeccion(doc, 'Detalle de movimientos');
  const cols = [
    { label: 'Fecha', x: MARGEN, ancho: 80 },
    { label: 'Tipo', x: MARGEN + 85, ancho: 95 },
    { label: 'Método', x: MARGEN + 185, ancho: 90 },
    { label: 'Observaciones', x: MARGEN + 278, ancho: 130 },
    { label: 'Monto', x: MARGEN + 438, ancho: 74, alinear: 'right' as const },
  ];
  const dibujarCabeceraTabla = () => {
    const cabeceraY = doc.y;
    doc
      .rect(MARGEN, cabeceraY, doc.page.width - MARGEN * 2, 18)
      .fill(COLOR_PRIMARIO);
    cols.forEach((c) => {
      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#ffffff')
        .text(c.label.toUpperCase(), c.x, cabeceraY + 4, {
          width: c.ancho,
          align: c.alinear || 'left',
          lineBreak: false,
        });
    });
    doc.x = MARGEN;
    doc.y = cabeceraY + 18;
  };
  dibujarCabeceraTabla();

  const filas = ahorro.movimientos.slice(0, 30);
  filas.forEach((m: MovimientoAhorro, i: number) => {
    if (doc.y > doc.page.height - doc.page.margins.bottom - 100) {
      doc.addPage();
      dibujarCabeceraTabla();
    }
    const filaY = doc.y;
    const anchoTabla = doc.page.width - MARGEN * 2;

    // Fondo de la fila primero (quedará debajo del texto)
    if (i % 2 === 1) {
      doc.save();
      doc
        .rect(cols[0].x, filaY, anchoTabla, 16)
        .fill(COLOR_FILA_ALTERNA);
      doc.restore();
    }

    dibujarCelda(doc, formatearFecha(m.fechaAporte), cols[0].x, filaY, cols[0].ancho);
    dibujarCelda(doc, m.tipoAporte || '-', cols[1].x, filaY, cols[1].ancho);
    dibujarCelda(doc, m.metodoPago || '-', cols[2].x, filaY, cols[2].ancho);
    dibujarCelda(doc, m.observaciones || '', cols[3].x, filaY, cols[3].ancho);
    dibujarCelda(doc, formatearMoneda(m.monto, simbolo), cols[4].x, filaY, cols[4].ancho, 'right');

    doc.y = filaY + 16;
  });

  if (ahorro.movimientos.length > 30) {
    doc.moveDown(0.3);
    doc
      .font('Helvetica-Oblique')
      .fontSize(8)
      .fillColor(COLOR_GRIS)
      .text(`Solo se muestran los últimos 30 de ${ahorro.movimientos.length} movimientos registrados.`);
  }
};
/** Sección de estado de cuenta de CRÉDITO. */
const dibujarCredito = (
  doc: PDFKit.PDFDocument,
  credito: EstadoCuentaCredito,
  simbolo: string,
) => {
  dibujarTituloSeccion(doc, '2. ESTADO DE CUENTA DE CRÉDITO');

  const yCards = doc.y;
  const ancho = (doc.page.width - MARGEN * 2 - 24) / 4;
  dibujarTarjetaResumen(doc, MARGEN, yCards, ancho, 'N°. de créditos', String(credito.numCreditos));
  dibujarTarjetaResumen(doc, MARGEN + ancho + 8, yCards, ancho, 'Créditos activos', String(credito.creditosActivos), '#7c3aed');
  dibujarTarjetaResumen(doc, MARGEN + (ancho + 8) * 2, yCards, ancho, 'Total solicitado', formatearMoneda(credito.montoSolicitadoTotal, simbolo));
  dibujarTarjetaResumen(doc, MARGEN + (ancho + 8) * 3, yCards, ancho, 'Total pagado', formatearMoneda(credito.totalPagadoGeneral, simbolo), '#15803d');
  doc.y = yCards + 46;
  doc.moveDown(0.3);

  // Tarjeta destacada de saldo pendiente
  asegurarEspacio(doc, 60);
  const ySaldo = doc.y;
  doc
    .roundedRect(MARGEN, ySaldo, doc.page.width - MARGEN * 2, 40, 5)
    .fill('#fef3c7');
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#b45309')
    .text(
      `SALDO TOTAL PENDIENTE: ${formatearMoneda(credito.saldoPendienteTotal, simbolo)}`,
      MARGEN + 14,
      ySaldo + 12,
    );
  doc.y = ySaldo + 40;
  doc.moveDown(0.5);

  if (credito.creditos.length === 0) {
    doc.font('Helvetica').fontSize(10).fillColor(COLOR_GRIS).text('El asociado no presenta créditos registrados.');
    return;
  }

  credito.creditos.forEach((c: DetalleCredito, idx: number) => {
    asegurarEspacio(doc, 175);
    dibujarTituloSeccion(doc, `Crédito #${idx + 1} - No. ${c.id}`);

    const yDetalle = doc.y;
    const anchoUtil = doc.page.width - MARGEN * 2;
    const anchoTres = (anchoUtil - 16) / 3;
    const anchoDos = (anchoUtil - 8) / 2;
    dibujarTarjetaResumen(doc, MARGEN, yDetalle, anchoTres, 'Monto', formatearMoneda(c.monto, simbolo), '#0f766e');
    dibujarTarjetaResumen(doc, MARGEN + anchoTres + 8, yDetalle, anchoTres, 'Cuota mensual', formatearMoneda(c.cuotaMensual, simbolo));
    dibujarTarjetaResumen(doc, MARGEN + (anchoTres + 8) * 2, yDetalle, anchoTres, 'Cuotas pagadas', `${c.numCuotasPagadas}/${c.numCuotas}`, '#7c3aed');
    const yDetalleSecundario = yDetalle + 54;
    dibujarTarjetaResumen(doc, MARGEN, yDetalleSecundario, anchoDos, 'Total pagado', formatearMoneda(c.totalPagado, simbolo), '#15803d');
    dibujarTarjetaResumen(doc, MARGEN + anchoDos + 8, yDetalleSecundario, anchoDos, 'Saldo pendiente', formatearMoneda(c.saldoPendiente, simbolo), '#dc2626');
    doc.y = yDetalleSecundario + 46;
    doc.moveDown(0.4);

    doc.font('Helvetica').fontSize(9).fillColor(COLOR_TEXTO);
    doc.text(
      `Estado: ${c.estado ? c.estado.toUpperCase() : 'N/D'}     Inicio: ${formatearFecha(c.fechaCredito)}     Vencimiento: ${formatearFecha(c.fechaVencimiento)}     Tasa mensual: ${c.tasa ? `${(Number(c.tasa) * 100).toFixed(2)}%` : 'N/D'}     Plazo: ${c.plazoMeses} meses`,
      MARGEN,
      doc.y,
      { width: doc.page.width - MARGEN * 2 },
    );
    doc.moveDown(0.7);
  });
};

/** Genera el certificado como Buffer PDF. */
export const generarCertificadoPDF = (
  data: EstadoCuentaAsociado,
  opts: { simbolo?: string; nombreCooperativa?: string } = {},
): Promise<Buffer> => {
  const simbolo = opts.simbolo || '$';
  const cooperativa = opts.nombreCooperativa || 'COOPERATIVA DE AHORRO Y CRÉDITO';

  const tipoTexto =
    data.consulta.tipo === 'ahorro'
      ? 'Estado de cuenta de Ahorro'
      : data.consulta.tipo === 'credito'
      ? 'Estado de cuenta de Crédito'
      : 'Estado de cuenta integral (Ahorro y Crédito)';

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: MARGEN, bottom: MARGEN, left: MARGEN, right: MARGEN },
      info: {
        Title: `${tipoTexto} - ${data.asociado.nombres}`,
        Author: cooperativa,
        Subject: 'Certificado de estado de cuenta',
        Producer: 'Cooperative Management System',
        Creator: 'Cooperative Management System',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Generar número de certificado simple a partir del id y fecha
    const numero = `${String(data.asociado.id).padStart(4, '0')}-${new Date(data.generadoEl).getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

    dibujarEncabezado(doc, data, tipoTexto);

    const rangoTexto = data.consulta.desde || data.consulta.hasta
      ? `Período: ${formatearFecha(data.consulta.desde)} al ${formatearFecha(data.consulta.hasta)}`
      : 'Período: Histórico completo';

    if (data.ahorro) dibujarAhorro(doc, data.ahorro, simbolo);
    if (data.credito) dibujarCredito(doc, data.credito, simbolo);

    doc
      .font('Helvetica-Oblique')
      .fontSize(9)
      .fillColor(COLOR_GRIS)
      .text(
        `${rangoTexto}. Documento generado por el sistema de gestión cooperativa.`,
        MARGEN,
        doc.y + 10,
        { width: doc.page.width - MARGEN * 2 },
      );

    dibujarFirma(doc, data, numero);

    doc.font('Helvetica').fontSize(8).fillColor(COLOR_GRIS);
    doc.end();
  });
};