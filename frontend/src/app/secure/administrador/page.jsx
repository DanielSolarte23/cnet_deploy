"use client";
import TarjetaProductoVelocimetro from "@/components/secure/admin/TarjetaProductoVelocimetro";
import Container from "@/components/secure/Container";
import { useProductos } from "@/context/ProductosContext";
import React, { use } from "react";
import { useState, useEffect } from "react";

function page() {
  const { productos, getStockBajo } = useProductos();

  useEffect(() => {
    getStockBajo();
  }, []);

  return (
    <div className="h-full w-full rounded-lg bg-slate-950">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 grid-rows">
        {productos.map((producto) => (
          <TarjetaProductoVelocimetro key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
  );
}

export default page;
