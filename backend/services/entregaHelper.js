const db = require("../models");
const { Entrega, EntregaProducto, Producto, Usuario, Personal } = db;

// Función para enriquecer entrega con seriales
const enrichEntregaWithSerials = async (entrega) => {
  const entregaJSON = entrega.toJSON ? entrega.toJSON() : entrega;

  // Enriquecer productos con seriales
  if (entregaJSON.EntregaProductos) {
    entregaJSON.EntregaProductos = await Promise.all(
      entregaJSON.EntregaProductos.map(async (entregaProducto) => {
        if (
          entregaProducto.unidadesSeriadas &&
          Array.isArray(entregaProducto.unidadesSeriadas)
        ) {
          const unidadesConSerial = await db.ProductoUnidad.findAll({
            where: {
              id: entregaProducto.unidadesSeriadas,
            },
            attributes: ["id", "serial"],
            raw: true,
          });

          const serialMap = unidadesConSerial.reduce((map, unidad) => {
            map[unidad.id] = unidad.serial;
            return map;
          }, {});

          entregaProducto.unidadesSeriadasDetalle =
            entregaProducto.unidadesSeriadas.map((id) => ({
              id,
              serial: serialMap[id] || "Serial no encontrado",
            }));
        }

        return entregaProducto;
      })
    );
  }

  return entregaJSON;
};

// Función para obtener entrega completa con seriales
const getEntregaWithSerials = async (id) => {
  const entrega = await Entrega.findByPk(id, {
    include: [
      {
        model: EntregaProducto,
        include: [{ model: Producto }],
        attributes: {
          include: ["unidadesSeriadas"],
        },
      },
      {
        model: Usuario,
        as: "almacenistaData",
        attributes: ["id", "nombre"],
      },
      {
        model: Personal,
        as: "tecnicoData",
        attributes: ["id", "nombre", "cedula", "cargo"],
      },
    ],
  });

  if (!entrega) {
    return null;
  }

  return await enrichEntregaWithSerials(entrega);
};

module.exports = {
  enrichEntregaWithSerials,
  getEntregaWithSerials,
};