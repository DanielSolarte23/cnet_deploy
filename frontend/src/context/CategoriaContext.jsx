"use client";

import { useState, useContext, createContext, useEffect } from "react";
import {
  getCategoriasRequest,
  getCategoriaRequest,
  createCategoriaRequest,
  updateCategoriaRequest,
  deleteCategoriaRequest,
  getSubcategoriasRequest,
  getSubcategoriaRequest,
  createSubcategoriaRequest,
  updateSubcategoriaRequest,
  deleteSubcategoriaRequest,
  getSubcategoriasByCategoriaRequest,
} from "../api/categoria";

const CategoriaContext = createContext();

export const useCategorias = () => {
  const context = useContext(CategoriaContext);

  if (!context) {
    throw new Error(
      "El useCategorias debe estar dentro de un CategoriaProvider"
    );
  }

  return context;
};

export function CategoriaProvider({ children }) {
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleError = (error, defaultMessage) => {
    setErrors(error.response?.data?.message || defaultMessage);
    // // console.log(error);
  };

  const getCategorias = async () => {
    setLoading(true);
    try {
      const res = await getCategoriasRequest();
      setCategorias(res.data.data);
      // console.log("Datos recibidos:", res.data.data);
    } catch (error) {
      handleError(error, "Error al cargar categorias");
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategoriasRequest();
      // console.log("Datos recibidos:", res.data.data);
      return res.data.data;
    } catch (error) {
      handleError(error, "Error al cargar categorias");
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoria = async (id) => {
    setLoading(true);
    try {
      const res = await getCategoriaRequest(id);
      return res.data;
    } catch (error) {
      handleError(error, "Error al cargar categoria");
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const createCategoria = async (categoria) => {
    try {
      const res = await createCategoriaRequest(categoria);
      setCategorias((prev) => [...prev, res.data]);
      return res.data;
    } catch (error) {
      // console.log(error);
    }
  };

  const updateCategoria = async (id, categoria) => {
    try {
      const res = await updateCategoriaRequest(id, categoria);
      setCategorias((prev) =>
        prev.map((cat) => (cat.id === id ? res.data : cat))
      );
      return res.data;
    } catch (error) {
      // console.log(error);
    }
  };

  const deleteCategoria = async (id) => {
    try {
      await deleteCategoriaRequest(id);
      setCategorias((prev) => prev.filter((cat) => cat.id !== id));
    } catch (error) {
      // console.log(error);
    }
  };

  const getSubcategorias = async () => {
    setLoading(true);
    try {
      const res = await getSubcategoriasRequest();
      setSubcategorias(res.data.data);
      // return res.data.data;
    } catch (error) {
      handleError(error, "Error al cargar subcategorias");
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getSubcategoria = async (id) => {
    setLoading(true);
    try {
      const res = await getSubcategoriaRequest(id);
      return res.data;
    } catch (error) {
      handleError(error, "Error al cargar subcategoria");
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const createSubcategoria = async (subcategoria) => {
    try {
      const res = await createSubcategoriaRequest(subcategoria);
      return res.data;
    } catch (error) {
      // console.log(error);
    }
  };

  const updateSubcategoria = async (id, subcategoria) => {
    try {
      const res = await updateSubcategoriaRequest(id, subcategoria);
      return res.data;
    } catch (error) {
      // console.log(error);
    }
  };

  const deleteSubcategoria = async (id) => {
    try {
      await deleteSubcategoriaRequest(id);
    } catch (error) {
      // console.log(error);
    }
  };

  const getSubcategoriasByCategoria = async (id) => {
    setLoading(true);
    try {
      const res = await getSubcategoriasByCategoriaRequest(id);
      return res.data;
    } catch (error) {
      handleError(error, "Error al cargar subcategorias por categoria");
      // console.log(error);
      return { data: { data: [] } };
    } finally {
      setLoading(false);
    }
  };

  //   useEffect(() => {
  //     getCategorias();
  //   }, []);

  return (
    <CategoriaContext.Provider
      value={{
        categorias,
        loading,
        errors,
        getCategorias,
        getCategoria,
        createCategoria,
        updateCategoria,
        deleteCategoria,
        getSubcategoriasByCategoria,
        createSubcategoria,
        getCategories,
      }}
    >
      {children}
    </CategoriaContext.Provider>
  );
}
