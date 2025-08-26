// src/services/axiosClient.ts
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/";

// Comprobar si la variable se carga correctamente
if (!apiUrl) {
  console.error("Error: REACT_APP_API_URL no está definida en el archivo .env");
}

const axiosClient = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
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
        if (error.response?.status === 401) {
          localStorage.clear();
          Swal.fire({
            title: "Sesión expirada",
            text: "Tu sesión ha vencido. Por favor, inicia sesión nuevamente.",
            icon: "warning",
            confirmButtonText: "Aceptar",
          }).then(() => {
            router.push("/authentication/login");
          });
        }
        return Promise.reject(error);
      }
    );
  }
};

// instancia separada sin interceptores
const axiosNoAuth = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export { axiosClient, axiosNoAuth };
