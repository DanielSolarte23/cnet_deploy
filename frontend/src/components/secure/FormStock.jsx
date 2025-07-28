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
} from "lucide-react";
import { useProductos } from "@/context/ProductosContext";

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

  // Función para manejar el envío del formulario
  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
      // console.log("Stock ajustado correctamente", dataToSend);
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="w-full flex justify-end">
          <i
            onClick={() => {
              handleCloseModalStock();
            }}
            className="fa-solid fa-x"
          ></i>
        </div>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Package className="mr-2" size={20} />
          Ajuste de Stock: {producto?.nombre}
        </h2>

        {/* {error && (
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
        )} */}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selector de cantidad */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
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
                className="w-full px-4 py-2 text-center focus:outline-none"
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

            <p className="text-sm text-gray-500">
              Stock actual:{" "}
              <span className="font-medium">{producto?.stock || 0}</span>{" "}
              unidades
            </p>
          </div>

          {/* Sección para productos con seriales */}
          {usaSeriales && modo === "addSeriales" && cantidad > 0 && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">
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
                        className="w-full px-4 py-2 border rounded-l-md focus:ring-slate-900 focus:border-slate-900"
                        placeholder="Ingresar serial..."
                      />
                      <X
                        className="absolute right-3 top-2.5 text-gray-400"
                        size={18}
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
                <div className="mt-4 max-h-60 overflow-y-auto border rounded-md">
                  <ul className="divide-y">
                    {seriales.map((item, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 flex justify-between items-center"
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
                          className="text-red-500 hover:text-red-700"
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
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Seleccionar seriales a eliminar ({seriales.length}/
                  {Math.abs(cantidad)})
                </h3>
                <button
                  type="button"
                  onClick={buscarSerialesExistentes}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none text-sm flex items-center"
                >
                  <Info className="mr-1" size={16} />
                  Cargar seriales
                </button>
              </div>

              {/* Lista de seriales para eliminar */}
              {seriales.length > 0 && (
                <div className="mt-4 max-h-60 overflow-y-auto border rounded-md">
                  <ul className="divide-y">
                    {seriales.map((item, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 flex justify-between items-center"
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
                            <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                              {item.estado}
                            </span>
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => eliminarSerial(item.serial)}
                          className="text-red-500 hover:text-red-700"
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
            <div className="flex items-center p-4 bg-slate-950 rounded-md">
              <Info className="text-yellow-500 mr-2" size={20} />
              <p className="text-white">
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
                  ? "bg-gray-300 cursor-not-allowed"
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
  );
}
