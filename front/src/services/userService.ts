// src/services/userService.ts
import { User } from "@/interfaces/User";

import { axiosClient } from "@/services/axiosClient";

export const userService = {
  async fetchUsers() {
    try {
      const response = await axiosClient.get("/usuarios");
      if (response?.data) {
        const user = response.data?.data;
        return user;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async createUser(user: Omit<User, "id" | "status">) {
    try {
      const response = await axiosClient.post("/usuarios", user);
      if (response?.data) {
        const user = response.data?.data;
        return user;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async updateUser(id: number, user: Omit<User, "id" | "status">) {
    try {
      const response = await axiosClient.put(`/usuarios/${id}`, user);
      if (response?.data) {
        const user = response.data?.data;
        return user;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async deactivateUser(id: number, user: Omit<User, "id">) {
    try {      
      const response = await axiosClient.patch(`/usuarios/${id}`, user);
      if (response?.data) {
        const user = response.data?.data;
        return user;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async deleteUser(id: number) {
    try {
      const response = await axiosClient.delete(`/usuarios/${id}`);
      if (response?.data) {
        const user = response.data?.data;
        return user;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
};
