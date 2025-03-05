import { LoggedUser } from "@/interfaces/User";
import dayjs from "dayjs";

export const formatDateToISO = (date: string | Date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
// Función para formatear la fecha sin la hora
export const formatDateWithoutTime = (date: string | Date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    console.error("Fecha inválida:", date);
    return "";
  }
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
};

export const formatNameDate = (date: string | Date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    console.error("Fecha inválida:", date);
    return "";
  }
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit", // Formato para el día con 2 dígitos
    month: "short", // Mes abreviado
    year: "numeric", // Año en formato numérico
  };

  return new Intl.DateTimeFormat("es-ES", options)
    .format(d)
    .toString()
    .toLocaleUpperCase();
};

// Función para formatear el monto
export const formatCurrency = (amount: any) => {
  return new Intl.NumberFormat("es-ES").format(amount);
};

export const formatCurrencyFixed = (amount: any) => {
  let value: any = parseFloat(amount);
  const formateador = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  if (!isNaN(value)) {
    value = (value).toFixed(0);
    return formateador.format(value);
  }
  // return amount;
};

export const getComparator = (order: "asc" | "desc", orderBy: string) => {
  return order === "desc"
    ? (a: any, b: any) => (a[orderBy] < b[orderBy] ? 1 : -1)
    : (a: any, b: any) => (a[orderBy] < b[orderBy] ? -1 : 1);
};

export const defaultLoggedUser: LoggedUser = {
  email: "",
  role: "",
  userId: 0,
  username: "",
  iat: 0,
  exp: 0,
};

export function numeroALetras(
  numero: number,
  mostrarComplemento: boolean = false
): string {
  const unidades = [
    "",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "dieciséis",
    "diecisiete",
    "dieciocho",
    "diecinueve",
    "veinte",
    "veintiuno",
    "veintidós",
    "veintitrés",
    "veinticuatro",
    "veinticinco",
    "veintiséis",
    "veintisiete",
    "veintiocho",
    "veintinueve",
  ];

  const decenas = [
    "",
    "",
    "veinte",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa",
  ];
  const centenas = [
    "",
    "ciento",
    "doscientos",
    "trescientos",
    "cuatrocientos",
    "quinientos",
    "seiscientos",
    "setecientos",
    "ochocientos",
    "novecientos",
  ];

  // Función para obtener la parte de centenas
  const getCentenas = (n: number): string => {
    if (n === 100) return "cien"; // Especial caso para cien, no ciento
    return (
      centenas[Math.floor(n / 100)] + (n % 100 ? " " + getDecenas(n % 100) : "")
    ).trim();
  };

  // Función para obtener la parte de decenas
  const getDecenas = (n: number): string => {
    if (n < 30) return unidades[n];
    return (
      decenas[Math.floor(n / 10)] + (n % 10 ? " y " + unidades[n % 10] : "")
    ).trim();
  };

  // Función para convertir millones a letras
  const millonesTexto = (n: number): string => {
    if (n === 0) return "";
    return `${getCentenas(n)} millon${n > 1 ? "es" : ""} `;
  };

  // Función para convertir miles a letras
  const milesTexto = (n: number): string => {
    if (n === 0) return "";
    // Si es 1, no usamos "mil" en plural.
    return n === 1 ? `un mil ` : `${getCentenas(n)} mil `;
  };

  // Convertir la parte entera del número
  const numeroEntero = Math.floor(numero);
  const numeroDecimales = Math.round((numero - numeroEntero) * 100); // Tomamos los primeros dos decimales

  // Dividir en millones, miles y centenas
  const millones = Math.floor(numeroEntero / 1000000);
  const miles = Math.floor((numeroEntero % 1000000) / 1000);
  const centenasTexto = numeroEntero % 1000;

  const millonesStr = millonesTexto(millones);
  const milesStr = milesTexto(miles);
  const centenasStr = getCentenas(centenasTexto);

  // Convertir la parte decimal de manera más sencilla
  const decimalesStr: string =
    numeroDecimales > 0 ? ` con ${numeroALetras(numeroDecimales)}` : "";

  // Aquí corregimos la parte de "ciento veintiún mil" si el número tiene un "1" antes del "mil"
  let result = (millonesStr + milesStr + centenasStr + decimalesStr).trim();
  if (mostrarComplemento) {
    result += " Pesos Moneda Corriente";
  }
  return result
    .replace("uno mil", "un mil")
    .replace("ciento uno", "ciento un")
    .toLocaleUpperCase();
}

export function redondearHaciaArriba(
  numero: number,
  decimales: number = 10
): number {
  const factor = Math.pow(10, decimales);
  return Math.ceil(numero * factor) / factor;
}

export function redondearHaciaAbajo(
  numero: number,
  decimales: number = 10
): number {
  const factor = Math.pow(10, decimales);
  return Math.floor(numero * factor) / factor;
}

export const formatDateTime = (date: Date): string => {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};

export const formatNumber = (number: number) => {
  let value = number.toString();
  return parseInt(parseFloat(value).toFixed(0))
}