"use client";
import { useEffect, useState } from "react";
import { X, Package, AlertCircle, CheckCircle2 } from "lucide-react";

export const ModalUnidadesSeriadas = ({
  isOpen,
  onClose,
  producto,
  accion,
  entregaActual,
  onSeleccionar,
}) => {
  const [unidadesDisponibles, setUnidadesDisponibles] = useState([]);
  const [unidadesEnEntrega, setUnidadesEnEntrega] = useState([]);
  const [unidadesSeleccionadas, setUnidadesSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && producto && entregaActual) {
      cargarUnidades();
    }
  }, [isOpen, producto, entregaActual, accion]);

  // Resetear selección al cambiar de acción
  useEffect(() => {
    setUnidadesSeleccionadas([]);
    setError(null);
  }, [accion, isOpen]);

  const cargarUnidades = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (accion === "agregar") {
        // Cargar unidades disponibles del producto
        const response = await fetch(
          `http://172.16.110.74:3004/api/productos/${producto.ProductoId}/unidades-disponibles`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setUnidadesDisponibles(data.data || []);
        } else {
          throw new Error(data.message || "Error al cargar unidades disponibles");
        }
      } else {
        // Cargar unidades que están en la entrega actual
        const response = await fetch(
          `http://172.16.110.74:3004/api/entregas/${entregaActual.id}/productos/${producto.ProductoId}/unidades`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setUnidadesEnEntrega(data.data || []);
        } else {
          throw new Error(data.message || "Error al cargar unidades de la entrega");
        }
      }
    } catch (error) {
      console.error("Error al cargar unidades:", error);
      setError(error.message);
      
      // Datos de prueba si falla la API
      if (accion === "agregar") {
        setUnidadesDisponibles([
          { id: 101, serial: "SN001001", estado: "disponible" },
          { id: 102, serial: "SN001002", estado: "disponible" },
          { id: 103, serial: "SN001003", estado: "disponible" },
        ]);
      } else {
        setUnidadesEnEntrega([
          { id: 104, serial: "SN001004", estado: "instalacion" },
          { id: 105, serial: "SN001005", estado: "instalacion" },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleUnidad = (unidadId) => {
    setUnidadesSeleccionadas((prev) =>
      prev.includes(unidadId)
        ? prev.filter((id) => id !== unidadId)
        : [...prev, unidadId]
    );
  };

  const seleccionarTodas = () => {
    const unidadesParaMostrar = accion === "agregar" ? unidadesDisponibles : unidadesEnEntrega;
    const todasLasUnidades = unidadesParaMostrar.map(u => u.id);
    setUnidadesSeleccionadas(todasLasUnidades);
  };

  const deseleccionarTodas = () => {
    setUnidadesSeleccionadas([]);
  };

  const confirmarSeleccion = () => {
    if (unidadesSeleccionadas.length === 0) {
      alert("Debe seleccionar al menos una unidad");
      return;
    }
    
    onSeleccionar(unidadesSeleccionadas);
    setUnidadesSeleccionadas([]);
  };

  const handleClose = () => {
    setUnidadesSeleccionadas([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const unidadesParaMostrar = accion === "agregar" ? unidadesDisponibles : unidadesEnEntrega;
  const titulo = accion === "agregar" 
    ? "Seleccionar Unidades Disponibles" 
    : "Seleccionar Unidades a Quitar";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-60 p-4">
      <div className="bg-slate-900 border border-slate-600 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <div>
            <h3 className="text-lg font-semibold text-gray-100">{titulo}</h3>
            <p className="text-sm text-gray-400 mt-1">
              {producto?.producto?.descripcion || "Producto"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-600/30 rounded-lg flex items-center">
              <AlertCircle size={20} className="text-red-400 mr-3 flex-shrink-0" />
              <div className="text-red-300">
                <p className="font-medium">Error al cargar datos</p>
                <p className="text-sm mt-1">{error}</p>
                <p className="text-xs mt-2 opacity-75">Mostrando datos de prueba</p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Cargando unidades...</p>
            </div>
          ) : unidadesParaMostrar.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay unidades disponibles</p>
              <p className="text-sm mt-2">
                {accion === "agregar" 
                  ? "No hay unidades disponibles para este producto"
                  : "No hay unidades de este producto en la entrega"
                }
              </p>
            </div>
          ) : (
            <>
              {/* Actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-400">
                  {unidadesParaMostrar.length} unidad(es) {accion === "agregar" ? "disponibles" : "en entrega"}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={seleccionarTodas}
                    className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Seleccionar todas
                  </button>
                  <button
                    onClick={deseleccionarTodas}
                    className="text-xs px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Limpiar selección
                  </button>
                </div>
              </div>

              {/* Units list */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {unidadesParaMostrar.map((unidad) => (
                  <label
                    key={unidad.id}
                    className="flex items-center p-3 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors border border-slate-600"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={unidadesSeleccionadas.includes(unidad.id)}
                        onChange={() => toggleUnidad(unidad.id)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        unidadesSeleccionadas.includes(unidad.id)
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-400 bg-transparent"
                      }`}>
                        {unidadesSeleccionadas.includes(unidad.id) && (
                          <CheckCircle2 size={12} className="text-white" />
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-200">
                        Serial: {unidad.serial}
                      </div>
                      <div className="text-sm text-gray-400">
                        Estado: {unidad.estado}
                      </div>
                    </div>
                    
                    <div className={`text-xs px-2 py-1 rounded ${
                      unidad.estado === "disponible" 
                        ? "bg-green-600 text-green-100"
                        : unidad.estado === "instalacion"
                        ? "bg-yellow-600 text-yellow-100"
                        : "bg-gray-600 text-gray-100"
                    }`}>
                      {unidad.estado}
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-600 bg-slate-800">
          <div className="text-sm text-gray-400">
            {unidadesSeleccionadas.length} unidad(es) seleccionada(s)
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-300 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarSeleccion}
              disabled={unidadesSeleccionadas.length === 0 || loading}
              className={`px-6 py-2 rounded-lg transition-colors font-medium ${
                accion === "agregar"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {accion === "agregar" ? "Confirmar" : "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};