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
}

export interface LoggedUser {
  email: string;
  role: [];
  userId: number;
  username: string;
  iat: number;
  exp: number;
}
