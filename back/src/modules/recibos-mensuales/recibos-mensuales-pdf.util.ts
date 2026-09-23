import * as PDFDocumentModule from 'pdfkit';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { ReciboMensual } from './recibos-mensuales.service';

const PDFDocument = (PDFDocumentModule as any).default || PDFDocumentModule;
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 24;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BORDER = '#9ca3af';
const PRIMARY = '#0f766e';
const SECONDARY = '#13DEB9';
const LIGHT = '#f1f5f9';
const GREEN = '#15803d';
const LOGO_PATHS = [resolve(process.cwd(), '../front/public/images/logos/logo.png'), resolve(process.cwd(), 'front/public/images/logos/logo.png')];

const money = (value: number) => `$ ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Number(value) || 0)}`;
const dateText = (value: Date | string | null) => value ? new Date(value).toLocaleDateString('es-CO') : '-';
const paymentMethod = (data: ReciboMensual) => {
  const methods = [
    ...data.ahorro.movimientos.map((movimiento) => movimiento.metodo),
    ...data.credito.pagos.map((pago) => pago.metodo),
  ].filter(Boolean).map((method) => method!.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase());
  const method = methods.find((value) => value.includes('TRANSFER') || value.includes('CONSIGN') || value.includes('DEPOSIT'));
  if (method) return 'TRANSFERENCIA';
  if (methods.some((value) => value.includes('EFECT'))) return 'EFECTIVO';
  return null;
};
const receiptDate = (data: ReciboMensual) => {
  const dates = [
    ...data.ahorro.movimientos.map((movimiento) => movimiento.fecha),
    ...data.credito.pagos.map((pago) => pago.fecha),
  ].filter((date): date is Date => Boolean(date));
  dates.sort((first, second) => new Date(first).getTime() - new Date(second).getTime());
  return dates[0] || null;
};
const numberToWords = (value: number): string => {
  const units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
  const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  const underThousand = (number: number): string => number < 30 ? units[number] : number < 100 ? `${tens[Math.floor(number / 10)]}${number % 10 ? ` y ${units[number % 10]}` : ''}` : number === 100 ? 'cien' : `${hundreds[Math.floor(number / 100)]}${number % 100 ? ` ${underThousand(number % 100)}` : ''}`;
  const integer = Math.max(0, Math.floor(Number(value) || 0));
  if (!integer) return 'CERO PESOS MONEDA CORRIENTE';
  const millions = Math.floor(integer / 1000000);
  const thousands = Math.floor((integer % 1000000) / 1000);
  const remainder = integer % 1000;
  const parts: string[] = [];
  if (millions) parts.push(`${millions === 1 ? 'un millón' : `${underThousand(millions)} millones`}`);
  if (thousands) parts.push(thousands === 1 ? 'mil' : `${underThousand(thousands)} mil`);
  if (remainder) parts.push(underThousand(remainder));
  return `${parts.join(' ')} pesos moneda corriente`.toLocaleUpperCase();
};

