// src/app/authentication/services/authService.ts
import { defaultLoggedUser } from "@/app/(DashboardLayout)/utilities/utils";
import { LoggedUser } from "@/interfaces/User";
import { axiosNoAuth } from "@/services/axiosClient";
import jwt_decode from "jwt-decode";

export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await axiosNoAuth.post("/auth/login", {
        email,
        password: btoa(password),
      });
      if (response?.data) {
        const user = response.data?.data;
        this.saveToken(user.access_token);
        const userData: any = this.getCurrentUserData();
        if (userData) {
          const role = userData.role
            ?.map((role: any) => role.nombre)
            .join(", ");
          sessionStorage.setItem("userRole", role);
        }
        return user.access_token;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },

  saveToken(token: string) {
    if (window && typeof window !== "undefined")
      localStorage.setItem("authToken", token);
  },

  getToken() {
    if (window && typeof window !== "undefined")
      return localStorage.getItem("authToken");
  },

  logout() {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("userRole");
  },

  isAuthenticated() {
    if (window && typeof window !== "undefined")
      return !!localStorage.getItem("authToken");
  },

  getCurrentUserData(): LoggedUser {
    if (window && typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        return jwt_decode(token);
      }
    }
    return defaultLoggedUser;
  },

  getUserRoles() {
    let roles = [];
    if (window && typeof window !== "undefined") {
      const userData: any = this.getCurrentUserData();
      if (userData) {
        roles = userData.role?.map((role: any) => role.nombre);
      }
    }
    return roles;
  },
};
