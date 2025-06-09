"use client";
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertCircle, Package2, Tag } from 'lucide-react';

export default function TarjetaProductoAdaptativa({ producto }) {
  // Si no hay producto, usa datos de ejemplo
  const productoMuestra = {
    id: 2,
    codigo: "PRD001",
    descripcion: "Fibra span 200",
    serial: "N/A",
    marca: "N/A",
    modelo: "N/A",
    color: "N/A",
    unidadMedida: "Metros",
    stock: 52,
    stockMinimo: 500,
    estado: "disponible",
    Subcategorium: {
      nombre: "Fibra 24 hilos",
      Categorium: {
        nombre: "Fibra"
      }
    },
    Stant: {
      nombre: "modulo 1"
    }
  };

  const item = producto || productoMuestra;
  
  // Determinar el stock máximo basado en la unidad de medida y el stock mínimo
  const getStockConfig = () => {
    // Unidades que típicamente tienen valores altos
    const unidadesVolumen = ['metros', 'kilogramos', 'litros', 'm', 'kg', 'l'];
    
    // Configuración predeterminada para unidades pequeñas (default)
    let maxStock = 100;
    let multiplicadorAlerta = 1.5; // Para alertas amarillas
    
    // Ajustar según la unidad de medida
    const unidadLowerCase = item.unidadMedida.toLowerCase();
    
    if (unidadesVolumen.includes(unidadLowerCase)) {
      // Si es una unidad de volumen, ajustar según el stock mínimo
      maxStock = Math.max(item.stockMinimo * 3, 1000);
      multiplicadorAlerta = 1.2;
    } else {
      // Para unidades contables como "unidad"
      maxStock = Math.max(item.stockMinimo * 5, 100);
    }
    
    return { maxStock, multiplicadorAlerta };
  };
  
  const { maxStock, multiplicadorAlerta } = getStockConfig();
  
  // Calcular el porcentaje del stock
  const stockPorcentaje = Math.min((item.stock / maxStock) * 100, 100);
  
  // Determinar el color basado en el stock y stockMinimo
  const getStockColor = () => {
    if (item.stock <= item.stockMinimo) return "#EF4444"; // rojo - stock crítico
    if (item.stock < item.stockMinimo * multiplicadorAlerta) return "#F59E0B"; // amarillo - stock bajo
    return "#10B981"; // verde - stock adecuado
  };

  // Datos para el gráfico de velocímetro
  const data = [
    { name: 'stock', value: stockPorcentaje },
    { name: 'vacío', value: 100 - stockPorcentaje }
  ];

  // Colores para el gráfico
  const COLORS = [getStockColor(), '#F3F4F6'];

  // Formatear número grande
  const formatearNumero = (numero) => {
    if (numero >= 1000) {
      return (numero / 1000).toFixed(1) + 'k';
    }
    return numero.toString();
  };

  return (
    <div className="bg-slate-900 rounded-lg shadow-md overflow-hidden w-full">
      {/* Cabecera */}
      <div className="bg-gray-800 text-white p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm truncate">{item.descripcion}</h3>
          <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full">#{item.codigo}</span>
        </div>
      </div>

      <div className="flex">
        {/* Gráfico de velocímetro */}
        <div className="p-2 bg-slate-900 w-1/2 flex flex-col items-center justify-center">
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  startAngle={180}
                  endAngle={0}
                  data={data}
                  cx="50%"
                  cy="90%"
                  innerRadius={30}
                  outerRadius={40}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Indicador numérico de stock */}
          <div className="flex flex-col items-center mb-1">
            <span className="text-xl font-bold" style={{ color: getStockColor() }}>
              {formatearNumero(item.stock)}
            </span>
            <span className="text-gray-500 text-xs">{item.unidadMedida}</span>
          </div>
        </div>

        {/* Información relevante */}
        <div className="p-3 w-1/2">
          <div className="flex items-center mb-2 text-xs">
            <div className="w-full flex justify-between">
              <span className="font-medium">Stock mín:</span>
              <span className="font-bold">{formatearNumero(item.stockMinimo)} {item.unidadMedida.charAt(0)}</span>
            </div>
          </div>
          
          <div className="text-xs mb-2">
            <p className="text-gray-500">Categoría</p>
            <p className="font-medium truncate">{item.Subcategorium.Categorium.nombre}</p>
          </div>
          
          <div className="text-xs mb-2">
            <p className="text-gray-500">Subcategoría</p>
            <p className="font-medium truncate">{item.Subcategorium.nombre}</p>
          </div>
          
          <div className="text-xs">
            <p className="text-gray-500">Ubicación</p>
            <p className="font-medium truncate">{item.Stant.nombre}</p>
          </div>
        </div>
      </div>

      {/* Footer con indicador de nivel */}
      <div className="p-2 bg-gray-900 border-t border-gray-200 flex justify-between text-xs">
        {/* <div className="flex items-center">
          <Package2 className="h-3 w-3 text-gray-500 mr-1" />
          <span className="text-gray-700">
            {Math.round(stockPorcentaje)}% de capacidad
          </span>
        </div> */}
        <span className={`px-2 py-0.5 rounded-full ${item.estado === 'disponible' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
        </span>
      </div>
    </div>
  );
}