// src/services/creditsService.ts
import { Prestamo } from "@/interfaces/Prestamo";
import { RetanqueoDto, CreditoRetanqueable, TrazaRetanqueo } from "@/interfaces/Retanqueo";

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
  async create(credit: Omit<Prestamo, "id">) {
    try {
      const response = await axiosClient.post(baseURL, credit);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async update(id: number, credit: Omit<Prestamo, "id">) {
    try {
      const response = await axiosClient.put(`${baseURL}/${id}`, credit);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async deactivate(id: number, credit: Omit<Prestamo, "id">) {
    try {
      const response = await axiosClient.patch(`${baseURL}/${id}`, credit);
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
  async createTasa(data: { anio: number; tasa: string }) {
    try {
      const response = await axiosClient.post(tasasURL, data);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async updateTasa(id: number, data: { anio?: number; tasa?: string }) {
    try {
      const response = await axiosClient.put(`${tasasURL}/find/${id}`, data);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async deleteTasa(id: number) {
    try {
      const response = await axiosClient.delete(`${tasasURL}/find/${id}`);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      throw new Error("Error", error!);
    }
  },
  async approveCredit(id: number, credit: Omit<Prestamo, "id">) {
    try {
      const response = await axiosClient.patch(
        `${baseURL + "/approve"}/${id}`,
        credit
      );
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error) {
      console.error(error)
      throw new Error("Error", error!);
    }
  },
  async recalcularCuotas(id: number) {
    try {
      const response = await axiosClient.patch(`${baseURL}/${id}/recalcular`);
      if (response?.data) {
        return response.data?.data;
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Error al recalcular cuotas";
      throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  },

  async getCreditosRetanqueables(userId: number): Promise<CreditoRetanqueable[]> {
    try {
      const response = await axiosClient.get(`${baseURL}/retancuables/${userId}`);
      const data = response?.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Error al obtener créditos retanqueables";
      throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  },

  async procesarRetanqueo(dto: RetanqueoDto): Promise<Prestamo | null> {
    try {
      const response = await axiosClient.post(`${baseURL}/retanqueo`, dto);
      return response?.data?.data ?? null;
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Error al procesar retanqueo";
      throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  },

  async getRetanqueos(idAsociado?: number): Promise<TrazaRetanqueo[]> {
    try {
      const response = await axiosClient.get(`${baseURL}/retanqueos`, {
        params: idAsociado ? { idAsociado } : undefined,
      });
      const data = response?.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Error al obtener los retanqueos";
      throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  },

  async getRetanqueosDePrestamo(idPrestamo: number): Promise<TrazaRetanqueo[]> {
    try {
      const response = await axiosClient.get(
        `${baseURL}/retanqueos-credito/${idPrestamo}`
      );
      const data = response?.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Error al obtener los retanqueos del crédito";
      throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  },

  async getReciboRetanqueoPDF(idRetanqueo: number): Promise<Blob> {
    const response = await axiosClient.get(
      `${baseURL}/retanqueos/${idRetanqueo}/recibo-pdf`,
      { responseType: "blob" }
    );
    return response.data as Blob;
  },

  async descargarReciboRetanqueoPDF(
    idRetanqueo: number,
    numeroRecibo?: string | null
  ) {
    const blob = await this.getReciboRetanqueoPDF(idRetanqueo);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `recibo-retanqueo-${numeroRecibo || idRetanqueo}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async abrirReciboRetanqueoPDF(
    idRetanqueo: number,
    numeroRecibo?: string | null
  ) {
    const blob = await this.getReciboRetanqueoPDF(idRetanqueo);
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
    window.setTimeout(() => window.URL.revokeObjectURL(url), 30000);
  },
};
