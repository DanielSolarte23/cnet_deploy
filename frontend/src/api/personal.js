import axios from "./axios";

export const getPersonalRequest = () => axios.get(`/personal`);
export const getPersonalByIdRequest = (id) => axios.get(`/personal/${id}`);
export const createPersonalRequest = (personal) =>
  axios.post(`/personal`, personal);
export const updatePersonalRequest = (id, personal) =>
  axios.put(`/personal/${id}`, personal);
export const deletePersonalRequest = (id) => axios.delete(`/personal/${id}`);