const text = (doc: any, value: string, x: number, y: number, width: number, size = 7, options: any = {}) => {
  doc.save();
  doc.rect(x, y - 1, width, size + 3).clip();
  doc.font(options.font || 'Helvetica').fontSize(size).fillColor(options.color || '#111').text(value || '-', x, y, { width, lineBreak: false, ellipsis: true, align: options.align || 'left' });
  doc.restore();
};
const cell = (doc: any, value: string, x: number, y: number, width: number, height: number, options: any = {}) => {
  doc.rect(x, y, width, height).fillAndStroke(options.fill || '#fff', BORDER);
  text(doc, value, x + 3, y + (height - (options.size || 7)) / 2 - 1, width - 6, options.size || 7, options);
};
const row = (doc: any, values: string[], widths: number[], x: number, y: number, height = 16, options: any = {}) => {
  let currentX = x;
  values.forEach((value, index) => {
    cell(doc, value, currentX, y, widths[index], height, { fill: options.header ? LIGHT : options.fill, size: options.size || 6.5, font: options.header ? 'Helvetica-Bold' : options.font, color: options.header ? PRIMARY : options.color, align: index === values.length - 1 ? 'right' : 'left' });
    currentX += widths[index];
  });
  return y + height;
};
const checkbox = (doc: any, label: string, checked: boolean, x: number, y: number) => {
  doc.rect(x, y, 9, 9).lineWidth(0.8).stroke(BORDER);
  if (checked) {
    doc.moveTo(x + 2, y + 4).lineTo(x + 4, y + 7).lineTo(x + 8, y + 2).lineWidth(1.2).stroke(PRIMARY);
  }
  text(doc, label, x + 14, y + 1, 88, 7);
};
const creditSummaryRow = (doc: any, label: string, value: string, widths: number[], x: number, y: number, options: any = {}) => {
  const labelWidth = widths.slice(0, -1).reduce((total, width) => total + width, 0);
  const height = options.height || 15;
  cell(doc, label, x, y, labelWidth, height, {
    fill: options.fill,
    size: options.size || 6.5,
    font: options.font || 'Helvetica-Bold',
    color: options.color || PRIMARY,
  });
  cell(doc, value, x + labelWidth, y, widths[widths.length - 1], height, {
    fill: options.fill,
    size: options.size || 6.5,
    font: options.font || 'Helvetica-Bold',
    color: options.color || PRIMARY,
    align: 'right',
  });
  return y + height;
};

const drawHeader = (doc: any, data: ReciboMensual, y: number, title: string, number: string) => {
  doc.rect(MARGIN, y, CONTENT_WIDTH, 3).fill(PRIMARY);
  const logo = LOGO_PATHS.find((path) => existsSync(path));
  if (logo) doc.image(logo, MARGIN + 4, y + 8, { fit: [45, 45] });
  text(doc, 'COOPERATIVA MULTIACTIVA DE PRODUCCIÓN', MARGIN + 58, y + 10, 300, 9, { font: 'Helvetica-Bold', color: PRIMARY });
  text(doc, 'Y PRESTACIÓN DE SERVICIOS INTEGRACIÓN', MARGIN + 58, y + 22, 300, 8, { font: 'Helvetica-Bold', color: PRIMARY });
  text(doc, 'SIGLO XXI “COOPINSI”', MARGIN + 58, y + 34, 300, 8, { font: 'Helvetica-Bold', color: PRIMARY });
  text(doc, 'NIT. 08301055337', MARGIN + 58, y + 47, 150, 7, { color: '#64748b' });
  text(doc, number, PAGE_WIDTH - MARGIN - 140, y + 16, 140, 9, { font: 'Helvetica-Bold', color: PRIMARY, align: 'right' });
  text(doc, title, MARGIN, y + 63, CONTENT_WIDTH, 12, { font: 'Helvetica-Bold', color: PRIMARY, align: 'center' });
  return y + 80;
};

