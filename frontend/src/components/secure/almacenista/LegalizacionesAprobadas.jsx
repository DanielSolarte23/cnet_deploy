'use client';

import { useState, useEffect } from 'react';

export default function LegalizacionesAprobadas() {
  const [legalizaciones, setLegalizaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  // Datos de ejemplo por ahora
  useEffect(() => {
    // Simulando datos de ejemplo para legalizaciones aprobadas
    setLegalizaciones([
      {
        id: 1,
        fecha: '2025-09-15T10:00:00.000Z',
        fechaAprobacion: '2025-09-16T14:30:00.000Z',
        tipo: 'instalado',
        cantidad: 2,
        producto: {
          codigo: 'PRD-0001',
          descripcion: 'Router WiFi AC1200',
          marca: 'TP-Link'
        },
        tecnicoData: {
          nombre: 'Juan Pérez',
          cedula: '12345678'
        },
        entregaOriginal: {
          proyecto: 'Instalación Residencial Norte',
          fecha: '2025-09-14T00:00:00.000Z'
        },
        ubicacion: 'Calle 123 #45-67',
        almacenistaData: {
          nombre: 'María González',
          cedula: '87654321'
        },
        observaciones: 'Instalación completada correctamente'
      },
      {
        id: 2,
        fecha: '2025-09-14T09:15:00.000Z',
        fechaAprobacion: '2025-09-15T16:20:00.000Z',
        tipo: 'configurado',
        cantidad: 1,
        producto: {
          codigo: 'PRD-0002',
          descripcion: 'Módem ADSL',
          marca: 'Huawei'
        },
        tecnicoData: {
          nombre: 'Carlos López',
          cedula: '11223344'
        },
        entregaOriginal: {
          proyecto: 'Mantenimiento Centro',
          fecha: '2025-09-13T00:00:00.000Z'
        },
        ubicacion: 'Oficina Central',
        almacenistaData: {
          nombre: 'Ana Rodríguez',
          cedula: '44332211'
        },
        observaciones: 'Configuración actualizada según requerimientos'
      }
    ]);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Legalizaciones Aprobadas</h2>
        <p className="text-gray-600 text-sm">
          Total de legalizaciones aprobadas: {legalizaciones.length}
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-green-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Solicitud</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Aprobación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnico</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Almacenista</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyecto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {legalizaciones.map((legalizacion) => (
              <tr key={legalizacion.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {legalizacion.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(legalizacion.fecha)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(legalizacion.fechaAprobacion)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{legalizacion.producto.codigo}</div>
                    <div className="text-gray-500 text-xs">{legalizacion.producto.descripcion}</div>
                    <div className="text-gray-400 text-xs">Marca: {legalizacion.producto.marca}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{legalizacion.tecnicoData.nombre}</div>
                    <div className="text-gray-500 text-xs">CC: {legalizacion.tecnicoData.cedula}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{legalizacion.almacenistaData.nombre}</div>
                    <div className="text-gray-500 text-xs">CC: {legalizacion.almacenistaData.cedula}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {legalizacion.tipo}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {legalizacion.cantidad}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{legalizacion.entregaOriginal.proyecto}</div>
                    <div className="text-gray-500 text-xs">
                      {formatDate(legalizacion.entregaOriginal.fecha)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  <div className="truncate" title={legalizacion.observaciones}>
                    {legalizacion.observaciones}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {legalizaciones.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay legalizaciones aprobadas
          </div>
        )}
      </div>
    </div>
  );
}