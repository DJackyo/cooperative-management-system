// src/mocks/mockUsers.ts

import { User } from "@/interfaces/User";

  export const mockUsers: User[] = [
    { 
      id: 1, 
      name: "Alice", 
      role: "administrador", 
      email: "admin@example.com", 
      phoneNumber: "12345" ,
      password: "12345" 
    },
    { 
      id: 2, 
      name: "Bob", 
      role: "gestorOperaciones", 
      email: "gestor@example.com", 
      phoneNumber: "0987654321" ,
      password: "12345" 
    },
    { 
      id: 3, 
      name: "Charlie", 
      role: "socio", 
      email: "socio@example.com", 
      phoneNumber: "5678901234" ,
      password: "12345" 
    },
  ];
  