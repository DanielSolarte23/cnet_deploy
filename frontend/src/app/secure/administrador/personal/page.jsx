"use client";
import { useState, useEffect, useMemo } from "react";
import LoadingScreen from "@/components/reutilizables/LoadingScreen";
import NotificationModal from "@/components/reutilizables/NotificacionModal";
import Paginacion from "@/components/reutilizables/Paginacion";
import { usePersonal } from "@/context/PersonalContext";
import PersonalForm from "@/components/secure/admin/FormPersonal";

export default function UsuariosTabla() {
  const [modalOpen, setModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalStock, setModalStock] = useState(false);

  const { personals, getPersonal, loading, error } = usePersonal();

  useEffect(() => {
    getPersonal();
  }, []);

  const [notification, setNotification] = useState({
    message: "",
    isVisible: false,
    type: "success",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateItemsPerPage = () => {
        if (window.innerWidth >= 1536) {
          // 2xl
          setItemsPerPage(10);
        } else if (window.innerWidth >= 1024) {
          // lg
          setItemsPerPage(5);
        } else if (window.innerWidth >= 640) {
          // sm
          setItemsPerPage(5);
        } else {
          setItemsPerPage(3);
        }
      };

      updateItemsPerPage();
      window.addEventListener("resize", updateItemsPerPage);
      return () => window.removeEventListener("resize", updateItemsPerPage);
    }
  }, []);

  // Función para mostrar notificaciones
  const showNotification = (message, type = "success") => {
    setNotification({
      message,
      isVisible: true,
      type,
    });
    // Ocultar la notificación después de 5000ms
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  // Función para cerrar notificación manualmente
  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {}, []);

  // Helper function to safely convert a value to lowercase
  const safeToLowerCase = (value) => {
    return value ? value.toLowerCase() : "";
  };

  const filterPersonal = useMemo(() => {
    if (!searchQuery) return Array.isArray(personals) ? personals : [];
    if (!personals || !Array.isArray(personals)) return [];

    const lowercaseQuery = searchQuery.toLowerCase();
    return personals.filter((personal) => {
      if (!personal) return false;

      return (
        safeToLowerCase(personal.nombre).includes(lowercaseQuery) ||
        safeToLowerCase(personal.apellido).includes(lowercaseQuery) ||
        safeToLowerCase(personal.cargo).includes(lowercaseQuery)
      );
    });
  }, [searchQuery, personals]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(filterPersonal)
    ? filterPersonal.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  // Calcular total de páginas
  const totalPages = Math.ceil(filterPersonal.length / itemsPerPage);

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

  const abrirModal = () => {
    setModalOpen(true);
  };

  const openModalStock = (personal) => {
    setModalStock(true);
    setProductoSeleccionado(personal);
    console.log(personal);
  };

  const handleCloseModalStock = () => {
    setModalStock(false);
    setProductoSeleccionado(null);
    getPersonal();
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Componente para mostrar estado vacío
  const EmptyState = ({ hasSearch = false }) => (
    <div className="flex flex-col items-center justify-center py-14 px-4">
      <div className="text-center">
        {/* Icono */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-slate-800 mb-4">
          {hasSearch ? (
            <svg
              className="h-8 w-8 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          ) : (
            <svg
              className="h-8 w-8 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          )}
        </div>

        {/* Título y descripción */}
        <h3 className="text-lg font-medium text-slate-200 mb-2">
          {hasSearch
            ? "No se encontraron resultados"
            : "No hay personal registrado"}
        </h3>
        <p className="text-sm text-slate-400 mb-6 max-w-sm">
          {hasSearch
            ? `No encontramos personal que coincidan con "${searchQuery}". Intenta con otros términos de búsqueda.`
            : "Aún no tienes personal registrado. Comienza agregando nuevo personal."}
        </p>

        {/* Botón de acción */}
        {!hasSearch && (
          <button
            onClick={abrirModal}
            className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-medium py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Registrar Personal
          </button>
        )}

        {/* Sugerencia para búsqueda */}
        {hasSearch && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-yellow-500 hover:text-yellow-400 font-medium text-sm underline"
          >
            Limpiar búsqueda
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative flex flex-col bg-slate-950 h-full border border-slate-700 rounded-lg ">
      {notification.isVisible && (
        <NotificationModal
          message={notification.message}
          isVisible={notification.isVisible}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <nav className="bg-slate-900 border-b border-b-slate-700 flex flex-col md:flex-row items-center justify-between py-3 px-4 gap-3 h-auto md:h-[12%] xl-plus:h-1/10">
        <div className="relative w-full md:w-1/3 flex items-center">
          <i className="fa-solid left-3 text-zinc-400 absolute fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-3 pl-10 py-2 border bg-slate-950 border-slate-700 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            className="bg-yellow-500 p-3 rounded-lg text-slate-950 flex items-center gap-2 hover:bg-yellow-300 transition w-full md:w-auto justify-center"
            onClick={() => abrirModal(null)}
          >
            <span className="font-medium">Registrar Personal</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              className="w-4 h-4 fill-slate-950"
            >
              <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" />
            </svg>
          </button>
        </div>
      </nav>

      <div className="overflow-x-auto h-[76%] xl-plus:h-8/10 w-full p-6 xl-plus:p-10">
        {/* Mostrar estado vacío si no hay datos */}
        {filterPersonal.length === 0 ? (
          <EmptyState hasSearch={searchQuery.length > 0} />
        ) : (
          <>
            {/* Vista de tabla para pantallas medianas y grandes */}
            <div className="hidden md:block overflow-hidden rounded-lg border border-slate-700">
              <table className="text-sm text-left text-gray-500 w-full">
                {/* Encabezado de tabla - mantener igual */}
                <thead className="text-xs text-gray-400 uppercase bg-slate-900 border-b border-slate-500">
                  <tr>
                    <th className="px-4 py-3 md:px-6 md:py-4">Nombre</th>
                    <th className="px-4 py-3 md:px-6 md:py-4">Cédula</th>
                    <th className="px-4 py-3 md:px-6 md:py-4">Número</th>
                    <th className="px-4 py-3 md:px-6 md:py-4">Correo</th>
                    <th className="px-4 py-3 md:px-6 md:py-4">Cargo</th>
                    <th className="px-4 py-3 md:px-6 md:py-4">Editar</th>
                  </tr>
                </thead>

                {/* Cuerpo */}
                <tbody className=" divide-y divide-slate-700">
                  {currentItems.map((personal) => (
                    <tr
                      className=" border-b border-slate-700"
                      key={personal.id}
                    >
                      <td className="px-4 py-2 md:px-6 md:py-4">
                        {personal.nombre || "-"} {personal.apellido || "-"}
                      </td>
                      <td className="px-4 py-2 md:px-6 md:py-4">
                        {personal.cedula || "-"}
                      </td>
                      <td className="px-4 py-2 md:px-6 md:py-4">
                        {personal.telefono || "-"}
                      </td>
                      <td className="px-4 py-2 md:px-6 md:py-4">
                        {personal.correo || ""}
                      </td>
                      <td className="px-4 py-2 md:px-6 md:py-4">
                        {personal.cargo || "0"}
                      </td>
                      <td className="px-4 py-1 ">
                        <button
                          onClick={() => openModalStock(personal)}
                          className="font-bold py-1 px-3 rounded"
                          aria-label="Editar Usuario"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista de tarjetas para móviles */}
            <div className="md:hidden space-y-4">
              {currentItems.map((personal) => (
                <div
                  key={personal.id}
                  className="bg-slate-950 p-4 rounded-lg border border-slate-700 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-white">
                      {personal.nombre} {personal.apellido}
                    </h3>
                    <button
                      onClick={() => openModalStock(personal)}
                      className="bg-slate-900 hover:bg-slate-800 p-2 rounded-full text-yellow-500"
                      aria-label="Editar Personal"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3">
                      <span className="font-medium text-slate-300">
                        Cédula:
                      </span>
                      <span className="col-span-2 text-slate-400">
                        {personal.cedula || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-medium text-slate-300">
                        Teléfono:
                      </span>
                      <span className="col-span-2 text-slate-400">
                        {personal.telefono || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-medium text-slate-300">
                        Correo:
                      </span>
                      <span className="col-span-2 text-slate-400">
                        {personal.correo || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-medium text-slate-300">Cargo:</span>
                      <span className="col-span-2 text-slate-400">
                        {personal.cargo || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Solo mostrar paginación si hay datos */}
      {filterPersonal.length > 0 && (
        <div className="bg-slate-900 border-t border-t-slate-700 rounded-b-md h-auto py-4 md:h-[12%] xl-plus:h-1/10 flex flex-col md:flex-row items-center justify-center p-2 gap-4 px-4">
          <Paginacion
            currentPage={currentPage}
            totalPages={totalPages}
            paginate={paginate}
            getPageNumbers={getPageNumbers}
          />
        </div>
      )}

      {modalOpen && <PersonalForm handleCloseModal={handleCloseModal} />}

      {modalStock && (
        <PersonalForm
          personal={productoSeleccionado}
          handleCloseModalStock={handleCloseModalStock}
          showNotification={showNotification}
        />
      )}
    </div>
  );
}
