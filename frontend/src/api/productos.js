import axios from "./axios";

export const getProductosRequest = async () => axios.get("/productos");
export const getProductoRequest = async (id) => axios.get(`/productos/${id}`);
export const createProductoRequest = async (producto) =>
  axios.post("/productos", producto);
export const updateProductoRequest = async (id, producto) =>
  axios.put(`/productos/${id}`, producto);
export const deleteProductoRequest = async (id) =>
  axios.delete(`/productos/${id}`);
export const getProductosByCategoriaRequest = async (categoria) =>
  axios.get(`/productos/categoria/${categoria}`);
export const getProductoByStantreRequest = async (id) =>
  axios.get(`/products/statnt/${id}`);

export const updateStockRequest = async (id, data) =>
  axios.put(`/productos/${id}/stock`, data);

export const getStockBajoRequest = async () =>
  axios.get("/products/stock/bajo");
export const getUnidadesRequest = async (id) =>
  axios.get(`/products/${id}/unidades`);
