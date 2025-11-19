// src/services/userService.ts
import { User } from "@/interfaces/User";

import { axiosClient } from "@/services/axiosClient";
const baseURL = "/usuarios";

export const userService = {
  async fetchAll() {
    try {
      const response = await axiosClient.get(baseURL);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async fetchAllWithLoans() {
    try {
      const response = await axiosClient.get(`${baseURL}?includeLoans=true`);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async create(user: Omit<User, "id" | "status">) {
    try {
      const response = await axiosClient.post(baseURL, user);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async update(id: number, user: Omit<User, "id" | "status">) {
    try {
      const response = await axiosClient.put(`/${baseURL}/${id}`, user);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async deactivate(id: number, user: Omit<User, "id">) {
    try {
      const response = await axiosClient.patch(`/${baseURL}/${id}`, user);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async delete(id: number) {
    try {
      const response = await axiosClient.delete(`/${baseURL}/${id}`);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
};
