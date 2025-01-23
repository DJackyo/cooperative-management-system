// src/app/authentication/services/authService.ts
import { axiosNoAuth } from "@/services/axiosClient";

export const authService = {

  async login(email: string, password: string) {
    try {
      const response = await axiosNoAuth.post("/auth/login", { email, password: btoa(password) });
      if (response?.data) {
        const user = response.data?.data;
        this.saveToken(user.access_token);
        localStorage.setItem("userRole", user.role);
        return user.access_token;
      }
    } catch (error) {
      throw new Error("Error en el inicio de sesión");
    }
  },

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
