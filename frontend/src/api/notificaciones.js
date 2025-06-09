import axios from "./axios";
export const getNotificacionesRequest = () => axios.get(`/notificaciones`);
export const getNotificacionRequest = (id) => axios.get(`notificaciones/${id}`);
export const createNotificacionRequest = (notificacion) => axios.post(`notificaciones`, notificacion);
export const updateNotificacionRequest = (id, notificacion) => axios.put(`notificaciones/${id}`, notificacion);
export const deleteNotificacionRequest = (id) => axios.delete(`notificaciones/${id}`);
export const getNotificacionesByUserRequest = (userId) => axios.get(`notificaciones/user/${userId}`)
