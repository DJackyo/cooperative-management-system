// src/interfaces/User.ts
export type Role = "socio" | "administrador" | "gestor";
export type Status = "activo" | "inactivo";

export interface User {
  id: number;
  names: string;
  email: string;
  identification: string;
  contactData?: string;
  locationData?: string;
  password?: string;
  phoneNumber?: string;
  role: Role;
  status?: Status;
}