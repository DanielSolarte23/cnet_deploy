"use client";
import axios from "axios";
import { useState, useEffect, useMemo, useRef } from "react";

// Nuevo componente para el modal de detalles
export const DetalleEntregaModal = ({
  isOpen,
  onClose,
  entrega,
  onEditarProductos,
  onImprimirActa,
  onReintegro,
  onReenviarConfirmacion,
}) => {
  const [detalleEntrega, setDetalleEntrega] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [emailConfirmacion, setEmailConfirmacion] = useState("");
  const [enviandoEmail, setEnviandoEmail] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (isOpen && entrega) {
      obtenerDetalleEntrega();
    }
  }, [isOpen, entrega]);

  const obtenerDetalleEntrega = async () => {
    setLoadingDetalle(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/entrega/${entrega.id}`
      );
      setDetalleEntrega(response.data.data);
      // Pre-llenar el email del técnico si está disponible
      if (response.data.data.tecnicoData?.email) {
        setEmailConfirmacion(response.data.data.tecnicoData.email);
      }
    } catch (error) {
      console.error("Error al obtener detalle de entrega:", error);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleReenviarConfirmacion = async () => {
    if (!emailConfirmacion.trim()) {
      alert("Por favor ingresa un email válido");
      return;
    }

    setEnviandoEmail(true);
    try {
      const response = await axios.post(
        `${baseUrl}/api/${entrega.id}/regenerate-token`,
        { recipientEmail: emailConfirmacion }
      );
      alert("Confirmación reenviada exitosamente");
      onClose();
    } catch (error) {
      console.error("Error al reenviar confirmación:", error);
      alert("Error al reenviar la confirmación");
    } finally {
      setEnviandoEmail(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            Detalle de Entrega #{entrega?.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        {loadingDetalle ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Cargando detalles...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Información general */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-yellow-500 border-b border-slate-700 pb-2">
                  Información General
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-400">Fecha:</span>
                    <span className="col-span-2 text-white">
                      {detalleEntrega?.fecha
                        ? new Date(detalleEntrega.fecha).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-400">Proyecto:</span>
                    <span className="col-span-2 text-white">
                      {detalleEntrega?.proyecto || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-400">Estado:</span>
                    <span className="col-span-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          detalleEntrega?.estado === "pendiente"
                            ? "bg-yellow-100 text-yellow-800"
                            : detalleEntrega?.estado === "cerrada"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {detalleEntrega?.estado || "Sin estado"}
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-400">Confirmada:</span>
                    <span className="col-span-2 text-white">
                      {detalleEntrega?.wasConfirmed ? "Sí" : "No"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-400">
                      Fecha Est. Devolución:
                    </span>
                    <span className="col-span-2 text-white">
                      {detalleEntrega?.fechaEstimadaDevolucion
                        ? new Date(
                            detalleEntrega.fechaEstimadaDevolucion
                          ).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-yellow-500 border-b border-slate-700 pb-2">
                  Personal
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-400">Técnico:</span>
                    <span className="col-span-2 text-white">
                      {detalleEntrega?.tecnicoData?.nombre || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-400">Cédula:</span>
                    <span className="col-span-2 text-white">
                      {detalleEntrega?.tecnicoData?.cedula || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-400">Cargo:</span>
                    <span className="col-span-2 text-white">
                      {detalleEntrega?.tecnicoData?.cargo || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-400">Almacenista:</span>
                    <span className="col-span-2 text-white">
                      {detalleEntrega?.almacenistaData?.nombre || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            {detalleEntrega?.observaciones && (
              <div>
                <h3 className="text-lg font-semibold text-yellow-500 border-b border-slate-700 pb-2 mb-4">
                  Observaciones
                </h3>
                <p className="text-white bg-slate-800 p-3 rounded-md text-sm">
                  {detalleEntrega.observaciones}
                </p>
              </div>
            )}

            {/* Productos */}
            <div>
              <h3 className="text-lg font-semibold text-yellow-500 border-b border-slate-700 pb-2 mb-4">
                Productos Entregados
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800 text-gray-400">
                    <tr>
                      <th className="p-3 text-left">Producto</th>
                      <th className="p-3 text-center">Cantidad</th>
                      <th className="p-3 text-center">Devuelto</th>
                      <th className="p-3 text-center">Legalizado</th>
                      <th className="p-3 text-center">Estado</th>
                      <th className="p-3 text-left">Seriales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {detalleEntrega?.EntregaProductos?.map(
                      (producto, index) => (
                        <tr key={index} className="text-white">
                          <td className="p-3">
                            <div>
                              <div className="font-medium">
                                {producto.descripcion}
                              </div>
                              <div className="text-xs text-gray-400">
                                {producto.Producto?.marca} -{" "}
                                {producto.Producto?.modelo}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {producto.cantidad}
                          </td>
                          <td className="p-3 text-center">
                            {producto.devuelto || 0}
                          </td>
                          <td className="p-3 text-center">
                            {producto.legalizado || 0}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                producto.estado === "cerrado"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {producto.estado}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="space-y-1">
                              {producto.unidadesSeriadasDetalle?.map(
                                (unidad, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs bg-slate-800 px-2 py-1 rounded"
                                  >
                                    {unidad.serial}
                                  </div>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sección de Reenvío de Confirmación */}
            <div className="bg-slate-800 p-4 rounded-lg">
              <h4 className="text-md font-semibold text-yellow-500 mb-3">
                Reenviar Confirmación
              </h4>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">
                    Email del destinatario
                  </label>
                  <input
                    type="email"
                    value={emailConfirmacion}
                    onChange={(e) => setEmailConfirmacion(e.target.value)}
                    placeholder="tecnico@empresa.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <button
                  onClick={handleReenviarConfirmacion}
                  disabled={enviandoEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {enviandoEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      Enviar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  onEditarProductos(entrega.id);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                <i className="fa-solid fa-box-open"></i>
                Modificar Productos
              </button>

              <button
                onClick={() => {
                  onImprimirActa(entrega);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <i className="fa-solid fa-file-pdf"></i>
                Imprimir Acta
              </button>

              <button
                onClick={() => {
                  onReintegro(entrega.id);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <i className="fa-solid fa-repeat"></i>
                Reintegro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
