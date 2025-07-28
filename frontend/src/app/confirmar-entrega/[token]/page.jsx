'use client';
import { use, useEffect, useState } from 'react';

export default function ConfirmarEntrega({ params }) {
  const { token } = use(params);

  const [loading, setLoading] = useState(true);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    // Simular la llamada a la API para demo
    // setTimeout(() => {
    //   setResultado({ success: true });
    //   setLoading(false);
    // }, 2000);
    
    // Tu código original comentado:
    fetch(`http://172.16.110.74:3004/api/entregas/confirmar-entrega/${token}`)
      .then((res) => res.json())
      .then((data) => {
        setResultado(data);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-700">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">
              Confirmando entrega...
            </h2>
            <p className="text-slate-200/70">
              Por favor espera mientras procesamos tu solicitud
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-700">
        {resultado?.success ? (
          <div className="text-center">
            {/* Icono de éxito animado */}
            <div className="mx-auto w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <svg className="w-10 h-10 text-slate-950" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-slate-200 mb-4">
              ¡Entrega Confirmada!
            </h2>
            
            <p className="text-slate-200/80 text-lg mb-6 leading-relaxed">
              Tu entrega ha sido confirmada exitosamente.
            </p>
            
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-700">
              <p className="text-yellow-500 font-medium text-sm">
                📦 Estado: Entregado
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            {/* Icono de error */}
            <div className="mx-auto w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-slate-200 mb-4">
              Error en la confirmación
            </h2>
            
            <p className="text-slate-200/80 text-lg mb-6 leading-relaxed">
              {resultado?.message || 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.'}
            </p>
            
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-700">
              <p className="text-red-400 font-medium text-sm">
                ⚠️ No se pudo confirmar la entrega
              </p>
            </div>
            
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Intentar nuevamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}