// src/services/pagosService.ts
import { Cuota } from "@/interfaces/Cuota";

import { axiosClient } from "@/services/axiosClient";
const baseURL = "/pagos";

export const pagosService = {
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
  async create(creditId: number, payload: FormData) {
    try {
      const response = await axiosClient.post(
        `${baseURL}/createByCredit/${creditId}`,
        payload
      );
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async update(id: number, pago: Omit<Cuota, "id">) {
    try {
      const response = await axiosClient.put(`${baseURL}/${id}`, pago);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async deactivate(id: number, pago: Omit<Cuota, "id">) {
    try {
      const response = await axiosClient.patch(`/${baseURL}/${id}`, pago);
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
