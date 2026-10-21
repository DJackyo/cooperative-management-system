import * as PDFDocumentModule from 'pdfkit';
import { existsSync } from 'fs';
import { resolve } from 'path';

const PDFDocument = (PDFDocumentModule as any).default || PDFDocumentModule;
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 24;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BORDER = '#9ca3af';
const PRIMARY = '#0f766e';
const LIGHT = '#f1f5f9';
const LOGO_PATHS = [
  resolve(process.cwd(), '../front/public/images/logos/logo.png'),
  resolve(process.cwd(), 'front/public/images/logos/logo.png'),
];

export interface DatosReciboRetanqueo {
  numeroRecibo: string;
  fechaRetanqueo: Date | string | null;
  asociado: {
    id: number;
    nombres: string;
    numeroDeIdentificacion: string;
  } | null;
  prestamoOrigen: {
    id: number;
    monto: number;
    plazoMeses: number;
    fechaCredito: Date | string | null;
  } | null;
  prestamoNuevo: {
    id: number;
    monto: number;
    plazoMeses: number;
    fechaCredito: Date | string | null;
  } | null;
  montoOrigen: number;
  montoNuevo: number;
  saldoLiquidado: number;
  desembolsoNeto: number;
  plazoMeses: number;
  estado: string;
  observaciones: string | null;
  liquidacion: any | null;
}

const money = (value: number) =>
  `$ ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(
    Number(value) || 0,
  )}`;

const dateText = (value: Date | string | null) =>
  value ? new Date(value).toLocaleDateString('es-CO') : '-';

const text = (
  doc: any,
  value: string,
  x: number,
  y: number,
  width: number,
  size = 7,
  options: any = {},
) => {
  doc.save();
  doc.rect(x, y - 1, width, size + 3).clip();
  doc
    .font(options.font || 'Helvetica')
    .fontSize(size)
    .fillColor(options.color || '#111')
    .text(value || '-', x, y, {
      width,
      lineBreak: false,
      ellipsis: true,
      align: options.align || 'left',
    });
  doc.restore();
};

const cell = (
  doc: any,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: any = {},
) => {
  doc.rect(x, y, width, height).fillAndStroke(options.fill || '#fff', BORDER);
  text(
    doc,
    value,
    x + 3,
    y + (height - (options.size || 7)) / 2 - 1,
    width - 6,
    options.size || 7,
    options,
  );
};

const row = (
  doc: any,
  values: string[],
  widths: number[],
  x: number,
  y: number,
  height = 16,
  options: any = {},
) => {
  let currentX = x;
  values.forEach((value, index) => {
    cell(doc, value, currentX, y, widths[index], height, {
      fill: options.header ? LIGHT : options.fill,
      size: options.size || 6.5,
      font: options.header ? 'Helvetica-Bold' : options.font,
      color: options.header ? PRIMARY : options.color,
      align: index === values.length - 1 ? 'right' : 'left',
    });
    currentX += widths[index];
  });
  return y + height;
};

const labelValue = (
  doc: any,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
) => {
  const labelWidth = 130;
  cell(doc, label, x, y, labelWidth, 15, {
    fill: LIGHT,
    size: 6.5,
    font: 'Helvetica-Bold',
    color: PRIMARY,
  });
  cell(doc, value, x + labelWidth, y, width - labelWidth, 15, { size: 6.5 });
  return y + 15;
};

