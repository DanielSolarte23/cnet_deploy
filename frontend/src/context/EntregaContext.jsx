"use client";
import { createContext, useContext, useState } from "react";

import { getEntregasRequest, createEntregaRequest } from "../api/entregas";

const EntregaContext = createContext();

export const useEntregas = () => {
  const context = useContext(EntregaContext);
  if (!context) {
    throw new Error("useEntregas must be used within an EntregaProvider");
  }
  return context;
};
export const EntregaProvider = ({ children }) => {
  const [entregas, setEntregas] = useState([]);
  const [entrega, setEntrega] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getEntregas = async () => {
    setLoading(true);
    try {
      const response = await getEntregasRequest();
      setEntregas(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const createEntrega = async (entrega) => {
    setLoading(true);
    try {
      const response = await createEntregaRequest(entrega);
      setEntregas((prevEntregas) => [...prevEntregas, response.data]);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <EntregaContext.Provider
      value={{
        entregas,
        entrega,
        setEntrega,
        getEntregas,
        createEntrega,
        loading,
        setLoading,
        error,
      }}
    >
      {children}
    </EntregaContext.Provider>
  );
};
