"use client";

import { createContext, useContext, useState } from "react";
import { getPersonalRequest } from "../api/personal";

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
  const [error, setError] = useState(null);

  const getPersonal = async () => {
    setLoading(true);
    try {
      const response = await getPersonalRequest();
      setPersonal(response.data.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <PersonalContext.Provider
      value={{
        personals,
        loading,
        error,
        getPersonal,
      }}
    >
      {children}
    </PersonalContext.Provider>
  );
};
