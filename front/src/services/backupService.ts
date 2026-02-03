import { axiosClient } from "./axiosClient";

export interface BackupItem {
  name: string;
  sizeMB: number;
  date: string | Date;
}

export const generateBackup = async (includeFiles: boolean = false): Promise<{ success: boolean; file: string }> => {
  const { data } = await axiosClient.post("/backup/manual", { includeFiles });
  return data?.data ?? data; // handle ResponseInterceptor wrapping
};

export const listBackups = async (): Promise<BackupItem[]> => {
  const { data } = await axiosClient.get("/backup/list");
  const payload = data?.data ?? data;
  return Array.isArray(payload) ? payload : [];
};

export const downloadBackup = async (filename: string): Promise<Blob> => {
  const { data } = await axiosClient.get(`/backup/download/${encodeURIComponent(filename)}`, {
    responseType: "blob",
  });
  return data as Blob;
};

export const triggerFileDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
