"use client";
import { useState, useEffect, useMemo } from "react";
import LoadingScreen from "./LoadingScreen";
import NotificationModal from "./NotificacionModal";
import Paginacion from "./Paginacion";

export default function TablaGenerica({
  // Props para datos y operaciones
  items = [],
  getItems,
  updateItem,
  createItem,
  deleteItem,
  loading = false, 

  // Props para configuración de tabla
  titulo = "Items",
  columnas = [],
  renderFilaTabla, // Función para renderizar fila de tabla
  renderTarjetaMovil, // Función para renderizar tarjeta móvil

  // Props para formulario
  FormularioComponente,
  nombreBotonNuevo = "Registrar Item",

  // Props para renderizado de datos
  itemsInitialState = {},

  // Props adicionales
  identificadorItem = "id",
  buscarEnCampos = [],
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [nuevoItem, setNuevoItem] = useState(itemsInitialState);
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
          setItemsPerPage(8);
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
    }, 5000);
  };

  // Función para cerrar notificación manualmente
  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    if (getItems) {
      getItems();
    }
  }, []);

  // Helper function to safely convert a value to lowercase
  const safeToLowerCase = (value) => {
    return value ? value.toLowerCase() : "";
  };

  const filterItems = useMemo(() => {
    if (!searchQuery) return Array.isArray(items) ? items : [];
    if (!items || !Array.isArray(items)) return [];

    const lowercaseQuery = searchQuery.toLowerCase();
    return items.filter((item) => {
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
  }, [searchQuery, items, buscarEnCampos]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(filterItems)
    ? filterItems.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  // Calcular total de páginas
  const totalPages = Math.ceil(filterItems.length / itemsPerPage);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const abrirModal = (item) => {
    if (item) {
      setItemSeleccionado(item);
      // Crear una copia del objeto con solo las propiedades necesarias
      const itemData = { ...itemsInitialState };
      // Copiar solo las propiedades que existen en itemsInitialState
      Object.keys(itemsInitialState).forEach((key) => {
        itemData[key] = item[key] || "";
      });
      setNuevoItem(itemData);
    } else {
      setItemSeleccionado(null);
      setNuevoItem({ ...itemsInitialState });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resultado = itemSeleccionado
        ? await updateItem(itemSeleccionado[identificadorItem], nuevoItem)
        : await createItem(nuevoItem);

      if (
        resultado &&
        (resultado.success ||
          resultado.status === 200 ||
          resultado.status === 201)
      ) {
        setModalOpen(false);
        setItemSeleccionado(null);
        setNuevoItem({ ...itemsInitialState });
        showNotification(`${titulo} guardado exitosamente`);
        if (getItems) getItems();
      } else {
        // console.log("Error al enviar datos");
        showNotification(`Error al guardar ${titulo.toLowerCase()}`, "error");
      }
    } catch (error) {
      console.error(error);
      showNotification(`Error al guardar ${titulo.toLowerCase()}`, "error");
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setItemSeleccionado(null);
    setNuevoItem({ ...itemsInitialState });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative flex flex-col bg-slate-950 h-full border-gray-200 rounded-lg">
      {notification.isVisible && (
        <NotificationModal
          message={notification.message}
          isVisible={notification.isVisible}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <nav className="bg-slate-900 border-b border-b-slate-700 flex flex-col md:flex-row items-center justify-between py-3 px-4 gap-3 h-auto md:h-[15%] xl-plus:h-1/10 rounded-t-lg">
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

      <div className="overflow-x-auto h-[100%] xl-plus:h-8/10 w-full p-6 xl-plus:p-10">
        {/* Vista de tabla para pantallas medianas y grandes */}
        <div className="hidden md:block overflow-hidden rounded-lg border border-slate-700">
          <table className="text-sm text-left text-gray-500 w-full">
            {/* Encabezado de tabla */}
            <thead className="text-xs text-slate-500 uppercase bg-slate-900 border-b border-slate-600">
              <tr>
                {columnas.map((columna, index) => (
                  <th key={index} className="px-4 py-3 md:px-6 md:py-4">
                    {columna.titulo}
                  </th>
                ))}
                <th className="px-4 py-3 md:px-6 md:py-4">Acción</th>
              </tr>
            </thead>

            {/* Cuerpo */}
            <tbody className="bg-slate-950 divide-y divide-slate-700">
              {currentItems.map((item) => (
                <tr
                  className="bg-slate-950 border-b border-slate-700"
                  key={item[identificadorItem]}
                >
                  {renderFilaTabla ? (
                    renderFilaTabla(item, columnas)
                  ) : (
                    <>
                      {columnas.map((columna, index) => (
                        <td key={index} className="px-4 py-2 md:px-6 md:py-4">
                          {columna.render
                            ? columna.render(item)
                            : item[columna.campo] ||
                              columna.valorPorDefecto ||
                              "-"}
                        </td>
                      ))}
                    </>
                  )}
                  <td className="px-4 py-1 text-center">
                    <button
                      onClick={() => abrirModal(item)}
                      className="font-bold py-1 px-3 rounded"
                      aria-label={`Editar ${titulo}`}
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
          {currentItems.map((item) =>
            renderTarjetaMovil ? (
              renderTarjetaMovil(item, () => abrirModal(item))
            ) : (
              <div
                key={item[identificadorItem]}
                className="bg-slate-950 p-4 rounded-lg border border-slate-700 shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">
                    {item[columnas[0]?.campo] || "Sin título"}
                  </h3>
                  <button
                    onClick={() => abrirModal(item)}
                    className="bg-slate-950 hover:bg-slate-700 p-2 rounded-full"
                    aria-label={`Editar ${titulo}`}
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  {columnas.slice(1).map((columna, index) => (
                    <div key={index} className="grid grid-cols-3">
                      <span className="font-medium">{columna.titulo}:</span>
                      <span className="col-span-2 text-gray-600">
                        {columna.render
                          ? columna.render(item)
                          : item[columna.campo] ||
                            columna.valorPorDefecto ||
                            "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <div className="bg-slate-950 border-t border-t-slate-700 rounded-b-md h-auto py-4 md:h-[15%] xl-plus:h-1/10 flex flex-col md:flex-row items-center justify-center p-2 gap-4 px-4">
        <Paginacion
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
          getPageNumbers={getPageNumbers}
        />
      </div>

      {modalOpen && FormularioComponente && (
        <FormularioComponente
          handleCloseModal={handleCloseModal}
          itemSeleccionado={itemSeleccionado}
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          item={nuevoItem}
          setItem={setNuevoItem}
        />
      )}
    </div>
  );
}
