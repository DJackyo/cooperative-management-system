import { string } from "prop-types";

// src/interfaces/User.ts
export interface Rol {
  id: number;
  nombre: string;
}

export interface Estado {
  id: number;
  estado: string;
}

export interface Asociado {
  id: number;
  nombres: string;
  numeroDeIdentificacion: string;
  idEstado: Estado;
  nombre1?: string;
  nombre2?: string;
  apellido1?: string;
  apellido2?: string;
  // additional details
  tipoIdentificacionId?: number | null;
  fechaDeExpedicion?: string | null;
  fechaDeNacimiento?: string | null;
  genero?: string | null;
  estadoCivil?: string | null;
  esAsociado?: boolean | null;
}

export interface User {
  id: number;
  username: string | null;
  correoElectronico: string | null;
  contrasena: string | null;
  fechaRegistro: string;
  fechaModificacion: string;
  roles: Rol[];
  idAsociado: Asociado;
  activeLoansCount?: number;
}

export interface LoggedUser {
  email: string;
  role: any[];
  userId: number;
  username: string;
  iat: number;
  exp: number;
}