const drawMonthlyReceipt = (doc: any, data: ReciboMensual, y: number) => {
  let currentY = drawHeader(doc, data, y, 'RECIBO MENSUAL DE APORTES Y CREDITO', `#REC-${data.asociado.id}-${data.periodo.anio}${String(data.periodo.mes).padStart(2, '0')}`);
  currentY = row(doc, ['Código', 'N° DE IDENTIFICACIÓN', 'APELLIDOS Y NOMBRES', 'CALIDAD', 'ESTADO'], [42, 100, 240, 70, 112], MARGIN, currentY, 15, { header: true });
  currentY = row(doc, [String(data.asociado.id), data.asociado.numeroDeIdentificacion, data.asociado.nombres, data.asociado.calidad, data.asociado.estado || 'ACTIVO'], [42, 100, 240, 70, 112], MARGIN, currentY, 17);
  currentY += 5;
  currentY = row(doc, ['CUOTA CORRESPONDIENTE A:', data.periodo.nombreMes.toUpperCase(), 'AÑO', String(data.periodo.anio), 'CUOTA MENSUAL', money(data.ahorro.total)], [145, 84, 32, 45, 82, 176], MARGIN, currentY, 17, { header: true });
  currentY += 7;
  text(doc, 'ESTADO APORTES', MARGIN, currentY, 276, 8, { font: 'Helvetica-Bold', color: PRIMARY, align: 'center' });
  text(doc, 'CREDITO', MARGIN + 282, currentY, 282, 8, { font: 'Helvetica-Bold', color: PRIMARY, align: 'center' });
  currentY += 13;
  const topY = currentY;
  let savingsY = row(doc, ['Fecha', 'Tipo', 'Método', 'Total'], [70, 72, 70, 64], MARGIN, topY, 15, { header: true });
  data.ahorro.movimientos.slice(0, 3).forEach((aporte) => { savingsY = row(doc, [dateText(aporte.fecha), aporte.tipo || 'MENSUAL', aporte.metodo || '-', money(aporte.monto)], [70, 72, 70, 64], MARGIN, savingsY, 15); });
  savingsY = row(doc, ['TOTAL APORTES', '', '', money(data.ahorro.total)], [70, 72, 70, 64], MARGIN, savingsY, 15, { header: true });
  const creditX = MARGIN + 282;
  const creditWidths = [52, 45, 58, 56, 71];
  let creditY = row(doc, ['Crédito', 'Cuota', 'Capital', 'Interés', 'Total'], creditWidths, creditX, topY, 15, { header: true });
  const groups = new Map<number, ReciboMensual['credito']['pagos']>();
  data.credito.pagos.forEach((pago) => groups.set(pago.creditoId, [...(groups.get(pago.creditoId) || []), pago]));
  Array.from(groups.values()).forEach((group) => {
    group.slice(0, 2).forEach((pago) => { creditY = row(doc, [`#${pago.creditoId}`, String(pago.cuota || '-'), money(pago.capital), money(pago.intereses), money(pago.total)], creditWidths, creditX, creditY, 15); });
    const last = group[group.length - 1];
    const total = group.reduce((sum, pago) => sum + pago.total, 0);
    creditY = creditSummaryRow(doc, `TOTAL CRÉDITO #${last.creditoId}`, money(total), creditWidths, creditX, creditY, { fill: LIGHT, color: PRIMARY, height: 15 });
    creditY = creditSummaryRow(doc, `SALDO A CAPITAL CUOTA #${last.cuota || '-'}`, money(last.saldoCapital), creditWidths, creditX, creditY, { fill: '#f8fafc', color: PRIMARY, height: 15 });
  });
  currentY = Math.max(savingsY, creditY) + 5;
  currentY = row(doc, ['TOTAL RECIBIDO', money(data.totalRecibido)], [458, 106], MARGIN, currentY, 17, { fill: '#f0fdf4', font: 'Helvetica-Bold', color: GREEN });
  cell(doc, 'VALOR RECIBIDO EN LETRAS', MARGIN, currentY + 4, CONTENT_WIDTH, 25, { fill: '#f8fafc', size: 6.5, font: 'Helvetica-Bold', color: '#64748b' });
  text(doc, numberToWords(data.totalRecibido), MARGIN + 125, currentY + 14, CONTENT_WIDTH - 135, 6.5, { font: 'Helvetica-BoldOblique', color: '#1e293b' });
  return currentY + 35;
};

