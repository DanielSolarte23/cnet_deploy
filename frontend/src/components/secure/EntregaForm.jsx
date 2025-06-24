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
} from "lucide-react";
import { usePersonal } from "@/context/PersonalContext";
import { useProductos } from "@/context/ProductosContext";
import { useAuth } from "@/context/AuthContext";
import { useEntregas } from "@/context/EntregaContext";
import axios from "@/api/axios"

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
    almacenista: user?.id || null, // Cambiar de 1 fijo a user?.id
    personalId: "",
  },
  productos: [],
});

  const [productoSeleccionado, setProductoSeleccionado] = useState({
    ProductoId: "",
    cantidad: 1,
    tieneSeriales: false,
    unidadesSeriadas: [],
  });

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
        const response = await axios.get(`/products/${productoSeleccionado.ProductoId}/unidades`);

        console.log("Unidades disponibles:", response.data.data);
        setUnidadesDisponibles(response.data.data || []); // Asegurar que sea un array

      } catch (error) {
        console.error("Error al cargar unidades:", error);
        setError("No se pudieron cargar las unidades del producto");
        setUnidadesDisponibles([]);
      }
    };

    cargarUnidadesDisponibles();
  }, [productoSeleccionado.ProductoId, productoSeleccionado.tieneSeriales]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      entrega: {
        ...formData.entrega,
        [name]: value, // Mantener como string en el estado, convertir al enviar
      },
    });
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

  setLoading(true);
  setError("");

  try {
    // Asegurar que el almacenista sea el usuario actual
    const dataToSend = {
      ...formData,
      entrega: {
        ...formData.entrega,
        almacenista: user.id, // Forzar el ID del usuario actual
      }
    };

    console.log("Datos a enviar:", dataToSend);
    
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
    });
  } catch (error) {
    console.error("Error completo:", error);
    setError(error.response?.data?.message || error.message || "Error al procesar la solicitud");
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
                      {p.nombre} - {p.cargo}
                    </option>
                  ))}
              </select>
              {/* Agregar indicador visual del valor seleccionado para debugging */}
              {formData.entrega.personalId && (
                <p className="text-xs text-gray-500 mt-1">
                  Técnico seleccionado ID: {formData.entrega.personalId}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Producto
                </label>
                <select
                  name="ProductoId"
                  value={productoSeleccionado.ProductoId}
                  onChange={handleProductoChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-slate-500 dark:bg-slate-800"
                >
                  <option value="">Seleccione un producto</option>
                  {Array.isArray(productos) &&
                    productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.descripcion} (Stock: {p.stock})
                      </option>
                    ))}
                </select>
              </div>

              {productoSeleccionado.ProductoId && (
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

              {productoSeleccionado.tieneSeriales ? (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Seleccionar Unidades (Múltiple)
                  </label>
                  <select
                    multiple
                    size={5}
                    value={productoSeleccionado.unidadesSeriadas || []}
                    onChange={handleSerialChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-slate-500 dark:bg-slate-800"
                  >
                    {Array.isArray(unidadesDisponibles) &&
                    unidadesDisponibles.length > 0 ? (
                      unidadesDisponibles.map((unidad) => (
                        <option key={unidad.id} value={unidad.id}>
                          {unidad.serial}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No hay unidades disponibles
                      </option>
                    )}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Seleccionados:{" "}
                    {productoSeleccionado.unidadesSeriadas.length} unidades
                  </p>
                </div>
              ) : (
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
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-slate-500 dark:bg-slate-800"
                  />
                </div>
              )}

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={agregarProducto}
                  className="bg-yellow-500 text-slate-950 px-4 py-2 rounded-md hover:bg-yellow-600 w-full"
                >
                  Agregar Producto
                </button>
              </div>
            </div>

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
                            className="text-red-500 hover:text-red-700"
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
              <p className="text-gray-500 text-center py-4">
                No hay productos agregados
              </p>
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