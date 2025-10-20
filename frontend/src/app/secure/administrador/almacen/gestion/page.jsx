"use client";
import { ReintegroModal } from "@/components/secure/almacenista/FormReintegro";
import { ModificarProductosModal } from "@/components/secure/almacenista/UpdateEntregaForm";
import { useState, useEffect, useMemo, useRef } from "react";
import LoadingScreen from "@/components/reutilizables/LoadingScreen";
import NotificationModal from "@/components/reutilizables/NotificacionModal";
import Paginacion from "@/components/reutilizables/Paginacion";
import FormStock from "@/components/secure/FormStock";
import { useEntregas } from "@/context/EntregaContext";
import FormularioEntrega from "@/components/secure/EntregaForm";
import ActaPDFAislada from "@/components/secure/ActaEntregaProductos";
import { DetalleEntregaModal } from "@/components/secure/almacenista/DetalleEntrega";
import axios from "axios";

export default function GestionPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalStock, setModalStock] = useState(false);
  const [entregaSeleccionada, setEntregaSeleccionada] = useState(null);
  const [modalOpenReintegro, setModalOpenReintegro] = useState(false);
  const [entregaIdParaReintegro, setEntregaIdParaReintegro] = useState(null);
  const { getEntregas, entregas, loading, error } = useEntregas();
  const [modalOpenUpdate, setModalOpenUpdate] = useState(false);

  // Nuevo estado para el modal de detalles
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [entregaDetalle, setEntregaDetalle] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    getEntregas();
  }, []);

  // Nueva función para abrir el modal de detalles
  const abrirModalDetalle = (entrega) => {
    setEntregaDetalle(entrega);
    setModalDetalleOpen(true);
  };

  const imprimirActa = async (entrega) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/entregas/${entrega.id}/acta/preview` ,
        {
          headers: {
            Accept: "text/html",
          },
          responseType: "text",
        }
      );

      let htmlContent = response.data;

      // Agregar base para rutas relativas
      if (!htmlContent.includes("<base")) {
        htmlContent = htmlContent.replace(
          /<head>/i,
          `<head><base href="${baseUrl}">`
        );
      }

      // OPCIÓN 1: Usar iframe oculto (recomendado para impresión directa)
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      iframe.style.visibility = "hidden";

      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        // Remover iframe después de imprimir
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      };
    } catch (error) {
      console.error("Error al obtener la vista previa del acta:", error);
      showNotification("Error al generar el acta para impresión", "error");
    }
  };

  //Actualizacion de entregfas
  const openEditModal = (entregaId) => {
    const entrega = entregas.find((e) => e.id === entregaId);
    setEntregaSeleccionada(entrega);
    setModalOpenUpdate(true);
  };

  const handleUpdate = (entregaActualizada) => {
    console.log("Entrega actualizada:", entregaActualizada);
    // Aquí actualizarías tu estado de entregas
  };

  //reintegros
  const abrirModalReintegro = (entregaId) => {
    setModalOpenReintegro(true);
    setEntregaIdParaReintegro(entregaId);
  };

  const getEstadoClase = (estado) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "expirada":
        return "bg-red-100 text-red-800";
      case "parcialmente_devuelta":
        return "bg-blue-100 text-blue-800";
      case "completamente_devuelta":
        return "bg-green-100 text-green-800";
      case "YES":
        return "bg-indigo-100 text-indigo-800";
      case "":
      case null:
      case undefined:
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  //notificaciones
  const [notification, setNotification] = useState({
    message: "",
    isVisible: false,
    type: "success",
  });

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

  //responsive
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

  // Función helper mejorada para manejar valores seguros
  const safeToLowerCase = (value) => {
    // Convertir a string si no lo es, y luego a lowercase
    if (value === null || value === undefined) return "";
    return String(value).toLowerCase();
  };

  const filterEntregas = useMemo(() => {
    if (!searchQuery) return Array.isArray(entregas) ? entregas : [];
    if (!entregas || !Array.isArray(entregas)) return [];

    const lowercaseQuery = searchQuery.toLowerCase();
    return entregas.filter((entrega) => {
      if (!entrega) return false;

      // Obtener valores de forma segura
      const proyecto = safeToLowerCase(entrega.proyecto);
      const tecnicoNombre = safeToLowerCase(entrega.tecnicoData?.nombre);
      const almacenistaNombre = safeToLowerCase(
        entrega.almacenistaData?.nombre
      );

      return (
        proyecto.includes(lowercaseQuery) ||
        tecnicoNombre.includes(lowercaseQuery) ||
        almacenistaNombre.includes(lowercaseQuery)
      );
    });
  }, [searchQuery, entregas]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(filterEntregas)
    ? filterEntregas.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  // Calcular total de páginas
  const totalPages = Math.ceil(filterEntregas.length / itemsPerPage);

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

  const openModalStock = (entrega) => {
    setModalStock(true);
    setProductoSeleccionado(entrega);
  };

    const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleCloseUpdateProducto = () => {
    setModalOpenUpdate(false);
    getEntregas();
  };

  const handleCloseModalStock = () => {
    setModalStock(false);
    setProductoSeleccionado(null);
    getEntregas();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const handleSubmitReintegro = async (formData) => {
    try {
      const response = await fetch(`${baseUrl}/api/reintegro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el reintegro");
      }

      const result = await response.json();
      // console.log("Reintegro creado:", result);

      // Mostrar notificación de éxito
      showNotification("Reintegro creado exitosamente", "success");

      // Refrescar los datos
      getEntregas();
    } catch (error) {
      console.error("Error:", error);
      showNotification(error.message || "Error al crear el reintegro", "error");
      throw error; // Re-lanzar el error para que el modal lo maneje
    }
  };

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
            className="bg-yellow-500 px-3 py-2 rounded-lg text-slate-950 flex items-center gap-2 hover:bg-yellow-300 transition w-full md:w-auto justify-center"
            onClick={() => abrirModal(null)}
          >
            <span className="font-medium">Registrar Entrega</span>
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
        {/* Vista de tabla para pantallas medianas y grandes */}
        <div className="hidden md:block overflow-hidden rounded-lg border border-slate-700">
          <table className="text-sm text-left text-gray-500 w-full">
            {/* Encabezado de tabla simplificado */}
            <thead className="text-xs text-gray-400 uppercase bg-slate-900 border-b border-slate-500">
              <tr>
                <th className="px-2 py-3 md:px-2 md:py-4 pl-4 tracking-wider">
                  Fecha de Entrega
                </th>
                <th className="px-2 py-3 md:px-2 md:py-4 text-center tracking-wider ">
                  Proyecto
                </th>
                <th className="px-2 py-3 md:px-2 md:py-4 text-center tracking-wider">
                  Entregado a
                </th>
                <th className="px-4 py-3 md:px-2 md:py-4 text-center tracking-wider">
                  Estado
                </th>
                <th className="px-2 py-3 md:px-2 md:py-4 text-center tracking-wider">
                  Confirmado
                </th>
                <th className="px-2 py-3 md:px-2 md:py-4 text-center tracking-wider">
                  Detalles
                </th>
              </tr>
            </thead>

            {/* Cuerpo */}
            <tbody className=" divide-y divide-slate-700">
              {currentItems.map((entrega) => (
                <tr className=" border-b border-slate-700" key={entrega.id}>
                  <td className="px-3 py-1 md:px-2 md:py-4 pl-4">
                    {entrega.fecha
                      ? new Date(entrega.fecha).toISOString().split("T")[0]
                      : "-"}
                  </td>

                  <td
                    className="px-2 py-1 md:px-2 md:py-1 text-center whitespace-nowrap"
                    title={entrega.proyecto} //
                  >
                    {entrega.proyecto
                      ? entrega.proyecto.split(" ").slice(0, 2).join(" ") +
                        (entrega.proyecto.split(" ").length > 3 ? "..." : "")
                      : "-"}
                  </td>

                  <td className="px-2 py-1 md:px-2 md:py-3 text-center whitespace-nowrap">
                    {entrega.tecnicoData?.nombre || ""}
                  </td>
                  <td className="px-2 py-1 md:px-2 md:py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getEstadoClase(
                        entrega.estado
                      )}`}
                    >
                      {entrega.estado === "parcialmente_devuelta"
                        ? "Reintegro parcial"
                        : entrega.estado === "completamente_devuelta"
                        ? "Reintegro completo"
                        : entrega.estado === "pendiente"
                        ? "Sin reintegro"
                        : entrega.estado || "Sin estado"}
                    </span>
                  </td>
                  <td className="px-2 py-1 md:px-2 md:py-3 text-center">
                    <div
                      className={`inline-block border h-2 w-2 rounded-full ${
                        entrega.wasConfirmed ? "bg-yellow-500" : ""
                      }`}
                    ></div>
                  </td>
                  <td className="px-2 py-1 md:px-2 md:py-3 text-center">
                    <button
                      onClick={() => abrirModalDetalle(entrega)}
                      className="text-blue-400 hover:text-blue-300 transition-colors text-lg"
                      title="Ver detalles"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vista de tarjetas para móviles */}
        <div className="md:hidden space-y-4">
          {currentItems.map((entrega) => (
            <div
              key={entrega.id}
              className="bg-slate-950 p-4 rounded-lg border border-slate-700 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">
                  {entrega.proyecto ? entrega.proyecto : "-"}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => abrirModalDetalle(entrega)}
                    className="bg-slate-900 hover:bg-gray-200 p-2 rounded-full"
                    aria-label="Ver detalles"
                  >
                    <i className="fa-solid fa-eye"></i>
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3">
                  <span className="font-medium">Fecha de entrega:</span>
                  <span className="col-span-2 text-gray-600">
                    {entrega.fecha
                      ? new Date(entrega.fecha).toISOString().split("T")[0]
                      : "-"}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-medium">Tecnico:</span>
                  <span className="col-span-2 text-gray-600">
                    {entrega.tecnicoData?.nombre || ""}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-medium">Almacenista:</span>
                  <span className="col-span-2 text-gray-600">
                    {entrega.almacenistaData?.nombre || ""}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-medium">Cantidad productos:</span>
                  <span className="col-span-2 text-gray-600">
                    {entrega.EntregaProductos?.length || ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenedor oculto para el acta que será convertido a PDF */}
      <div style={{ display: "none" }}>
        <div id="pdf-isolated-content">
          {entregaSeleccionada && (
            <ActaPDFAislada entregaSeleccionada={entregaSeleccionada} />
          )}
        </div>
      </div>

      <div className="bg-slate-900 border-t border-t-slate-700 rounded-b-md h-auto py-4 md:h-[12%] xl-plus:h-1/10 flex flex-col md:flex-row items-center justify-center p-2 gap-4 px-4">
        <Paginacion
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
          getPageNumbers={getPageNumbers}
        />
      </div>

      {/* Modal de Detalles de Entrega */}
      <DetalleEntregaModal
        isOpen={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        entrega={entregaDetalle}
        onEditarProductos={openEditModal}
        onImprimirActa={imprimirActa}
        onReintegro={abrirModalReintegro}
        onReenviarConfirmacion={(entregaId, email) => {
          // Esta función ya está implementada dentro del modal
          // console.log("Reenviar confirmación para:", entregaId, email);
        }}
      />

      {modalOpen && (
        <FormularioEntrega
          showNotification={showNotification}
          handleCloseModal={handleCloseModal}
        />
      )}

      {modalStock && (
        <FormStock
          entrega={productoSeleccionado}
          handleCloseModalStock={handleCloseModalStock}
          showNotification={showNotification}
        />
      )}

      <ModificarProductosModal
        isOpen={modalOpenUpdate}
        onClose={handleCloseUpdateProducto}
        entregaId={entregaSeleccionada?.id}
        entregaActual={entregaSeleccionada}
        showNotification={showNotification}
        onUpdate={handleUpdate}
      />

      {modalOpenReintegro && (
        <ReintegroModal
          entrega={entregaIdParaReintegro}
          isOpen={modalOpenReintegro}
          onClose={() => {
            setModalOpenReintegro(false);
            setEntregaIdParaReintegro(null);
          }}
          onSubmit={handleSubmitReintegro}
        />
      )}
    </div>
  );
}
