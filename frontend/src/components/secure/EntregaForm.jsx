"use client";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Clipboard,
  Package,
  User,
  FileText,
  AlertCircle,
  Barcode,
  Search,
  X,
} from "lucide-react";
import { usePersonal } from "@/context/PersonalContext";
import { useProductos } from "@/context/ProductosContext";
import { useAuth } from "@/context/AuthContext";
import { useEntregas } from "@/context/EntregaContext";
import axios from "@/api/axios";

export default function FormularioEntrega({
  handleCloseModal,
  showNotification,
}) {
  // LLamado al personals desde el contexto
  const { personals = [], getPersonal } = usePersonal(); // Valor por defecto
  const { user } = useAuth();

  // LLamado al contexto de productos
  const { productos = [], getProductos } = useProductos(); // Valor por defecto

  // LLamado al contexto de Entregas
  const { createEntrega } = useEntregas();

  const [formData, setFormData] = useState({
    entrega: {
      fecha: new Date().toISOString().split("T")[0],
      proyecto: "",
      observaciones: "",
      estado: "pendiente",
      fechaEstimadaDevolucion: "",
      almacenista: user?.id || null,
      personalId: "",
    },
    productos: [],
    recipientEmail: "",
  });

  const [productoSeleccionado, setProductoSeleccionado] = useState({
    ProductoId: "",
    cantidad: 1,
    tieneSeriales: false,
    unidadesSeriadas: [],
  });

  // Estados para búsqueda de productos
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [mostrarListaProductos, setMostrarListaProductos] = useState(false);
  const [productoSeleccionadoInfo, setProductoSeleccionadoInfo] =
    useState(null);

  // Estados para búsqueda de unidades seriadas
  const [busquedaSerial, setBusquedaSerial] = useState("");
  const [mostrarListaSeriales, setMostrarListaSeriales] = useState(false);

  // Estado para almacenar las unidades disponibles del producto seleccionado
  const [unidadesDisponibles, setUnidadesDisponibles] = useState([]);

  const [almacenistas, setAlmacenistas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Cargar el personals al montar el componente
    if (getPersonal) {
      getPersonal();
    }
    if (getProductos) {
      getProductos();
    }
  }, []);

  // Cargar las unidades disponibles cuando se selecciona un producto
  useEffect(() => {
    const cargarUnidadesDisponibles = async () => {
      if (
        !productoSeleccionado.ProductoId ||
        !productoSeleccionado.tieneSeriales
      ) {
        setUnidadesDisponibles([]);
        return;
      }

      try {
        const response = await axios.get(
          `/products/${productoSeleccionado.ProductoId}/unidades`
        );

        // console.log("Unidades disponibles:", response.data.data);
        setUnidadesDisponibles(response.data.data || []); // Asegurar que sea un array
      } catch (error) {
        console.error("Error al cargar unidades:", error);
        setError("No se pudieron cargar las unidades del producto");
        setUnidadesDisponibles([]);
      }
    };

    cargarUnidadesDisponibles();
  }, [productoSeleccionado.ProductoId, productoSeleccionado.tieneSeriales]);

  // Filtrar productos basado en la búsqueda
  const productosFiltrados = productos.filter((producto) =>
    `${producto.codigo} ${producto.descripcion} ${producto.modelo}`
      .toLowerCase()
      .includes(busquedaProducto.toLowerCase())
  );

  // Filtrar unidades seriadas basado en la búsqueda
  const unidadesFiltradas = unidadesDisponibles.filter((unidad) =>
    unidad.serial.toLowerCase().includes(busquedaSerial.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "personalId") {

      const selectedPersonal = personals.find((p) => p.id === parseInt(value));

      setFormData({
        ...formData,
        entrega: {
          ...formData.entrega,
          [name]: value,
        },
        recipientEmail: selectedPersonal?.correo || "",
      });
    } else {
      setFormData({
        ...formData,
        entrega: {
          ...formData.entrega,
          [name]: value,
        },
      });
    }
  };

  const handleProductoChange = (e) => {
    const { name, value } = e.target;

    if (name === "ProductoId") {
      // Asegurarse de que el valor no sea undefined o vacío antes de convertirlo
      const selectedProductId = value ? parseInt(value) : "";
      const selectedProduct = productos.find((p) => p.id === selectedProductId);

      setProductoSeleccionado({
        ProductoId: selectedProductId || "",
        cantidad: 1,
        tieneSeriales: selectedProduct?.tieneSeriado || false,
        unidadesSeriadas: [],
      });
    } else if (name === "tieneSeriales") {
      setProductoSeleccionado({
        ...productoSeleccionado,
        tieneSeriales: e.target.checked,
        unidadesSeriadas: [],
        cantidad: e.target.checked ? 0 : 1, // Si tiene seriales, la cantidad se determina por las unidades seleccionadas
      });
    } else if (name === "cantidad") {
      // Evitar NaN asegurándose de que value sea un número válido
      const cantidad =
        value === "" ? "" : isNaN(parseInt(value)) ? 1 : parseInt(value);
      setProductoSeleccionado({
        ...productoSeleccionado,
        cantidad: cantidad,
      });
    }
  };

  // Función para seleccionar un producto desde la lista filtrada
  const seleccionarProducto = (producto) => {
    setProductoSeleccionado({
      ProductoId: producto.id,
      cantidad: 1,
      tieneSeriales: producto.tieneSeriado || false,
      unidadesSeriadas: [],
    });
    setProductoSeleccionadoInfo(producto);
    setBusquedaProducto(`${producto.codigo}: ${producto.descripcion} - ${producto.modelo}`);
    setMostrarListaProductos(false);
  };

  // Función para limpiar la selección de producto
  const limpiarSeleccionProducto = () => {
    setProductoSeleccionado({
      ProductoId: "",
      cantidad: 1,
      tieneSeriales: false,
      unidadesSeriadas: [],
    });
    setProductoSeleccionadoInfo(null);
    setBusquedaProducto("");
    setMostrarListaProductos(false);
  };

  const handleSerialChange = (e) => {
    // Convertir valores a números y asegurarse de que todos sean válidos
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => {
      const val = parseInt(option.value);
      return isNaN(val) ? null : val;
    }).filter((val) => val !== null);

    setProductoSeleccionado({
      ...productoSeleccionado,
      unidadesSeriadas: selectedOptions,
      cantidad: selectedOptions.length, // La cantidad es igual al número de unidades seleccionadas
    });
  };

  // Función para seleccionar/deseleccionar una unidad seriada
  const toggleUnidadSeriada = (unidadId) => {
    const isSelected = productoSeleccionado.unidadesSeriadas.includes(unidadId);
    let nuevasUnidades;

    if (isSelected) {
      nuevasUnidades = productoSeleccionado.unidadesSeriadas.filter(
        (id) => id !== unidadId
      );
    } else {
      nuevasUnidades = [...productoSeleccionado.unidadesSeriadas, unidadId];
    }

    setProductoSeleccionado({
      ...productoSeleccionado,
      unidadesSeriadas: nuevasUnidades,
      cantidad: nuevasUnidades.length,
    });
  };

  const agregarProducto = () => {
    if (!productoSeleccionado.ProductoId) {
      setError("Seleccione un producto");
      return;
    }

    if (
      productoSeleccionado.tieneSeriales &&
      productoSeleccionado.unidadesSeriadas.length === 0
    ) {
      setError("Seleccione al menos una unidad");
      return;
    }

    if (
      !productoSeleccionado.tieneSeriales &&
      productoSeleccionado.cantidad <= 0
    ) {
      setError("Ingrese una cantidad válida");
      return;
    }

    const productoInfo = productos.find(
      (p) => p.id === productoSeleccionado.ProductoId
    );

    // Verificar si ya existe el producto en la lista
    const productoExistente = formData.productos.find(
      (p) => p.ProductoId === productoSeleccionado.ProductoId
    );

    if (productoExistente) {
      // Si el producto tiene seriales, necesitamos verificar que no haya duplicados
      if (productoSeleccionado.tieneSeriales) {
        // Verificar duplicados en seriales
        const serialesDuplicados = productoSeleccionado.unidadesSeriadas.filter(
          (serial) => productoExistente.unidadesSeriadas?.includes(serial)
        );

        if (serialesDuplicados.length > 0) {
          setError("Ya ha agregado algunas de estas unidades");
          return;
        }

        // Añadir las nuevas unidades seriadas
        setFormData({
          ...formData,
          productos: formData.productos.map((p) =>
            p.ProductoId === productoSeleccionado.ProductoId
              ? {
                  ...p,
                  unidadesSeriadas: [
                    ...(p.unidadesSeriadas || []),
                    ...productoSeleccionado.unidadesSeriadas,
                  ],
                  cantidad:
                    (p.cantidad || 0) +
                    productoSeleccionado.unidadesSeriadas.length,
                }
              : p
          ),
        });
      } else {
        // Para productos sin seriales, simplemente aumentar la cantidad
        setFormData({
          ...formData,
          productos: formData.productos.map((p) =>
            p.ProductoId === productoSeleccionado.ProductoId
              ? { ...p, cantidad: p.cantidad + productoSeleccionado.cantidad }
              : p
          ),
        });
      }
    } else {
      // Agregar nuevo producto
      setFormData({
        ...formData,
        productos: [
          ...formData.productos,
          {
            ProductoId: productoSeleccionado.ProductoId,
            cantidad: productoSeleccionado.cantidad,
            descripcion:
              productoInfo?.descripcion || "Producto sin descripción",
            tieneSeriales: productoSeleccionado.tieneSeriales,
            unidadesSeriadas: productoSeleccionado.tieneSeriales
              ? productoSeleccionado.unidadesSeriadas
              : undefined,
          },
        ],
      });
    }

    // Resetear el producto seleccionado
    setProductoSeleccionado({
      ProductoId: "",
      cantidad: 1,
      tieneSeriales: false,
      unidadesSeriadas: [],
    });
    setProductoSeleccionadoInfo(null);
    setBusquedaProducto("");
    setBusquedaSerial("");

    setError("");
  };

  const eliminarProducto = (index) => {
    setFormData({
      ...formData,
      productos: formData.productos.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    // Validar que tenemos un usuario autenticado
    if (!user?.id) {
      setError("Usuario no autenticado");
      return;
    }

    if (formData.productos.length === 0) {
      setError("Debe agregar al menos un producto");
      return;
    }

    // Validar campos requeridos
    if (!formData.entrega.personalId) {
      setError("Debe seleccionar un técnico");
      return;
    }

    if (!formData.entrega.proyecto.trim()) {
      setError("Debe ingresar un proyecto");
      return;
    }

    if (!formData.entrega.fechaEstimadaDevolucion) {
      setError("Debe ingresar la fecha estimada de devolución");
      return;
    }

    if (!formData.recipientEmail) {
      setError("El técnico seleccionado no tiene email registrado");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const dataToSend = {
        ...formData, //
        entrega: {
          ...formData.entrega,
          almacenista: user.id,
        },
      };

      // console.log("Datos a enviar:", dataToSend);

      await createEntrega(dataToSend);
      setSuccess("Entrega creada correctamente");

      // Reiniciar formulario
      setFormData({
        entrega: {
          fecha: new Date().toISOString().split("T")[0],
          proyecto: "",
          observaciones: "",
          estado: "pendiente",
          fechaEstimadaDevolucion: "",
          almacenista: user.id,
          personalId: "",
        },
        productos: [],
        recipientEmail: "",
      });

      handleCloseModal()
      showNotification("Entrega registrada correctamente", "success")
    } catch (error) {
      showNotification("Error al crear la entrea", error)
      console.error("Error completo:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Error al procesar la solicitud"
      );
    } finally {
      setLoading(false);
    }
  };
  // Función para mostrar los detalles de las unidades seriadas
  const mostrarDetallesUnidades = (unidades) => {
    if (!unidades || unidades.length === 0) return "N/A";

    // Intento de mostrar información de seriales basada en unidades disponibles
    // Si no tenemos datos reales, simplemente mostramos los IDs
    return unidades
      .map((id) => {
        if (unidadesDisponibles && unidadesDisponibles.length > 0) {
          const unidad = unidadesDisponibles.find((u) => u.id === id);
          return unidad ? unidad.serial : `ID: ${id}`;
        } else {
          return `ID: ${id}`;
        }
      })
      .join(", ");
  };

  // Renderizado condicional para evitar errores
  if (!personals || !productos) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4 z-50">
        <div className="max-w-md mx-auto p-6 dark:bg-slate-900 bg-white rounded-lg shadow-md">
          <p className="text-center">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4 z-50">
      <div
        className="max-w-4xl mx-auto p-6 dark:bg-slate-900 bg-white rounded-lg shadow-md max-h-[90vh] overflow-y-auto
      "
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-slate-300 flex items-center">
          <Clipboard className="mr-2" /> Formulario de Entrega de Productos
        </h1>

        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6 flex items-start">
            <AlertCircle className="text-red-500 mr-2 mt-1 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 p-4 rounded-md mb-6">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Fecha de Entrega
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.entrega.fecha}
                onChange={handleInputChange}
                className="w-full p-2 border dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Fecha Estimada de Devolución
              </label>
              <input
                type="date"
                name="fechaEstimadaDevolucion"
                value={formData.entrega.fechaEstimadaDevolucion}
                onChange={handleInputChange}
                className="w-full p-2 border dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Proyecto
              </label>
              <input
                type="text"
                name="proyecto"
                value={formData.entrega.proyecto}
                onChange={handleInputChange}
                placeholder="Ej: Instalación de redes en sede norte"
                className="w-full p-2 border dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                <User className="h-4 w-4 mr-1" />
                Técnico *
              </label>
              <select
                name="personalId"
                value={formData.entrega.personalId}
                onChange={handleInputChange}
                className="w-full p-2 border dark:border-slate-700 rounded-md focus:ring-2 focus:ring-slate-500 dark:bg-slate-800"
                required
              >
                <option value="">Seleccione un técnico</option>
                {Array.isArray(personals) &&
                  personals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} - {p.cargo}{" "}
                      {/* {p.correo ? `(${p.correo})` : "(Sin email)"} */}
                    </option>
                  ))}
              </select>
              {formData.recipientEmail && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ Email de confirmación: {formData.recipientEmail}
                </p>
              )}
              {formData.entrega.personalId && !formData.recipientEmail && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ El técnico seleccionado no tiene email registrado
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.entrega.observaciones}
                onChange={handleInputChange}
                placeholder="Comentarios adicionales sobre la entrega"
                className="w-full p-2 border dark:border-slate-700 rounded-md focus:ring-2 focus:ring-slate-500 h-24 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-950 p-4 rounded-md mb-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Package className="mr-2" /> Productos a Entregar
            </h2>

            <div className="grid grid-cols-1 gap-4 mb-4">
              {/* Búsqueda de productos */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Buscar Producto
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={busquedaProducto}
                    onChange={(e) => {
                      setBusquedaProducto(e.target.value);
                      setMostrarListaProductos(true);
                    }}
                    onFocus={() => setMostrarListaProductos(true)}
                    placeholder="Escriba para buscar un producto..."
                    className="w-full pl-10 pr-10 p-2 border rounded-md focus:ring-2 focus:ring-slate-500 dark:bg-slate-800"
                  />
                  {productoSeleccionadoInfo && (
                    <button
                      type="button"
                      onClick={limpiarSeleccionProducto}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Lista de productos filtrados */}
                {mostrarListaProductos && busquedaProducto && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {productosFiltrados.length > 0 ? (
                      productosFiltrados.map((producto) => (
                        <div
                          key={producto.id}
                          onClick={() => seleccionarProducto(producto)}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer border-b border-gray-100 dark:border-slate-600 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900 dark:text-slate-200">
                            {producto.codigo} {producto.descripcion} - {producto.modelo}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">
                            Stock: {producto.stock}
                            {producto.tieneSeriado && " • Con Serial"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 dark:text-slate-400">
                        No se encontraron productos
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Información del producto seleccionado */}
              {productoSeleccionadoInfo && (
                <div className="bg-blue-50 dark:bg-slate-800 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-200">
                        {productoSeleccionadoInfo.descripcion} -{" "}
                        {productoSeleccionadoInfo.modelo}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Stock disponible: {productoSeleccionadoInfo.stock}
                        {productoSeleccionadoInfo.tieneSeriado &&
                          " • Producto con serial"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Checkbox para seriales si el producto lo soporta */}
              {productoSeleccionado.ProductoId && productoSeleccionadoInfo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center">
                    <Barcode className="h-4 w-4 mr-1" />
                    ¿Producto con serie?
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="tieneSeriales"
                      checked={productoSeleccionado.tieneSeriales}
                      onChange={handleProductoChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                      Este producto tiene números de serie
                    </span>
                  </div>
                </div>
              )}

              {/* Selección de unidades seriadas o cantidad */}
              {productoSeleccionado.tieneSeriales ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Buscar y Seleccionar Unidades
                  </label>

                  {/* Búsqueda de seriales */}
                  <div className="relative mb-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={busquedaSerial}
                      onChange={(e) => setBusquedaSerial(e.target.value)}
                      placeholder="Buscar por número de serie..."
                      className="w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-slate-500 dark:bg-slate-800"
                    />
                  </div>

                  {/* Lista de unidades filtradas */}
                  <div className="border rounded-md max-h-40 overflow-y-auto dark:border-slate-600">
                    {unidadesFiltradas.length > 0 ? (
                      unidadesFiltradas.map((unidad) => (
                        <div
                          key={unidad.id}
                          onClick={() => toggleUnidadSeriada(unidad.id)}
                          className={`px-3 py-2 cursor-pointer border-b border-gray-100 dark:border-slate-600 last:border-b-0 ${
                            productoSeleccionado.unidadesSeriadas.includes(
                              unidad.id
                            )
                              ? "bg-blue-100 dark:bg-blue-900/50"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700"
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={productoSeleccionado.unidadesSeriadas.includes(
                                unidad.id
                              )}
                              onChange={() => {}} // Manejado por el onClick del div
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{unidad.serial}</span>
                          </div>
                        </div>
                      ))
                    ) : unidadesDisponibles.length === 0 ? (
                      <div className="px-3 py-2 text-gray-500 dark:text-slate-400 text-sm">
                        No hay unidades disponibles
                      </div>
                    ) : (
                      <div className="px-3 py-2 text-gray-500 dark:text-slate-400 text-sm">
                        No se encontraron unidades con ese criterio
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    Seleccionadas:{" "}
                    {productoSeleccionado.unidadesSeriadas.length} unidades
                  </p>
                </div>
              ) : (
                productoSeleccionadoInfo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      name="cantidad"
                      value={productoSeleccionado.cantidad}
                      onChange={handleProductoChange}
                      min="1"
                      max={productoSeleccionadoInfo.stock}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-slate-500 dark:bg-slate-800"
                    />
                  </div>
                )
              )}

              {/* Botón para agregar producto */}
              {productoSeleccionadoInfo && (
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={agregarProducto}
                    className="bg-yellow-500 text-slate-950 px-6 py-2 rounded-md hover:bg-yellow-600 w-full font-medium"
                  >
                    Agregar Producto
                  </button>
                </div>
              )}
            </div>

            {/* Tabla de productos agregados */}
            {formData.productos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-slate-950">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-slate-900">
                      <th className="py-2 px-4 text-left">Producto</th>
                      <th className="py-2 px-4 text-left">Cantidad</th>
                      <th className="py-2 px-4 text-left">Seriales</th>
                      <th className="py-2 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.productos.map((prod, index) => (
                      <tr
                        key={index}
                        className="border-t dark:border-slate-700"
                      >
                        <td className="py-2 px-4">{prod.descripcion}</td>
                        <td className="py-2 px-4">{prod.cantidad}</td>
                        <td className="py-2 px-4">
                          {prod.tieneSeriales
                            ? mostrarDetallesUnidades(prod.unidadesSeriadas)
                            : "N/A"}
                        </td>
                        <td className="py-2 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => eliminarProducto(index)}
                            className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No hay productos agregados</p>
                <p className="text-sm">
                  Use el buscador arriba para agregar productos
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2 rounded-md bg-gray-400 hover:bg-gray-500 text-white font-medium"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-2 rounded-md ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-slate-600 hover:bg-slate-700"
              } text-white font-medium`}
            >
              {loading ? "Procesando..." : "Crear Entrega"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
