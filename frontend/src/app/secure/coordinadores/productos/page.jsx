'use client'
import React, { useState } from 'react';
import { Package, MapPin, Tags, User } from 'lucide-react';
import BusquedaRapida from '@/components/secure/almacenista/Busqueda';

const EjemploBusquedaProductos = () => {
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  const manejarSeleccionProducto = (producto) => {
    setProductoSeleccionado(producto);
    setMostrarDetalles(true);
    console.log('Producto seleccionado:', producto);
  };

  const cerrarDetalles = () => {
    setMostrarDetalles(false);
    setProductoSeleccionado(null);
  };

  return (
    <div className="bg-slate-950 p-2">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-200 mb-3 text-center">
Búsqueda de Productos
        </h1>
        
        {/* Componente de búsqueda */}
        <div className="mb-2">
          <BusquedaRapida
            onProductoSeleccionado={manejarSeleccionProducto}
            mostrarUnidades={true}
          />
        </div>

        {/* Instrucciones de uso */}
        <div className="bg-slate-900 rounded-lg shadow-sm p-6 mb-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">
            Cómo usar la búsqueda:
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Escribe al menos 2 caracteres para ver sugerencias</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Presiona Enter o haz clic en una sugerencia para buscar</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Busca por código, descripción, marca, modelo o serial</span>
              </li>
            </ul>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Los resultados muestran disponibilidad en tiempo real</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Las búsquedas recientes se guardan automáticamente</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Haz clic en un producto para ver más detalles</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal de detalles del producto */}
        {mostrarDetalles && productoSeleccionado && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-200">
                    Detalles del Producto
                  </h2>
                  <button
                    onClick={cerrarDetalles}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Información básica */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-yellow-500" />
                        Información Básica
                      </h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Código:</span> {productoSeleccionado.codigo}</p>
                        <p><span className="font-medium">Descripción:</span> {productoSeleccionado.descripcion}</p>
                        {productoSeleccionado.marca && (
                          <p><span className="font-medium">Marca:</span> {productoSeleccionado.marca}</p>
                        )}
                        {productoSeleccionado.modelo && (
                          <p><span className="font-medium">Modelo:</span> {productoSeleccionado.modelo}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-green-500" />
                        Ubicación y Stock
                      </h3>
                      <div className="space-y-2">
                        {productoSeleccionado.Stant && (
                          <p><span className="font-medium">Estante:</span> {productoSeleccionado.Stant.nombre}</p>
                        )}
                        <p><span className="font-medium">Stock Disponible:</span> 
                          <span className={`ml-2 px-2 py-1 text-sm rounded-full ${
                            productoSeleccionado.stockDisponible > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {productoSeleccionado.stockDisponible}
                          </span>
                        </p>
                        {productoSeleccionado.stockTotal !== productoSeleccionado.stockDisponible && (
                          <p><span className="font-medium">Stock Total:</span> {productoSeleccionado.stockTotal}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Categorización */}
                  {productoSeleccionado.Subcategorium && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Tags className="w-5 h-5 mr-2 text-purple-500" />
                        Categorización
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {productoSeleccionado.Subcategorium.Categorium?.nombre}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {productoSeleccionado.Subcategorium.nombre}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Stock por estado (si tiene unidades seriadas) */}
                  {productoSeleccionado.stockPorEstado && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Stock por Estado
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(productoSeleccionado.stockPorEstado).map(([estado, cantidad]) => (
                          <div key={estado} className="bg-gray-50 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-gray-800">{cantidad}</div>
                            <div className="text-sm text-gray-600 capitalize">{estado}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Información adicional para seriales */}
                  {productoSeleccionado.tipoResultado === 'serial' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Información del Serial
                      </h3>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p><span className="font-medium">Serial:</span> {productoSeleccionado.serial}</p>
                        <p><span className="font-medium">Estado:</span> 
                          <span className={`ml-2 px-2 py-1 text-sm rounded-full capitalize ${
                            ['nuevo', 'usado'].includes(productoSeleccionado.estado)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {productoSeleccionado.estado}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={cerrarDetalles}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cerrar
                  </button>
                  {/* <button
                    onClick={() => {
                      // Aquí puedes agregar lógica adicional como navegar a la página del producto
                      console.log('Ver producto completo:', productoSeleccionado);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Ver Completo
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Información sobre la funcionalidad */}
        <div className="bg-slate-900 rounded-lg shadow-sm px-6 py-3">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">
            Características de la Búsqueda:
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-400 mb-2">Búsqueda Inteligente</h4>
              <p className="text-sm text-gray-600">
                Busca en múltiples campos simultáneamente con coincidencias parciales
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-400 mb-2">Stock en Tiempo Real</h4>
              <p className="text-sm text-gray-600">
                Muestra disponibilidad actualizada considerando todos los estados
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Tags className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-400 mb-2">Autocompletado</h4>
              <p className="text-sm text-gray-600">
                Sugerencias inteligentes y historial de búsquedas recientes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EjemploBusquedaProductos;