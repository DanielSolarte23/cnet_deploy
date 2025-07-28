import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  CreditCard,
  Eye,
  EyeOff,
  X,
  Upload,
  FileImage,
  Trash2,
} from "lucide-react";
import { usePersonal } from "@/context/PersonalContext";

export default function PersonalForm({
  personal = null,
  handleCloseModal,
  handleCloseModalStock,
  showNotification,
}) {
  const { createPersonal, updatePersonal, loading } = usePersonal();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    expedicion: "",
    fecha_nacimiento: "",
    cargo: "",
    departamento: "",
    telefono: "",
    correo: "",
    password: "",
    activo: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el manejo de la firma
  const [firmaFile, setFirmaFile] = useState(null);
  const [firmaPreview, setFirmaPreview] = useState(null);
  const [existingFirmaUrl, setExistingFirmaUrl] = useState(null);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (personal) {
      setFormData({
        nombre: personal.nombre || "",
        apellido: personal.apellido || "",
        cedula: personal.cedula || "",
        expedicion: personal.expedicion
          ? personal.expedicion.split("T")[0]
          : "",
        fecha_nacimiento: personal.fecha_nacimiento
          ? personal.fecha_nacimiento.split("T")[0]
          : "",
        cargo: personal.cargo || "",
        departamento: personal.departamento || "",
        telefono: personal.telefono || "",
        correo: personal.correo || "",
        password: "", // No cargar contraseña por seguridad
        activo: personal.activo !== undefined ? personal.activo : true,
      });

      // Si existe firma, establecer la URL
      if (personal.firma_path) {
        setExistingFirmaUrl(`/api/personal/${personal.id}/firma`);
      }

      setIsEditing(true);
    } else {
      setIsEditing(false);
      setExistingFirmaUrl(null);
    }
  }, [personal]);

  const clearForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      cedula: "",
      expedicion: "",
      fecha_nacimiento: "",
      cargo: "",
      departamento: "",
      telefono: "",
      correo: "",
      password: "",
      activo: true,
    });
    setIsEditing(false);
    setErrors({});
    setFirmaFile(null);
    setFirmaPreview(null);
    setExistingFirmaUrl(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Manejar selección de archivo de firma
  const handleFirmaChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          firma: "Solo se permiten archivos PNG, JPG o JPEG",
        }));
        return;
      }

      // Validar tamaño (2MB máximo)
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          firma: "El archivo no puede ser mayor a 2MB",
        }));
        return;
      }

      setFirmaFile(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFirmaPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Limpiar error de firma si existía
      if (errors.firma) {
        setErrors((prev) => ({
          ...prev,
          firma: "",
        }));
      }
    }
  };

  // Eliminar firma seleccionada
  const handleRemoveFirma = () => {
    setFirmaFile(null);
    setFirmaPreview(null);
    // Limpiar el input file
    const fileInput = document.getElementById("firma-input");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.apellido.trim())
      newErrors.apellido = "El apellido es requerido";
    if (!formData.cedula.trim()) newErrors.cedula = "La cédula es requerida";
    if (!formData.expedicion)
      newErrors.expedicion = "La fecha de expedición es requerida";
    if (!formData.fecha_nacimiento)
      newErrors.fecha_nacimiento = "La fecha de nacimiento es requerida";
    if (!formData.cargo.trim()) newErrors.cargo = "El cargo es requerido";
    if (!formData.departamento.trim())
      newErrors.departamento = "El departamento es requerido";
    if (!formData.telefono.trim())
      newErrors.telefono = "El teléfono es requerido";
    if (!formData.correo.trim()) {
      newErrors.correo = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = "El formato del correo no es válido";
    }

    // Solo validar contraseña si estamos creando un nuevo personal
    if (!isEditing && !formData.password.trim()) {
      newErrors.password = "La contraseña es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Crear FormData para enviar archivos
      const submitData = new FormData();

      // Agregar todos los campos del formulario
      Object.keys(formData).forEach((key) => {
        if (key === "expedicion" || key === "fecha_nacimiento") {
          // Convertir fechas a ISO string si existen
          if (formData[key]) {
            submitData.append(key, new Date(formData[key]).toISOString());
          }
        } else if (key === "password") {
          // Solo agregar contraseña si no estamos editando o si tiene valor
          if (!isEditing || formData[key].trim()) {
            submitData.append(key, formData[key]);
          }
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Agregar archivo de firma si existe
      if (firmaFile) {
        submitData.append("firma", firmaFile);
      }

      let result;

      if (isEditing) {
        // Actualizar personal existente
        result = await updatePersonal(personal.id, submitData);
      } else {
        // Crear nuevo personal
        result = await createPersonal(submitData);
      }

      // Mostrar notificación de éxito
      const message = isEditing
        ? "Personal actualizado exitosamente!"
        : "Personal creado exitosamente!";

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
      console.error("Error al procesar personal:", error);

      const errorMessage = isEditing
        ? "Error al actualizar el personal"
        : "Error al crear el personal";

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

  const cargos = [
    "Empalmador",
    "Técnico",
    "Supervisor",
    "Coordinador",
    "Jefe de Área",
    "Gerente",
    "Soporte",
  ];

  const departamentos = [
    "Popayán(Cauca)",
    "Cali(Valle del Cauca)",
    "Bogotá(Cundinamarca)",
    "Medellín(Antioquia)",
    "Barranquilla(Atlántico)",
    "Cartagena(Bolívar)",
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4 z-50">
      <div className="max-w-4xl mx-auto max-h-[90%] overflow-y-auto">
        <div className="bg-slate-950 shadow-xl overflow-hidden rounded-lg border border-slate-700">
          {/* Header */}
          <div className="border-b border-slate-700 px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {isEditing ? "Editar Personal" : "Registrar Personal"}
              </h1>
              <p className="text-slate-400 mt-2">
                {isEditing
                  ? "Actualiza la información del personal"
                  : "Complete todos los campos requeridos"}
              </p>
            </div>

            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <User className="w-4 h-4 mr-2 text-yellow-500" />
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-white ${
                    errors.nombre ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="Ingrese el nombre"
                />
                {errors.nombre && (
                  <p className="text-red-400 text-sm">{errors.nombre}</p>
                )}
              </div>

              {/* Apellido */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <User className="w-4 h-4 mr-2 text-yellow-500" />
                  Apellido *
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-white ${
                    errors.apellido ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="Ingrese el apellido"
                />
                {errors.apellido && (
                  <p className="text-red-400 text-sm">{errors.apellido}</p>
                )}
              </div>

              {/* Cédula */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <CreditCard className="w-4 h-4 mr-2 text-yellow-500" />
                  Cédula *
                </label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-white ${
                    errors.cedula ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="Número de cédula"
                />
                {errors.cedula && (
                  <p className="text-red-400 text-sm">{errors.cedula}</p>
                )}
              </div>

              {/* Fecha de Expedición */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <Calendar className="w-4 h-4 mr-2 text-yellow-500" />
                  Fecha de Expedición *
                </label>
                <input
                  type="date"
                  name="expedicion"
                  value={formData.expedicion}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-white ${
                    errors.expedicion ? "border-red-500" : "border-slate-600"
                  }`}
                />
                {errors.expedicion && (
                  <p className="text-red-400 text-sm">{errors.expedicion}</p>
                )}
              </div>

              {/* Fecha de Nacimiento */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <Calendar className="w-4 h-4 mr-2 text-yellow-500" />
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-white ${
                    errors.fecha_nacimiento
                      ? "border-red-500"
                      : "border-slate-600"
                  }`}
                />
                {errors.fecha_nacimiento && (
                  <p className="text-red-400 text-sm">
                    {errors.fecha_nacimiento}
                  </p>
                )}
              </div>

              {/* Cargo */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <Briefcase className="w-4 h-4 mr-2 text-yellow-500" />
                  Cargo *
                </label>
                <select
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-white ${
                    errors.cargo ? "border-red-500" : "border-slate-600"
                  }`}
                >
                  <option value="">Seleccione un cargo</option>
                  {cargos.map((cargo) => (
                    <option key={cargo} value={cargo}>
                      {cargo}
                    </option>
                  ))}
                </select>
                {errors.cargo && (
                  <p className="text-red-400 text-sm">{errors.cargo}</p>
                )}
              </div>

              {/* Departamento */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <MapPin className="w-4 h-4 mr-2 text-yellow-500" />
                  Departamento *
                </label>
                <select
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-white ${
                    errors.departamento ? "border-red-500" : "border-slate-600"
                  }`}
                >
                  <option value="">Seleccione un departamento</option>
                  {departamentos.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.departamento && (
                  <p className="text-red-400 text-sm">{errors.departamento}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <Phone className="w-4 h-4 mr-2 text-yellow-500" />
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-white ${
                    errors.telefono ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="Número de teléfono"
                />
                {errors.telefono && (
                  <p className="text-red-400 text-sm">{errors.telefono}</p>
                )}
              </div>

              {/* Correo */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <Mail className="w-4 h-4 mr-2 text-yellow-500" />
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-white ${
                    errors.correo ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="ejemplo@correo.com"
                />
                {errors.correo && (
                  <p className="text-red-400 text-sm">{errors.correo}</p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <Eye className="w-4 h-4 mr-2 text-yellow-500" />
                  Contraseña {!isEditing && "*"}
                  {isEditing && (
                    <span className="text-xs text-slate-500 ml-2">
                      (Dejar vacío para mantener la actual)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-12 bg-slate-900 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-white ${
                      errors.password ? "border-red-500" : "border-slate-600"
                    }`}
                    placeholder={
                      isEditing
                        ? "Dejar vacío para mantener actual"
                        : "Ingrese la contraseña"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password}</p>
                )}
              </div>

              {/* Firma */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <FileImage className="w-4 h-4 mr-2 text-yellow-500" />
                  Firma Digital
                  <span className="text-xs text-slate-500 ml-2">
                    (PNG - máx 2MB)
                  </span>
                </label>

                {/* Input de archivo */}
                <div className="relative">
                  <input
                    id="firma-input"
                    type="file"
                    accept="image/png"
                    onChange={handleFirmaChange}
                    className="hidden"
                  />

                  {!firmaPreview && !existingFirmaUrl && (
                    <label
                      htmlFor="firma-input"
                      className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 transition-colors ${
                        errors.firma ? "border-red-500" : "border-slate-600"
                      }`}
                    >
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-slate-400 text-sm text-center">
                        Haz clic para seleccionar la firma
                        <br />
                        <span className="text-xs">PNG (máx 2MB)</span>
                      </span>
                    </label>
                  )}

                  {/* Preview de nueva firma */}
                  {firmaPreview && (
                    <div className="relative">
                      <div className="w-full h-32 bg-white border border-slate-600 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={firmaPreview}
                          alt="Preview de firma"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFirma}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          {firmaFile?.name}
                        </span>
                        <label
                          htmlFor="firma-input"
                          className="text-sm text-yellow-500 hover:text-yellow-400 cursor-pointer"
                        >
                          Cambiar firma
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Firma existente (modo edición) */}
                  {!firmaPreview && existingFirmaUrl && (
                    <div className="relative">
                      <div className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={existingFirmaUrl}
                          alt="Firma actual"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                            setExistingFirmaUrl(null);
                          }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          Firma actual
                        </span>
                        <label
                          htmlFor="firma-input"
                          className="text-sm text-yellow-500 hover:text-yellow-400 cursor-pointer"
                        >
                          Cambiar firma
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {errors.firma && (
                  <p className="text-red-400 text-sm">{errors.firma}</p>
                )}
              </div>

              {/* Estado Activo */}
              <div className="md:col-span-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-yellow-600 bg-slate-900 border-slate-600 rounded focus:ring-yellow-500"
                  />
                  <span className="text-sm font-medium text-slate-300">
                    Personal activo
                  </span>
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-700">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 text-slate-950 px-6 py-3 rounded-lg hover:from-yellow-500 hover:to-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting || loading
                  ? "Procesando..."
                  : isEditing
                  ? "Actualizar Personal"
                  : "Crear Personal"}
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
