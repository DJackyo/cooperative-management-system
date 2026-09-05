import { axiosClient } from "@/services/axiosClient";

const baseURL = "/estados-asociado";

export const estadosAsociadoService = {
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
  async fetchById(id: number) {
    try {
      const response = await axiosClient.get(`${baseURL}/${id}`);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async create(data: { id: number; estado?: string | null }) {
    try {
      const response = await axiosClient.post(baseURL, data);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async update(id: number, data: { estado?: string | null }) {
    try {
      const response = await axiosClient.put(`${baseURL}/${id}`, data);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async delete(id: number) {
    try {
      const response = await axiosClient.delete(`${baseURL}/${id}`);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
};