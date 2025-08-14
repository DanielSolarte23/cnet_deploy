import React, { useState, useEffect } from "react";
import { Search, Plus, Minus, X, Package, Hash, Trash2 } from "lucide-react";
import { useProductos } from "@/context/ProductosContext";
import { ModalUnidadesSeriadas } from "./ModalUnidadesSeriadas";

export const ModificarProductosModal = ({
  isOpen,
  onClose,
  entregaId,
  entregaActual,
  onUpdate,
}) => {
  const { productos, getProductos } = useProductos();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [productosAModificar, setProductosAModificar] = useState([]);
  const [accion, setAccion] = useState("agregar");
  const [loading, setLoading] = useState(false);
  const [showUnidadesModal, setShowUnidadesModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);

  useEffect(() => {
    getProductos();
  }, []);

  // Filtrar productos basado en búsqueda
  useEffect(() => {
    if (!productos) return;

    const filtered = productos.filter((producto) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        producto.descripcion.toLowerCase().includes(searchLower) ||
        producto.marca.toLowerCase().includes(searchLower) ||
        (producto.codigo &&
          producto.codigo.toLowerCase().includes(searchLower))
      );
    });
    setFilteredProductos(filtered.slice(0, 10));
  }, [searchTerm, productos]);

  // Resetear modal al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setProductosAModificar([]);
      setSearchTerm("");
      setAccion("agregar");
    }
  }, [isOpen]);

  // Función para determinar si un producto es seriado
  const esProductoSeriado = (producto) => {
    return producto.ProductoUnidads && Array.isArray(producto.ProductoUnidads) && producto.ProductoUnidads.length > 0;
  };

  // Agregar producto a la lista de modificación
  const agregarProductoALista = (producto) => {
    const existe = productosAModificar.find(
      (p) => p.ProductoId === producto.id
    );
    if (existe) return;

    // Verificar si es un producto seriado
    const esSeriado = esProductoSeriado(producto);

    const nuevoProducto = {
      ProductoId: producto.id,
      producto: producto,
      cantidad: esSeriado ? 0 : 1, // Para productos seriados, la cantidad se calcula por las unidades seleccionadas
      unidadesSeriadas: [],
      ProductoUnidads: esSeriado,
    };

    setProductosAModificar([...productosAModificar, nuevoProducto]);
    setSearchTerm("");
  };

  // Quitar producto de la lista
  const quitarProductoDeLista = (productoId) => {
    setProductosAModificar(
      productosAModificar.filter((p) => p.ProductoId !== productoId)
    );
  };

  // Actualizar cantidad de producto no seriado
  const actualizarCantidad = (productoId, nuevaCantidad) => {
    const cantidad = parseInt(nuevaCantidad);
    if (cantidad < 1) return;

    setProductosAModificar(
      productosAModificar.map((p) =>
        p.ProductoId === productoId ? { ...p, cantidad } : p
      )
    );
  };

  // Abrir modal de selección de unidades seriadas
  const abrirModalUnidades = (producto) => {
    setSelectedProducto(producto);
    setShowUnidadesModal(true);
  };

  // Actualizar unidades seriadas seleccionadas
  const actualizarUnidadesSeriadas = (unidades) => {
    setProductosAModificar(
      productosAModificar.map((p) =>
        p.ProductoId === selectedProducto.ProductoId
          ? { ...p, unidadesSeriadas: unidades, cantidad: unidades.length }
          : p
      )
    );
    setShowUnidadesModal(false);
  };

  // Validar datos antes de enviar
  const validarDatos = () => {
    if (productosAModificar.length === 0) {
      alert("Debe agregar al menos un producto");
      return false;
    }

    for (const producto of productosAModificar) {
      if (producto.ProductoUnidads) {
        // Producto seriado
        if (producto.unidadesSeriadas.length === 0) {
          alert(`Debe seleccionar al menos una unidad para ${producto.producto.descripcion}`);
          return false;
        }
      } else {
        // Producto no seriado
        if (!producto.cantidad || producto.cantidad < 1) {
          alert(`Debe especificar una cantidad válida para ${producto.producto.descripcion}`);
          return false;
        }
        
        // Validar stock disponible para agregar
        if (accion === "agregar" && producto.cantidad > producto.producto.stock) {
          alert(`Stock insuficiente para ${producto.producto.descripcion}. Stock disponible: ${producto.producto.stock}`);
          return false;
        }
      }
    }

    return true;
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validarDatos()) return;

    setLoading(true);

    try {
      // Preparar datos para enviar según la especificación de la API
      const productosParaEnviar = productosAModificar.map((p) => {
        const producto = {
          ProductoId: p.ProductoId,
        };

        if (p.ProductoUnidads && p.unidadesSeriadas.length > 0) {
          // Producto seriado
          producto.unidadesSeriadas = p.unidadesSeriadas;
        } else if (!p.ProductoUnidads && p.cantidad > 0) {
          // Producto no seriado
          producto.cantidad = p.cantidad;
        }

        return producto;
      });

      // Filtrar productos válidos
      const productosValidos = productosParaEnviar.filter(
        (p) =>
          (p.unidadesSeriadas && p.unidadesSeriadas.length > 0) ||
          (p.cantidad && p.cantidad > 0)
      );

      const response = await fetch(`http://172.16.110.74:3004/api/entregas/${entregaId}/productos`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accion: accion,
          productos: productosValidos,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onUpdate && onUpdate(data.data);
        onClose();
        alert(
          `Productos ${
            accion === "agregar" ? "agregados" : "quitados"
          } correctamente`
        );
      } else {
        alert(`Error: ${data.error || data.message || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar la solicitud. Verifique la conexión.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-gray-100">
            Modificar Productos - Entrega {entregaActual?.proyecto || entregaId}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Selector de acción */}
          <div className="mb-6">
            <label className="block text-md font-medium text-gray-100 mb-3">
              Acción a realizar:
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="agregar"
                  checked={accion === "agregar"}
                  onChange={(e) => setAccion(e.target.value)}
                  className="mr-3 text-green-500"
                />
                <Plus size={16} className="mr-2 text-green-500" />
                <span className="text-gray-200">Agregar productos</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="quitar"
                  checked={accion === "quitar"}
                  onChange={(e) => setAccion(e.target.value)}
                  className="mr-3 text-red-500"
                />
                <Minus size={16} className="mr-2 text-red-500" />
                <span className="text-gray-200">Quitar productos</span>
              </label>
            </div>
          </div>

          {/* Búsqueda de productos */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buscar productos:
            </label>
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por descripción, marca o código..."
                className="pl-10 pr-4 py-3 w-full bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400"
              />
            </div>

            {/* Resultados de búsqueda */}
            {searchTerm && filteredProductos.length > 0 && (
              <div className="mt-2 border border-slate-600 rounded-lg shadow-lg bg-slate-800 max-h-60 overflow-y-auto">
                {filteredProductos.map((producto) => (
                  <div
                    key={producto.id}
                    onClick={() => agregarProductoALista(producto)}
                    className="p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-600 last:border-b-0 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-200">
                        {producto.descripcion}
                      </div>
                      <div className="text-sm text-gray-400">
                        {producto.marca} | Stock: {producto.stock}
                        {producto.codigo && ` | Código: ${producto.codigo}`}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      esProductoSeriado(producto) 
                        ? "bg-blue-600 text-blue-100" 
                        : "bg-gray-600 text-gray-100"
                    }`}>
                      {esProductoSeriado(producto) ? "Seriado" : "Normal"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchTerm && filteredProductos.length === 0 && (
              <div className="mt-2 p-3 text-center text-gray-400 bg-slate-800 rounded-lg">
                No se encontraron productos
              </div>
            )}
          </div>

          {/* Lista de productos seleccionados */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-200 mb-4">
              Productos seleccionados ({productosAModificar.length})
            </h3>

            {productosAModificar.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-lg mb-1">No hay productos seleccionados</p>
                <p className="text-sm">
                  Use el buscador para agregar productos
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {productosAModificar.map((item) => (
                  <div
                    key={item.ProductoId}
                    className="flex items-center justify-between p-4 bg-slate-800 border border-slate-600 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-100">
                        {item.producto.descripcion}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {item.producto.marca} | Stock disponible: {item.producto.stock}
                      </div>
                      <div className={`inline-block text-xs px-2 py-1 rounded mt-2 ${
                        item.ProductoUnidads 
                          ? "bg-blue-600 text-blue-100" 
                          : "bg-gray-600 text-gray-100"
                      }`}>
                        {item.ProductoUnidads ? "Producto Seriado" : "Producto Normal"}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {item.ProductoUnidads ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => abrirModalUnidades(item)}
                            className={`flex items-center px-3 py-2 rounded text-sm transition-colors ${
                              item.unidadesSeriadas.length > 0
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }`}
                          >
                            <Hash size={14} className="mr-1" />
                            Unidades ({item.unidadesSeriadas.length})
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-300">
                            Cantidad:
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={accion === "agregar" ? item.producto.stock : undefined}
                            value={item.cantidad}
                            onChange={(e) =>
                              actualizarCantidad(item.ProductoId, e.target.value)
                            }
                            className="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-center text-gray-100 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      <button
                        onClick={() => quitarProductoDeLista(item.ProductoId)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                        title="Eliminar producto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-700 bg-slate-800">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-300 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || productosAModificar.length === 0}
            className={`px-6 py-2 rounded-lg transition-colors font-medium ${
              accion === "agregar"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading
              ? "Procesando..."
              : accion === "agregar"
              ? "Agregar Productos"
              : "Quitar Productos"}
          </button>
        </div>
      </div>

      {/* Modal de unidades seriadas */}
      <ModalUnidadesSeriadas
        isOpen={showUnidadesModal}
        onClose={() => setShowUnidadesModal(false)}
        producto={selectedProducto}
        accion={accion}
        entregaActual={entregaActual}
        onSeleccionar={actualizarUnidadesSeriadas}
      />
    </div>
  );
};