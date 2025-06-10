"use client";

import { createContext, useContext, useState } from "react";
import {
  getPersonalRequest,
  createPersonalRequest,
  updatePersonalRequest,
} from "../api/personal";

const PersonalContext = createContext();

export const usePersonal = () => {
  const context = useContext(PersonalContext);
  if (!context) {
    throw new Error("usePersonal must be used within a PersonalProvider");
  }
  return context;
};

export const PersonalProvider = ({ children }) => {
  const [personals, setPersonal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleError = (error, defaultMessage) => {
    setErrors(error.response?.data?.message || defaultMessage);
    console.log(error);
  };

  const getPersonal = async () => {
    setLoading(true);
    try {
      const response = await getPersonalRequest();
      setPersonal(response.data.data);
    } catch (error) {
      setErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const createPersonal = async (personal) => {
    try {
      const res = await createPersonalRequest(personal);
      setPersonal((prev) => [...prev, res.data.data]);
      return res.data.data;
    } catch (error) {
      handleError(error, "Error al registrar personal");
      console.log(error);
    }
  };

  const updatePersonal = async (id, personal) => {
    try {
      const res = await updatePersonalRequest(id, personal);
      setPersonal((prev) =>
        prev.map((pers) => (pers.id === id ? res.data : pers))
      );
      return res.data;
    } catch (error) {
      handleError(error, "Error al actualizar personal");
      console.log(error);
    }
  };

  return (
    <PersonalContext.Provider
      value={{
        personals,
        loading,
        errors,
        getPersonal,
        updatePersonal,
        createPersonal
      }}
    >
      {children}
    </PersonalContext.Provider>
  );
};
