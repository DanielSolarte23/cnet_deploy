import axios from "axios";
import Cookies from "js-cookie";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://172.16.110.74:3004/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token a cada request
instance.interceptors.request.use(
  (config) => {
    // Obtener token de las cookies
    const token = Cookies.get("token") || Cookies.get("jwt");
    
    if (token) {
      // Agregar token al header Authorization
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token agregado al header:", token.substring(0, 20) + "...");
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Sesión expirada o no autenticado - limpiando cookies");
      
      Cookies.remove("token", { path: "/" });
      Cookies.remove("jwt", { path: "/" });
      
      // Solo redirigir si no estamos ya en la página de login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        // Opcional: redirigir al login
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;