"use client";

import ActaEntregaEquipos from "@/components/secure/ActaEntregaProductos";
import FormStock from "@/components/secure/FormStock";
import React from "react";

function page() {
  const entregaSeleccionada = {
    id: 12,
    fecha: "2025-05-20T00:00:00.000Z",
    proyecto: "Proyecto mercaderes",
    observaciones: "Se entrega productos para instalación de redes",
    estado: "pendiente",
    fechaEstimadaDevolucion: "2025-05-30T00:00:00.000Z",
    createdAt: "2025-05-20T13:32:04.000Z",
    updatedAt: "2025-05-20T13:32:04.000Z",
    almacenista: 1,
    personalId: 1,
    EntregaProductos: [
      {
        id: 20,
        cantidad: 2,
        descripcion: "ONT",
        serial: null,
        marca: "ZYCEL",
        color: "Blanco",
        devuelto: 0,
        estado: "pendiente",
        createdAt: "2025-05-20T13:32:04.000Z",
        updatedAt: "2025-05-20T13:32:04.000Z",
        EntregaId: 12,
        ProductoId: 24,
        Producto: {
          id: 24,
          codigo: "12345",
          descripcion: "ONT",
          marca: "ZYCEL",
          modelo: "23",
          color: "Blanco",
          unidadMedida: "unidad",
          stock: 2,
          stockMinimo: 1,
          fechaIngreso: "2025-05-07T15:22:47.000Z",
          estado: "disponible",
          notas: "Producto, nuevo",
          createdAt: "2025-05-07T15:22:47.000Z",
          updatedAt: "2025-05-20T13:32:04.000Z",
          StantId: 7,
          SubcategoriumId: 10,
        },
      },
      {
        id: 21,
        cantidad: 1,
        descripcion: "Martillo",
        serial: null,
        marca: "N/A",
        color: "Negro",
        devuelto: 0,
        estado: "pendiente",
        createdAt: "2025-05-20T13:32:04.000Z",
        updatedAt: "2025-05-20T13:32:04.000Z",
        EntregaId: 12,
        ProductoId: 4,
        Producto: {
          id: 4,
          codigo: "002",
          descripcion: "Martillo",
          marca: "N/A",
          modelo: "N/A",
          color: "Negro",
          unidadMedida: "unidad",
          stock: 1,
          stockMinimo: 1,
          fechaIngreso: "2025-04-29T19:11:41.000Z",
          estado: "disponible",
          notas: "Martillo nuevo",
          createdAt: "2025-04-29T19:11:41.000Z",
          updatedAt: "2025-05-20T13:32:04.000Z",
          StantId: 10,
          SubcategoriumId: 8,
        },
      },
      {
        id: 22,
        cantidad: 3000,
        descripcion: "Fibra",
        serial: null,
        marca: "S",
        color: "N/A",
        devuelto: 0,
        estado: "pendiente",
        createdAt: "2025-05-20T13:32:04.000Z",
        updatedAt: "2025-05-20T13:32:04.000Z",
        EntregaId: 12,
        ProductoId: 1,
        Producto: {
          id: 1,
          codigo: "1",
          descripcion: "Fibra",
          marca: "S",
          modelo: "N/A",
          color: "N/A",
          unidadMedida: "metros",
          stock: 6500,
          stockMinimo: 500,
          fechaIngreso: "2025-04-24T10:00:00.000Z",
          estado: "disponible",
          notas: "carreto de fibra recien ingresado a bodega.",
          createdAt: "2025-04-29T16:33:51.000Z",
          updatedAt: "2025-05-20T13:32:04.000Z",
          StantId: 41,
          SubcategoriumId: 1,
        },
      },
    ],
    almacenistaData: {
      id: 1,
      nombre: "Daniel Solarte",
      username: "Dansol23",
    },
    tecnicoData: {
      id: 1,
      nombre: "Kevin",
      cedula: "1061813299",
      cargo: "tecnico",
    },
  };

  return (
    <div>
      <ActaEntregaEquipos entregaSeleccionada={entregaSeleccionada} />
    </div>
  );
}

export default page;
