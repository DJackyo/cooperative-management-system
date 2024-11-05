// src/interfaces/User.ts

export interface User {
  id: number;
  names: string;
  email: string;
  identification: string;
  contactData: string;
  locationData: string;
  role: "socio" | "administrador" | "gestor"; // Definir los roles específicos aquí
  status: "activo" | "inactivo"; // Agregar estado también
}