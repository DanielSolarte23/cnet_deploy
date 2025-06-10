import axios from "./axios";

export const getStantsRequest = async () => axios.get(`/stants`);
export const getStantRequest = async (id) => axios.get(`/stants/${id}`);
export const createStantRequest = async (stant) => axios.post(`/stant`, stant);
export const updateStantRequest = async (id, stant) =>
  axios.put(`/stants/${id}`, stant);
export const deleteStantRequest = async (id) => axios.delete(`/stants/${id}`);
