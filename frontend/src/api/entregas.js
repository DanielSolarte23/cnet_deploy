import axios from "./axios"

export const getEntregasRequest = () => axios.get(`/entrega`);
export const createEntregaRequest = (entrega) => axios.post(`/entrega`, entrega);


