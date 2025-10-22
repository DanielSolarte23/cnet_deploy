import axios from "./axios"

export const getEntregasRequest = () => axios.get(`/entrega`);
export const getEntregaLiteRequest = (page = 1, limit = 5) => 
  axios.get(`/entregas/lite?page=${page}&limit=${limit}`);
export const createEntregaRequest = (entrega) => axios.post(`/entrega`, entrega);