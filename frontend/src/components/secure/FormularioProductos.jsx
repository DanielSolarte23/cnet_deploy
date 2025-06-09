"use client";
import { useState, useEffect, useRef } from "react";
import {
  AlertCircle,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Save,
} from "lucide-react";
import { useCategorias } from "@/context/CategoriaContext";
import { useProductos } from "@/context/ProductosContext";
import { useStants } from "@/context/StantContext";

export default function ProductForm() {
  const {
    categorias,
    getCategorias,
    getSubcategoriasByCategoria,
  } = useCategorias();
  const { productos, createProducto } = useProductos();
  const { stants, getStants } = useStants();
  useEffect(() => {
    getCategorias();
    getStants();
  }, []);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [subcategories, setSubcategories] = useState([]);

  // Estado para la categoría y subcategoría
  const [categoryStep, setCategoryStep] = useState({
    selectedCategoryId: "",
    selectedSubcategoryId: "",
    newCategory: { nombre: "" },
    newSubcategory: { nombre: "", CategoriumId: "", crearCategoria: false },
    isCreatingCategory: false,
    isCreatingSubcategory: false,
    StantId: "",
  });

  // Estado para el producto
  const [product, setProduct] = useState({
    codigo: "",
    descripcion: "",
    marca: "",
    modelo: "",
    color: "",
    unidadMedida: "",
    stock: 0,
    stockMinimo: 0,
    fechaIngreso: new Date().toISOString().split("T")[0],
    estado: "disponible",
    notas: "",
    SubcategoriumId: "",
    StantId: "",
    tieneSerialesUnicos: false,
  });

  // Estado para las unidades con serial
  const [units, setUnits] = useState([{ serial: "", estado: "nuevo" }]);

  // Ref para controlar que los datos iniciales se carguen solo una vez
  const initialDataLoaded = useRef(false);

  // useEffect para cargar datos iniciales solo una vez
  useEffect(() => {
    if (!initialDataLoaded.current) {
      const fetchInitialData = async () => {
        try {
          await getCategorias();
          await getStants();
          initialDataLoaded.current = true;
        } catch (error) {
          setMessage({
            type: "error",
            text: "Error al cargar datos iniciales: " + error.message,
          });
        }
      };

      fetchInitialData();
    }
  }, []);

  // Mismo enfoque para cargar subcategorías
  const prevSelectedCategoryId = useRef(null);

  useEffect(() => {
    // Solo ejecutar si la categoría cambió
    if (
      categoryStep.selectedCategoryId &&
      categoryStep.selectedCategoryId !== prevSelectedCategoryId.current
    ) {
      const fetchSubcategories = async () => {
        try {
          const subcategoriesData = await getSubcategoriasByCategoria(
            categoryStep.selectedCategoryId
          );
          setSubcategories(subcategoriesData);
          prevSelectedCategoryId.current = categoryStep.selectedCategoryId;
        } catch (error) {
          setMessage({
            type: "error",
            text: "Error al cargar subcategorías: " + error.message,
          });
        }
      };

      fetchSubcategories();
    } else if (!categoryStep.selectedCategoryId) {
      setSubcategories([]);
      prevSelectedCategoryId.current = null;
    }
  }, [categoryStep.selectedCategoryId]);

  // Manejar cambios en el formulario de categoría/subcategoría
  const handleCategoryStepChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setCategoryStep({
        ...categoryStep,
        newSubcategory: {
          ...categoryStep.newSubcategory,
          crearCategoria: checked,
        },
      });
    } else if (name === "selectedCategoryId") {
      // Si se está seleccionando una categoría, actualizar también el CategoriumId
      // de la nueva subcategoría (si estamos en modo de creación)
      setCategoryStep({
        ...categoryStep,
        [name]: value,
        newSubcategory: {
          ...categoryStep.newSubcategory,
          CategoriumId: value ? parseInt(value, 10) : "", // Asegurar que sea un número o string vacío
        },
      });
    } else {
      setCategoryStep({
        ...categoryStep,
        [name]: value,
      });
    }
  };

  // Manejar cambios en inputs anidados
  const handleNestedChange = (e, parent) => {
    const { name, value } = e.target;

    setCategoryStep({
      ...categoryStep,
      [parent]: {
        ...categoryStep[parent],
        [name]: value,
      },
    });
  };

  // Manejar cambios en el formulario de producto
  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setProduct({
        ...product,
        [name]: checked,
      });
    } else if (name === "stock" || name === "stockMinimo") {
      setProduct({
        ...product,
        [name]: value === "" ? "" : parseInt(value, 10),
      });
    } else {
      setProduct({
        ...product,
        [name]: value,
      });
    }
  };

  // Manejar cambio en unidades con serial
  const handleUnitChange = (index, e) => {
    const { name, value } = e.target;
    const updatedUnits = [...units];
    updatedUnits[index] = {
      ...updatedUnits[index],
      [name]: value,
    };
    setUnits(updatedUnits);
  };

  // Agregar nueva unidad con serial
  const addUnit = () => {
    setUnits([...units, { serial: "", estado: "nuevo" }]);
  };

  // Eliminar unidad con serial
  const removeUnit = (index) => {
    const updatedUnits = units.filter((_, i) => i !== index);
    setUnits(updatedUnits);
  };

  // Cambiar al modo de creación de nueva categoría
  const toggleCreateCategory = () => {
    setCategoryStep({
      ...categoryStep,
      isCreatingCategory: !categoryStep.isCreatingCategory,
      newCategory: { nombre: "" },
    });
  };

  // Cambiar al modo de creación de nueva subcategoría
  const toggleCreateSubcategory = () => {
    // Si estamos activando el modo de creación de subcategoría,
    // asegurarse de que el CategoriumId se establezca correctamente
    const newSubcategory = {
      nombre: "",
      CategoriumId: categoryStep.selectedCategoryId
        ? parseInt(categoryStep.selectedCategoryId, 10)
        : "",
      crearCategoria: false,
    };

    setCategoryStep({
      ...categoryStep,
      isCreatingSubcategory: !categoryStep.isCreatingSubcategory,
      newSubcategory: !categoryStep.isCreatingSubcategory
        ? newSubcategory
        : { nombre: "", CategoriumId: "", crearCategoria: false },
    });
  };

  // Avanzar al siguiente paso
  const nextStep = () => {
    if (step === 1) {
      // Validar paso 1
      if (
        !categoryStep.isCreatingSubcategory &&
        !categoryStep.selectedSubcategoryId
      ) {
        setMessage({
          type: "error",
          text: "Debe seleccionar una subcategoría o crear una nueva",
        });
        return;
      }
      if (
        categoryStep.isCreatingSubcategory &&
        !categoryStep.newSubcategory.nombre
      ) {
        setMessage({
          type: "error",
          text: "Debe ingresar un nombre para la nueva subcategoría",
        });
        return;
      }
      if (
        categoryStep.newSubcategory.crearCategoria &&
        !categoryStep.newCategory.nombre
      ) {
        setMessage({
          type: "error",
          text: "Debe ingresar un nombre para la nueva categoría",
        });
        return;
      }
      if (!categoryStep.StantId) {
        setMessage({ type: "error", text: "Debe seleccionar un estante" });
        return;
      }

      // Actualizar el producto con los datos de la categoría
      setProduct({
        ...product,
        SubcategoriumId: categoryStep.selectedSubcategoryId,
        StantId: categoryStep.StantId,
      });

      setMessage({ type: "", text: "" });
    }

    if (step === 2) {
      // Validar paso 2
      if (!product.codigo || !product.descripcion) {
        setMessage({
          type: "error",
          text: "El código y la descripción son obligatorios",
        });
        return;
      }

      // Si no tiene seriales, actualizar el stock
      if (
        !product.tieneSerialesUnicos &&
        (product.stock <= 0 || isNaN(product.stock))
      ) {
        setMessage({
          type: "error",
          text: "Debe ingresar una cantidad válida de stock",
        });
        return;
      }

      setMessage({ type: "", text: "" });
    }

    setStep(step + 1);
  };

  // Retroceder al paso anterior
  const prevStep = () => {
    setStep(step - 1);
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Construir el objeto base para enviar a la API
      const requestData = {
        codigo: product.codigo,
        descripcion: product.descripcion,
        marca: product.marca,
        modelo: product.modelo,
        color: product.color,
        unidadMedida: product.unidadMedida,
        stockMinimo: parseInt(product.stockMinimo, 10) || 0,
        fechaIngreso: product.fechaIngreso,
        estado: product.estado,
        notas: product.notas,
        StantId: parseInt(categoryStep.StantId, 10),
      };

      // Caso 1: Se está creando una nueva subcategoría con una nueva categoría
      if (
        categoryStep.isCreatingSubcategory &&
        categoryStep.newSubcategory.crearCategoria
      ) {
        // Incluir datos de nueva categoría
        requestData.categoria = {
          nombre: categoryStep.newCategory.nombre,
        };

        // Incluir datos de nueva subcategoría (sin CategoriumId)
        requestData.subcategoria = {
          nombre: categoryStep.newSubcategory.nombre,
          crearCategoria: true,
        };
        // No incluir SubcategoriumId cuando se está creando una nueva
        delete requestData.SubcategoriumId;
      }
      // Caso 2: Se está creando solo una nueva subcategoría usando una categoría existente
      else if (categoryStep.isCreatingSubcategory) {
        // FIX: Asegurar que CategoriumId siempre sea un entero válido
        if (!categoryStep.selectedCategoryId) {
          setMessage({
            type: "error",
            text: "Debe seleccionar una categoría para la nueva subcategoría",
          });
          setLoading(false);
          return;
        }

        requestData.subcategoria = {
          nombre: categoryStep.newSubcategory.nombre,
          CategoriumId: parseInt(categoryStep.selectedCategoryId, 10),
        };

        // Validar que CategoriumId sea un número válido
        if (isNaN(requestData.subcategoria.CategoriumId)) {
          setMessage({
            type: "error",
            text: "ID de categoría no válido",
          });
          setLoading(false);
          return;
        }

        // No incluir SubcategoriumId cuando se está creando una nueva
        delete requestData.SubcategoriumId;
      }
      // Caso 3: Se está usando una subcategoría existente
      else {
        if (!categoryStep.selectedSubcategoryId) {
          setMessage({
            type: "error",
            text: "Debe seleccionar una subcategoría",
          });
          setLoading(false);
          return;
        }

        requestData.SubcategoriumId = parseInt(
          categoryStep.selectedSubcategoryId,
          10
        );

        // Validar que SubcategoriumId sea un número válido
        if (isNaN(requestData.SubcategoriumId)) {
          setMessage({
            type: "error",
            text: "ID de subcategoría no válido",
          });
          setLoading(false);
          return;
        }
      }

      // Si tiene seriales, incluir las unidades
      if (product.tieneSerialesUnicos) {
        // Validar que todas las unidades tengan serial
        const invalidUnits = units.some((unit) => !unit.serial);
        if (invalidUnits) {
          setMessage({
            type: "error",
            text: "Todas las unidades deben tener un número de serie",
          });
          setLoading(false);
          return;
        }

        requestData.unidades = units;

        // Si tiene seriales, NO incluir el stock manual
        // ya que se calculará automáticamente en el backend
        if (requestData.hasOwnProperty("stock")) {
          delete requestData.stock;
        }
      }
      // Si no tiene seriales, incluir el stock manual
      else {
        requestData.stock = parseInt(product.stock, 10) || 0;
      }

      // Log para debug
      console.log(
        "Datos que se envían al servidor:",
        JSON.stringify(requestData, null, 2)
      );

      // Crear el producto usando el contexto
      await createProducto(requestData);

      setMessage({
        type: "success",
        text: "Producto creado correctamente",
      });

      // Resetear el formulario
      setStep(1);
      setCategoryStep({
        selectedCategoryId: "",
        selectedSubcategoryId: "",
        newCategory: { nombre: "" },
        newSubcategory: { nombre: "", CategoriumId: "", crearCategoria: false },
        isCreatingCategory: false,
        isCreatingSubcategory: false,
        StantId: "",
      });
      setProduct({
        codigo: "",
        descripcion: "",
        marca: "",
        modelo: "",
        color: "",
        unidadMedida: "",
        stock: 0,
        stockMinimo: 0,
        fechaIngreso: new Date().toISOString().split("T")[0],
        estado: "disponible",
        notas: "",
        SubcategoriumId: "",
        StantId: "",
        tieneSerialesUnicos: false,
      });
      setUnits([{ serial: "", estado: "nuevo" }]);
    } catch (error) {
      console.error("Error completo:", error);
      let errorMsg = "Error al crear el producto";

      if (error.response && error.response.data) {
        errorMsg +=
          ": " +
          (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.message) {
        errorMsg += ": " + error.message;
      }

      setMessage({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-700 rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Crear Nuevo Producto
      </h1>

      {/* Indicador de pasos */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          <div
            className={`h-2 rounded-l-full ${
              step >= 1 ? "bg-yellow-500" : "bg-gray-200"
            }`}
          ></div>
          <p className="text-center mt-1 text-sm">Categoría</p>
        </div>
        <div className="flex-1">
          <div
            className={`h-2 ${step >= 2 ? "bg-yellow-500" : "bg-gray-200"}`}
          ></div>
          <p className="text-center mt-1 text-sm">Producto</p>
        </div>
        <div className="flex-1">
          <div
            className={`h-2 rounded-r-full ${
              step >= 3 ? "bg-yellow-500" : "bg-gray-200"
            }`}
          ></div>
          <p className="text-center mt-1 text-sm">Unidades</p>
        </div>
      </div>

      {/* Mensajes de error o éxito */}
      {message.text && (
        <div
          className={`p-4 mb-4 rounded-md ${
            message.type === "error"
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          <div className="flex items-center">
            {message.type === "error" && (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Paso 1: Selección de categoría y subcategoría */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">
              Paso 1: Seleccionar Categoría y Subcategoría
            </h2>

            {/* Selección de estante */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Estante</label>
              <select
                name="StantId"
                value={categoryStep.StantId}
                onChange={handleCategoryStepChange}
                className="w-full bg-slate-950   px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Seleccione un estante</option>
                {stants.map((stand) => (
                  <option key={stand.id} value={stand.id}>
                    {stand.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoría */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">Categoría</label>
                <button
                  type="button"
                  onClick={toggleCreateCategory}
                  className="text-yellow-500 hover:text-yellow-700 text-sm flex items-center"
                >
                  {categoryStep.isCreatingCategory
                    ? "Seleccionar existente"
                    : "Crear nueva"}
                </button>
              </div>

              {categoryStep.isCreatingCategory ? (
                <div className="mb-4">
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre de la nueva categoría"
                    value={categoryStep.newCategory.nombre}
                    onChange={(e) => handleNestedChange(e, "newCategory")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              ) : (
                <select
                  name="selectedCategoryId"
                  value={categoryStep.selectedCategoryId}
                  onChange={handleCategoryStepChange}
                  className="w-full px-3 bg-slate-950 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option className="" value="">
                    Seleccione una categoría
                  </option>
                  {categorias.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Subcategoría */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">
                  Subcategoría
                </label>
                <button
                  type="button"
                  onClick={toggleCreateSubcategory}
                  className="text-yellow-500 hover:text-yellow-700 text-sm flex items-center"
                  disabled={
                    !categoryStep.selectedCategoryId &&
                    !categoryStep.isCreatingCategory
                  }
                >
                  {categoryStep.isCreatingSubcategory
                    ? "Seleccionar existente"
                    : "Crear nueva"}
                </button>
              </div>

              {categoryStep.isCreatingSubcategory ? (
                <div className="space-y-3 border border-gray-200 rounded-md p-3">
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre de la nueva subcategoría"
                    value={categoryStep.newSubcategory.nombre}
                    onChange={(e) => handleNestedChange(e, "newSubcategory")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />

                  {/* Opción para crear una categoría asociada */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="crearCategoria"
                      id="crearCategoria"
                      checked={categoryStep.newSubcategory.crearCategoria}
                      onChange={handleCategoryStepChange}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="crearCategoria"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Crear nueva categoría para esta subcategoría
                    </label>
                  </div>

                  {/* Si está creando una categoría nueva, mostrar campo para el nombre */}
                  {categoryStep.newSubcategory.crearCategoria && (
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Nombre de la nueva categoría"
                      value={categoryStep.newCategory.nombre}
                      onChange={(e) => handleNestedChange(e, "newCategory")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  )}
                </div>
              ) : (
                <select
                  name="selectedSubcategoryId"
                  value={categoryStep.selectedSubcategoryId}
                  onChange={handleCategoryStepChange}
                  className="w-full px-3 bg-slate-950 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  disabled={!categoryStep.selectedCategoryId}
                >
                  <option value="">Seleccione una subcategoría</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}

        {/* Paso 2: Información del producto */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              Paso 2: Información del Producto
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={product.codigo}
                  onChange={handleProductChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Descripción *
                </label>
                <input
                  type="text"
                  name="descripcion"
                  value={product.descripcion}
                  onChange={handleProductChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Marca</label>
                <input
                  type="text"
                  name="marca"
                  value={product.marca}
                  onChange={handleProductChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Modelo</label>
                <input
                  type="text"
                  name="modelo"
                  value={product.modelo}
                  onChange={handleProductChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="text"
                  name="color"
                  value={product.color}
                  onChange={handleProductChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Unidad de Medida
                </label>
                <input
                  type="text"
                  name="unidadMedida"
                  value={product.unidadMedida}
                  onChange={handleProductChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha de Ingreso
                </label>
                <input
                  type="date"
                  name="fechaIngreso"
                  value={product.fechaIngreso}
                  onChange={handleProductChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  name="estado"
                  value={product.estado}
                  onChange={handleProductChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="disponible">Disponible</option>
                  <option value="agotado">Agotado</option>
                  <option value="baja">Baja</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  name="stockMinimo"
                  value={product.stockMinimo}
                  onChange={handleProductChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="tieneSerialesUnicos"
                    name="tieneSerialesUnicos"
                    checked={product.tieneSerialesUnicos}
                    onChange={handleProductChange}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="tieneSerialesUnicos"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Este producto tiene unidades con seriales únicos
                  </label>
                </div>

                {!product.tieneSerialesUnicos && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Stock (Cantidad)
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={product.stock}
                      onChange={handleProductChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                )}
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Notas Adicionales
                </label>
                <textarea
                  name="notas"
                  value={product.notas}
                  onChange={handleProductChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* Paso 3: Unidades con serial (si aplica) */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {product.tieneSerialesUnicos
                ? "Paso 3: Unidades con Serial"
                : "Paso 3: Confirmar Datos"}
            </h2>

            {product.tieneSerialesUnicos ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Agregue los números de serie para cada unidad del producto. El
                  stock se calculará automáticamente.
                </p>

                {units.map((unit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-grow">
                      <input
                        type="text"
                        name="serial"
                        placeholder={`Serial #${index + 1}`}
                        value={unit.serial}
                        onChange={(e) => handleUnitChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>
                    <div>
                      <select
                        name="estado"
                        value={unit.estado}
                        onChange={(e) => handleUnitChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="nuevo">Nuevo</option>
                        <option value="usado">Usado</option>
                        <option value="reparado">Reparado</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUnit(index)}
                      className={`p-2 text-red-500 hover:text-red-700 ${
                        units.length === 1 ? "invisible" : ""
                      }`}
                      disabled={units.length === 1}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={addUnit}
                    className="flex items-center text-yellow-500 hover:text-yellow-700"
                  >
                    <Plus className="w-5 h-5 mr-1" /> Agregar otra unidad
                  </button>
                </div>

                <div className="mt-2">
                  <p className="text-sm font-medium">
                    Total unidades:{" "}
                    <span className="font-bold">{units.length}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Resumen del Producto</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <dt className="text-xs text-gray-500">Código:</dt>
                    <dd>{product.codigo}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Descripción:</dt>
                    <dd>{product.descripcion}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Marca:</dt>
                    <dd>{product.marca || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Modelo:</dt>
                    <dd>{product.modelo || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Stock:</dt>
                    <dd>{product.stock}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Unidad de Medida:</dt>
                    <dd>{product.unidadMedida || "N/A"}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        )}

        {/* Botones de navegación */}
        <div className="mt-8 flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Anterior
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Siguiente <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="w-5 h-5 mr-1" /> Guardar
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
