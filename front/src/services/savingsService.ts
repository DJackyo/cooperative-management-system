// src/services/savingsService.ts
import { Aporte } from "@/interfaces/Aporte";

import { axiosClient } from "@/services/axiosClient";
const baseURL = "/aportes-asociados";

export const savingsService = {
  async fetchByFilters(filter:any) {
    try {
      const response = await axiosClient.post(baseURL + '/findWithFilters', filter);
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
  async create(saving: Omit<Aporte, "id" | "asociado">) {
    try {
      let response;
      
      // Convertir estado a boolean antes de enviar
      if (typeof saving.estado === 'string') {
        saving.estado = saving.estado.toLowerCase() === 'activo' || saving.estado === 'true' || saving.estado === '1';
      }
      
      if (saving.file) {
        // Si hay archivo, usar FormData
        const formData = new FormData();
        Object.keys(saving).forEach(key => {
          if (key === 'file') {
            formData.append('comprobante', saving.file!);
          } else if (key === 'estado') {
            // Enviar estado como boolean
            formData.append(key, String(saving.estado === true));
          } else if (saving[key as keyof typeof saving] !== null && saving[key as keyof typeof saving] !== undefined) {
            formData.append(key, String(saving[key as keyof typeof saving]));
          }
        });
        
        response = await axiosClient.post(baseURL, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Sin archivo, envío normal
        response = await axiosClient.post(baseURL, saving);
      }
      
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async update(id: number, saving: Omit<Aporte, "id" | "asociado">) {
    try {
      let response;
      
      // Convertir estado a boolean antes de enviar
      if (typeof saving.estado === 'string') {
        saving.estado = saving.estado.toLowerCase() === 'activo' || saving.estado === 'true' || saving.estado === '1';
      }
      
      if (saving.file) {
        // Si hay archivo, usar FormData
        const formData = new FormData();
        Object.keys(saving).forEach(key => {
          if (key === 'file') {
            formData.append('comprobante', saving.file!);
          } else if (key === 'estado') {
            // Enviar estado como boolean
            formData.append(key, String(saving.estado === true));
          } else if (saving[key as keyof typeof saving] !== null && saving[key as keyof typeof saving] !== undefined) {
            formData.append(key, String(saving[key as keyof typeof saving]));
          }
        });
        
        response = await axiosClient.put(`${baseURL}/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Sin archivo, envío normal
        response = await axiosClient.put(`${baseURL}/${id}`, saving);
      }
      
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async deactivate(id: number, saving: Omit<Aporte, "id">) {
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
  async fetchAllUsersSavings() {
    try {
      const response = await axiosClient.get(baseURL + '/users-summary');
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
};
