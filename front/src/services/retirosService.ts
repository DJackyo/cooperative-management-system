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
  async liquidate(idAsociado: number, data: { fechaRetiro: string; observaciones?: string; idUsuarioRegistro?: number }) {
    const response = await axiosClient.post(`${baseURL}/${idAsociado}/liquidar`, data);
    return response?.data?.data;
  },
};
