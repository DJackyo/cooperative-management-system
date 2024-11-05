// src/app/authentication/services/authService.ts
import { User } from "@/interfaces/User";
import { mockUsers } from "@/mock/mockUsers";
import axiosClient from "@/services/axiosClient";


export const authService = {
  async login(email: string, password: string): Promise<User> {
    // Simulación de autenticación
    const user = mockUsers.find(
      (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password
    );

    if (user) {
      localStorage.setItem("authToken", "mockedToken"); // Guarda un token mockeado
      localStorage.setItem("userRole", user.role); // Guarda el rol del usuario
      return user;
    } else {
      throw new Error("Correo o contraseña incorrectos");
    }
  },

  // async login(email: string, password: string) {
  //     try {
  //       const response = await axiosClient.post("/auth/login", { email, password });
  //       const { token } = response.data;
  //       localStorage.setItem("authToken", token); // Guarda el token en localStorage
  //       localStorage.setItem("userRole", user.role);
  //       return token;
  //     } catch (error) {
  //       throw new Error("Error en el inicio de sesión");
  //     }
  //   },

  saveToken(token: string) {
    localStorage.setItem("authToken", token);
  },

  getToken() {
    return localStorage.getItem("authToken");
  },

  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
  },

  isAuthenticated() {
    return !!localStorage.getItem("authToken");
  },
};
