import { useState, useEffect, useContext } from "react";
import {
  Plus,
  Minus,
  Save,
  Trash2,
  Info,
  X,
  AlertCircle,
  Package,
  Clipboard,
  CheckCircle,
} from "lucide-react";
import { useProductos } from "@/context/ProductosContext";

// Modal de Confirmación
function ModalConfirmacion({ 
  isOpen, 
  onClose, 
  onConfirm, 
  producto, 
  cantidad, 
  seriales, 
  usaSeriales 
}) {
  if (!isOpen) return null;

  const stockActual = producto?.stock || 0;
  const stockFinal = stockActual + cantidad;
  const operacion = cantidad > 0 ? "incrementar" : "decrementar";
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 p-4 z-[60]">
      <div className="bg-slate-950 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-200">
            Confirmar Ajuste de Stock
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6 space-y-3">
          <div className="bg-slate-900 p-4 rounded-md">
            <h4 className="font-medium text-gray-100 mb-2">Producto:</h4>
            <p className="text-gray-500">{producto?.descripcion}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-3 rounded-md">
              <p className="text-sm text-blue-300 font-medium">Stock Actual</p>
              <p className="text-lg font-bold text-blue-300">{stockActual}</p>
            </div>
            <div className={`p-3 rounded-md ${
              stockFinal >= 0 ? 'bg-slate-900' : 'bg-red-950'
            }`}>
              <p className={`text-sm font-medium ${
                stockFinal >= 0 ? 'text-green-200' : 'text-red-200'
              }`}>
                Stock Final
              </p>
              <p className={`text-lg font-bold ${
                stockFinal >= 0 ? 'text-green-200' : 'text-red-200'
              }`}>
                {stockFinal}
              </p>
            </div>
          </div>
          
          <div className="bg-slate-900 p-3 rounded-md">
            <p className="text-sm text-slate-200 font-medium">Operación</p>
            <p className="text-yellow-500">
              {operacion === "incrementar" ? "+" : ""}{cantidad} unidades
            </p>
          </div>
          
          {usaSeriales && seriales.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600 font-medium mb-2">
                {cantidad > 0 ? "Seriales a agregar:" : "Seriales a eliminar:"}
              </p>
              <div className="max-h-20 overflow-y-auto">
                <ul className="text-sm text-gray-700 space-y-1">
                  {seriales.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      {typeof item === 'string' ? item : item.serial}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {stockFinal < 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Advertencia:</strong> El stock resultante será negativo.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-md transition duration-200 flex items-center"
          >
            <CheckCircle className="mr-2" size={16} />
            Confirmar Ajuste
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FormStock({
  producto,
  handleCloseModalStock,
  showNotification,
}) {
  // Estados para el formulario
  const [cantidad, setCantidad] = useState(0);
  const [modo, setModo] = useState("simple"); // 'simple', 'addSeriales', 'removeSeriales'
  const [seriales, setSeriales] = useState([]);
  const [serialActual, setSerialActual] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Estado para el modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Obtener la función updateStock del contexto
  const { updateStock } = useProductos();

  // Determinar si el producto usa seriales
  const [usaSeriales, setUsaSeriales] = useState(false);

  useEffect(() => {
    setUsaSeriales(producto?.ProductoUnidads?.length > 0);
  }, [producto]);

  // Función para agregar un serial a la lista
  const agregarSerial = () => {
    if (!serialActual.trim()) {
      setError("El serial no puede estar vacío");
      return;
    }

    if (seriales.some((s) => s.serial === serialActual)) {
      setError("Este serial ya ha sido agregado");
      return;
    }

    setSeriales([...seriales, { serial: serialActual, estado: "nuevo" }]);
    setSerialActual("");
    setError("");
  };

  // Función para eliminar un serial de la lista
  const eliminarSerial = (serial) => {
    setSeriales(seriales.filter((s) => s.serial !== serial));
  };

  // Función para cambiar el modo según la operación
  const cambiarModo = (nuevaCantidad) => {
    // Asegurarse de que nuevaCantidad sea un número entero válido
    const cantidadValidada = Number.isInteger(nuevaCantidad)
      ? nuevaCantidad
      : 0;

    setCantidad(cantidadValidada);

    if (!usaSeriales) {
      setModo("simple");
      return;
    }

    if (cantidadValidada > 0) {
      setModo("addSeriales");
      setSeriales([]);
    } else if (cantidadValidada < 0) {
      setModo("removeSeriales");
      setSeriales([]);
    } else {
      setModo("simple");
    }
  };

  // Función para validar el formulario antes de mostrar la confirmación
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError("");

    try {
      // Validar que cantidad sea un número válido
      if (isNaN(cantidad) || !Number.isInteger(cantidad)) {
        throw new Error("La cantidad debe ser un número entero válido");
      }

      // Validaciones existentes
      if (cantidad === 0) {
        throw new Error("La cantidad no puede ser cero");
      }

      if (usaSeriales && cantidad > 0 && seriales.length !== cantidad) {
        throw new Error(`Debe ingresar ${cantidad} seriales`);
      }

      if (
        usaSeriales &&
        cantidad < 0 &&
        seriales.length !== Math.abs(cantidad)
      ) {
        throw new Error(
          `Debe seleccionar ${Math.abs(cantidad)} seriales para eliminar`
        );
      }

      // Asegurarse de que no quede stock negativo si es una reducción
      if (cantidad < 0 && !usaSeriales && producto.stock + cantidad < 0) {
        throw new Error("El stock resultante no puede ser negativo");
      }

      // Si todas las validaciones pasan, mostrar el modal de confirmación
      setShowConfirmModal(true);
    } catch (err) {
      setError(err.message || "Ha ocurrido un error en la validación");
    }
  };

  // Función para manejar el envío confirmado
  const handleConfirmedSubmit = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      // Preparar los datos para la API
      let dataToSend = { cantidad };

      if (usaSeriales && cantidad > 0) {
        dataToSend.unidades = seriales;
      }

      if (usaSeriales && cantidad < 0) {
        dataToSend.eliminarSeriales = seriales.map((s) => s.serial);
      }

      // Llamar a la función del contexto
      await updateStock(producto.id, dataToSend);

      // Mostrar mensaje de éxito y resetear formulario
      showNotification("Stock ajustado correctamente");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setCantidad(0);
      setSeriales([]);
      setModo("simple");
      handleCloseModalStock();
    } catch (err) {
      setError(err.message || "Ha ocurrido un error al ajustar el stock");
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar seriales existentes (para el caso de reducción)
  const buscarSerialesExistentes = async () => {
    setLoading(true);
    try {
      // Aquí se implementaría la lógica para obtener los seriales existentes
      // Por ejemplo, una llamada a la API para obtener las unidades del producto
      // Por ahora, simulamos algunos seriales
      const seriatesDummy = [
        { serial: "SN001", estado: "usado" },
        { serial: "SN002", estado: "nuevo" },
        { serial: "SN003", estado: "nuevo" },
      ];
      setSeriales(seriatesDummy);
    } catch (err) {
      setError("Error al cargar los seriales existentes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4 z-50">
        <div className="dark:bg-slate-900 bg-white border border-slate-700 rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <div className="w-full flex justify-end">
            <button
              onClick={handleCloseModalStock}
              className="text-gray-400 hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
          <h2 className="text-xl font-bold mb-4 flex items-center dark:text-slate-200 text-slate-700">
            <Package className="mr-2" size={20} />
            Ajuste de Stock: {producto?.nombre}
          </h2>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 flex items-start">
              <AlertCircle
                className="text-red-500 mr-2 flex-shrink-0"
                size={20}
              />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <p className="text-green-700">Stock ajustado correctamente</p>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Selector de cantidad */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 dark:text-slate-200 text-slate-700 font-bold">
                Ajuste de cantidad
              </label>
              <div className="flex items-center border rounded-md overflow-hidden">
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-950 hover:bg-yellow-500 transition duration-300"
                  onClick={() => cambiarModo(cantidad - 1)}
                >
                  <Minus size={18} />
                </button>

                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => {
                    // Convertir a entero o usar 0 si no es un número válido
                    const val =
                      e.target.value === "" ? 0 : parseInt(e.target.value);
                    cambiarModo(isNaN(val) ? 0 : val);
                  }}
                  className="w-full px-4 py-2 text-center focus:outline-none dark:text-slate-200 text-slate-700"
                  aria-label="Cantidad"
                />

                <button
                  type="button"
                  className="px-4 py-2 bg-slate-950 hover:bg-yellow-500 transition duration-300"
                  onClick={() => cambiarModo(cantidad + 1)}
                >
                  <Plus size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-400 dark:text-slate-200 text-slate-700 ">
                Stock actual:{" "}
                <span className="font-medium dark:text-slate-200 text-slate-700">{producto?.stock || 0}</span>{" "}
                unidades
              </p>
            </div>

            {/* Sección para productos con seriales */}
            {usaSeriales && modo === "addSeriales" && cantidad > 0 && (
              <div className="space-y-4 border-t border-slate-600 pt-4">
                <h3 className="text-lg font-medium text-white">
                  Agregar nuevos seriales ({seriales.length}/{cantidad})
                </h3>

                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <div className="flex">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={serialActual}
                          onChange={(e) => setSerialActual(e.target.value)}
                          className="w-full px-4 py-2 border rounded-l-md outline-none dark:text-slate-200 text-slate-700 placeholder:dark:text-slate-500 placeholder:text-slate-700 focus:border-slate-500"
                          placeholder="Ingresar serial..."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={agregarSerial}
                        className="px-4 py-2 bg-yellow-500 text-slate-950 rounded-r-md hover:bg-yellow-400 focus:outline-none"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de seriales agregados */}
                {seriales.length > 0 && (
                  <div className="mt-4 max-h-60 overflow-y-auto border border-slate-600 rounded-md">
                    <ul className="divide-y divide-slate-600">
                      {seriales.map((item, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 flex justify-between items-center dark:text-slate-200 text-slate-700 "
                        >
                          <div>
                            <span className="font-medium">{item.serial}</span>
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              {item.estado}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarSerial(item.serial)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X size={18} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Sección para eliminar seriales existentes */}
            {usaSeriales && modo === "removeSeriales" && cantidad < 0 && (
              <div className="space-y-4 border-t border-slate-600 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium dark:text-slate-200 text-slate-700">
                    Seleccionar seriales a eliminar ({seriales.length}/
                    {Math.abs(cantidad)})
                  </h3>
                  <button
                    type="button"
                    onClick={buscarSerialesExistentes}
                    className="px-3 py-1 bg-slate-700 text-gray-300 rounded-md hover:bg-slate-600 focus:outline-none text-sm flex items-center"
                  >
                    <Info className="mr-1" size={16} />
                    Cargar seriales
                  </button>
                </div>

                {/* Lista de seriales para eliminar */}
                {seriales.length > 0 && (
                  <div className="mt-4 max-h-60 overflow-y-auto border border-slate-600 rounded-md">
                    <ul className="divide-y divide-slate-600">
                      {seriales.map((item, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 flex justify-between items-center dark:text-slate-200 text-slate-700 "
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`serial-${index}`}
                              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={true}
                              onChange={() => eliminarSerial(item.serial)}
                            />
                            <label htmlFor={`serial-${index}`} className="flex-1">
                              <span className="font-medium">{item.serial}</span>
                              <span className="ml-2 text-xs bg-gray-600 text-gray-200 px-2 py-0.5 rounded">
                                {item.estado}
                              </span>
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarSerial(item.serial)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Mensaje para productos sin seriales */}
            {!usaSeriales && cantidad !== 0 && (
              <div className="flex items-center p-4 border dark:border-0 dark:bg-slate-800 rounded-md">
                <Info className="text-yellow-500 mr-2" size={20} />
                <p className="dark:text-slate-200 text-slate-700">
                  Este producto no utiliza seriales. El stock se ajustará
                  directamente.
                </p>
              </div>
            )}

            {/* Botón de envío */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  loading ||
                  cantidad === 0 ||
                  (usaSeriales &&
                    ((cantidad > 0 && seriales.length !== cantidad) ||
                      (cantidad < 0 && seriales.length !== Math.abs(cantidad))))
                }
                className={`px-6 py-2 rounded-md flex items-center ${
                  loading ||
                  cantidad === 0 ||
                  (usaSeriales &&
                    ((cantidad > 0 && seriales.length !== cantidad) ||
                      (cantidad < 0 && seriales.length !== Math.abs(cantidad))))
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-slate-600 hover:bg-slate-700 text-white"
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  <>
                    <Save className="mr-2" size={18} />
                    Guardar ajuste
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Confirmación */}
      <ModalConfirmacion
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmedSubmit}
        producto={producto}
        cantidad={cantidad}
        seriales={seriales}
        usaSeriales={usaSeriales}
      />
    </>
  );
}