// src/mocks/mockUsers.ts

import { User } from "@/interfaces/User";

export const mockUsers: User[] = [
  {
    id: 1,
    names: "Alice",
    role: "administrador",
    email: "admin@example.com",
    identification: "12345",
    password: "12345",
    status: 'activo'
  },
  {
    id: 2,
    names: "Bob",
    role: "gestor",
    email: "gestor@example.com",
    identification: "0987654321",
    password: "12345",
    status: 'activo'
  },
  {
    id: 3,
    names: "Charlie",
    role: "socio",
    email: "socio@example.com",
    identification: "5678901234",
    password: "12345",
    status: 'activo'
  },
];
