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
    // console.log("Abrir modal para:", stant);
  };

  const handleCloseModal = () => {
    setOpenModal(false)
  }

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
    <div className="w-full h-full border dark:border-slate-700 border-slate-400 rounded-lg dark:bg-slate-950 flex flex-col">
      {/* Header Navigation - Mejorado responsive */}
      <nav className="dark:bg-slate-900 border-b dark:border-b-slate-700 border-b-slate-400 flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-3 sm:p-4 gap-3 sm:gap-4 shrink-0 rounded-t-lg">
        {/* Search Input */}
        <div className="relative w-full lg:w-1/2 xl:w-1/3 flex items-center order-1 lg:order-1">
          <i className="fa-solid left-3 text-zinc-400 absolute fa-magnifying-glass text-sm"></i>
          <input
            type="text"
            placeholder="Buscar estantes..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-3 pl-10 dark:bg-slate-950 py-2.5 sm:py-2 border border-bg-slate-300 dark:border-slate-700 rounded-md w-full focus:outline-none focus:ring-2 dark:focus:ring-slate-600 focus:ring-slate-500 focus:border-transparent text-sm sm:text-base transition-all duration-200 text-slate-700 placeholder:text-slate-600"
          />
        </div>
        
        {/* New Button */}
        <div className="flex items-center w-full lg:w-auto order-2 lg:order-2">
          <button
            className="bg-yellow-500 px-4 py-2.5 sm:py-2 rounded-lg text-white flex items-center gap-2 hover:bg-yellow-400 transition-all duration-200 w-full lg:w-auto justify-center font-medium text-sm sm:text-base shadow-sm hover:shadow-md"
            onClick={() => abrirModal(null)}
          >
            <span className="hidden sm:inline">{nombreBotonNuevo}</span>
            <span className="sm:hidden">Nuevo</span>
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

      {/* Main Content - Grid mejorado */}
      <main className="flex-1 overflow-y-auto w-full p-3 sm:p-4 lg:p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full min-h-[300px]">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-yellow-500"></div>
              <p className="text-slate-400 text-sm">Cargando estantes...</p>
            </div>
          </div>
        ) : currentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-3 lg:gap-2 h-full max-h-full">
            {currentItems.map((stant) => (
              <div
                key={stant.id}
                className="flex flex-col justify-evenly dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-lg px-4 py-2 sm:px-5 sm:py-3 hover:shadow-lg hover:shadow-slate-900/50 hover:border-slate-600 transition-all duration-300 transform hover:-translate-y-1 h-full max-h-full"
              >
                {/* Icon */}
                <div className="flex items-center justify-center">
                  <div className="p-4 sm:p-2 border border-salet-600 dark:border-0 dark:bg-slate-800 rounded-full">
                    <i className="fa-solid fa-cube text-slate-700 text-lg sm:text-xl"></i>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col w-full text-center mb-1">
                  <h1 className="dark:text-slate-200 text-slate-700 font-semibold text-base sm:text-lg truncate" title={stant.nombre}>
                    {stant.nombre}
                  </h1>
                  <p className="text-sm text-slate-700 dark:text-slate-400">
                    <span className="hidden sm:inline">Productos: </span>
                    <span className="sm:hidden">Prod: </span>
                    <span className="font-medium">{stant.cantidadProductos || 0}</span>
                  </p>
                </div>

                {/* Action Button */}
                <Link
                  href={`/secure/administrador/almacen/stants/${stant.id}`}
                  className="w-full text-center px-3 sm:px-4 py-2 sm:py-2 bg-slate-800 text-white rounded-md hover:bg-yellow-500 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                >
                  <i className="fa-solid fa-eye mr-2"></i>
                  <span className="hidden sm:inline">Ver productos</span>
                  <span className="sm:hidden">Ver</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center text-slate-400 h-full min-h-[300px] gap-3">
            <div className="p-4 dark:bg-slate-800 rounded-full">
              <i className="fa-solid fa-cube text-3xl sm:text-4xl"></i>
            </div>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-medium mb-1">No se encontraron estantes</h3>
              <p className="text-sm text-slate-500">
                {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer estante para comenzar'}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer - Pagination mejorada */}
      <footer className="shrink-0 border-t border-slate-500 dark:border-slate-700 dark:bg-slate-900 rounded-b-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 py-3 px-3 sm:px-4">
          {/* Results info - solo en pantallas grandes */}
          <div className="hidden lg:block text-sm text-slate-700 dark:text-slate-400">
            Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filterItems.length)} de {filterItems.length} estantes
          </div>
          
          {/* Pagination */}
          <div className="flex-1 sm:flex-none">
            <Paginacion
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
              getPageNumbers={getPageNumbers}
            />
          </div>
          
          {/* Items per page - solo en pantallas grandes */}
          <div className="hidden xl:flex items-center gap-2 text-sm text-slate-700 dark:text-slate-400">
            <span>Por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="dark:bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </footer>

      {/* Modal */}
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