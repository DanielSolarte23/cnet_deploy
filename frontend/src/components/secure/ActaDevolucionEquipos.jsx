import { useState } from 'react';
import Image from 'next/image';

export default function ActaDevolucionEquipos({ 
  entrega_elemento, 
  detalle_entrega_elementos 
}) {
  const [fecha, setFecha] = useState('___________________');
  
  return (
    <div className="w-full min-h-screen relative font-sans m-0 p-0">
      {/* Fondo con marca de agua */}
      <div 
        className="absolute inset-0 bg-center bg-no-repeat bg-cover opacity-50 z-0" 
        style={{ backgroundImage: 'url(/marcadeagua.png)' }} 
      />
      
      {/* Contenido principal */}
      <div className="relative z-10">
        {/* Header */}
        <header className="w-full h-24 mb-5 opacity-50">
          <Image
            src="/logo.png"
            alt="Logo"
            width={800}
            height={100}
            layout="responsive"
            priority
          />
        </header>

        {/* Contenedor principal */}
        <div className="container mx-auto px-4">
          <div>
            <h3 className="text-right text-base">Fecha: {fecha}</h3>
            <h1 className="text-center text-lg font-bold">ACTA DEVOLUCION DE EQUIPOS</h1>
            <p className="text-base">
              Con la presente acta se le hace entrega de los siguientes elementos para ser reintegrados en almacén:
            </p>
          </div>

          {/* Tabla de elementos */}
          <div className="datos-proyecto my-4">
            <table className="w-full border-collapse border border-black">
              <thead>
                <tr className="text-base">
                  <th className="border border-black p-2 bg-gray-100">#</th>
                  <th className="border border-black p-2 bg-gray-100">Cantidad</th>
                  <th className="border border-black p-2 bg-gray-100">Tipo de Cantidad</th>
                  <th className="border border-black p-2 bg-gray-100">Elemento</th>
                  <th className="border border-black p-2 bg-gray-100">Marca</th>
                  <th className="border border-black p-2 bg-gray-100">Serial</th>
                </tr>
              </thead>
              <tbody>
                {detalle_entrega_elementos?.map((detalle, index) => (
                  <tr key={index} className="text-sm">
                    <td className="border border-black p-2">{index + 1}</td>
                    <td className="border border-black p-2">{detalle.cantidad_devolucionada || ''}</td>
                    <td className="border border-black p-2">{detalle.elemento?.tipoCantidad?.tipo_cantidad}</td>
                    <td className="border border-black p-2">{detalle.elemento?.item?.item}</td>
                    <td className="border border-black p-2">{detalle.elemento?.marca}</td>
                    <td className="border border-black p-2">{detalle.elemento?.serial}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Manifesto */}
          <div className="my-4">
            <p className="text-base font-bold">Manifiesto que:</p>
            <ul className="list-disc pl-8 text-base">
              <li>Se verifica la entrega de elementos en buen estado a almacén.</li>
            </ul>
          </div>

          {/* Tabla de firmas */}
          <div className="mt-6">
            <table className="w-full border-collapse border border-black">
              <thead>
                <tr className="text-base">
                  <th className="border border-black p-2 bg-gray-100">Entregado por:</th>
                  <th className="border border-black p-2 bg-gray-100">Cargo:</th>
                  <th className="border border-black p-2 bg-gray-100">Recibido por:</th>
                  <th className="border border-black p-2 bg-gray-100">Cargo:</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-sm">
                  <td className="border border-black p-2">{entrega_elemento?.empleado?.nombres_completos}</td>
                  <td className="border border-black p-2">{entrega_elemento?.empleado?.cargoEmpleado?.cargo_empleado}</td>
                  <td className="border border-black p-2">Leidy Viviana Bolaños</td>
                  <td className="border border-black p-2">Almacén</td>
                </tr>
                <tr className="text-base">
                  <th className="border border-black p-2 bg-gray-100">Firma:</th>
                  <th className="border border-black p-2 bg-gray-100">Cédula:</th>
                  <th className="border border-black p-2 bg-gray-100">Firma:</th>
                  <th className="border border-black p-2 bg-gray-100">Cédula:</th>
                </tr>
                <tr className="text-sm">
                  <td className="border border-black p-2 h-12"></td>
                  <td className="border border-black p-2">{entrega_elemento?.empleado?.documento}</td>
                  <td className="border border-black p-2 h-12"></td>
                  <td className="border border-black p-2">1061720521</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full h-24 absolute bottom-0 opacity-50">
          <Image
            src="/footer.png"
            alt="Footer"
            width={800}
            height={100}
            layout="responsive"
          />
        </footer>
      </div>
    </div>
  );
}