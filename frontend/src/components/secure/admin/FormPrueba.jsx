import React, { useState, useEffect } from "react";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Save,
  AlertTriangle,
  Plus,
  Trash2,
} from "lucide-react";
import { useStants } from "@/context/StantContext";
import { useCategorias } from "@/context/CategoriaContext";
import { useProductos } from "@/context/ProductosContext";

const FormPrueba = () => {
  const { getStants, stants } = useStants();
  const { getCategorias, getSubcategoriasByCategoria, categorias } =
    useCategorias();
  const { createProducto } = useProductos();

  // Form step state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [subcategorias, setSubcategorias] = useState([]);

  useEffect(() => {
    getStants();
    getCategorias();
  }, []);

  // Form data state
  const [formData, setFormData] = useState({
    // Product data
    codigo: "",
    descripcion: "",
    marca: "",
    modelo: "",
    color: "",
    unidadMedida: "unidad",
    stockMinimo: 1,
    stock: 0,
    estado: "disponible",
    notas: "",

    // Relations
    SubcategoriumId: "",
    StantId: "",

    // Category and subcategory
    useExistingCategory: true,
    useExistingSubcategory: true,
    categoria: {
      nombre: "",
    },
    subcategoria: {
      nombre: "",
      CategoriumId: "",
      crearCategoria: false,
    },

    // Units
    hasUnits: false,
    unidades: [],
  });

  // Handle input change for main product data
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Handle category selection
  const handleCategoryChange = async (e) => {
    const categoryId = Number(e.target.value);

    // Actualizar el estado del formulario antes de cargar las subcategorías
    setFormData({
      ...formData,
      subcategoria: {
        ...formData.subcategoria,
        CategoriumId: categoryId,
      },
      SubcategoriumId: "", // Reset subcategory when category changes
    });

    // Obtener subcategorías para esta categoría
    if (categoryId) {
      try {
        const subcats = await getSubcategoriasByCategoria(categoryId);
        setSubcategorias(subcats || []);
      } catch (error) {
        console.error("Error al cargar subcategorías:", error);
        setError("No se pudieron cargar las subcategorías");
        setSubcategorias([]);
      }
    } else {
      setSubcategorias([]);
    }
  };

  // Handle subcategory input
  const handleSubcategoryChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      subcategoria: {
        ...formData.subcategoria,
        [name]: value,
      },
    });
  };

  // Handle category input
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      categoria: {
        ...formData.categoria,
        [name]: value,
      },
    });
  };

  // Add new unit
  const handleAddUnit = () => {
    setFormData({
      ...formData,
      unidades: [...formData.unidades, { serial: "", estado: "nuevo" }],
    });
  };

  // Remove unit at index
  const handleRemoveUnit = (index) => {
    const updatedUnits = [...formData.unidades];
    updatedUnits.splice(index, 1);

    setFormData({
      ...formData,
      unidades: updatedUnits,
    });
  };

  // Update unit data
  const handleUnitChange = (index, field, value) => {
    const updatedUnits = [...formData.unidades];
    updatedUnits[index] = {
      ...updatedUnits[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      unidades: updatedUnits,
    });
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare the data to send
      const dataToSend = {
        codigo: formData.codigo,
        descripcion: formData.descripcion,
        marca: formData.marca,
        modelo: formData.modelo,
        color: formData.color,
        unidadMedida: formData.unidadMedida,
        stockMinimo: formData.stockMinimo,
        estado: formData.estado,
        notas: formData.notas,
        StantId: Number(formData.StantId) || undefined,
      };

      // Add stock if not managing units
      if (!formData.hasUnits) {
        dataToSend.stock = formData.stock;
      }

      // Handle category/subcategory logic
      if (formData.useExistingSubcategory) {
        dataToSend.SubcategoriumId = Number(formData.SubcategoriumId);
      } else {
        // Creating new subcategory
        dataToSend.subcategoria = {
          nombre: formData.subcategoria.nombre,
        };

        if (formData.useExistingCategory) {
          // Use existing category for new subcategory
          dataToSend.subcategoria.CategoriumId = Number(
            formData.subcategoria.CategoriumId
          );
        } else {
          // Create new category and subcategory
          dataToSend.categoria = {
            nombre: formData.categoria.nombre,
          };
          dataToSend.subcategoria.crearCategoria = true;
        }
      }

      // Add units if needed
      if (formData.hasUnits && formData.unidades.length > 0) {
        dataToSend.unidades = formData.unidades;
      }

      console.log("Data to send:", dataToSend);

      // Usar la función del contexto para crear el producto
      await createProducto(dataToSend);

      setSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          codigo: "",
          descripcion: "",
          marca: "",
          modelo: "",
          color: "",
          unidadMedida: "unidad",
          stockMinimo: 1,
          stock: 0,
          estado: "disponible",
          notas: "",
          SubcategoriumId: "",
          StantId: "",
          useExistingCategory: true,
          useExistingSubcategory: true,
          categoria: { nombre: "" },
          subcategoria: { nombre: "", CategoriumId: "", crearCategoria: false },
          hasUnits: false,
          unidades: [],
        });
        setCurrentStep(1);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message || "Error al crear el producto");
    } finally {
      setLoading(false);
    }
  };

  // Navigate between steps
  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  // Step 1: Category and Subcategory Selection
  const renderCategoryStep = () => (
    <div className="step-container">
      <h3 className="text-lg font-medium mb-4">
        Paso 1: Categoría y Subcategoría
      </h3>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="useExistingSubcategory"
            name="useExistingSubcategory"
            checked={formData.useExistingSubcategory}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          <label htmlFor="useExistingSubcategory">
            Usar categoría y subcategoría existentes
          </label>
        </div>

        {formData.useExistingSubcategory ? (
          <>
            {/* Primero seleccionar categoría */}
            <div className="mb-4">
              <label className="block mb-1">Seleccione Categoría:</label>
              <select
                name="categoriaSeleccionada"
                value={formData.subcategoria.CategoriumId || ""}
                onChange={handleCategoryChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">-- Seleccionar Categoría --</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Luego mostrar subcategorías de esa categoría */}
            {formData.subcategoria.CategoriumId && subcategorias.length > 0 && (
              <div className="mb-4">
                <label className="block mb-1">Seleccione Subcategoría:</label>
                <select
                  name="SubcategoriumId"
                  value={formData.SubcategoriumId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">-- Seleccionar Subcategoría --</option>
                  {subcategorias.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.subcategoria.CategoriumId &&
              subcategorias.length === 0 && (
                <div className="text-amber-500 mt-2">
                  Esta categoría no tiene subcategorías disponibles. Por favor
                  cree una nueva subcategoría.
                </div>
              )}
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block mb-1">
                Nombre de la nueva subcategoría:
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.subcategoria.nombre}
                onChange={handleSubcategoryChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="useExistingCategory"
                  name="useExistingCategory"
                  checked={formData.useExistingCategory}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <label htmlFor="useExistingCategory">
                  Usar categoría existente
                </label>
              </div>

              {formData.useExistingCategory ? (
                <div>
                  <label className="block mb-1">Seleccione Categoría:</label>
                  <select
                    value={formData.subcategoria.CategoriumId || ""}
                    onChange={handleCategoryChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">-- Seleccionar Categoría --</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block mb-1">
                    Nombre de la nueva categoría:
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.categoria.nombre}
                    onChange={handleCategoryInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={nextStep}
          className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
          disabled={
            (formData.useExistingSubcategory &&
              (!formData.subcategoria.CategoriumId ||
                !formData.SubcategoriumId)) ||
            (!formData.useExistingSubcategory &&
              !formData.subcategoria.nombre) ||
            (!formData.useExistingSubcategory &&
              formData.useExistingCategory &&
              !formData.subcategoria.CategoriumId) ||
            (!formData.useExistingSubcategory &&
              !formData.useExistingCategory &&
              !formData.categoria.nombre)
          }
        >
          Siguiente <ArrowRight size={18} className="ml-1" />
        </button>
      </div>
    </div>
  );

  // Step 2: Product Information
  const renderProductStep = () => (
    <div className="step-container">
      <h3 className="text-lg font-medium mb-4">
        Paso 2: Información del Producto
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-3">
          <label className="block mb-1">Código:</label>
          <input
            type="text"
            name="codigo"
            value={formData.codigo}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Marca:</label>
          <input
            type="text"
            name="marca"
            value={formData.marca}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Modelo:</label>
          <input
            type="text"
            name="modelo"
            value={formData.modelo}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Color:</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Unidad de Medida:</label>
          <input
            type="text"
            name="unidadMedida"
            value={formData.unidadMedida}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Stock Mínimo:</label>
          <input
            type="number"
            name="stockMinimo"
            value={formData.stockMinimo}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            min="0"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Estado:</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="disponible">Disponible</option>
            <option value="agotado">Agotado</option>
            <option value="descontinuado">Descontinuado</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block mb-1">Estante:</label>
          <select
            name="StantId"
            value={formData.StantId}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Sin asignar --</option>
            {stants.map((stant) => (
              <option key={stant.id} value={stant.id}>
                {stant.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Descripción:</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          rows="3"
          required
        ></textarea>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Notas adicionales:</label>
        <textarea
          name="notas"
          value={formData.notas}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          rows="2"
        ></textarea>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="hasUnits"
            name="hasUnits"
            checked={formData.hasUnits}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          <label htmlFor="hasUnits">
            Este producto tiene unidades con seriales únicos
          </label>
        </div>

        {!formData.hasUnits && (
          <div className="mb-3 mt-2">
            <label className="block mb-1">Stock Inicial:</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded flex items-center"
        >
          <ArrowLeft size={18} className="mr-1" /> Anterior
        </button>

        <button
          type="button"
          onClick={nextStep}
          className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
          disabled={
            !formData.codigo ||
            !formData.descripcion ||
            !formData.marca ||
            !formData.modelo
          }
        >
          {formData.hasUnits ? "Siguiente" : "Revisar"}{" "}
          <ArrowRight size={18} className="ml-1" />
        </button>
      </div>
    </div>
  );

  // Step 3: Units with serials (if applicable)
  const renderUnitsStep = () => (
    <div className="step-container">
      <h3 className="text-lg font-medium mb-4">Paso 3: Unidades con Serial</h3>

      <div className="mb-4">
        <button
          type="button"
          onClick={handleAddUnit}
          className="px-3 py-2 bg-green-500 text-white rounded flex items-center"
        >
          <Plus size={16} className="mr-1" /> Agregar Unidad
        </button>
      </div>

      {formData.unidades.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No hay unidades agregadas. Agregue al menos una unidad con serial.
        </div>
      ) : (
        <div className="border rounded overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  #
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Serial
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Estado
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {formData.unidades.map((unidad, index) => (
                <tr key={index}>
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={unidad.serial}
                      onChange={(e) =>
                        handleUnitChange(index, "serial", e.target.value)
                      }
                      className="w-full p-1 border rounded"
                      placeholder="Ingrese serial"
                      required
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={unidad.estado}
                      onChange={(e) =>
                        handleUnitChange(index, "estado", e.target.value)
                      }
                      className="w-full p-1 border rounded"
                    >
                      <option value="nuevo">Nuevo</option>
                      <option value="usado">Usado</option>
                      <option value="reacondicionado">Reacondicionado</option>
                      <option value="defectuoso">Defectuoso</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveUnit(index)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded flex items-center"
        >
          <ArrowLeft size={18} className="mr-1" /> Anterior
        </button>

        <button
          type="button"
          onClick={nextStep}
          className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
          disabled={
            formData.unidades.length === 0 ||
            formData.unidades.some((u) => !u.serial)
          }
        >
          Revisar <ArrowRight size={18} className="ml-1" />
        </button>
      </div>
    </div>
  );

  // Step 4: Review and Submit
  const renderReviewStep = () => {
    // Determine which category/subcategory information to display
    let categoryInfo = "";
    if (formData.useExistingSubcategory) {
      const subcategoria = subcategorias.find(
        (s) => s.id === Number(formData.SubcategoriumId)
      );
      const categoria = categorias.find(
        (c) => c.id === subcategoria?.CategoriumId
      );
      categoryInfo = `Subcategoría: ${subcategoria?.nombre || ""} (Categoría: ${
        categoria?.nombre || ""
      })`;
    } else {
      if (formData.useExistingCategory) {
        const categoria = categorias.find(
          (c) => c.id === Number(formData.subcategoria.CategoriumId)
        );
        categoryInfo = `Nueva subcategoría: "${
          formData.subcategoria.nombre
        }" en categoría existente: "${categoria?.nombre || ""}"`;
      } else {
        categoryInfo = `Nueva categoría: "${formData.categoria.nombre}" con nueva subcategoría: "${formData.subcategoria.nombre}"`;
      }
    }

    // Find selected stant
    const stant = stants.find((s) => s.id === Number(formData.StantId));

    return (
      <div className="step-container">
        <h3 className="text-lg font-medium mb-4">
          Paso {formData.hasUnits ? "4" : "3"}: Revisar y Confirmar
        </h3>

        <div className="bg-slate-950 p-4 rounded border mb-4">
          <h4 className="font-medium mb-2">Categorización</h4>
          <p>{categoryInfo}</p>
        </div>

        <div className="bg-slate-950 p-4 rounded border mb-4">
          <h4 className="font-medium mb-2">Datos del Producto</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <strong>Código:</strong> {formData.codigo}
            </div>
            <div>
              <strong>Marca:</strong> {formData.marca}
            </div>
            <div>
              <strong>Modelo:</strong> {formData.modelo}
            </div>
            <div>
              <strong>Color:</strong> {formData.color || "N/A"}
            </div>
            <div>
              <strong>U. Medida:</strong> {formData.unidadMedida}
            </div>
            <div>
              <strong>Stock Mínimo:</strong> {formData.stockMinimo}
            </div>
            <div>
              <strong>Estado:</strong> {formData.estado}
            </div>
            <div>
              <strong>Estante:</strong> {stant ? stant.nombre : "Sin asignar"}
            </div>
          </div>
          <div className="mt-2">
            <strong>Descripción:</strong> {formData.descripcion}
          </div>
          {formData.notas && (
            <div className="mt-2">
              <strong>Notas:</strong> {formData.notas}
            </div>
          )}
        </div>

        {formData.hasUnits ? (
          <div className="bg-slate-950 p-4 rounded border mb-4">
            <h4 className="font-medium mb-2">
              Unidades ({formData.unidades.length})
            </h4>
            {formData.unidades.length > 0 ? (
              <ul className="list-disc list-inside">
                {formData.unidades.map((unidad, index) => (
                  <li key={index}>
                    Serial: <strong>{unidad.serial}</strong> - Estado:{" "}
                    {unidad.estado}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No se han agregado unidades</p>
            )}
          </div>
        ) : (
          <div className="bg-slate-950 p-4 rounded border mb-4">
            <h4 className="font-medium mb-2">Stock</h4>
            <p>
              Stock inicial: <strong>{formData.stock}</strong> unidades
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded flex items-center"
          >
            <ArrowLeft size={18} className="mr-1" /> Anterior
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded flex items-center"
            disabled={loading}
          >
            {loading ? (
              "Guardando..."
            ) : (
              <>
                <Save size={18} className="mr-1" /> Guardar Producto
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Registrar Nuevo Producto</h2>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between">
          <div className={`step-indicator ${currentStep >= 1 ? "active" : ""}`}>
            Categorización
          </div>
          <div className={`step-indicator ${currentStep >= 2 ? "active" : ""}`}>
            Datos Producto
          </div>
          {formData.hasUnits && (
            <div
              className={`step-indicator ${currentStep >= 3 ? "active" : ""}`}
            >
              Unidades
            </div>
          )}
          <div
            className={`step-indicator ${
              currentStep >= (formData.hasUnits ? 4 : 3) ? "active" : ""
            }`}
          >
            Revisión
          </div>
        </div>
      </div>

      {/* Success/Error messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <Check size={20} className="mr-2" />
          Producto creado exitosamente!
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          {error}
        </div>
      )}

      {/* Form container */}
      <div className="bg-slate-950 shadow-md rounded-lg p-6 border">
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && renderCategoryStep()}
          {currentStep === 2 && renderProductStep()}
          {currentStep === 3 &&
            (formData.hasUnits ? renderUnitsStep() : renderReviewStep())}
          {currentStep === 4 && renderReviewStep()}
        </form>
      </div>

      {/* CSS for component styling */}
      <style jsx>{`
        .step-indicator {
          position: relative;
          width: 25%;
          font-size: 14px;
          text-align: center;
          color: #9ca3af;
          padding-bottom: 10px;
        }

        .step-indicator::before {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background-color: #e5e7eb;
          border-radius: 2px;
        }

        .step-indicator.active {
          color: #3b82f6;
          font-weight: 500;
        }

        .step-indicator.active::before {
          background-color: #3b82f6;
        }
      `}</style>
    </div>
  );
};

export default FormPrueba;
