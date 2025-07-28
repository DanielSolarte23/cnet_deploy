import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Package,
  User,
  Calendar,
  FileText,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePersonal } from "@/context/PersonalContext";

export const ReintegroModal = ({
  isOpen,
  onClose,
  onSubmit,
  entrega: entregaProp,
}) => {
  const { user } = useAuth();
  const { personals, getPersonal } = usePersonal();

  useEffect(() => {
    getPersonal();
  }, []);

  const [formData, setFormData] = useState({
    reintegro: {
      fecha: new Date().toISOString().split("T")[0],
      observaciones: "",
      almacenistaId: "",
      personalId: "",
      entregaId: "",
    },
    productos: [],
  });

  const [entregaData, setEntregaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchingEntrega, setSearchingEntrega] = useState(false);

  // Inicializar con datos del usuario y entrega si se proporciona
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        reintegro: {
          ...prev.reintegro,
          almacenistaId: user?.id || "",
          entregaId: entregaProp || "",
        },
      }));

      // Si se proporciona una entrega específica, buscarla automáticamente
      if (entregaProp) {
        buscarEntrega(entregaProp);
      }
    }
  }, [isOpen, user, entregaProp]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      reintegro: {
        fecha: new Date().toISOString().split("T")[0],
        observaciones: "",
        almacenistaId: user?.id || "",
        personalId: "",
        entregaId: entregaProp || "",
      },
      productos: [],
    });
    setEntregaData(null);
    setError("");
  };

  const buscarEntrega = async (entregaId) => {
    if (!entregaId) {
      setEntregaData(null);
      return;
    }

    setSearchingEntrega(true);
    setError("");

    try {
      const response = await fetch(
        `http://172.16.110.74:3004/api/entrega/${entregaId}`
      );

      if (!response.ok) {
        throw new Error("Entrega no encontrada");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Error al obtener la entrega");
      }

      const entregaInfo = data.data;

      // Validar que la entrega tenga productos disponibles para devolver
      const productosDevolvibles =
        entregaInfo.EntregaProductos?.filter(
          (ep) => ep.cantidad > (ep.devuelto || 0)
        ) || [];

      if (productosDevolvibles.length === 0) {
        throw new Error(
          "Esta entrega no tiene productos disponibles para devolver"
        );
      }

      setEntregaData(entregaInfo);

      // Auto-llenar datos si están disponibles
      if (entregaInfo.tecnicoId && !formData.reintegro.personalId) {
        setFormData((prev) => ({
          ...prev,
          reintegro: {
            ...prev.reintegro,
            personalId: entregaInfo.tecnicoId,
          },
        }));
      }
    } catch (err) {
      setError(err.message);
      setEntregaData(null);
    } finally {
      setSearchingEntrega(false);
    }
  };

  const handleEntregaIdChange = (e) => {
    const entregaId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      reintegro: { ...prev.reintegro, entregaId },
      productos: [], // Reset productos cuando cambia la entrega
    }));

    if (entregaId) {
      buscarEntrega(entregaId);
    } else {
      setEntregaData(null);
    }
  };

  const toggleProductoSeleccion = (entregaProducto) => {
    const productoId = entregaProducto.ProductoId;
    const cantidadDisponible =
      entregaProducto.cantidad - (entregaProducto.devuelto || 0);

    setFormData((prev) => {
      const productosActuales = [...prev.productos];
      const index = productosActuales.findIndex(
        (p) => p.ProductoId === productoId
      );

      if (index >= 0) {
        // Remover producto
        productosActuales.splice(index, 1);
      } else {
        // Agregar producto - CORRECCIÓN AQUÍ
        const nuevoProducto = {
          ProductoId: productoId,
          observaciones: "", // Siempre inicializar observaciones
        };

        // Para productos con unidades seriadas
        if (entregaProducto.unidadesSeriadas && entregaProducto.unidadesSeriadas.length > 0) {
          nuevoProducto.ProductoUnidads = [];
        } else {
          // Para productos sin unidades seriadas
          nuevoProducto.cantidad = Math.min(cantidadDisponible, 1);
        }

        productosActuales.push(nuevoProducto);
      }

      return {
        ...prev,
        productos: productosActuales,
      };
    });
  };

  const updateProductoCantidad = (productoId, nuevaCantidad) => {
    const entregaProducto = entregaData.EntregaProductos.find(
      (ep) => ep.ProductoId === productoId
    );
    const maxCantidad =
      entregaProducto.cantidad - (entregaProducto.devuelto || 0);

    setFormData((prev) => ({
      ...prev,
      productos: prev.productos.map((p) =>
        p.ProductoId === productoId
          ? {
              ...p,
              cantidad: Math.min(
                Math.max(1, parseInt(nuevaCantidad) || 1),
                maxCantidad
              ),
            }
          : p
      ),
    }));
  };

  const updateProductoObservaciones = (productoId, observaciones) => {
    setFormData((prev) => ({
      ...prev,
      productos: prev.productos.map((p) =>
        p.ProductoId === productoId ? { ...p, observaciones } : p
      ),
    }));
  };

  const toggleUnidadSeriada = (productoId, unidadId) => {
    setFormData((prev) => ({
      ...prev,
      productos: prev.productos.map((p) => {
        if (p.ProductoId === productoId && p.ProductoUnidads !== undefined) {
          const unidades = [...p.ProductoUnidads];
          const index = unidades.indexOf(unidadId);

          if (index >= 0) {
            unidades.splice(index, 1);
          } else {
            unidades.push(unidadId);
          }

          return { ...p, ProductoUnidads: unidades };
        }
        return p;
      }),
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.reintegro.entregaId) {
      setError("Debe especificar una entrega");
      return;
    }

    if (!formData.reintegro.almacenistaId) {
      setError("Error: No se pudo identificar el almacenista");
      return;
    }

    if (!formData.reintegro.personalId) {
      setError("Debe seleccionar un técnico");
      return;
    }

    if (formData.productos.length === 0) {
      setError("Debe seleccionar al menos un producto para devolver");
      return;
    }

    // Validar productos con unidades seriadas
    const productosConUnidadesVacias = formData.productos.filter(
      (p) => p.ProductoUnidads !== undefined && p.ProductoUnidads.length === 0
    );

    if (productosConUnidadesVacias.length > 0) {
      setError(
        "Debe seleccionar las unidades específicas para los productos seriados"
      );
      return;
    }

    // CORRECCIÓN: Limpiar datos antes de enviar
    const dataToSend = {
      reintegro: {
        ...formData.reintegro,
        almacenistaId: parseInt(formData.reintegro.almacenistaId),
        personalId: parseInt(formData.reintegro.personalId),
        entregaId: parseInt(formData.reintegro.entregaId),
      },
      productos: formData.productos.map(producto => {
        // Crear objeto limpio para cada producto
        const productoLimpio = {
          ProductoId: parseInt(producto.ProductoId),
          observaciones: producto.observaciones || "" // Asegurar que siempre tenga observaciones
        };

        // Agregar cantidad o ProductoUnidads según corresponda
        if (producto.ProductoUnidads !== undefined) {
          // Producto con unidades seriadas
          productoLimpio.ProductoUnidads = producto.ProductoUnidads.map(id => parseInt(id));
        } else {
          // Producto sin unidades seriadas
          productoLimpio.cantidad = parseInt(producto.cantidad);
        }

        return productoLimpio;
      })
    };

    setLoading(true);
    setError("");

    try {
      // console.log("Datos a enviar:", JSON.stringify(dataToSend, null, 2));
      await onSubmit(dataToSend);
      resetForm();
      onClose();
    } catch (err) {
      console.error("Error al crear el reintegro:", err);
      setError(err.message || "Error al crear el reintegro");
    } finally {
      setLoading(false);
    }
  };

  const getProductoSeleccionado = (productoId) => {
    return formData.productos.find((p) => p.ProductoId === productoId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-700 rounded-lg dark:bg-slate-900 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Crear Reintegro
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          {/* Body */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-3">
                  <AlertTriangle className="text-red-500" size={20} />
                  <span className="text-red-700 dark:text-red-400">
                    {error}
                  </span>
                </div>
              )}

              {/* Datos del Reintegro */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={formData.reintegro.fecha}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reintegro: { ...prev.reintegro, fecha: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div className="hidden">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <Package size={16} className="inline mr-1" />
                    ID de Entrega
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.reintegro.entregaId}
                      onChange={handleEntregaIdChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                      placeholder="Ingrese el ID de la entrega"
                      disabled={!!entregaProp}
                      required
                    />
                    {searchingEntrega && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <User size={16} className="inline mr-1" />
                    Técnico
                  </label>
                  <select
                    value={formData.reintegro.personalId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reintegro: {
                          ...prev.reintegro,
                          personalId: e.target.value, // CORRECCIÓN: No parsear aquí, se hace al enviar
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                    required
                  >
                    <option value="">Seleccionar técnico</option>
                    {personals.map((tecnico) => (
                      <option key={tecnico.id} value={tecnico.id}>
                        {tecnico.nombre} - {tecnico.cedula}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <FileText size={16} className="inline mr-1" />
                  Observaciones
                </label>
                <textarea
                  value={formData.reintegro.observaciones}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      reintegro: {
                        ...prev.reintegro,
                        observaciones: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                  rows={3}
                  placeholder="Observaciones del reintegro..."
                />
              </div>

              {/* Información de la Entrega */}
              {entregaData && (
                <div className="bg-gray-50 dark:bg-slate-950 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-3">
                    Información de la Entrega
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Proyecto:</span>{" "}
                      {entregaData.proyecto}
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span>{" "}
                      {new Date(entregaData.fecha).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Técnico:</span>{" "}
                      {entregaData.tecnicoData?.nombre}
                    </div>
                    <div>
                      <span className="font-medium">Estado:</span>
                      <span
                        className={`ml-1 px-2 py-1 rounded text-xs ${
                          entregaData.estado === "completamente_devuelta"
                            ? "bg-gray-200 text-gray-800"
                            : entregaData.estado === "parcialmente_devuelta"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-green-200 text-green-800"
                        }`}
                      >
                        {entregaData.estado || "activa"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Productos Disponibles */}
              {entregaData && entregaData.EntregaProductos && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-yellow-400 mb-4">
                    Productos Disponibles para Devolución
                  </h3>
                  <div className="space-y-4">
                    {entregaData.EntregaProductos.map((entregaProducto) => {
                      const cantidadDisponible =
                        entregaProducto.cantidad -
                        (entregaProducto.devuelto || 0);
                      const productoSeleccionado = getProductoSeleccionado(
                        entregaProducto.ProductoId
                      );

                      if (cantidadDisponible <= 0) return null;

                      return (
                        <div
                          key={entregaProducto.id}
                          className="border border-gray-200 dark:border-slate-600 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={!!productoSeleccionado}
                                onChange={() =>
                                  toggleProductoSeleccion(entregaProducto)
                                }
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-slate-300">
                                  {entregaProducto.Producto?.descripcion ||
                                    "Producto sin descripción"}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                  {entregaProducto.Producto?.marca || ""} -{" "}
                                  {entregaProducto.Producto?.color || ""}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-slate-500">
                                  Código:{" "}
                                  {entregaProducto.Producto?.codigo || ""}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-slate-400">
                                Disponible: {cantidadDisponible} de{" "}
                                {entregaProducto.cantidad}
                              </p>
                              {entregaProducto.unidadesSeriadas &&
                                entregaProducto.unidadesSeriadas.length > 0 && (
                                  <p className="text-xs text-blue-600">
                                    Con unidades seriadas
                                  </p>
                                )}
                            </div>
                          </div>

                          {productoSeleccionado && (
                            <div className="mt-4 space-y-4 bg-blue-50 dark:bg-slate-950 rounded-lg p-4">
                              {/* Cantidad o Unidades Seriadas */}
                              {entregaProducto.unidadesSeriadas &&
                              entregaProducto.unidadesSeriadas.length > 0 ? (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                    Seleccionar unidades específicas:
                                  </label>
                                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                                    {entregaProducto.unidadesSeriadasDetalle.map(
                                      (unidadId) => (
                                        <label
                                          key={unidadId.id}
                                          className="flex items-center space-x-2 text-sm"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={
                                              productoSeleccionado.ProductoUnidads?.includes(
                                                unidadId.id
                                              ) || false
                                            }
                                            onChange={() =>
                                              toggleUnidadSeriada(
                                                entregaProducto.ProductoId,
                                                unidadId.id
                                              )
                                            }
                                            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                          />
                                          <span className="dark:text-slate-300">
                                            Serial: {unidadId.serial}
                                          </span>
                                        </label>
                                      )
                                    )}
                                  </div>
                                  {productoSeleccionado.ProductoUnidads && (
                                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-2">
                                      {
                                        productoSeleccionado.ProductoUnidads
                                          .length
                                      }{" "}
                                      unidades seleccionadas
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                    Cantidad a devolver:
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max={cantidadDisponible}
                                    value={productoSeleccionado.cantidad || 1}
                                    onChange={(e) =>
                                      updateProductoCantidad(
                                        entregaProducto.ProductoId,
                                        e.target.value
                                      )
                                    }
                                    className="w-20 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                                  />
                                  <span className="ml-2 text-sm text-gray-600 dark:text-slate-400">
                                    de {cantidadDisponible} disponibles
                                  </span>
                                </div>
                              )}

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                  Observaciones del producto:
                                </label>
                                <textarea
                                  value={
                                    productoSeleccionado.observaciones || ""
                                  }
                                  onChange={(e) =>
                                    updateProductoObservaciones(
                                      entregaProducto.ProductoId,
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm dark:bg-slate-800 dark:text-white"
                                  rows={2}
                                  placeholder="Observaciones específicas de este producto..."
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                loading || !entregaData || formData.productos.length === 0
              }
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Crear Reintegro</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};