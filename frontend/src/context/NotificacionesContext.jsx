"use client";

import { useState, useContext, createContext, useEffect } from "react";
import {
  getNotificacionesRequest,
  getNotificacionRequest,
  createNotificacionRequest,
  updateNotificacionRequest,
  deleteNotificacionRequest,
  getNotificacionesByUserRequest,
} from "../api/notificaciones";

const NotificacionesContext = createContext();

export const useNotificaciones = () => {
  const context = useContext(NotificacionesContext);

  if (!context) {
    throw new Error(
      "El useNotificaciones debe estar dentro de un NotificacionesProvider"
    );
  }

  return context;
};

export function NotificacionesProvider({ children }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleError = (error, defaultMessage) => {
    setErrors(error.response?.data?.message || defaultMessage);
    console.log(error);
  };

  const getNotificaciones = async () => {
    setLoading(true);
    try {
      const res = await getNotificacionesRequest();
      setNotificaciones(res.data.data);
      console.log("Datos recibidos:", res.data.data);
    } catch (error) {
      handleError(error, "Error al cargar notificaciones");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificacion = async (id) => {
    setLoading(true);
    try {
      const res = await getNotificacionRequest(id);
      return res.data;
    } catch (error) {
      handleError(error, "Error al cargar notificacion");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const createNotificacion = async (notificacion) => {
    try {
      const res = await createNotificacionRequest(notificacion);
      setNotificaciones((prev) => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.log(error);
      handleError(error, "Error al crear notificacion");
      return null; // o lanza un error para manejarlo en el componente
    }
  };

  const updateNotificacion = async (id, notificacion) => {
    try {
      const res = await updateNotificacionRequest(id, notificacion);
      setNotificaciones((prev) =>
        prev.map((notificacion) =>
          notificacion.id === id ? res.data : notificacion
        )
      );
      return res.data;
    } catch (error) {
      console.log(error);
      handleError(error, "Error al actualizar notificacion");
      return null; // o lanza un error para manejarlo en el componente
    }
  };

  const deleteNotificacion = async (id) => {
    try {
      const res = await deleteNotificacionRequest(id);
      if (res.status === 204) {
        setNotificaciones((prev) =>
          prev.filter((notificacion) => notificacion.id !== id)
        );
      }
    } catch (error) {
      handleError(error, "Error al eliminar notificacion");
      console.log(error);
    }
  };

  const getNotificacionesByUser = async (userId) => {
    setLoading(true);
    try {
      const res = await getNotificacionesByUserRequest(userId);
      setNotificaciones(res.data); // En lugar de hacer res.json()
      // console.log("Datos recibidos:", res.data);
    } catch (error) {
      handleError(error, "Error al cargar notificaciones por usuario");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

//   useEffect(() => {
//     getNotificaciones();
//   }, []);

  return (
    <NotificacionesContext.Provider
      value={{
        notificaciones,
        loading,
        errors,
        getNotificaciones,
        getNotificacion,
        createNotificacion,
        updateNotificacion,
        deleteNotificacion,
        getNotificacionesByUser,
      }}
    >
      {children}
    </NotificacionesContext.Provider>
  );
}
