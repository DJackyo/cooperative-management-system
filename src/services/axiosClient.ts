// src/services/axiosClient.ts
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://api.example.com", // Cambia esta URL a la de tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token de autenticación a cada solicitud
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // Usa el token almacenado
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores globales
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login si el token expira o es inválido
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
