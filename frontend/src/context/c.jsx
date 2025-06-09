"use client";

import { useState, useContext, createContext, useEffect } from "react";

import {
  getRutasRequest,
  getRutaRequest,
  updateRutaRequest,
  deleteRutaRequest,
  createRutaRequest,
} from "../api/rutas";

const RutasContext = createContext();

export const useRutas = () => {
  const context = useContext(RutasContext);

  if (!context) {
    throw new Error("El useRutas debe estar dentro de un RutasProvider");
  }

  return context;
};

export function RutasProvider({ children }) {
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleError = (error, defaultMessage) => {
    setErrors(error.response?.data?.message || defaultMessage);
    console.log(error);
  };

  const getRutas = async () => {
    setLoading(true);
    try {
      const res = await getRutasRequest();
      setRutas(res.data); // En lugar de hacer res.json()
      // console.log("Datos recibidos:", res.data);
    } catch (error) {
      handleError(error, "Error al cargar rutas");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  

  const createRuta = async (ruta) => {
    try {
        const res = await createRutaRequest(ruta);
        setRutas((prev) => [...prev, res.data]);
        return res.data;
    } catch (error) {
        console.log(error);
        handleError(error, "Error al crear ruta");
        return null; // o lanza un error para manejarlo en el componente
    }
};

  const deleteRuta = async (id) => {
    try {
      const res = await deleteRutaRequest(id);
      if (res.status === 204) {
        setRutas((prev) => prev.filter((ruta) => ruta.id !== id));
      }
    } catch (error) {
      handleError(error, "Error al eliminar ruta");
      console.log(error);
    }
  };

  const getRuta = async (id) => {
    try {
      const res = await getRutaRequest(id);
      return res.data;
    } catch (error) {
      handleError(error, "Error al obtener ruta");
    }
  };

  const updateRuta = async (id, ruta) => {
    try {
      await updateRutaRequest(id, ruta);
      setRutas((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...ruta } : item))
      );
    } catch (error) {
      handleError(error, "Error al actualizar ruta");
      console.log(error);
    }
  };

  // useEffect(() => {
  //   getRutas();
  // }, [])
  
  // useEffect(() => {
  //   console.log("Rutas actualizadas:", rutas);
  // }, [rutas]); // Se ejecutará cada vez que `rutas` cambie
  

  return (
    <RutasContext.Provider
      value={{
        rutas,
        createRuta,
        getRuta,
        deleteRuta,
        getRutas,
        updateRuta,
        deleteRutaRequest,
        errors,
      }}
    >
      {children}
    </RutasContext.Provider>
  );
}