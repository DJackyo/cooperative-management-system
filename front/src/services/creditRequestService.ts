// src/services/creditsService.ts
import { Prestamo } from "@/interfaces/Prestamo";

import { axiosClient } from "@/services/axiosClient";
const baseURL = "/prestamos";
const tasasURL = "/tasas";

export const creditsService = {
  async fetchByFilters(filter: any) {
    try {
      const response = await axiosClient.post(
        baseURL + "/findWithFilters",
        filter
      );
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async fetchByUser(userId: number) {
    try {
      const response = await axiosClient.get(baseURL + "/user/" + userId);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
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
  async create(saving: Omit<Prestamo, "id">) {
    try {
      const response = await axiosClient.post(baseURL, saving);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async update(id: number, saving: Omit<Prestamo, "id">) {
    try {
      const response = await axiosClient.put(`/${baseURL}/${id}`, saving);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async deactivate(id: number, saving: Omit<Prestamo, "id">) {
    try {
      const response = await axiosClient.patch(`/${baseURL}/${id}`, saving);
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
  async getTasas() {
    try {
      const response = await axiosClient.get(tasasURL);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
};