const drawCashReceipt = (doc: any, data: ReciboMensual, y: number) => {
  let currentY = y + 7;
  doc.moveTo(MARGIN, currentY).lineTo(PAGE_WIDTH - MARGIN, currentY).lineWidth(1).stroke(PRIMARY);
  currentY += 7;
  const logo = LOGO_PATHS.find((path) => existsSync(path));
  if (logo) doc.image(logo, MARGIN + 4, currentY + 4, { fit: [42, 42] });
  text(doc, 'COOPERATIVA MULTIACTIVA DE PRODUCCIÓN', MARGIN + 56, currentY + 7, 300, 8, { font: 'Helvetica-Bold', color: PRIMARY });
  text(doc, 'Y PRESTACIÓN DE SERVICIOS INTEGRACIÓN', MARGIN + 56, currentY + 18, 300, 7, { font: 'Helvetica-Bold', color: PRIMARY });
  text(doc, 'SIGLO XXI “COOPINSI”  |  NIT. 08301055337', MARGIN + 56, currentY + 30, 320, 7, { font: 'Helvetica-Bold', color: PRIMARY });
  cell(doc, 'RECIBO DE CAJA', PAGE_WIDTH - MARGIN - 190, currentY, 190, 26, { fill: '#fff', size: 12, font: 'Helvetica-Bold', align: 'center' });
  cell(doc, `N°  #CAJA-${data.asociado.id}-${data.periodo.anio}${String(data.periodo.mes).padStart(2, '0')}`, PAGE_WIDTH - MARGIN - 190, currentY + 26, 190, 24, { fill: LIGHT, size: 8, font: 'Helvetica-Bold', align: 'center' });
  currentY += 57;
  currentY = row(doc, ['Ciudad', 'BOGOTÁ', 'Fecha', dateText(receiptDate(data))], [52, 145, 52, 315], MARGIN, currentY, 16, { header: true });
  currentY = row(doc, ['RECIBIDO DE', data.asociado.numeroDeIdentificacion, data.asociado.nombres, 'TOTAL', money(data.totalRecibido)], [68, 105, 265, 55, 71], MARGIN, currentY, 18, { header: true });
  currentY += 5;
  text(doc, 'Por concepto de:', MARGIN, currentY + 20, 68, 7, { font: 'Helvetica-Bold' });
  const conceptX = MARGIN + 68;
  const conceptTop = currentY;
  row(doc, ['Crédito', 'Aportes'], [120, 120], conceptX, conceptTop, 16, { header: true });
  row(doc, [`Cuota crédito: ${money(data.credito.totalMes)}`, `Aporte ${data.periodo.nombreMes}: ${money(data.ahorro.total)}`], [120, 120], conceptX, conceptTop + 16, 38);
  cell(doc, 'TOTAL EN LETRAS', conceptX + 240, conceptTop, 256, 16, { fill: LIGHT, size: 7, font: 'Helvetica-Bold', color: PRIMARY });
  const wordsX = conceptX + 243;
  const wordsY = conceptTop + 20;
  const wordsWidth = 250;
  const wordsHeight = 30;
  doc.rect(conceptX + 240, conceptTop + 16, 256, 38).fillAndStroke('#fff', BORDER);
  doc.save();
  doc.rect(wordsX, wordsY - 1, wordsWidth, wordsHeight + 2).clip();
  doc.font('Helvetica-BoldOblique').fontSize(6.5).fillColor('#1e293b').text(numberToWords(data.totalRecibido), wordsX, wordsY, { width: wordsWidth, height: wordsHeight, lineGap: 1, lineBreak: true });
  doc.restore();
  currentY = conceptTop + 54;
  cell(doc, 'Observaciones: Sin observaciones.', MARGIN, currentY, CONTENT_WIDTH, 20, { fill: '#fff', size: 7 });
  currentY += 27;
  text(doc, 'Cheque N° __________________', MARGIN, currentY, 145, 7);
  text(doc, 'Banco __________________', MARGIN + 170, currentY, 130, 7);
  const selectedMethod = paymentMethod(data);
  checkbox(doc, 'Efectivo', selectedMethod === 'EFECTIVO', MARGIN + 320, currentY - 1);
  checkbox(doc, 'Transferencia', selectedMethod === 'TRANSFERENCIA', MARGIN + 420, currentY - 1);
  doc.moveTo(MARGIN + 280, currentY + 30).lineTo(PAGE_WIDTH - MARGIN, currentY + 30).stroke(BORDER);
  text(doc, 'Firma y sello', MARGIN + 400, currentY + 34, 140, 7, { align: 'center' });
};

export const generarReciboMensualPDF = async (data: ReciboMensual): Promise<Buffer> => {
  const doc = new PDFDocument({ size: 'LETTER', margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolvePromise, reject) => {
    doc.on('end', () => resolvePromise(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill('#fff');
  doc.rect(0, 0, PAGE_WIDTH, 5).fill(PRIMARY);
  const monthlyEnd = drawMonthlyReceipt(doc, data, 10);
  drawCashReceipt(doc, data, Math.max(monthlyEnd + 8, 398));
  doc.end();
  return finished;
};
