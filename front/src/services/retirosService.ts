import { axiosClient } from "@/services/axiosClient";

const baseURL = "/retiros-asociados";

export const retirosService = {
  async fetchAll(estado?: string) {
    const response = await axiosClient.get(baseURL, { params: estado ? { estado } : undefined });
    return response?.data?.data || [];
  },
  async calculate(idAsociado: number) {
    const response = await axiosClient.get(`${baseURL}/calcular/${idAsociado}`);
    return response?.data?.data;
  },
  async fetchNegativeBalances() {
    const response = await axiosClient.get(`${baseURL}/saldos-negativos`);
    return response?.data?.data || [];
  },
  async request(idAsociado: number, data: FormData) {
    const response = await axiosClient.post(`${baseURL}/${idAsociado}/solicitar`, data);
    return response?.data?.data;
  },
  async approve(idRetiro: number) {
    const response = await axiosClient.post(`${baseURL}/${idRetiro}/aprobar`);
    return response?.data?.data;
  },
  async reject(idRetiro: number, motivoRechazo: string) {
    const response = await axiosClient.post(`${baseURL}/${idRetiro}/rechazar`, { motivoRechazo });
    return response?.data?.data;
  },
  async confirm(idRetiro: number) {
    const response = await axiosClient.post(`${baseURL}/${idRetiro}/confirmar`);
    return response?.data?.data;
  },
};
