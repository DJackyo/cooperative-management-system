// src/services/axiosClient.ts
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").replace(/\/$/, "");

// Comprobar si la variable se carga correctamente
if (!apiUrl) {
  console.error("Error: NEXT_PUBLIC_API_URL no está definida en el archivo .env");
}

const axiosClient = axios.create({
  baseURL: apiUrl,
});

// Interceptor para agregar el token de autenticación a cada solicitud
axiosClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Función para configurar interceptores con el router
export const setupAxiosInterceptors = (router: any) => {
  if (typeof window !== "undefined") {
    axiosClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(error);
        // show generic error toast for non-auth failures
        if (error.response) {
          const status = error.response.status;
          if (status === 401) {
            localStorage.clear();
            Swal.fire({
              title: "Sesión expirada",
              text: "Tu sesión ha vencido. Por favor, inicia sesión nuevamente.",
              icon: "warning",
              confirmButtonText: "Aceptar",
            }).then(() => {
              router.push("/authentication/login");
            });
          } else {
            // try to show backend message
            const data = error.response.data;
            let msg = 'Ocurrió un error en la petición';
            if (data) {
              if (typeof data === 'string') msg = data;
              else if (data.message) msg = data.message;
              else if (data.error?.message) msg = data.error.message;
              else if (data.detail) msg = data.detail;
            }
            Swal.fire({
              title: 'Error',
              text: msg,
              icon: 'error',
              confirmButtonText: 'OK',
              zIndex: 10000,
            } as any);
          }
        }
        return Promise.reject(error);
      }
    );
  }
};

// instancia separada sin interceptores
const axiosNoAuth = axios.create({
  baseURL: apiUrl,
});

export { axiosClient, axiosNoAuth };
