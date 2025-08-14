import React, { useState, useEffect } from "react";
import {
  User,
  Box,
  X,
} from "lucide-react";
import { usePersonal } from "@/context/PersonalContext"; // Corregido: 'cre' no se usa
import { useStants } from "@/context/StantContext";

export default function StantForm({
  stant = null, // Descomentado y con valor por defecto
  handleCloseModal,
  handleCloseModalStock, // Descomentado
  showNotification, // Descomentado
}) {
  const { stants, createStant, updateStant, loading } = useStants(); // Asegúrate de llamar useStants como función

  const [formData, setFormData] = useState({
    nombre: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (stant) { // Cambiado de 'stants' a 'stant'
      setFormData({
        nombre: stant.nombre || "",
      });
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [stant]); // Dependencia actualizada a 'stant'

  const clearForm = () => {
    setFormData({
      nombre: "",
    });
    setIsEditing(false);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target; // <-- Aquí está la corrección clave
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let result;
      const submitData = { nombre: formData.nombre }; 

      if (isEditing) {
        // Actualizar stants existente
        result = await updateStant(stant.id, submitData);
      } else {
        // Crear nuevo stants
        result = await createStant(submitData);
      }

      // Mostrar notificación de éxito
      const message = isEditing
        ? "Stant actualizado exitosamente!"
        : "Stant creado exitosamente!";

      if (showNotification) {
        showNotification(message, "success");
      }

      // Cerrar modal
      if (isEditing && handleCloseModalStock) {
        handleCloseModalStock();
      } else if (handleCloseModal) {
        handleCloseModal();
      }

      // Si es creación, limpiar formulario
      if (!isEditing) {
        clearForm();
      }
    } catch (error) {
      console.error("Error al procesar stant:", error);

      const errorMessage = isEditing
        ? "Error al actualizar el stant"
        : "Error al crear el stant";

      if (showNotification) {
        showNotification(errorMessage, "error");
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isEditing && handleCloseModalStock) {
      handleCloseModalStock();
    } else if (handleCloseModal) {
      handleCloseModal();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4 z-50">
      <div className="max-w-4xl mx-auto max-h-[90%] overflow-y-auto">
        <div className="dark:bg-slate-950 bg-white shadow-xl overflow-hidden rounded-lg border border-slate-700">
          {/* Header */}
          <div className="border-b border-slate-700 px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold dark:text-white text-slate-700">
                {isEditing ? "Editar Stant" : "Registrar Stant"}
              </h1>
              <p className="dark:text-slate-400 text-slate-600 mt-2">
                {isEditing
                  ? "Actualiza la información del stant"
                  : "Complete todos los campos requeridos"}
              </p>
            </div>

            <button
              onClick={handleClose}
              className="dark:text-slate-400 text-slate-600  hover:text-slate-800 dark:hover:text-white transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Box className="w-4 h-4 mr-2 text-yellow-500" />
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange} // Aquí se usa la función corregida
                  className={`w-full px-4 py-3 dark:bg-slate-900 border rounded-lg focus:ring-0 focus:border-yellow-500 transition-all dark:text-white text-slate-700 ${
                    errors.nombre ? "border-red-500" : "border-slate-400"
                  }`}
                  placeholder="Ingrese el nombre del stant"
                />
                {errors.nombre && (
                  <p className="text-red-400 text-sm">{errors.nombre}</p>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-700">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="flex-1 bg-yellow-500 text-slate-950 px-6 py-3 rounded-lg hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting || loading
                  ? "Procesando..."
                  : isEditing
                  ? "Actualizar Stant"
                  : "Crear Stant"}
              </button>

              <button
                type="button"
                onClick={clearForm}
                disabled={isSubmitting || loading}
                className="flex-1 sm:flex-none bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-600 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50"
              >
                Limpiar
              </button>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting || loading}
                className="flex-1 sm:flex-none bg-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-500 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}