// src/services/axiosClient.ts
import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/';

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

// instancia separada sin interceptores
const axiosNoAuth = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export { axiosClient, axiosNoAuth };
