'use client';

import { useState } from 'react';

export default function ModalObservaciones({ isOpen, onClose, onConfirm, cantidad }) {
  const [observaciones, setObservaciones] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(observaciones);
    setObservaciones('');
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-300 mb-4">
          Aprobar {cantidad} Legalizaciones
        </h3>
        
        <p className="text-gray-400 mb-4">
          Está a punto de aprobar {cantidad} legalizaciones. Por favor, agregue una observación:
        </p>

        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Ingrese sus observaciones aquí..."
          className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={!observaciones.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Aprobar
          </button>
        </div>
      </div>
    </div>
  );
}