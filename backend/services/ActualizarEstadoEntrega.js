const db = require("../models");
const Entrega = db.Entrega;
const EntregaProducto = db.EntregaProducto;

const actualizarEstadoEntregaCoordinado = async (
  entregaId,
  transaction = null
) => {
  const t = transaction || (await db.sequelize.transaction());
  const shouldCommit = !transaction;

  try {
    // Obtener todos los productos de la entrega
    const productosEntrega = await EntregaProducto.findAll({
      where: { EntregaId: entregaId },
      transaction: t,
    });

    if (!productosEntrega.length) {
      if (shouldCommit) await t.commit();
      return;
    }

    let todosCompletamenteDevueltos = true;
    let todosCompletateLegalizados = true;
    let todosCerrados = true;
    let hayParcialDevuelto = false;
    let hayParcialLegalizado = false;
    let hayProductosSinProcesar = false;

    // Analizar el estado de cada producto
    for (const producto of productosEntrega) {
      const cantidadTotal = producto.cantidad;
      const cantidadDevuelta = producto.devuelto || 0;
      const cantidadLegalizada = producto.legalizado || 0;
      const cantidadProcesada = cantidadDevuelta + cantidadLegalizada;

      // Verificar estados individuales
      if (cantidadDevuelta < cantidadTotal) {
        todosCompletamenteDevueltos = false;
      }

      if (cantidadLegalizada < cantidadTotal) {
        todosCompletateLegalizados = false;
      }

      if (cantidadProcesada < cantidadTotal) {
        todosCerrados = false;
        hayProductosSinProcesar = true;
      }

      if (cantidadDevuelta > 0 && cantidadDevuelta < cantidadTotal) {
        hayParcialDevuelto = true;
      }

      if (cantidadLegalizada > 0 && cantidadLegalizada < cantidadTotal) {
        hayParcialLegalizado = true;
      }

      // Actualizar estado individual del producto
      let estadoProducto;
      if (cantidadProcesada === cantidadTotal) {
        // Si está completamente procesado, siempre es "cerrado"
        // Sin importar si fue devuelto, legalizado o mixto
        estadoProducto = "cerrado";
      } else if (cantidadDevuelta > 0 && cantidadLegalizada > 0) {
        estadoProducto = "mixto_parcial"; 
      } else if (cantidadDevuelta > 0) {
        estadoProducto = "devuelto_parcial";
      } else if (cantidadLegalizada > 0) {
        estadoProducto = "legalizado_parcial";
      } else {
        estadoProducto = "pendiente";
      }

      // Actualizar el estado del producto si cambió
      if (producto.estado !== estadoProducto) {
        producto.estado = estadoProducto;
        await producto.save({ transaction: t });
      }
    }

    // Determinar el estado general de la entrega
    let estadoEntrega;

    if (todosCerrados) {

      estadoEntrega = "cerrada";
    } else {
      // Hay productos pendientes de procesar
      if (hayParcialDevuelto && hayParcialLegalizado) {
        estadoEntrega = "mixto_parcial";
      } else if (hayParcialDevuelto) {
        estadoEntrega = "parcialmente_devuelta";
      } else if (hayParcialLegalizado) {
        estadoEntrega = "parcialmente_legalizada";
      } else if (hayProductosSinProcesar) {
        estadoEntrega = "pendiente"; // Productos entregados pero sin procesar
      } else {
        estadoEntrega = "entregada";
      }
    }

    // Actualizar el estado de la entrega
    await Entrega.update(
      { estado: estadoEntrega },
      {
        where: { id: entregaId },
        transaction: t,
      }
    );

    if (shouldCommit) {
      await t.commit();
    }

    return estadoEntrega;
  } catch (error) {
    if (shouldCommit) {
      await t.rollback();
    }
    throw error;
  }
};

// Función auxiliar para obtener resumen de estados (útil para debugging)
const obtenerResumenEstadoEntrega = async (entregaId) => {
  const productos = await EntregaProducto.findAll({
    where: { EntregaId: entregaId },
    include: [{ model: db.Producto, attributes: ['descripcion'] }]
  });

  const resumen = productos.map(p => ({
    producto: p.Producto.descripcion,
    cantidad: p.cantidad,
    devuelto: p.devuelto || 0,
    legalizado: p.legalizado || 0,
    pendiente: p.cantidad - (p.devuelto || 0) - (p.legalizado || 0),
    estado: p.estado
  }));

  return resumen;
};

// EXPORT CORRECTO (opción recomendada)
module.exports = {
  actualizarEstadoEntregaCoordinado,
  obtenerResumenEstadoEntrega
};