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
    // console.log(error);
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

  //   const createPersonal = async (personalData) => {
  //   try {
  //     const isFormData = personalData instanceof FormData;

  //     const res = await createPersonalRequest(
  //       isFormData ? personalData : JSON.stringify(personalData),
  //       isFormData ? {} : { 'Content-Type': 'application/json' }
  //     );

  //     setPersonal((prev) => [...prev, res.data.data]);
  //     return res.data.data;

  //   } catch (error) {
  //     handleError(error, "Error al registrar personal");
  //     console.error("Error al crear personal:", error);
  //     throw error;
  //   }
  // };

  const createPersonal = async (personalData) => {
    setLoading(true);
    // setErrors(null);
    try {
      // Determinar si es FormData o objeto regular
      const isFormData = personalData instanceof FormData;

      const response = await fetch(`http://172.16.110.74:3004/api/personal`, {
        method: "POST",
        body: personalData, // FormData se envía directamente
        // No establecer Content-Type para FormData, el navegador lo hace automáticamente
        ...(isFormData
          ? {}
          : {
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(personalData),
            }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        // Actualizar la lista local
        setPersonal((prev) => [...prev, result.data]);
        return result;
      } else {
        throw new Error(result.message || "Error al crear personal");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error al crear personal:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePersonal = async (id, personalData) => {
    setLoading(true);
    // setErrors(null);
    try {
      // Determinar si es FormData o objeto regular
      const isFormData = personalData instanceof FormData;

      const response = await fetch(
        `http://172.16.110.74:3004/api/personal/${id}`,
        {
          method: "PUT", // o 'PATCH' dependiendo de tu API
          body: isFormData ? personalData : JSON.stringify(personalData),
          // No establecer Content-Type para FormData, el navegador lo hace automáticamente
          ...(!isFormData
            ? {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            : {}),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        // Actualizar la lista local
        setPersonal((prev) =>
          prev.map((pers) => (pers.id === id ? result.data : pers))
        );
        return result.data;
      } else {
        throw new Error(result.message || "Error al actualizar personal");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error al actualizar personal:", err);
      throw err;
    } finally {
      setLoading(false);
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
        createPersonal,
      }}
    >
      {children}
    </PersonalContext.Provider>
  );
};
