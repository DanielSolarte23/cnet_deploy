"use client";

import { useState, useContext, createContext, useEffect } from "react";
import {
  getStantsRequest,
  getStantRequest,
  createStantRequest,
  updateStantRequest,
  deleteStantRequest,
} from "../api/stants";

const StantsContext = createContext();

export const useStants = () => {
  const context = useContext(StantsContext);

  if (!context) {
    throw new Error("El useStants debe estar dentro de un StantsProvider");
  }

  return context;
};

export function StantsProvider({ children }) {
  const [stants, setStants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleError = (error, defaultMessage) => {
    setErrors(error.response?.data?.message || defaultMessage);
    console.log(error);
  };

  const getStants = async () => {
    setLoading(true);
    try {
      const res = await getStantsRequest();
      setStants(res.data.data);
      console.log("Datos recibidos:", res.data.data);
    } catch (error) {
      handleError(error, "Error al cargar stants");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getStant = async (id) => {
    setLoading(true);
    try {
      const res = await getStantRequest(id);
      return res.data;
    } catch (error) {
      handleError(error, "Error al cargar stant");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const createStant = async (stant) => {
    setLoading(true);
    try {
      const res = await createStantRequest(stant);
      setStants([...stants, res.data]);
      return res.data;
    } catch (error) {
      handleError(error, "Error al crear stant");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStant = async (id, stant) => {
    setLoading(true);
    try {
      const res = await updateStantRequest(id, stant);
      setStants(stants.map((s) => (s.id === id ? res.data : s)));
      return res.data;
    } catch (error) {
      handleError(error, "Error al actualizar stant");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteStant = async (id) => {
    setLoading(true);
    try {
      await deleteStantRequest(id);
      setStants(stants.filter((s) => s.id !== id));
    } catch (error) {
      handleError(error, "Error al eliminar stant");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   getStants();
  // }, []);

  return (
    <StantsContext.Provider
      value={{
        stants,
        loading,
        errors,
        getStants,
        getStant,
        createStant,
        updateStant,
        deleteStant,
      }}
    >
      {children}
    </StantsContext.Provider>
  );
}
