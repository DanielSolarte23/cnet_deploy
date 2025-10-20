'use client';

import { useState, useEffect } from 'react';
import ModalObservaciones from './ModalObservaciones';

export default function LegalizacionesPendientes() {
  const [legalizaciones, setLegalizaciones] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchLegalizaciones();
  }, []);

  const fetchLegalizaciones = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://172.16.110.74:3004/api/legalizacion/pendientes');
      const result = await response.json();
      
      if (result.success) {
        setLegalizaciones(result.data);
      }
    } catch (error) {
      console.error('Error fetching legalizaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id) => {
    const newSeleccionadas = new Set(seleccionadas);
    if (newSeleccionadas.has(id)) {
      newSeleccionadas.delete(id);
    } else {
      newSeleccionadas.add(id);
    }
    setSeleccionadas(newSeleccionadas);
  };

  const handleSelectAll = () => {
    if (seleccionadas.size === legalizaciones.length) {
      setSeleccionadas(new Set());
    } else {
      setSeleccionadas(new Set(legalizaciones.map(l => l.id)));
    }
  };

  const handleAprobarUna = async (id) => {
    try {
      const response = await fetch(`http://172.16.110.74:3004/api/legalizacion/${id}/aprobar`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        fetchLegalizaciones();
        setSeleccionadas(new Set());
      }
    } catch (error) {
      console.error('Error aprobando legalización:', error);
    }
  };

  const handleRechazarUna = async (id) => {
    try {
      const response = await fetch(`http://172.16.110.74:3004/api/legalizacion/${id}/rechazar`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        fetchLegalizaciones();
        setSeleccionadas(new Set());
      }
    } catch (error) {
      console.error('Error rechazando legalización:', error);
    }
  };

  const handleAprobarMultiples = () => {
    if (seleccionadas.size > 1) {
      setShowModal(true);
    }
  };

  const confirmarAprobacionMultiple = async (observaciones) => {
    try {
      const response = await fetch('http://172.16.110.74:3004/api/legalizacions/multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          legalizacionIds: Array.from(seleccionadas),
          almacenistaId: 1, // Esto debería venir del usuario logueado
          observaciones: observaciones
        })
      });

      if (response.ok) {
        fetchLegalizaciones();
        setSeleccionadas(new Set());
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error aprobando múltiples legalizaciones:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full ">
      {/* Botones de acción */}
      {seleccionadas.size > 0 && (
        <div className=" p-4 bg-slate-900 h-[15%] rounded-lg flex items-center justify-between">
          <span className="text-yellow-500 font-medium">
            {seleccionadas.size} legalización{seleccionadas.size > 1 ? 'es' : ''} seleccionada{seleccionadas.size > 1 ? 's' : ''}
          </span>
          
          <div className="space-x-2">
            {seleccionadas.size === 1 && (
              <>
                <button
                  onClick={() => handleAprobarUna(Array.from(seleccionadas)[0])}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => handleRechazarUna(Array.from(seleccionadas)[0])}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Rechazar
                </button>
              </>
            )}
            
            {seleccionadas.size > 1 && (
              <button
                onClick={handleAprobarMultiples}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Aprobar Seleccionadas
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className={`overflow-x-auto px-5 ${seleccionadas.size > 0 ? "h-[85%] max-h-[85%]": "h-full max-h-full"} overflow-y-auto`}>
        <table className="min-w-full bg-slate-900 border border-slate-700">
          <thead className="bg-slate-950">
            <tr>
              <th className="px-2 py-3 text-left">
                <input
                  type="checkbox"
                  checked={seleccionadas.size === legalizaciones.length && legalizaciones.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th> */}
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Técnico</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Justificación</th>
            </tr>
          </thead>
          <tbody className="bg-slate-900 divide-y divide-gray-700">
            {legalizaciones.map((legalizacion) => (
              <tr key={legalizacion.id} className="">
                <td className="px-2 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={seleccionadas.has(legalizacion.id)}
                    onChange={() => handleCheckboxChange(legalizacion.id)}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                </td>
                {/* <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                  {legalizacion.id}
                </td> */}
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(legalizacion.fecha)}
                </td>
                <td className="px-2 py-4 text-sm text-gray-300">
                  <div>
                    <div className="font-medium">{legalizacion.producto.codigo}</div>
                    <div className="text-gray-500 text-xs">{legalizacion.producto.descripcion}</div>
                    <div className="text-gray-400 text-xs">Marca: {legalizacion.producto.marca}</div>
                  </div>
                </td>
                <td className="px-2 py-4 text-sm text-gray-300">
                  <div>
                    <div className="font-medium">{legalizacion.tecnicoData.nombre}</div>
                    <div className="text-gray-500 text-xs">CC: {legalizacion.tecnicoData.cedula}</div>
                  </div>
                </td>
                <td className="px-2 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-slate-800">
                    {legalizacion.tipo}
                  </span>
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-300">
                  {legalizacion.cantidad}
                  {legalizacion.unidadesSeriadas && (
                    <div className="text-xs text-gray-500">
                      Series: {legalizacion.unidadesSeriadas.join(', ')}
                    </div>
                  )}
                </td>
                <td className="px-2 py-4 text-sm text-gray-300">
                  <div>
                    <div className="font-medium">{legalizacion.entregaOriginal.proyecto}</div>
                    <div className="text-gray-500 text-xs">
                      {formatDate(legalizacion.entregaOriginal.fecha)}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-4 text-sm text-gray-300">
                  {legalizacion.ubicacion}
                </td>
                <td className="px-2 py-4 text-sm text-gray-500 max-w-xs">
                  <div className="truncate" title={legalizacion.justificacion}>
                    {legalizacion.justificacion}
                  </div>
                  {legalizacion.observaciones && (
                    <div className="text-xs text-gray-400 mt-1 truncate" title={legalizacion.observaciones}>
                      Obs: {legalizacion.observaciones}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {legalizaciones.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay legalizaciones pendientes
          </div>
        )}
      </div>

      {/* Modal para observaciones */}
      {showModal && (
        <ModalObservaciones
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={confirmarAprobacionMultiple}
          cantidad={seleccionadas.size}
        />
      )}
    </div>
  );
}