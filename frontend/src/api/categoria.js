import axios from "./axios";

export const getCategoriasRequest = () => axios.get(`/categorias`);
export const getCategoriaRequest = (id) => axios.get(`categorias/${id}`);
export const createCategoriaRequest = (categoria) =>
  axios.post(`categorias`, categoria);
export const updateCategoriaRequest = (id, categoria) =>
  axios.put(`categorias/${id}`, categoria);
export const deleteCategoriaRequest = (id) => axios.delete(`categorias/${id}`);
export const getSubcategoriasRequest = () => axios.get(`/subcategorias`);
export const getSubcategoriaRequest = (id) =>
  axios.get(`subcategorias/${id}`);
export const createSubcategoriaRequest = (subcategoria) =>
  axios.post(`subcategorias`, subcategoria);
export const updateSubcategoriaRequest = (id, subcategoria) =>
  axios.put(`subcategorias/${id}`, subcategoria);
export const deleteSubcategoriaRequest = (id) =>
  axios.delete(`subcategorias/${id}`);
export const getSubcategoriasByCategoriaRequest = (id) =>
  axios.get(`subcategorias/categoria/${id}`);