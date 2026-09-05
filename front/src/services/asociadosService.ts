import { Asociado } from "@/interfaces/User";
import { axiosClient } from "@/services/axiosClient";

const baseURL = "/asociados";

export const asociadosService = {
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
  async fetchFullProfile(id: number) {
    try {
      const response = await axiosClient.get(`${baseURL}/${id}/perfil-completo`);
      return response?.data?.data;
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async fetchAssemblyAttendance() {
    try {
      const response = await axiosClient.get(`${baseURL}/asistencia-asamblea`);
      return response?.data?.data || [];
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async create(asociado: Omit<Asociado, "id">) {
    try {
      const response = await axiosClient.post(baseURL, asociado);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async update(id: number, asociado: Omit<Asociado, "id" | "idEstado"> & { idEstado?: number }) {
    try {
      const response = await axiosClient.put(`${baseURL}/${id}`, asociado);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async updateFullProfile(id: number, profile: any) {
    try {
      const response = await axiosClient.put(`${baseURL}/${id}/perfil-completo`, profile);
      return response?.data?.data;
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
