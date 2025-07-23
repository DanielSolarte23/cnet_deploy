import { useState, useContext, createContext, useEffect } from "react";

import {
  getProductosRequest,
  getProductoRequest,
  createProductoRequest,
  updateProductoRequest,
  deleteProductoRequest,
  getProductosByCategoriaRequest,
  getProductoByStantreRequest,
  updateStockRequest,
  getStockBajoRequest,
  getProductsRequest
} from "../api/productos";

const ProductosContext = createContext();

export const useProductos = () => {
  const context = useContext(ProductosContext);

  if (!context) {
    throw new Error(
      "El useProductos debe estar dentro de un ProductosProvider"
    );
  }

  return context;
};

export function ProductosProvider({ children }) {
  const [productos, setProductos] = useState([]);
  const [cantidad, setCantidad] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleError = (error, defaultMessage) => {
    setErrors(error.response?.data?.message || defaultMessage);
    console.log(error);
  };

  const getProductos = async () => {
    setLoading(true);
    try {
      const res = await getProductosRequest();
      setProductos(res.data.data);
      console.log("Datos recibidos:", res.data.data);
    } catch (error) {
      handleError(error, "Error al cargar productos");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  
  // const getProducts = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await getProductsRequest();
  //     setProductos(res.data.data);
  //     console.log("Datos recibidos:", res.data.data);
  //   } catch (error) {
  //     handleError(error, "Error al cargar productos");
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getProducto = async (id) => {
    setLoading(true);
    try {
      const res = await getProductoRequest(id);
      return res.data;
    } catch (error) {
      handleError(error, "Error al cargar producto");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getStockBajo = async () => {
    setLoading(true);
    try {
      const res = await getStockBajoRequest();
      setProductos(res.data.data);
      console.log("Datos recibidos:", res.data.data);
    } catch (error) {
      handleError(error, "Error al cargar productos con stock bajo");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const createProducto = async (producto) => {
    try {
      const res = await createProductoRequest(producto);
      setProductos((prev) => [...prev, res.data]);
      return res.data;
    } catch (error) {
      handleError(error, "Error al crear producto");
      console.log(error);
    }
  };

  const updateProducto = async (id, producto) => {
    try {
      const res = await updateProductoRequest(id, producto);
      setProductos((prev) =>
        prev.map((prod) => (prod._id === id ? res.data : prod))
      );
      return res.data;
    } catch (error) {
      handleError(error, "Error al actualizar producto");
      console.log(error);
    }
  };

  const deleteProducto = async (id) => {
    try {
      await deleteProductoRequest(id);
      setProductos((prev) => prev.filter((prod) => prod._id !== id));
    } catch (error) {
      handleError(error, "Error al eliminar producto");
      console.log(error);
    }
  };

  const getProductosByCategoria = async (categoria) => {
    setLoading(true);
    try {
      const res = await getProductosByCategoriaRequest(categoria);
      setProductos(res.data.data);
      console.log("Datos recibidos:", res.data.data);
    } catch (error) {
      handleError(error, "Error al cargar productos por categoria");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getProductoByStantre = async (id) => {
    setLoading(true);
    try {
      const res = await getProductoByStantreRequest(id);
      // Devolver el objeto completo para mantener consistencia
      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      handleError(error, "Error al cargar producto por stantre");
      console.log(error);
      // Devolver un objeto con la misma estructura en caso de error
      return {
        success: false,
        data: { data: [], count: 0 },
      };
    } finally {
      setLoading(false);
    }
  };

  const getCantidadProductosStant = async (id) => {
    try {
      const res = await getProductoByStantreRequest(id);
      // Asegurarse de acceder correctamente al count
      return res.data.count || 0;
    } catch (error) {
      handleError(error, "Error al cargar cantidad de productos por stantre");
      console.log(error);
      return 0;
    }
  };

  const updateStock = async (id, data) => {
    try {
      const res = await updateStockRequest(id, data);

      // Actualizar el estado local si la petición fue exitosa
      setProductos((prev) =>
        prev.map((prod) => (prod.id === id ? res.data.data.producto : prod))
      );

      return res.data;
    } catch (error) {
      handleError(error, "Error al actualizar stock");
      console.log(error);
      throw error; // Propagar el error para que pueda ser manejado por el componente
    }
  };

  //   useEffect(() => {
  //     getProductos();
  //   }, []);

  return (
    <ProductosContext.Provider
      value={{
        productos,
        loading,
        errors,
        getProductos,
        getProducto,
        createProducto,
        updateProducto,
        deleteProducto,
        getProductosByCategoria,
        getProductoByStantre,
        getCantidadProductosStant,
        updateStock,
        getStockBajo,
        // getProducts,
      }}
    >
      {children}
    </ProductosContext.Provider>
  );
}