export const generarReciboRetanqueoPDF = async (
  data: DatosReciboRetanqueo,
): Promise<Buffer> => {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolvePromise, reject) => {
    doc.on('end', () => resolvePromise(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill('#fff');
  doc.rect(0, 0, PAGE_WIDTH, 5).fill(PRIMARY);

  let currentY = MARGIN;
  doc.rect(MARGIN, currentY, CONTENT_WIDTH, 3).fill(PRIMARY);
  const logo = LOGO_PATHS.find((path) => existsSync(path));
  if (logo) doc.image(logo, MARGIN + 4, currentY + 8, { fit: [45, 45] });
  text(
    doc,
    'COOPERATIVA MULTIACTIVA DE PRODUCCIÓN',
    MARGIN + 58,
    currentY + 10,
    300,
    9,
    { font: 'Helvetica-Bold', color: PRIMARY },
  );
  text(
    doc,
    'Y PRESTACIÓN DE SERVICIOS INTEGRACIÓN',
    MARGIN + 58,
    currentY + 22,
    300,
    8,
    { font: 'Helvetica-Bold', color: PRIMARY },
  );
  text(
    doc,
    'SIGLO XXI "COOPINSI"',
    MARGIN + 58,
    currentY + 34,
    300,
    8,
    { font: 'Helvetica-Bold', color: PRIMARY },
  );
  text(doc, 'NIT. 08301055337', MARGIN + 58, currentY + 47, 150, 7, {
    color: '#64748b',
  });
  cell(
    doc,
    'RECIBO DE RETANQUEO',
    PAGE_WIDTH - MARGIN - 190,
    currentY,
    190,
    26,
    { size: 11, font: 'Helvetica-Bold', align: 'center' },
  );
  cell(
    doc,
    `N° ${data.numeroRecibo || '-'}`,
    PAGE_WIDTH - MARGIN - 190,
    currentY + 26,
    190,
    24,
    { fill: LIGHT, size: 8, font: 'Helvetica-Bold', align: 'center' },
  );
  currentY += 57;

  currentY = row(
    doc,
    [
      'Ciudad',
      'BOGOTÁ',
      'Fecha',
      dateText(data.fechaRetanqueo),
      'Estado',
      data.estado || '-',
    ],
    [52, 90, 52, 160, 52, 158],
    MARGIN,
    currentY,
    16,
    { header: true },
  );

  currentY = labelValue(
    doc,
    'Recibi de',
    data.asociado?.nombres || '-',
    MARGIN,
    currentY,
    CONTENT_WIDTH,
  );
  currentY = labelValue(
    doc,
    'N° de identificación',
    data.asociado?.numeroDeIdentificacion || '-',
    MARGIN,
    currentY,
    CONTENT_WIDTH,
  );
  currentY += 6;

  // Detalle del crédito origen
  text(doc, 'CRÉDITO ANTERIOR (ORIGEN)', MARGIN, currentY, 300, 8, {
    font: 'Helvetica-Bold',
    color: PRIMARY,
  });
  currentY += 11;
  currentY = row(
    doc,
    [
      'Crédito',
      `N° ${data.prestamoOrigen?.id ?? '-'}`,
      'Monto',
      money(data.montoOrigen),
      'Fecha',
      dateText(data.prestamoOrigen?.fechaCredito ?? null),
    ],
    [60, 90, 55, 100, 55, 204],
    MARGIN,
    currentY,
    16,
  );
  currentY += 6;

  // Detalle del crédito nuevo
  text(doc, 'CRÉDITO NUEVO (RETAQUEADO)', MARGIN, currentY, 300, 8, {
    font: 'Helvetica-Bold',
    color: PRIMARY,
  });
  currentY += 11;
  currentY = row(
    doc,
    [
      'Crédito',
      `N° ${data.prestamoNuevo?.id ?? '-'}`,
      'Monto',
      money(data.montoNuevo),
      'Plazo',
      `${data.plazoMeses} meses`,
    ],
    [60, 90, 55, 100, 55, 204],
    MARGIN,
    currentY,
    16,
  );
  currentY += 6;

  // Resumen económico
  text(doc, 'RESUMEN DE LA OPERACIÓN', MARGIN, currentY, 300, 8, {
    font: 'Helvetica-Bold',
    color: PRIMARY,
  });
  currentY += 11;
  currentY = row(
    doc,
    [
      'Monto del crédito nuevo',
      money(data.montoNuevo),
      'Saldo liquidado del crédito anterior',
      money(data.saldoLiquidado),
    ],
    [180, 84, 180, 120],
    MARGIN,
    currentY,
    17,
  );
  currentY = row(
    doc,
    ['Desembolso neto al asociado', money(data.desembolsoNeto)],
    [320, 144],
    MARGIN,
    currentY,
    17,
    { fill: '#ecfdf5', font: 'Helvetica-Bold', color: '#15803d' },
  );

  // Detalle de liquidación
  if (data.liquidacion) {
    const liq = data.liquidacion;
    text(
      doc,
      'DETALLE DE LIQUIDACIÓN DEL CRÉDITO ANTERIOR',
      MARGIN,
      currentY,
      300,
      8,
      { font: 'Helvetica-Bold', color: PRIMARY },
    );
    currentY += 11;
    currentY = row(
      doc,
      [
        'Saldo a capital',
        money(liq.saldoCapital ?? 0),
        'Intereses vencidos',
        money(liq.interesesVencidos ?? 0),
      ],
      [180, 84, 180, 120],
      MARGIN,
      currentY,
      16,
    );
    currentY = row(
      doc,
      [
        'Mora',
        money(liq.moraTotal ?? 0),
        'Total a liquidar',
        money(liq.totalALiquidar ?? data.saldoLiquidado),
      ],
      [180, 84, 180, 120],
      MARGIN,
      currentY,
      16,
    );
    currentY = row(
      doc,
      [
        'Cuotas pagadas',
        `${liq.cuotasPagadas ?? 0} de ${liq.cuotasTotales ?? 0}`,
        'Cuotas canceladas',
        `${liq.cuotasPendientes ?? 0}`,
      ],
      [180, 84, 180, 120],
      MARGIN,
      currentY,
      16,
    );
    currentY += 6;
  }

  cell(
    doc,
    `Observaciones: ${data.observaciones || 'Sin observaciones.'}`,
    MARGIN,
    currentY,
    CONTENT_WIDTH,
    22,
    { size: 7 },
  );
  currentY += 34;

  doc.moveTo(MARGIN, currentY).lineTo(MARGIN + 220, currentY).stroke(BORDER);
  text(doc, 'Firma y sello', MARGIN, currentY + 4, 220, 7, { align: 'center' });
  doc
    .moveTo(PAGE_WIDTH - MARGIN - 220, currentY)
    .lineTo(PAGE_WIDTH - MARGIN, currentY)
    .stroke(BORDER);
  text(doc, 'Recibido por', PAGE_WIDTH - MARGIN - 220, currentY + 4, 220, 7, {
    align: 'center',
  });

  doc.end();
  return finished;
};


