"use client";

import LegalizacionesAprobadas from "@/components/secure/almacenista/LegalizacionesAprobadas";
import LegalizacionesPendientes from "@/components/secure/almacenista/LegalizacionesPendientes";
import { useState } from "react";

export default function LegalizacionesPage() {
  const [tablaActiva, setTablaActiva] = useState("pendientes");

  return (
    <div className="h-full">
      {/* Header con botones de navegación */}
      <div className="rounded-t-lg h-[12%] flex items-end  border-b">
        {/* <h1 className="text-2xl font-bold text-gray-100 mb-4">
          Legalizaciones
        </h1> */}

        <div className="flex space-x-2 px-2 w-full h-5/6 border-gray-200">
          <button
            onClick={() => setTablaActiva("pendientes")}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
              tablaActiva === "pendientes"
                ? "bg-yellow-500 text-white border-b-2 border-yellow-500"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Pendientes
          </button>

          <button
            onClick={() => setTablaActiva("aprobadas")}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
              tablaActiva === "aprobadas"
                ? "bg-yellow-500 text-white border-b-2 border-yellow-500"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Aprobadas
          </button>
        </div>
      </div>

      {/* Contenido de las tablas */}
      <div className="bg-slate-950 rounded-lg h-[88%] shadow">
        {tablaActiva === "pendientes" && <LegalizacionesPendientes />}
        {tablaActiva === "aprobadas" && <LegalizacionesAprobadas />}
      </div>
    </div>
  );
}
