"use client";
import React, { useState, useEffect } from "react";
import TablaGenerica from "@/components/reutilizables/Tabla";
import { useCategorias } from "@/context/CategoriaContext";
import { useParams } from "next/navigation";
import { set } from "react-hook-form";

function page() {
  const { getCategorias, loading, errors } = useCategorias();
  const params = useParams();

  const [categorias, setCategorias] = useState([]);

  const fetchCategorias = async () => {
    try {
      const resultado = await getCategorias();

      if (
        resultado &&
        resultado.success &&
        resultado.data &&
        Array.isArray(resultado.data)
      ) {
        setCategorias(resultado.data);
      } else if (
        resultado &&
        resultado.success &&
        resultado.data &&
        Array.isArray(resultado.data.data)
      ) {
        setCategorias(resultado.data.data);
      } else {
        setCategorias([]);
      }
    } catch (error) {
      console.error("Error al cargar categorias:", error);
      setCategorias([]);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // Definir las columnas para la tabla
  const columnas = [
    {
      titulo: "Nombre",
      campo: "nombre",
    },
    {
      titulo: "subcategorias",
      campo: "subcategorias",
      render: (categoria) =>
        categoria.Subcategorium.length
    },
  ];


  const renderFilaTabla = (categoria) => {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold">{categoria.nombre}</div>
        <div className="text-xs text-gray-500">
          {categoria.Subcategorium.length} subcategorias
        </div>
      </div>
    );
  };

  const renderTarjetaMovil = (producto, abrirModalFn) => {
    return (
      <div
        className="flex flex-col gap-2 cursor-pointer"
        onClick={() => abrirModalFn(producto)}
      >
        <div className="text-sm font-semibold">{producto.nombre}</div>
        <div className="text-xs text-gray-500">
          {producto.Subcategorium.length} subcategorias
        </div>
      </div>
    );
  };

  const productoInitialState = {
    nombre: "",
    subcategoria: [],
  };

  const FormularioProducto = ({
    handleCloseModal,
    itemSeleccionado,
    handleSubmit,
    handleInputChange,
    item,
    setItem,
  }) => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="nombre" className="text-sm font-semibold">
            Nombre
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={item.nombre}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-md p-2"
          />
        </div>
        <button
          type="button"
          onClick={() => handleCloseModal()}
          className="bg-blue-500 text-white rounded-md p-2"
        >
          Guardar
        </button>
      </div>
    );
  }

  

  return <div>categorias</div>;
}

export default page;
