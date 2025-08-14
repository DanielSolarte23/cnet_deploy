import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Save,
} from "lucide-react";
import { useStants } from "@/context/StantContext";
import { useProductos } from "@/context/ProductosContext";
import { useCategorias } from "@/context/CategoriaContext";

export default function FormularioMultipaso({
  handleCloseModal,
  stantId,
  showNotification,
  getProductoByStantre,
  onProductoCreado,
}) {
  const { getStants, stants } = useStants();
  const { createProducto } = useProductos();
  const { getCategorias, categorias, getSubcategoriasByCategoria } =
    useCategorias();

  const [paso, setPaso] = useState(1);
  const [subcategorias, setSubcategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState(false);
  const [nuevaSubcategoria, setNuevaSubcategoria] = useState(false);
  const [unidades, setUnidades] = useState([{ serial: "", estado: "nuevo" }]);
  const [tieneSeriales, setTieneSeriales] = useState(true);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // codigo: "",
    descripcion: "",
    marca: "",
    modelo: "",
    color: "",
    unidadMedida: "unidad",
    stockMinimo: 1,
    stock: 0,
    estado: "disponible",
    SubcategoriumId: "",
    StantId: stantId,
    notas: "",
    categoria: {
      nombre: "",
    },
    subcategoria: {
      nombre: "",
      CategoriumId: "",
      crearCategoria: false,
    },
  });

  useEffect(() => {
    getStants();
    getCategorias();
  }, []);

  useEffect(() => {
    if (formData.subcategoria.CategoriumId) {
      getSubcategoriasByCategoria(formData.subcategoria.CategoriumId)
        .then((res) => {
          if (res && res.data) {
            setSubcategorias(res.data);
          } else if (res && Array.isArray(res)) {
            setSubcategorias(res);
          } else {
            setSubcategorias([]);
          }
        })
        .catch((error) => {
          console.error("Error al obtener subcategorías:", error);
          setSubcategorias([]);
        });
    } else {
      setSubcategorias([]);
    }
  }, [formData.subcategoria.CategoriumId, getSubcategoriasByCategoria]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleCategoriaChange = (e) => {
    const categoriaId = e.target.value;
    setFormData({
      ...formData,
      SubcategoriumId: "",
      subcategoria: {
        ...formData.subcategoria,
        CategoriumId: categoriaId,
      },
    });
  };

  const handleSubcategoriaChange = (e) => {
    setFormData({
      ...formData,
      SubcategoriumId: e.target.value,
    });
  };

  const handleNuevaCategoria = () => {
    setNuevaCategoria(true);
    setFormData({
      ...formData,
      subcategoria: {
        ...formData.subcategoria,
        crearCategoria: true,
      },
    });
  };

  const cancelarNuevaCategoria = () => {
    setNuevaCategoria(false);
    setFormData({
      ...formData,
      categoria: {
        nombre: "",
      },
      subcategoria: {
        ...formData.subcategoria,
        crearCategoria: false,
      },
    });
  };

  const handleNuevaSubcategoria = () => {
    setNuevaSubcategoria(true);
    setFormData({
      ...formData,
      SubcategoriumId: "",
    });
  };

  const cancelarNuevaSubcategoria = () => {
    setNuevaSubcategoria(false);
    setFormData({
      ...formData,
      subcategoria: {
        ...formData.subcategoria,
        nombre: "",
      },
    });
  };

  const agregarUnidad = () => {
    setUnidades([...unidades, { serial: "", estado: "nuevo" }]);
  };

  const eliminarUnidad = (index) => {
    const nuevasUnidades = [...unidades];
    nuevasUnidades.splice(index, 1);
    setUnidades(nuevasUnidades);
  };

  const handleUnidadChange = (index, campo, valor) => {
    const nuevasUnidades = [...unidades];
    nuevasUnidades[index][campo] = valor;
    setUnidades(nuevasUnidades);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Preparar datos para enviar
      const productoData = {
        ...formData,
      };

      // Si tiene seriales, agregar las unidades
      if (tieneSeriales && unidades.length > 0) {
        productoData.unidades = unidades;
      } else {
        // Si no tiene seriales, asegurarse de que no se envíen unidades
        delete productoData.unidades;
      }

      // Si se está usando subcategoría existente, limpiar datos de nueva categoría/subcategoría
      if (formData.SubcategoriumId && !nuevaSubcategoria) {
        delete productoData.subcategoria;
        delete productoData.categoria;
      }

      // Si no se está creando una nueva categoría, eliminar ese objeto
      if (!nuevaCategoria) {
        delete productoData.categoria;
        if (productoData.subcategoria) {
          productoData.subcategoria.crearCategoria = false;
        }
      }

      // console.log("Enviando datos:", productoData);

      // Esperar a que se complete la creación del producto
      await createProducto(productoData);

      showNotification("Producto registrado correctamente");
      // console.log("Producto registrado correctamente");
      setSuccess(true);
      resetForm();

      // Llamar a la función para recargar los productos antes de cerrar el modal
      if (onProductoCreado) {
        await onProductoCreado();
      }

      handleCloseModal();
    } catch (error) {
      // console.log(error);
      showNotification("Error al registrar producto", "error");
      setSuccess(false);
    }
  };

  const resetForm = () => {
    setPaso(1);
    setFormData({
      // codigo: "",
      descripcion: "",
      marca: "",
      modelo: "",
      color: "",
      unidadMedida: "unidad",
      stockMinimo: 1,
      stock: 0,
      estado: "disponible",
      SubcategoriumId: "",
      StantId: "",
      notas: "",
      categoria: {
        nombre: "",
      },
      subcategoria: {
        nombre: "",
        CategoriumId: "",
        crearCategoria: false,
      },
    });
    setUnidades([{ serial: "", estado: "nuevo" }]);
    setNuevaCategoria(false);
    setNuevaSubcategoria(false);
    setTieneSeriales(true);
  };

  const avanzarPaso = () => {
    if (paso < 4) {
      setPaso(paso + 1);
    }
  };

  const retrocederPaso = () => {
    if (paso > 1) {
      setPaso(paso - 1);
    }
  };

  const validarPaso1 = () => {
    if (nuevaCategoria) {
      return (
        formData.categoria.nombre.trim() !== "" &&
        formData.subcategoria.nombre.trim() !== ""
      );
    } else if (nuevaSubcategoria) {
      return (
        formData.subcategoria.CategoriumId &&
        formData.subcategoria.nombre.trim() !== ""
      );
    } else {
      return formData.SubcategoriumId;
    }
  };

  const validarPaso2 = () => {
    return (
      // formData.codigo.trim() !== "" &&
      formData.descripcion.trim() !== "" &&
      formData.marca.trim() !== "" &&
      formData.modelo.trim() !== "" &&
      formData.StantId
    );
  };

  const validarPaso3 = () => {
    if (!tieneSeriales) return true;
    if (unidades.length === 0) return false;

    return unidades.every((u) => u.serial.trim() !== "");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4 z-50">
      <div className="w-full max-w-4xl max-h-[90%] overflow-y-auto mx-auto bg-white dark:bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-md">
        <i
          onClick={() => {
            handleCloseModal();
          }}
          className="fa-solid fa-x dark:text-slate-200 text-slate-700"
        ></i>
        <h1 className="text-2xl font-bold text-center mb-6 dark:text-slate-200 text-slate-700">
          Crear Nuevo Producto
        </h1>

        {/* Indicador de pasos */}
        <div className="flex justify-between mb-10">
          <div
            className={`flex-1 text-center ${paso === 1 ? "font-bold" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                paso >= 1 ? "bg-yellow-500 text-slate-900" : "dark:bg-slate-200 bg-slate-700"
              }`}
            >
              1
            </div>
            <p className="mt-1 dark:text-slate-200 text-slate-700">Categoría</p>
          </div>
          <div className="w-full flex-1  flex items-center">
            <div
              className={`h-[0.15rem] w-full ${
                paso > 1 ? "bg-yellow-500" : "dark:bg-slate-200 bg-slate-700"
              }`}
            ></div>
          </div>
          <div
            className={`flex-1 text-center ${paso === 2 ? "font-bold" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                paso >= 2 ? "bg-yellow-500 text-slate-900" : "dark:bg-slate-200 bg-slate-700 dark:text-slate-700"
              }`}
            >
              2
            </div>
            <p className="mt-1 dark:text-slate-200 text-slate-700">Producto</p>
          </div>
          <div className="w-full flex-1 flex items-center">
            <div
              className={`h-[0.15rem] w-full ${
                paso > 2 ? "bg-yellow-500" : "dark:bg-slate-200 bg-slate-700"
              }`}
            ></div>
          </div>
          <div
            className={`flex-1 text-center ${paso === 3 ? "font-bold" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                paso >= 3 ? "bg-yellow-500 text-slate-900" : "dark:bg-slate-200 bg-slate-700 dark:text-slate-700"
              }`}
            >
              3
            </div>
            <p className="mt-1 dark:text-slate-200 text-slate-700">Seriales</p>
          </div>
          <div className="w-full flex-1 flex items-center">
            <div
              className={`h-[0.15rem] w-full ${
                paso > 3 ? "bg-yellow-500" : "dark:bg-slate-200 bg-slate-700"
              }`}
            ></div>
          </div>
          <div
            className={`flex-1 text-center ${paso === 4 ? "font-bold" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                paso >= 4 ? "bg-yellow-500 text-slate-900" : "dark:bg-slate-200 bg-slate-700 dark:text-slate-700"
              }`}
            >
              4
            </div>
            <p className="mt-1 dark:text-slate-200 text-slate-700">Confirmar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Paso 1: Selección de Categoría y Subcategoría */}
          {paso === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4 dark:text-slate-200 text-slate-700">
                Seleccione la Categoría y Subcategoría
              </h2>

              {!nuevaCategoria ? (
                <>
                  <div className="mb-4">
                    <label className="block mb-2 font-medium dark:text-slate-200 text-slate-700">Categoría:</label>
                    <div className="flex gap-4">
                      <select
                        className="w-full p-2 dark:bg-slate-900 border rounded focus:ring-0 focus:ring-slate-500 dark:text-slate-200 text-slate-700"
                        value={formData.subcategoria.CategoriumId}
                        onChange={handleCategoriaChange}
                      >
                        <option value="">Seleccione una categoría</option>
                        {categorias.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="px-4 py-2 bg-yellow-500 text-slate-950 rounded flex items-center gap-1"
                        onClick={handleNuevaCategoria}
                      >
                        <Plus size={16} /> Nueva
                      </button>
                    </div>
                  </div>

                  {formData.subcategoria.CategoriumId && (
                    <div className="mb-4">
                      {!nuevaSubcategoria ? (
                        <>
                          <label className="block mb-2 font-medium">
                            Subcategoría:
                          </label>
                          <div className="flex gap-4">
                            <select
                              className="w-full p-2 border rounded focus:ring focus:ring-slate-500 dark:bg-slate-900 dark:text-slate-200 text-slate-700"
                              value={formData.SubcategoriumId}
                              onChange={handleSubcategoriaChange}
                            >
                              <option value="">
                                Seleccione una subcategoría
                              </option>
                              {subcategorias.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                  {sub.nombre}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="px-4 py-2 bg-yellow-500 text-slate-950 rounded flex items-center gap-1"
                              onClick={handleNuevaSubcategoria}
                            >
                              <Plus size={16} /> Nueva
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <label className="block mb-2 font-medium dark:text-slate-200 text-slate-700">
                            Nueva Subcategoría:
                          </label>
                          <div className="flex gap-4">
                            <input
                              type="text"
                              className="w-full p-2 border rounded outline-none dark:text-slate-200 text-slate-700 placeholder:dark:text-slate-500 placeholder:text-slate-400 focus:border-slate-500"
                              placeholder="Nombre de la subcategoría"
                              name="subcategoria.nombre"
                              value={formData.subcategoria.nombre}
                              onChange={handleChange}
                            />
                            <button
                              type="button"
                              className="px-4 py-2 bg-red-500 text-white rounded flex items-center gap-1"
                              onClick={cancelarNuevaSubcategoria}
                            >
                              Cancelar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block mb-2 font-medium dark:text-slate-200 text-slate-700">
                      Nueva Categoría:
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        className="w-full p-2 border rounded outline-none dark:text-slate-200 text-slate-700 placeholder:dark:text-slate-500 placeholder:text-slate-400 focus:border-slate-500"
                        placeholder="Nombre de la categoría"
                        name="categoria.nombre"
                        value={formData.categoria.nombre}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-red-500 text-white rounded flex items-center gap-1"
                        onClick={cancelarNuevaCategoria}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 font-medium dark:text-slate-200 text-slate-700">
                      Nueva Subcategoría:
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded outline-none dark:text-slate-200 text-slate-700 placeholder:dark:text-slate-500 placeholder:text-slate-400 focus:border-slate-500"
                      placeholder="Nombre de la subcategoría"
                      name="subcategoria.nombre"
                      value={formData.subcategoria.nombre}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Paso 2: Datos del Producto */}
          {paso === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4 dark:text-slate-200 text-slate-700">
                Ingrese los Datos del Producto
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {/* <div>
                  <label className="block mb-1 font-medium">Código:</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-9  00"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleChange}
                    required
                  />
                </div> */}
                {/* 
                <div>
                  <label className="block mb-1 font-medium">Estante:</label>
                  <select
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-900"
                    name="StantId"
                    value={formData.StantId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un estante</option>
                    {stants.map((stant) => (
                      <option key={stant.id} value={stant.id}>
                        {stant.nombre}
                      </option>
                    ))}
                  </select>
                </div> */}

                <div className="col-span-2">
                  <label className="block mb-1 font-medium dark:text-slate-200 text-slate-700">Nombre del producto:</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded outline-none dark:text-slate-200 text-slate-700 placeholder:dark:text-slate-500 placeholder:text-slate-400 focus:border-slate-500"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium dark:text-slate-200 text-slate-700">Marca:</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded outline-none dark:text-slate-200 text-slate-700 placeholder:dark:text-slate-500 placeholder:text-slate-400 focus:border-slate-500"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium dark:text-slate-200 text-slate-700">Modelo:</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded outline-none dark:text-slate-200 text-slate-700 placeholder:dark:text-slate-500 placeholder:text-slate-400 focus:border-slate-500"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium dark:text-slate-200 text-slate-700">Color:</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded outline-none dark:text-slate-200 text-slate-700 placeholder:dark:text-slate-500 placeholder:text-slate-400 focus:border-slate-500"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium dark:text-slate-200 text-slate-700">
                    Unidad de Medida:
                  </label>
                  <select
                    className="w-full p-2 border rounded foutline-none dark:text-slate-200 text-slate-700  focus:border-slate-500 dark:bg-slate-900"
                    name="unidadMedida"
                    value={formData.unidadMedida}
                    onChange={handleChange}
                  >
                    <option value="unidad">Unidad</option>
                    <option value="metros">Metro</option>
                    <option value="kilogramos">Kilogramo</option>
                    <option value="litros">Litro</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium dark:text-slate-200 text-slate-700">
                    Stock Mínimo:
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded outline-none dark:text-slate-200 text-slate-700 placeholder:dark:text-slate-500 placeholder:text-slate-400 focus:border-slate-500"
                    name="stockMinimo"
                    value={formData.stockMinimo}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium dark:text-slate-200 text-slate-700">Estado:</label>
                  <select
                    className="w-full p-2 border rounded outline-none dark:text-slate-200 text-slate-700  focus:border-slate-500 dark:bg-slate-900"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="agotado">Agotado</option>
                    <option value="reservado">Reservado</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block mb-1 font-medium dark:text-slate-200 text-slate-700">
                    ¿El producto tiene seriales únicos?
                  </label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={tieneSeriales}
                        onChange={() => setTieneSeriales(true)}
                      />
                      <span className="dark:text-slate-200 text-slate-700">Sí, registrar seriales</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={!tieneSeriales}
                        onChange={() => setTieneSeriales(false)}
                      />
                      <span className="dark:text-slate-200 text-slate-700">No, manejar stock manualmente</span>
                    </label>
                  </div>
                </div>

                {!tieneSeriales && (
                  <div>
                    <label className="block mb-1 font-medium dark:text-slate-200 text-slate-700">
                      Stock Inicial:
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded outline-none dark:text-slate-200 text-slate-700 placeholder:dark:text-slate-500 placeholder:text-slate-400 focus:border-slate-500"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                )}

                <div className="col-span-2">
                  <label className="block mb-1 font-medium dark:text-slate-200 text-slate-700">Notas:</label>
                  <textarea
                    className="w-full p-2 border rounded outline-none dark:text-slate-200 text-slate-700 placeholder:dark:text-slate-500 placeholder:text-slate-400 focus:border-slate-500"
                    name="notas"
                    value={formData.notas}
                    onChange={handleChange}
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Seriales */}
          {paso === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4 dark:text-slate-200 text-slate-700">
                {tieneSeriales ? "Registrar Seriales" : "Sin Seriales"}
              </h2>

              {tieneSeriales ? (
                <>
                  <p className="mb-4 dark:text-slate-200 text-slate-700">
                    Agregue los seriales únicos para cada unidad del producto.
                  </p>

                  {unidades.map((unidad, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <div className="flex-1">
                        <input
                          type="text"
                          className="w-full p-2 border rounded outline-none dark:text-slate-200 text-slate-700 placeholder:dark:text-slate-500 placeholder:text-slate-400 focus:border-slate-500"
                          placeholder="Número de serial"
                          value={unidad.serial}
                          onChange={(e) =>
                            handleUnidadChange(index, "serial", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="w-32">
                        <select
                          className="w-full p-2 border rounded outline-none dark:text-slate-200 text-slate-700 dark:bg-slate-900 focus:border-slate-500"
                          value={unidad.estado}
                          onChange={(e) =>
                            handleUnidadChange(index, "estado", e.target.value)
                          }
                        >
                          <option value="nuevo">Nuevo</option>
                          <option value="usado">Usado</option>
                          <option value="reacondicionado">
                            Reacondicionado
                          </option>
                        </select>
                      </div>
                      <button
                        type="button"
                        className="p-2 text-red-500"
                        onClick={() => eliminarUnidad(index)}
                        disabled={unidades.length === 1}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}

                  <div className="mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 bg-yellow-500 text-slate-900 rounded flex items-center gap-1"
                      onClick={agregarUnidad}
                    >
                      <Plus size={16} /> Agregar Serial
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center dark:bg-slate-950 rounded">
                  <p className="dark:text-slate-200 text-slate-700 font-bold">Este producto no requiere registro de seriales.</p>
                  <p className="text-sm dark:text-slate-100 text-slate-700 mt-2">
                    El stock se manejará manualmente.
                  </p>
                  <p className="font-medium mt-4 dark:text-slate-200 text-slate-700">
                    Stock inicial: {formData.stock}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Paso 4: Confirmación */}
          {paso === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4 dark:text-slate-200 text-slate-700">
                Confirmar Datos del Producto
              </h2>

              <div className="dark:bg-slate-950 p-6 rounded border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={20} className="text-yellow-500" />
                  <span className="font-medium dark:text-slate-200 text-slate-700">
                    Verifique la información antes de guardar
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="dark:text-slate-200 text-slate-700 font-bold">Categoría:</p>
                    <p className="dark:text-slate-200 text-slate-700">
                      {nuevaCategoria
                        ? `${formData.categoria.nombre} (Nueva)`
                        : categorias.find(
                            (c) => c.id == formData.subcategoria.CategoriumId
                          )?.nombre || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="dark:text-slate-200 text-slate-700 font-bold ">Subcategoría:</p>
                    <p className="dark:text-slate-200 text-slate-500 ">
                      {nuevaSubcategoria || nuevaCategoria
                        ? `${formData.subcategoria.nombre} (Nueva)`
                        : subcategorias.find(
                            (s) => s.id == formData.SubcategoriumId
                          )?.nombre || "-"}
                    </p>
                  </div>

                  {/* <div>
                    <p className="font-medium">Código:</p>
                    <p>{formData.codigo}</p>
                  </div> */}

                  <div>
                    <p className="dark:text-slate-200 text-slate-700 font-bold">Estante:</p>
                    <p className="dark:text-slate-200 text-slate-500">
                      {stants.find((s) => s.id == formData.StantId)?.nombre ||
                        "-"}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="dark:text-slate-200 text-slate-700 font-bold">Descripción:</p>
                    <p className="dark:text-slate-200 text-slate-500">{formData.descripcion}</p>
                  </div>

                  <div>
                    <p className="dark:text-slate-200 text-slate-700 font-bold">Marca:</p>
                    <p className="dark:text-slate-200 text-slate-500">{formData.marca}</p>
                  </div>

                  <div>
                    <p className="dark:text-slate-200 text-slate-700 font-bold">Modelo:</p>
                    <p className="dark:text-slate-200 text-slate-500">{formData.modelo}</p>
                  </div>

                  <div>
                    <p className="dark:text-slate-200 text-slate-700 font-bold">Color:</p>
                    <p className="dark:text-slate-200 text-slate-500">{formData.color}</p>
                  </div>

                  <div>
                    <p className="dark:text-slate-200 text-slate-700 font-bold">Stock Mínimo:</p>
                    <p className="dark:text-slate-200 text-slate-500">{formData.stockMinimo}</p>
                  </div>

                  <div>
                    <p className="dark:text-slate-200 text-slate-700 font-bold">Unidades con serial:</p>
                    <p className="dark:text-slate-200 text-slate-500">
                      {tieneSeriales
                        ? `${unidades.length} unidades`
                        : "No aplica"}
                    </p>
                  </div>

                  <div>
                    <p className="dark:text-slate-200 text-slate-700 font-bold">Stock:</p>
                    <p className="dark:text-slate-200 text-slate-500">{tieneSeriales ? unidades.length : formData.stock}</p>
                  </div>

                  {tieneSeriales && unidades.length > 0 && (
                    <div className="col-span-2 mt-2">
                      <p className="dark:text-slate-200 text-slate-700 font-bold">Seriales:</p>
                      <ul className="ml-4 list-disc">
                        {unidades
                          .map((u, idx) => (
                            <li key={idx}>
                              {u.serial} ({u.estado})
                            </li>
                          ))
                          .slice(0, 5)}
                        {unidades.length > 5 && (
                          <li>Y {unidades.length - 5} más...</li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="col-span-2">
                    <p className="dark:text-slate-200 text-slate-700 font-bold">Notas:</p>
                    <p className="dark:text-slate-200 text-slate-500">{formData.notas || "No hay notas adicionales"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="mt-8 flex justify-between">
            {paso > 1 && (
              <button
                type="button"
                className="px-4 py-2 bg-gray-500 text-white rounded flex items-center gap-1"
                onClick={retrocederPaso}
              >
                <ChevronLeft size={16} /> Anterior
              </button>
            )}

            {paso < 4 && (
              <button
                type="button"
                className={`px-4 py-2 rounded flex items-center gap-1 ml-auto ${
                  (paso === 1 && validarPaso1()) ||
                  (paso === 2 && validarPaso2()) ||
                  (paso === 3 && validarPaso3())
                    ? "bg-slate-900 text-white"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                onClick={avanzarPaso}
                disabled={
                  (paso === 1 && !validarPaso1()) ||
                  (paso === 2 && !validarPaso2()) ||
                  (paso === 3 && !validarPaso3())
                }
              >
                Siguiente <ChevronRight size={16} />
              </button>
            )}

            {paso === 4 && (
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-1 ml-auto"
              >
                <Save size={16} /> Guardar Producto
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
