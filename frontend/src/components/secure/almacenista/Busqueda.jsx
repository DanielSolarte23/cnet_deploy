'use client'
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Package,
  Tag,
  Settings,
  X,
  Clock,
  TrendingUp,
} from "lucide-react";

const BusquedaRapida = ({
  onProductoSeleccionado,
  mostrarUnidades = false,
}) => {
  const [termino, setTermino] = useState("");
  const [resultados, setResultados] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [historialBusquedas, setHistorialBusquedas] = useState([]);

  const inputRef = useRef(null);
  const contenedorRef = useRef(null);
  const timeoutRef = useRef(null);

  // Cargar historial desde localStorage al montar
  useEffect(() => {
    const historial = localStorage.getItem("historialBusquedas");
    if (historial) {
      setHistorialBusquedas(JSON.parse(historial));
    }
  }, []);

  // Manejar clicks fuera del componente
  useEffect(() => {
    const manejarClickFuera = (event) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(event.target)
      ) {
        setMostrarResultados(false);
        setMostrarSugerencias(false);
      }
    };

    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  // Función para realizar búsqueda
  const realizarBusqueda = async (terminoBusqueda) => {
    if (!terminoBusqueda.trim()) {
      setResultados([]);
      setMostrarResultados(false);
      return;
    }

    setCargando(true);
    setMostrarSugerencias(false);

    try {
      const params = new URLSearchParams({
        q: terminoBusqueda,
        limite: "10",
        incluirUnidades: mostrarUnidades.toString(),
      });

      const response = await fetch(`http://172.16.110.74:3004/api/productos/busqueda-rapida?${params}`);
      const data = await response.json();

      if (data.success) {
        setResultados(data.data);
        setEstadisticas(data.estadisticas);
        setMostrarResultados(true);

        // Agregar al historial
        agregarAlHistorial(terminoBusqueda);
      } else {
        console.error("Error en búsqueda:", data.message);
        setResultados([]);
      }
    } catch (error) {
      console.error("Error realizando búsqueda:", error);
      setResultados([]);
    } finally {
      setCargando(false);
    }
  };

  // Función para obtener sugerencias
  const obtenerSugerencias = async (terminoBusqueda) => {
    if (terminoBusqueda.length < 2) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        q: terminoBusqueda,
        limite: "5",
      });

      const response = await fetch(`http://172.16.110.74:3004/api/productos/sugerencias?${params}`);
      const data = await response.json();

      if (data.success) {
        setSugerencias(data.data);
        setMostrarSugerencias(true);
        setMostrarResultados(false);
      }
    } catch (error) {
      console.error("Error obteniendo sugerencias:", error);
    }
  };

  // Manejar cambios en el input
  const manejarCambioInput = (e) => {
    const valor = e.target.value;
    setTermino(valor);

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Si está vacío, limpiar todo
    if (!valor.trim()) {
      setSugerencias([]);
      setResultados([]);
      setMostrarSugerencias(false);
      setMostrarResultados(false);
      return;
    }

    // Debounce para sugerencias
    timeoutRef.current = setTimeout(() => {
      obtenerSugerencias(valor);
    }, 300);
  };

  // Manejar envío del formulario
  const manejarEnvio = (e) => {
    e.preventDefault();
    if (termino.trim()) {
      realizarBusqueda(termino);
    }
  };

  // Agregar al historial de búsquedas
  const agregarAlHistorial = (terminoBusqueda) => {
    const nuevoHistorial = [
      terminoBusqueda,
      ...historialBusquedas.filter((item) => item !== terminoBusqueda),
    ].slice(0, 5);
    setHistorialBusquedas(nuevoHistorial);
    localStorage.setItem("historialBusquedas", JSON.stringify(nuevoHistorial));
  };

  // Limpiar búsqueda
  const limpiarBusqueda = () => {
    setTermino("");
    setResultados([]);
    setSugerencias([]);
    setMostrarResultados(false);
    setMostrarSugerencias(false);
    setEstadisticas(null);
    inputRef.current?.focus();
  };

  // Seleccionar sugerencia
  const seleccionarSugerencia = (sugerencia) => {
    setTermino(sugerencia.valor);
    setSugerencias([]);
    setMostrarSugerencias(false);
    realizarBusqueda(sugerencia.valor);
  };

  // Seleccionar producto
  const seleccionarProducto = (item) => {
    setMostrarResultados(false);
    if (onProductoSeleccionado) {
      onProductoSeleccionado(item);
    }
  };

  // Obtener icono según tipo
  const obtenerIcono = (tipo) => {
    switch (tipo) {
      case "codigo":
        return <Tag className="w-4 h-4" />;
      case "descripcion":
        return <Package className="w-4 h-4" />;
      case "marca":
        return <Package className="w-4 h-4" />;
      case "modelo":
        return <Settings className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // Resaltar texto coincidente
  const resaltarTexto = (texto, termino) => {
    if (!texto || !termino) return texto;

    const regex = new RegExp(`(${termino})`, "gi");
    const partes = texto.split(regex);

    return partes.map((parte, index) =>
      regex.test(parte) ? (
        <span
          key={index}
          className="bg-yellow-200 text-yellow-800 px-1 rounded"
        >
          {parte}
        </span>
      ) : (
        parte
      )
    );
  };

  return (
    <div ref={contenedorRef} className="relative w-full max-w-2xl mx-auto">
      {/* Contenedor de búsqueda */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={termino}
            onChange={manejarCambioInput}
            onKeyDown={(e) => e.key === "Enter" && manejarEnvio(e)}
            placeholder="Buscar por código, descripción, marca, modelo o serial..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
            autoComplete="off"
          />
          {termino && (
            <button
              type="button"
              onClick={limpiarBusqueda}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Indicador de carga */}
      {cargando && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Buscando...</span>
          </div>
        </div>
      )}

      {/* Sugerencias */}
      {mostrarSugerencias && sugerencias.length > 0 && !cargando && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 mb-2 px-2">Sugerencias</div>
            {sugerencias.map((sugerencia, index) => (
              <button
                key={index}
                onClick={() => seleccionarSugerencia(sugerencia)}
                className="w-full flex items-center space-x-2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-left"
              >
                {obtenerIcono(sugerencia.tipo)}
                <span className="text-sm">{sugerencia.valor}</span>
                <span className="text-xs text-gray-400 ml-auto capitalize">
                  {sugerencia.tipo}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Historial de búsquedas */}
      {/* {!termino && historialBusquedas.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs text-gray-500 mb-2 px-2 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Búsquedas recientes
            </div>
            {historialBusquedas.map((busqueda, index) => (
              <button
                key={index}
                onClick={() => {
                  setTermino(busqueda);
                  realizarBusqueda(busqueda);
                }}
                className="w-full flex items-center space-x-2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-left"
              >
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{busqueda}</span>
              </button>
            ))}
          </div>
        </div>
      )} */}

      {/* Resultados de búsqueda */}
      {mostrarResultados && resultados.length > 0 && !cargando && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Estadísticas */}
          {estadisticas && (
            <div className="p-3 border-b border-gray-100">
              <div className="text-sm text-gray-200">
                {estadisticas.totalEncontrados} resultado
                {estadisticas.totalEncontrados !== 1 ? "s" : ""}
                {estadisticas.productos > 0 &&
                  ` • ${estadisticas.productos} producto${
                    estadisticas.productos !== 1 ? "s" : ""
                  }`}
                {estadisticas.unidadesPorSerial > 0 &&
                  ` • ${estadisticas.unidadesPorSerial} por serial`}
              </div>
            </div>
          )}

          {/* Lista de resultados */}
          <div className="p-2">
            {resultados.map((item, index) => (
              <div
                key={index}
                className="border-b border-gray-100 last:border-b-0"
              >
                {item.tipoResultado === "producto" ? (
                  <button
                    onClick={() => seleccionarProducto(item)}
                    className="w-full p-3 hover:bg-slate-800 transition-colors text-left rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Package className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium text-sm">
                            {resaltarTexto(item.codigo, termino)}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              item.stockDisponible > 0 
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.stockDisponible > 0
                              ? "Disponible"
                              : "Agotado"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-200 mb-1">
                          {resaltarTexto(item.descripcion, termino)}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-300">
                          {item.marca && (
                            <span>
                              Marca: {resaltarTexto(item.marca, termino)}
                            </span>
                          )}
                          {item.modelo && (
                            <span>
                              Modelo: {resaltarTexto(item.modelo, termino)}
                            </span>
                          )}
                          {item.Stant && (
                            <span>Estante: {item.Stant.nombre}</span>
                          )}
                        </div>
                        {item.Subcategorium && (
                          <div className="text-xs text-gray-300 mt-1">
                            {item.Subcategorium.Categorium?.nombre} →{" "}
                            {item.Subcategorium.nombre}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium text-blue-600">
                          {item.stockDisponible} disponible
                          {item.stockDisponible !== 1 ? "s" : ""}
                        </div>
                        {mostrarUnidades &&
                          item.stockTotal > item.stockDisponible && (
                            <div className="text-xs text-gray-500">
                              {item.stockTotal} total
                            </div>
                          )}
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => seleccionarProducto(item)}
                    className="w-full p-3 hover:bg-slate-800 transition-colors text-left rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Tag className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-sm">
                            Serial: {resaltarTexto(item.serial, termino)}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full capitalize ${
                              ["nuevo", "usado"].includes(item.estado)
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.estado}
                          </span>
                        </div>
                        <div className="text-sm text-gray-200 mb-1">
                          {item.Producto?.descripcion}
                        </div>
                        <div className="text-xs text-gray-300">
                          Código: {item.Producto?.codigo}
                        </div>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje sin resultados */}
      {mostrarResultados && resultados.length === 0 && !cargando && termino && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-gray-700 rounded-lg shadow-lg z-50 p-4">
          <div className="text-center text-gray-500">
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">
              No se encontraron resultados para "{termino}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusquedaRapida;
