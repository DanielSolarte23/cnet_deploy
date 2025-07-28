"use client";
import { useState, useEffect, useMemo } from "react";
import LoadingScreen from "../reutilizables/LoadingScreen";
import NotificationModal from "../reutilizables/NotificacionModal";
import Paginacion from "../reutilizables/Paginacion";
import { useProductos } from "@/context/ProductosContext";
import { useParams } from "next/navigation";

export default function ProductosTabla() {
  const { getProductoByStantre, loading, errors } = useProductos();
  // Mover useParams al cuerpo del componente
  const params = useParams();
  const stantId = params?.id; // Obtener el ID de manera segura

  const [modalOpen, setModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [productos, setProductos] = useState([]);
  const [notification, setNotification] = useState({
    message: "",
    isVisible: false,
    type: "success",
  });

  useEffect(() => {
    if (stantId) {
      getProductoByStantre(stantId)
        .then((resultado) => {
          // console.log("Resultado completo:", resultado);

          // Comprobar si existe la propiedad data y si es un array
          if (
            resultado &&
            resultado.success &&
            resultado.data &&
            Array.isArray(resultado.data)
          ) {
            setProductos(resultado.data);
            // console.log("Datos recibidos:", resultado.data);
          } else if (
            resultado &&
            resultado.success &&
            resultado.data &&
            Array.isArray(resultado.data.data)
          ) {
            // Estructura alternativa
            setProductos(resultado.data.data);
            // console.log(
            //   "Datos recibidos (estructura anidada):",
            //   resultado.data.data
            // );
          } else {
            setProductos([]);
            // console.log(
            //   "No se encontraron datos o formato incorrecto:",
            //   resultado
            // );
          }
        })
        .catch((error) => {
          console.error("Error al cargar productos:", error);
          setProductos([]);
        });
    }
  }, [stantId, getProductoByStantre]);

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

  const showNotification = (message, type = "success") => {
    setNotification({
      message,
      isVisible: true,
      type,
    });

    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isVisible: false }));
    }, 5000);
  };

  // Función para cerrar notificación manualmente
  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  // Agregar esta función a TablaProductosModulo.jsx
  const safeToLowerCase = (str) => {
    if (typeof str === "string") {
      return str.toLowerCase();
    }
    return "";
  };

  const filterProductos = useMemo(() => {
    if (!searchQuery) return Array.isArray(productos) ? productos : [];
    if (!productos || !Array.isArray(productos)) return [];

    const lowercaseQuery = searchQuery.toLowerCase();
    return productos.filter((producto) => {
      if (!producto) return false;

      // Verificar que las propiedades existan antes de acceder a ellas
      const descripcion = safeToLowerCase(producto.descripcion || "");
      const subcategoriaNombre = producto.Subcategorium
        ? safeToLowerCase(producto.Subcategorium.nombre || "")
        : "";
      const categoriaNombre = producto.Subcategorium?.Categorium
        ? safeToLowerCase(producto.Subcategorium.Categorium.nombre || "")
        : producto.Categorium
        ? safeToLowerCase(producto.Categorium.nombre || "")
        : "";

      return (
        descripcion.includes(lowercaseQuery) ||
        subcategoriaNombre.includes(lowercaseQuery) ||
        categoriaNombre.includes(lowercaseQuery)
      );
    });
  }, [searchQuery, productos]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(filterProductos)
    ? filterProductos.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  // Calcular total de páginas
  const totalPages = Math.ceil(filterProductos.length / itemsPerPage);

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

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setNuevoUsuario((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  // const abrirModal = (producto) => {
  //   if (producto) {
  //     setProductoSeleccionado(producto);
  //     setNuevoUsuario({
  //       nombres: producto.nombres || "",
  //       apellidos: producto.apellidos || "",
  //       correoElectronico: producto.correoElectronico || "",
  //       telefono: producto.telefono || "",
  //       direccion: producto.direccion || "",
  //       rol: producto.rol || "",
  //       contraseña: "",
  //     });
  // //     console.log(producto);
  //   } else {
  //     setProductoSeleccionado(null);
  //     setNuevoUsuario({
  //       nombres: "",
  //       apellidos: "",
  //       correoElectronico: "",
  //       telefono: "",
  //       direccion: "",
  //       rol: "",
  //       contraseña: "",
  //     });
  //   }
  //   setModalOpen(true);
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const datosParaEnviar = {
  //     nombres: nuevoUsuario.nombres,
  //     apellidos: nuevoUsuario.apellidos,
  //     correoElectronico: nuevoUsuario.correoElectronico,
  //     telefono: nuevoUsuario.telefono,
  //     direccion: nuevoUsuario.direccion,
  //     rol: nuevoUsuario.rol,
  //   };

  //   if (nuevoUsuario.contraseña) {
  //     datosParaEnviar.contraseña = nuevoUsuario.contraseña;
  //   }

  //   try {
  // //     console.log("Datos a enviar:", datosParaEnviar);
  //     const resultado = productoSeleccionado
  //       ? await updateUsuario(productoSeleccionado.id, datosParaEnviar)
  //       : await createUsuario(datosParaEnviar);

  //     if (
  //       resultado &&
  //       (resultado.success ||
  //         resultado.status === 200 ||
  //         resultado.status === 201)
  //     ) {
  //       setModalOpen(false);
  //       setProductoSeleccionado(null);
  //       setNuevoUsuario({
  //         nombres: "",
  //         apellidos: "",
  //         correoElectronico: "",
  //         telefono: "",
  //         direccion: "",
  //         rol: "",
  //         contraseña: "",
  //       });
  //       showNotification("Usuario guardado exitosamente");
  // //       console.log("Resultado de la API:", resultado);
  //       getUsuarios();
  //     } else {
  // //       console.log("Resultado de la API:", resultado);
  // //       console.log("Error al enviar datos");
  //       showNotification("Error al guardar producto", "error");
  //     }
  //   } catch (error) {
  // //     console.log(error);
  //     showNotification("Error al guardar producto", "error");
  //   }
  // };

  // const handleCloseModal = () => {
  //   setModalOpen(false);
  //   setProductoSeleccionado(null);
  //   setNuevoUsuario({
  //     nombres: "",
  //     apellidos: "",
  //     correoElectronico: "",
  //     telefono: "",
  //     direccion: "",
  //     rol: "",
  //     contraseña: "",
  //   });
  // };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative flex flex-col bg-slate-950 h-full border-slate-600 rounded-lg">
      {notification.isVisible && (
        <NotificationModal
          message={notification.message}
          isVisible={notification.isVisible}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      {/* 
      <nav className="bg-white border-b border-b-gray-200 flex flex-col md:flex-row items-center justify-between py-3 px-4 gap-3 h-auto md:h-[15%] xl-plus:h-1/10">
        <div className="relative w-full md:w-1/3 flex items-center">
          <i className="fa-solid left-3 text-zinc-400 absolute fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-3 pl-10 py-2 border border-zinc-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-rojo"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            className="bg-lime-600 p-3 rounded-lg text-white flex items-center gap-2 hover:bg-lime-700 transition w-full md:w-auto justify-center"
            onClick={() => abrirModal(null)}
          >
            <span className="font-medium">Registrar Usuario</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              className="w-4 h-4 fill-white"
            >
              <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" />
            </svg>
          </button>
        </div>
      </nav> */}

      <div className="overflow-x-auto h-[88%] xl-plus:h-8/10 w-full p-6 xl-plus:p-10">
        {/* Vista de tabla para pantallas medianas y grandes */}
        <div className="hidden md:block overflow-hidden rounded-lg border border-slate-600">
          <table className="text-sm text-left text-gray-500 w-full">
            {/* Encabezado de tabla - mantener igual */}
            <thead className="text-xs text-slate-400 uppercase bg-slate-900 border-b border-slate-500">
              <tr>
                <th className="px-4 py-3 md:px-6 md:py-4">Nombre</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Categoria</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Subcategoria</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Stock</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Accion</th>
              </tr>
            </thead>

            {/* Cuerpo */}
            <tbody className="bg-slate-950 divide-y divide-slate-600">
              {currentItems.map((producto) => (
                <tr
                  className="bg-slate-950 border-b border-slate-600"
                  key={producto.id}
                >
                  <td className="px-4 py-2 md:px-6 md:py-4">
                    {producto.descripcion || ""}
                  </td>
                  <td className="px-4 py-2 md:px-6 md:py-4">
                    {producto.Subcategorium?.Categorium?.nombre ||
                      producto.Categorium?.nombre ||
                      "-"}
                  </td>
                  <td className="px-4 py-2 md:px-6 md:py-4">
                    {producto.Subcategorium?.nombre || "-"}
                  </td>
                  <td className="px-4 py-2 md:px-6 md:py-4">
                    {producto.stock || 0}
                  </td>
                  <td className="px-4 py-2 md:px-6 md:py-4">
                    <button
                      onClick={() => abrirModal(producto)}
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

        {/* Vista de tarjetas para móviles - Movida fuera del div con hidden md:block */}
        <div className="md:hidden space-y-4">
          {currentItems.map((producto) => (
            <div
              key={producto.id}
              className="bg-slate-950 p-4 rounded-lg border border-slate-600 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{producto.descripcion || ""}</h3>
                <button
                  onClick={() => abrirModal(producto)}
                  className="bg-slate-900 hover:bg-gray-200 hover:text-slate-950 p-2 rounded-full"
                  aria-label="Editar Usuario"
                >
                  <i className="fa-solid fa-pen"></i>
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3">
                  <span className="font-medium">Categoría:</span>
                  <span className="col-span-2 text-gray-600">
                    {producto.Subcategorium?.Categorium?.nombre ||
                      producto.Categorium?.nombre ||
                      "-"}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-medium">Subcategoría:</span>
                  <span className="col-span-2 text-gray-600">
                    {producto.Subcategorium?.nombre || "-"}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-medium">Stock:</span>
                  <span className="col-span-2 text-gray-600">
                    {producto.stock || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-transparent border-t border-t-slate-500 rounded-b-md h-auto py-4 md:h-[12%] xl-plus:h-1/10 flex flex-col md:flex-row items-center justify-center p-2 gap-4 px-4">
        <Paginacion
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
          getPageNumbers={getPageNumbers}
        />
      </div>

      {/* {modalOpen && (
        <RegistroUsuarioForm
          handleCloseModal={handleCloseModal}
          productoSeleccionado={productoSeleccionado}
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          nuevoUsuario={nuevoUsuario}
        />
      )} */}
    </div>
  );
}
