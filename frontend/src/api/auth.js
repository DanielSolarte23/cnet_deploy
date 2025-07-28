import axios from "./axios";

export const registerRequest = user => axios.post(`auth/registro`, user)

export const loginRequest = user => axios.post(`auth/inicio`, user)

export const verifyTokenRequest = () => axios.get('/auth/verify')

export const logoutRequest = () => axios.post("/auth/logout");

// Función para reset password (si la tienes)
export const resetPasswordRequest = (token, password) => 
  api.post("/auth/reset-password", { token, password });