"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useStants } from "@/context/StantContext";
import Paginacion from "@/components/reutilizables/Paginacion";
import { usePathname } from "next/navigation";
import { useProductos } from "@/context/ProductosContext";
import StantForm from "@/components/secure/StantForm";

function Page() {
  // Obtener el contexto de Productos
  const { getCantidadProductosStant } = useProductos();

  // Estado para almacenar la cantidad de productos por estante
  const [cantidadesProductos, setCantidadesProductos] = useState({});
  const [openModal, setOpenModal] = useState(false);

  // Obtener el contexto de Stants
  const {
    stants,
    loading,
    getStants,
  } = useStants();

  // Nombre del botón nuevo
  const nombreBotonNuevo = "Nuevo Estante";

  // Obtener la ruta actual
  const pathname = usePathname();

  // Estado para la paginación y búsqueda
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");
  const [buscarEnCampos, setBuscarEnCampos] = useState([
    "nombre",
    "descripcion",
  ]); // Define los campos relevantes

  // Función para manejar el cambio en la búsqueda
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Resetear a la primera página cuando se busca
  };

  // Función segura para convertir a minúsculas
  const safeToLowerCase = (value) => {
    if (typeof value === "string") {
      return value.toLowerCase();
    }
    return "";
  };

  const abrirModal = (stant) => {
    setOpenModal(true);
    console.log("Abrir modal para:", stant);
  };

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  // useEffect(() => {
  //   const cargarCantidades = async () => {
  //     if (Array.isArray(stants) && stants.length > 0) {
  //       const nuevasCantidades = {};

  //       // Crear un array de promesas para todas las consultas
  //       const promesas = stants.map(async (stant) => {
  //         if (stant && stant.id) {
  //           const cantidad = await getCantidadProductosStant(stant.id);
  //           nuevasCantidades[stant.id] = cantidad;
  //         }
  //       });

  //       // Esperar a que todas las promesas se resuelvan
  //       await Promise.all(promesas);
  //       setCantidadesProductos(nuevasCantidades);
  //     }
  //   };

  //   cargarCantidades();
  // }, [stants, getCantidadProductosStant]);

  // Cargar estantes al montar el componente
  useEffect(() => {
    getStants();
  }, []);

  // Filtrar items según la búsqueda
  const filterItems = useMemo(() => {
    if (!searchQuery) return Array.isArray(stants) ? stants : [];
    if (!stants || !Array.isArray(stants)) return [];

    const lowercaseQuery = searchQuery.toLowerCase();
    return stants.filter((item) => {
      if (!item) return false;

      // Si no se proporcionaron campos para buscar, buscar en todos los campos
      if (!buscarEnCampos || buscarEnCampos.length === 0) {
        return Object.values(item).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(lowercaseQuery)
        );
      }

      // Buscar solo en los campos especificados
      return buscarEnCampos.some((campo) => {
        const valor = item[campo];
        return (
          typeof valor === "string" &&
          safeToLowerCase(valor).includes(lowercaseQuery)
        );
      });
    });
  }, [searchQuery, stants, buscarEnCampos]);

  // Calcular índices para paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(filterItems)
    ? filterItems.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  // Calcular total de páginas
  const totalPages = Math.ceil(
    (Array.isArray(filterItems) ? filterItems.length : 0) / itemsPerPage
  );

  // Ajustar la página actual si el número total de páginas cambia
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [totalPages, currentPage]);

  // Función para cambiar de página
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Obtener los números de página con lógica adaptable
  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 5; // Máximo de páginas a mostrar

    // Calcular el número total de páginas
    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="w-full h-full border border-slate-700 rounded-lg bg-slate-950">
      <nav className="bg-slate-900 border-b border-b-slate-700 flex flex-col md:flex-row items-center justify-between py-3 px-4 gap-3 h-auto md:h-[12%]  rounded-t-lg">
        <div className="relative w-full md:w-1/3 flex items-center">
          <i className="fa-solid left-3 text-zinc-400 absolute fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-3 pl-10 bg-slate-950 py-2 border border-slate-700 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            className="bg-yellow-500 px-3 py-2 rounded-lg text-white flex items-center gap-2 hover:bg-yellow-400 transition w-full md:w-auto justify-center"
            onClick={() => abrirModal(null)}
          >
            <span className="font-medium">{nombreBotonNuevo}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              className="w-4 h-4 fill-white"
            >
              <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="h-[76%] overflow-y-auto w-full gap-3 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 grid-rows-2">
        {loading ? (
          <div className="col-span-full flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : currentItems.length > 0 ? (
          currentItems.map((stant) => (
            <div
              key={stant.id}
              className="flex flex-col justify-between items-center bg-slate-950 border border-slate-700 rounded-lg p-4 hover:shadow-md hover:shadow-slate-900 hover:border-slate-600 transition duration-300"
            >
              <div className="flex items-center justify-center mb-2">
                <i className="fa-solid fa-cube text-slate-400 text-3xl"></i>
              </div>

              <div className="w-full text-center mb-3">
                <h1 className="text-slate-200 font-semibold">{stant.nombre}</h1>
                <p className="text-sm text-slate-400">
                  Productos: {stant.cantidadProductos || 0}
                </p>
              </div>

              <Link
                href={`/secure/administrador/almacen/stants/${stant.id}`}
                className="w-full text-center mt-2 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-yellow-500 transition-colors"
              >
                <i className="fa-solid fa-eye mr-2"></i>
                Ver productos
              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center text-slate-400">
            No se encontraron estantes
          </div>
        )}
      </main>

      {/* Renderizado de paginación */}
      <footer className="flex justify-between items-center gap-2 py-3 px-4 border-t border-slate-700 bg-slate-900 rounded-b-lg h-[12%] ">
        <Paginacion
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
          getPageNumbers={getPageNumbers}
        />
      </footer>

      {openModal && (
        <StantForm
          handleCloseModal={handleCloseModal}
          // showNotification={showNotification}
        />
      )}
    </div>
  );
}

export default Page;
