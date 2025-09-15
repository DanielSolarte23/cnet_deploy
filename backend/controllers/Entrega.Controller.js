// const db = require("../models");
// const Entrega = db.Entrega;
// const EntregaProducto = db.EntregaProducto;
// const Producto = db.Producto;
// const Usuario = db.Usuario;
// const Personal = db.Personal;
// const { Op } = require("sequelize");

// const EntregaController = {
//   async create(req, res) {
//     const t = await db.sequelize.transaction();

//     try {
//       const { entrega, productos } = req.body;

//       // Crear la entrega
//       const nuevaEntrega = await Entrega.create(entrega, { transaction: t });

//       // Procesar los productos de la entrega
//       for (const prod of productos) {
//         // Buscar el producto en inventario
//         const producto = await Producto.findByPk(prod.ProductoId, {
//           transaction: t,
//         });

//         if (!producto) {
//           throw new Error(`El producto con ID ${prod.ProductoId} no existe`);
//         }

//         // Obtener información base del producto para incluir en EntregaProducto
//         const infoProducto = {
//           descripcion: producto.descripcion,
//           marca: producto.marca,
//           color: producto.color,
//         };

//         // Verificar si el producto tiene unidades con seriales
//         if (
//           prod.unidadesSeriadas &&
//           Array.isArray(prod.unidadesSeriadas) &&
//           prod.unidadesSeriadas.length > 0
//         ) {
//           // Para productos con seriales, verificamos cada unidad específica
//           const cantidad = prod.unidadesSeriadas.length;

//           // Verificar que todas las unidades existan y pertenezcan al producto
//           for (const unidadId of prod.unidadesSeriadas) {
//             const unidad = await db.ProductoUnidad.findOne({
//               where: {
//                 id: unidadId,
//                 productoId: prod.ProductoId,
//               },
//               transaction: t,
//             });

//             if (!unidad) {
//               throw new Error(
//                 `La unidad con ID ${unidadId} no existe o no pertenece al producto ${producto.descripcion}`
//               );
//             }

//             // Aquí podrías actualizar el estado de la unidad si es necesario
//             unidad.estado = 'instalacion';
//             await unidad.save({ transaction: t });
//           }

//           // Crear el registro en EntregaProducto con la cantidad basada en las unidades seriadas
//           await EntregaProducto.create(
//             {
//               EntregaId: nuevaEntrega.id,
//               ProductoId: prod.ProductoId,
//               cantidad: cantidad,
//               unidadesSeriadas: prod.unidadesSeriadas, // Guardar los IDs de las unidades específicas
//               ...infoProducto,
//             },
//             { transaction: t }
//           );

//           // Actualizar el stock
//           producto.stock -= cantidad;
//           await producto.save({ transaction: t });
//         } else {
//           if (producto.stock < prod.cantidad) {
//             throw new Error(
//               `Stock insuficiente para el producto: ${producto.descripcion}`
//             );
//           }

//           // Crear el registro en EntregaProducto
//           await EntregaProducto.create(
//             {
//               EntregaId: nuevaEntrega.id,
//               ProductoId: prod.ProductoId,
//               cantidad: prod.cantidad,
//               ...infoProducto,
//             },
//             { transaction: t }
//           );

//           // Actualizar el stock
//           producto.stock -= prod.cantidad;
//           await producto.save({ transaction: t });
//         }

//         // Verificar si el stock quedó bajo el mínimo y generar notificación
//         if (producto.stock <= producto.stockMinimo) {
//           await db.Notificacion.create(
//             {
//               tipo: "stock_bajo",
//               mensaje: `Stock bajo para el producto: ${producto.descripcion} (${producto.stock} unidades)`,
//               detalles: {
//                 stockActual: producto.stock,
//                 stockMinimo: producto.stockMinimo,
//                 codigo: producto.codigo || "",
//               },
//               nivel: producto.stock === 0 ? "urgente" : "advertencia",
//               productoId: producto.id,
//             },
//             { transaction: t }
//           );
//         }
//       }

//       await t.commit();

//       // Obtener la entrega completa con sus relaciones
//       const entregaCompleta = await Entrega.findByPk(nuevaEntrega.id, {
//         include: [
//           {
//             model: EntregaProducto,
//             include: [{ model: Producto }],
//             // Asegurar que se incluyan todos los campos, incluyendo unidadesSeriadas
//             attributes: {
//               include: ["unidadesSeriadas"], // Explícitamente incluir el campo
//             },
//           },
//           {
//             model: Usuario,
//             as: "almacenistaData",
//             attributes: ["id", "nombre", "username"],
//           },
//           {
//             model: Personal,
//             as: "tecnicoData",
//             attributes: ["id", "nombre", "cedula", "cargo"],
//           },
//         ],
//       });

//       return res.status(201).json({
//         success: true,
//         message: "Entrega creada correctamente",
//         data: entregaCompleta,
//       });
//     } catch (error) {
//       await t.rollback();
//       return res.status(400).json({
//         success: false,
//         message: "Error al crear la entrega",
//         error: error.message,
//       });
//     }
//   },

//   // Obtener todas las entregas
//   async findAll(req, res) {
//     try {
//       const entregas = await Entrega.findAll({
//         include: [
//           {
//             model: EntregaProducto,
//             include: [{ model: Producto }],
//             // Asegurar que se incluyan todos los campos, incluyendo unidadesSeriadas
//             // attributes: {
//             //   include: ["unidadesSeriadas"], // Explícitamente incluir el campo
//             // },
//           },
//           {
//             model: Usuario,
//             as: "almacenistaData",
//             attributes: ["id", "nombre"],
//           },
//           {
//             model: Personal,
//             as: "tecnicoData",
//             attributes: ["id", "nombre", "cedula", "cargo"],
//           },
//         ],
//         order: [["fecha", "DESC"]],
//       });

//       // Enriquecer los datos con los seriales
//       const entregasEnriquecidas = await Promise.all(
//         entregas.map(async (entrega) => {
//           const entregaJSON = entrega.toJSON();

//           // Procesar cada producto de la entrega
//           if (entregaJSON.EntregaProductos) {
//             entregaJSON.EntregaProductos = await Promise.all(
//               entregaJSON.EntregaProductos.map(async (entregaProducto) => {
//                 // Si tiene unidades seriadas, obtener los seriales
//                 if (
//                   entregaProducto.unidadesSeriadas &&
//                   Array.isArray(entregaProducto.unidadesSeriadas)
//                 ) {
//                   // Obtener los seriales de las unidades
//                   const unidadesConSerial = await db.ProductoUnidad.findAll({
//                     where: {
//                       id: entregaProducto.unidadesSeriadas,
//                     },
//                     attributes: ["id", "serial"],
//                     raw: true,
//                   });

//                   // Crear un mapa para acceso rápido
//                   const serialMap = unidadesConSerial.reduce((map, unidad) => {
//                     map[unidad.id] = unidad.serial;
//                     return map;
//                   }, {});

//                   // Enriquecer los datos manteniendo la estructura original
//                   entregaProducto.unidadesSeriadasDetalle =
//                     entregaProducto.unidadesSeriadas.map((id) => ({
//                       id: id,
//                       serial: serialMap[id] || "Serial no encontrado",
//                     }));
//                 }

//                 return entregaProducto;
//               })
//             );
//           }

//           return entregaJSON;
//         })
//       );

//       return res.status(200).json({
//         success: true,
//         count: entregasEnriquecidas.length,
//         data: entregasEnriquecidas,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: "Error al obtener las entregas",
//         error: error.message,
//       });
//     }
//   },

//   async findOne(req, res) {
//     try {
//       const { id } = req.params;
//       const entrega = await Entrega.findByPk(id, {
//         include: [
//           {
//             model: EntregaProducto,
//             include: [{ model: Producto }],
//           },
//           {
//             model: Usuario,
//             as: "almacenistaData",
//             attributes: ["id", "nombre"],
//           },
//           {
//             model: Personal,
//             as: "tecnicoData",
//             attributes: ["id", "nombre", "cedula", "cargo"],
//           },
//         ],
//       });

//       if (!entrega) {
//         return res.status(404).json({
//           success: false,
//           message: "Entrega no encontrada",
//         });
//       }

//       const entregaJSON = entrega.toJSON();

//       // Enriquecer productos con seriales
//       if (entregaJSON.EntregaProductos) {
//         entregaJSON.EntregaProductos = await Promise.all(
//           entregaJSON.EntregaProductos.map(async (entregaProducto) => {
//             if (
//               entregaProducto.unidadesSeriadas &&
//               Array.isArray(entregaProducto.unidadesSeriadas)
//             ) {
//               const unidadesConSerial = await db.ProductoUnidad.findAll({
//                 where: {
//                   id: entregaProducto.unidadesSeriadas,
//                 },
//                 attributes: ["id", "serial"],
//                 raw: true,
//               });

//               const serialMap = unidadesConSerial.reduce((map, unidad) => {
//                 map[unidad.id] = unidad.serial;
//                 return map;
//               }, {});

//               entregaProducto.unidadesSeriadasDetalle =
//                 entregaProducto.unidadesSeriadas.map((id) => ({
//                   id,
//                   serial: serialMap[id] || "Serial no encontrado",
//                 }));
//             }

//             return entregaProducto;
//           })
//         );
//       }

//       return res.status(200).json({
//         success: true,
//         data: entregaJSON,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: "Error al obtener la entrega",
//         error: error.message,
//       });
//     }
//   },

//   // Obtener entregas por filtros (fecha, proyecto, técnico)
//   async findByFilters(req, res) {
//     try {
//       const { fechaInicio, fechaFin, proyecto, personalId, estado } = req.query;

//       const filtros = {};

//       if (fechaInicio && fechaFin) {
//         filtros.fecha = {
//           [Op.between]: [new Date(fechaInicio), new Date(fechaFin)],
//         };
//       } else if (fechaInicio) {
//         filtros.fecha = {
//           [Op.gte]: new Date(fechaInicio),
//         };
//       } else if (fechaFin) {
//         filtros.fecha = {
//           [Op.lte]: new Date(fechaFin),
//         };
//       }

//       if (proyecto) {
//         filtros.proyecto = {
//           [Op.like]: `%${proyecto}%`,
//         };
//       }

//       if (personalId) {
//         filtros.personalId = personalId;
//       }

//       if (estado) {
//         filtros.estado = estado;
//       }

//       const entregas = await Entrega.findAll({
//         where: filtros,
//         include: [
//           {
//             model: EntregaProducto,
//             include: [{ model: Producto }],
//             // Asegurar que se incluyan todos los campos, incluyendo unidadesSeriadas
//             attributes: {
//               include: ["unidadesSeriadas"], // Explícitamente incluir el campo
//             },
//           },
//           {
//             model: Usuario,
//             as: "almacenistaData",
//             attributes: ["id", "nombre", "username"],
//           },
//           {
//             model: Personal,
//             as: "tecnicoData",
//             attributes: ["id", "nombre", "cedula", "cargo"],
//           },
//         ],
//         order: [["fecha", "DESC"]],
//       });

//       return res.status(200).json({
//         success: true,
//         count: entregas.length,
//         data: entregas,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: "Error al obtener las entregas",
//         error: error.message,
//       });
//     }
//   },

//   // Actualizar una entrega (solo datos principales, no productos)
//   async update(req, res) {
//     try {
//       const { id } = req.params;
//       const [updated] = await Entrega.update(req.body, {
//         where: { id },
//       });

//       if (updated) {
//         const entrega = await Entrega.findByPk(id, {
//           include: [
//             {
//               model: EntregaProducto,
//               include: [{ model: Producto }],
//               // Asegurar que se incluyan todos los campos, incluyendo unidadesSeriadas
//               attributes: {
//                 include: ["unidadesSeriadas"], // Explícitamente incluir el campo
//               },
//             },
//             {
//               model: Usuario,
//               as: "almacenistaData",
//               attributes: ["id", "nombre", "username"],
//             },
//             {
//               model: Personal,
//               as: "tecnicoData",
//               attributes: ["id", "nombre", "cedula", "cargo"],
//             },
//           ],
//         });

//         return res.status(200).json({
//           success: true,
//           message: "Entrega actualizada correctamente",
//           data: entrega,
//         });
//       }

//       return res.status(404).json({
//         success: false,
//         message: "Entrega no encontrada",
//       });
//     } catch (error) {
//       return res.status(400).json({
//         success: false,
//         message: "Error al actualizar la entrega",
//         error: error.message,
//       });
//     }
//   },

//   // Eliminar una entrega (si no tiene reintegros asociados)
//   async delete(req, res) {
//     const t = await db.sequelize.transaction();

//     try {
//       const { id } = req.params;

//       // Verificar si la entrega existe
//       const entrega = await Entrega.findByPk(id, {
//         include: [{ model: EntregaProducto }],
//         transaction: t,
//       });

//       if (!entrega) {
//         await t.rollback();
//         return res.status(404).json({
//           success: false,
//           message: "Entrega no encontrada",
//         });
//       }

//       // Verificar si tiene reintegros asociados
//       const reintegrosAsociados = await db.Reintegro.count({
//         where: { entregaId: id },
//         transaction: t,
//       });

//       if (reintegrosAsociados > 0) {
//         await t.rollback();
//         return res.status(400).json({
//           success: false,
//           message:
//             "No se puede eliminar la entrega porque tiene reintegros asociados",
//         });
//       }

//       // Devolver los productos al inventario
//       for (const entregaProducto of entrega.EntregaProductos) {
//         const producto = await Producto.findByPk(entregaProducto.ProductoId, {
//           transaction: t,
//         });

//         if (producto) {
//           producto.stock += entregaProducto.cantidad;
//           await producto.save({ transaction: t });
//         }
//       }

//       // Eliminar los productos de la entrega
//       await EntregaProducto.destroy({
//         where: { EntregaId: id },
//         transaction: t,
//       });

//       // Eliminar la entrega
//       await Entrega.destroy({
//         where: { id },
//         transaction: t,
//       });

//       await t.commit();

//       return res.status(200).json({
//         success: true,
//         message: "Entrega eliminada correctamente",
//       });
//     } catch (error) {
//       await t.rollback();
//       return res.status(500).json({
//         success: false,
//         message: "Error al eliminar la entrega",
//         error: error.message,
//       });
//     }
//   },

//   // Actualizar el estado de entrega basado en devoluciones
//   async actualizarEstadoEntrega(entregaId) {
//     try {
//       const entrega = await Entrega.findByPk(entregaId, {
//         include: [{ model: EntregaProducto }],
//       });

//       if (!entrega) return null;

//       let totalProductosEntregados = 0;
//       let totalProductosDevueltos = 0;

//       entrega.EntregaProductos.forEach((ep) => {
//         totalProductosEntregados += ep.cantidad;
//         totalProductosDevueltos += ep.devuelto;
//       });

//       let nuevoEstado = "pendiente";

//       if (totalProductosDevueltos === totalProductosEntregados) {
//         nuevoEstado = "completamente_devuelta";
//       } else if (totalProductosDevueltos > 0) {
//         nuevoEstado = "parcialmente_devuelta";
//       }

//       entrega.estado = nuevoEstado;
//       await entrega.save();

//       return entrega;
//     } catch (error) {
//       console.error("Error al actualizar el estado de la entrega:", error);
//       return null;
//     }
//   },
// };

// module.exports = EntregaController;

// -------------------------------------------------
// -------------------------------------------------

const db = require("../models");
const Entrega = db.Entrega;
const EntregaProducto = db.EntregaProducto;
const Producto = db.Producto;
const Usuario = db.Usuario;
const Personal = db.Personal;
const { Op } = require("sequelize");
const { sendConfirmationEmail } = require("../services/emailService");
const {
  actualizarEstadoEntregaCoordinado,
} = require("../services/ActualizarEstadoEntrega");

const EntregaController = {
  async create(req, res) {
    const t = await db.sequelize.transaction();
    let transactionCommitted = false;

    try {
      const { entrega, productos, recipientEmail } = req.body;

      // Crear la entrega
      const nuevaEntrega = await Entrega.create(entrega, { transaction: t });

      // Procesar los productos de la entrega (código existente)
      for (const prod of productos) {
        // Buscar el producto en inventario
        const producto = await Producto.findByPk(prod.ProductoId, {
          transaction: t,
        });

        if (!producto) {
          throw new Error(`El producto con ID ${prod.ProductoId} no existe`);
        }

        // Obtener información base del producto para incluir en EntregaProducto
        const infoProducto = {
          descripcion: producto.descripcion,
          marca: producto.marca,
          color: producto.color,
        };

        // Verificar si el producto tiene unidades con seriales
        if (
          prod.unidadesSeriadas &&
          Array.isArray(prod.unidadesSeriadas) &&
          prod.unidadesSeriadas.length > 0
        ) {
          // Para productos con seriales, verificamos cada unidad específica
          const cantidad = prod.unidadesSeriadas.length;

          // Verificar que todas las unidades existan y pertenezcan al producto
          for (const unidadId of prod.unidadesSeriadas) {
            const unidad = await db.ProductoUnidad.findOne({
              where: {
                id: unidadId,
                productoId: prod.ProductoId,
              },
              transaction: t,
            });

            if (!unidad) {
              throw new Error(
                `La unidad con ID ${unidadId} no existe o no pertenece al producto ${producto.descripcion}`
              );
            }

            // Aquí podrías actualizar el estado de la unidad si es necesario
            unidad.estado = "instalacion";
            await unidad.save({ transaction: t });
          }

          // Crear el registro en EntregaProducto con la cantidad basada en las unidades seriadas
          await EntregaProducto.create(
            {
              EntregaId: nuevaEntrega.id,
              ProductoId: prod.ProductoId,
              cantidad: cantidad,
              unidadesSeriadas: prod.unidadesSeriadas, // Guardar los IDs de las unidades específicas
              ...infoProducto,
            },
            { transaction: t }
          );

          // Actualizar el stock
          producto.stock -= cantidad;
          await producto.save({ transaction: t });
        } else {
          if (producto.stock < prod.cantidad) {
            throw new Error(
              `Stock insuficiente para el producto: ${producto.descripcion}`
            );
          }

          // Crear el registro en EntregaProducto
          await EntregaProducto.create(
            {
              EntregaId: nuevaEntrega.id,
              ProductoId: prod.ProductoId,
              cantidad: prod.cantidad,
              ...infoProducto,
            },
            { transaction: t }
          );

          // Actualizar el stock
          producto.stock -= prod.cantidad;
          await producto.save({ transaction: t });
        }

        // Verificar si el stock quedó bajo el mínimo y generar notificación
        if (producto.stock <= producto.stockMinimo) {
          await db.Notificacion.create(
            {
              tipo: "stock_bajo",
              mensaje: `Stock bajo para el producto: ${producto.descripcion} (${producto.stock} unidades)`,
              detalles: {
                stockActual: producto.stock,
                stockMinimo: producto.stockMinimo,
                codigo: producto.codigo || "",
              },
              nivel: producto.stock === 0 ? "urgente" : "advertencia",
              productoId: producto.id,
            },
            { transaction: t }
          );
        }
      }

      // Confirmar la transacción ANTES de hacer consultas adicionales
      await t.commit();
      transactionCommitted = true;

      // Después del commit, obtener la entrega completa (SIN transacción)
      const entregaCompleta = await Entrega.findByPk(nuevaEntrega.id, {
        include: [
          {
            model: EntregaProducto,
            include: [{ model: Producto }],
            // Asegurar que se incluyan todos los campos, incluyendo unidadesSeriadas
            attributes: {
              include: ["unidadesSeriadas"], // Explícitamente incluir el campo
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
            attributes: ["id", "nombre", "cedula", "cargo", "correo"], // Incluir email si existe
          },
        ],
      });

      // Enviar email de confirmación si se proporciona email
      let emailResult = null;
      if (recipientEmail) {
        try {
          emailResult = await sendConfirmationEmail(
            entregaCompleta,
            recipientEmail,
            "creada"
          );
        } catch (emailError) {
          // Log del error del email pero no fallar la operación
          console.error("Error enviando email de confirmación:", emailError);
          emailResult = { success: false, error: emailError.message };
        }
      }

      return res.status(201).json({
        success: true,
        message: "Entrega creada correctamente",
        data: entregaCompleta,
        emailSent: emailResult?.success || false,
        emailError: emailResult?.error || null,
      });
    } catch (error) {
      // Solo hacer rollback si la transacción no ha sido confirmada
      if (!transactionCommitted) {
        await t.rollback();
      }

      return res.status(400).json({
        success: false,
        message: "Error al crear la entrega",
        error: error.message,
      });
    }
  },

  // Obtener todas las entregas
  async findAll(req, res) {
    try {
      const entregas = await Entrega.findAll({
        include: [
          {
            model: EntregaProducto,
            include: [{ model: Producto }],
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
        order: [["fecha", "DESC"]],
      });

      // Enriquecer los datos con los seriales
      const entregasEnriquecidas = await Promise.all(
        entregas.map(async (entrega) => {
          const entregaJSON = entrega.toJSON();

          // Procesar cada producto de la entrega
          if (entregaJSON.EntregaProductos) {
            entregaJSON.EntregaProductos = await Promise.all(
              entregaJSON.EntregaProductos.map(async (entregaProducto) => {
                // Si tiene unidades seriadas, obtener los seriales
                if (
                  entregaProducto.unidadesSeriadas &&
                  Array.isArray(entregaProducto.unidadesSeriadas)
                ) {
                  // Obtener los seriales de las unidades
                  const unidadesConSerial = await db.ProductoUnidad.findAll({
                    where: {
                      id: entregaProducto.unidadesSeriadas,
                    },
                    attributes: ["id", "serial", "estado"],
                    raw: true,
                  });

                  // Crear un mapa para acceso rápido
                  const serialMap = unidadesConSerial.reduce((map, unidad) => {
                    map[unidad.id] = unidad.serial;
                    return map;
                  }, {});

                  // Enriquecer los datos manteniendo la estructura original
                  entregaProducto.unidadesSeriadasDetalle =
                    entregaProducto.unidadesSeriadas.map((id) => ({
                      id: id,
                      serial: serialMap[id] || "Serial no encontrado",
                    }));
                }

                return entregaProducto;
              })
            );
          }

          return entregaJSON;
        })
      );

      return res.status(200).json({
        success: true,
        count: entregasEnriquecidas.length,
        data: entregasEnriquecidas,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener las entregas",
        error: error.message,
      });
    }
  },

  async findOne(req, res) {
    try {
      const { id } = req.params;
      const entrega = await Entrega.findByPk(id, {
        include: [
          {
            model: EntregaProducto,
            include: [{ model: Producto }],
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
        return res.status(404).json({
          success: false,
          message: "Entrega no encontrada",
        });
      }

      const entregaJSON = entrega.toJSON();

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
                attributes: ["id", "serial", "estado"],
                raw: true,
              });

              const unidadesMap = unidadesConSerial.reduce((map, unidad) => {
                map[unidad.id] = {
                  serial: unidad.serial,
                  estado: unidad.estado,
                };
                return map;
              }, {});

              entregaProducto.unidadesSeriadasDetalle =
                entregaProducto.unidadesSeriadas.map((id) => ({
                  id,
                  serial: unidadesMap[id]?.serial || "Serial no encontrado",
                  estado: unidadesMap[id]?.estado || "Estado no encontrado",
                }));
            }

            return entregaProducto;
          })
        );
      }

      return res.status(200).json({
        success: true,
        data: entregaJSON,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener la entrega",
        error: error.message,
      });
    }
  },

  async regenerateConfirmationToken(req, res) {
    try {
      const { entregaId } = req.params;
      const { recipientEmail } = req.body;

      // Validar que se proporcione el email
      if (!recipientEmail) {
        return res.status(400).json({
          success: false,
          message: "El email del destinatario es requerido",
        });
      }

      // Buscar la entrega
      const entrega = await Entrega.findByPk(entregaId, {
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
            attributes: ["id", "nombre", "cedula", "cargo", "correo"],
          },
        ],
      });

      if (!entrega) {
        return res.status(404).json({
          success: false,
          message: "Entrega no encontrada",
        });
      }

      // Verificar que la entrega no esté ya confirmada
      if (entrega.wasConfirmed) {
        return res.status(400).json({
          success: false,
          message:
            "Esta entrega ya ha sido confirmada. No es posible regenerar el token.",
        });
      }

      // Verificar que la entrega esté en estado pendiente
      // if (entrega.estado !== "pendiente" || entrega.estado !== "cerrada") {
      //   return res.status(400).json({
      //     success: false,
      //     message:
      //       "Solo se puede regenerar el token para entregas en estado pendiente",
      //   });
      // }

      // Buscar si existe un token actual para esta entrega
      const tokenActual = await db.ConfirmacionToken.findOne({
        where: { entregaId: entregaId },
      });

      // Verificar si el token actual está realmente expirado (opcional, pero recomendado)
      if (tokenActual && new Date() < new Date(tokenActual.expiresAt)) {
        return res.status(400).json({
          success: false,
          message: "El token actual aún no ha expirado",
          tokenExpiration: tokenActual.expiresAt,
        });
      }

      // Si existe un token anterior, eliminarlo para mantener limpia la tabla
      if (tokenActual) {
        await db.ConfirmacionToken.destroy({
          where: { entregaId: entregaId },
        });
      }

      // Enviar nuevo email de confirmación (esto generará automáticamente un nuevo token)
      let emailResult = null;
      try {
        emailResult = await sendConfirmationEmail(
          entrega,
          recipientEmail,
          "regenerado" // Indicar que es un token regenerado
        );
      } catch (emailError) {
        console.error("Error enviando email de confirmación:", emailError);
        return res.status(500).json({
          success: false,
          message: "Error al enviar el email con el nuevo token",
          error: emailError.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Token de confirmación regenerado y enviado correctamente",
        data: {
          entregaId: entrega.id,
          proyecto: entrega.proyecto,
          emailSent: emailResult?.success || false,
          sentTo: recipientEmail,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al regenerar el token de confirmación",
        error: error.message,
      });
    }
  },

  // Obtener entregas por filtros (fecha, proyecto, técnico)
  async findByFilters(req, res) {
    try {
      const { fechaInicio, fechaFin, proyecto, personalId, estado } = req.query;

      const filtros = {};

      if (fechaInicio && fechaFin) {
        filtros.fecha = {
          [Op.between]: [new Date(fechaInicio), new Date(fechaFin)],
        };
      } else if (fechaInicio) {
        filtros.fecha = {
          [Op.gte]: new Date(fechaInicio),
        };
      } else if (fechaFin) {
        filtros.fecha = {
          [Op.lte]: new Date(fechaFin),
        };
      }

      if (proyecto) {
        filtros.proyecto = {
          [Op.like]: `%${proyecto}%`,
        };
      }

      if (personalId) {
        filtros.personalId = personalId;
      }

      if (estado) {
        filtros.estado = estado;
      }

      const entregas = await Entrega.findAll({
        where: filtros,
        include: [
          {
            model: EntregaProducto,
            include: [{ model: Producto }],
            // Asegurar que se incluyan todos los campos, incluyendo unidadesSeriadas
            attributes: {
              include: ["unidadesSeriadas"], // Explícitamente incluir el campo
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
        order: [["fecha", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        count: entregas.length,
        data: entregas,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener las entregas",
        error: error.message,
      });
    }
  },

  // Actualizar una entrega (solo datos principales, no productos)
  async update(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Entrega.update(req.body, {
        where: { id },
      });

      if (updated) {
        const entrega = await Entrega.findByPk(id, {
          include: [
            {
              model: EntregaProducto,
              include: [{ model: Producto }],
              // Asegurar que se incluyan todos los campos, incluyendo unidadesSeriadas
              attributes: {
                include: ["unidadesSeriadas"], // Explícitamente incluir el campo
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

        return res.status(200).json({
          success: true,
          message: "Entrega actualizada correctamente",
          data: entrega,
        });
      }

      return res.status(404).json({
        success: false,
        message: "Entrega no encontrada",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Error al actualizar la entrega",
        error: error.message,
      });
    }
  },

  // Eliminar una entrega (si no tiene reintegros asociados)
  async delete(req, res) {
    const t = await db.sequelize.transaction();

    try {
      const { id } = req.params;

      // Verificar si la entrega existe
      const entrega = await Entrega.findByPk(id, {
        include: [{ model: EntregaProducto }],
        transaction: t,
      });

      if (!entrega) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: "Entrega no encontrada",
        });
      }

      // Verificar si tiene reintegros asociados
      const reintegrosAsociados = await db.Reintegro.count({
        where: { entregaId: id },
        transaction: t,
      });

      if (reintegrosAsociados > 0) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message:
            "No se puede eliminar la entrega porque tiene reintegros asociados",
        });
      }

      // Devolver los productos al inventario
      for (const entregaProducto of entrega.EntregaProductos) {
        const producto = await Producto.findByPk(entregaProducto.ProductoId, {
          transaction: t,
        });

        if (producto) {
          producto.stock += entregaProducto.cantidad;
          await producto.save({ transaction: t });
        }
      }

      // Eliminar los productos de la entrega
      await EntregaProducto.destroy({
        where: { EntregaId: id },
        transaction: t,
      });

      // Eliminar la entrega
      await Entrega.destroy({
        where: { id },
        transaction: t,
      });

      await t.commit();

      return res.status(200).json({
        success: true,
        message: "Entrega eliminada correctamente",
      });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({
        success: false,
        message: "Error al eliminar la entrega",
        error: error.message,
      });
    }
  },

  async updateProductos(req, res) {
    const t = await db.sequelize.transaction();
    let transactionCommitted = false; // Variable de control

    try {
      const { id } = req.params;
      const { accion, productos, recipientEmail } = req.body;

      // Validaciones básicas
      if (!accion || !["agregar", "quitar"].includes(accion)) {
        return res.status(400).json({
          success: false,
          message: "Acción no válida. Use 'agregar' o 'quitar'",
        });
      }

      if (!productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Debe proporcionar al menos un producto",
        });
      }

      // Verificar que la entrega existe
      const entrega = await Entrega.findByPk(id, { transaction: t });
      if (!entrega) {
        return res.status(404).json({
          success: false,
          message: "Entrega no encontrada",
        });
      }

      // Verificar si la entrega tiene reintegros asociados
      const reintegrosAsociados = await db.Reintegro.count({
        where: { entregaId: id },
        transaction: t,
      });

      if (reintegrosAsociados > 0) {
        return res.status(400).json({
          success: false,
          message:
            "No se puede modificar la entrega porque tiene reintegros asociados",
        });
      }

      // Procesar cada producto
      for (const prod of productos) {
        // Validar estructura del producto
        if (!prod.ProductoId) {
          throw new Error("ProductoId es requerido para cada producto");
        }

        // Buscar el producto en inventario
        const producto = await Producto.findByPk(prod.ProductoId, {
          transaction: t,
        });

        if (!producto) {
          throw new Error(`El producto con ID ${prod.ProductoId} no existe`);
        }

        // Obtener información base del producto
        const infoProducto = {
          descripcion: producto.descripcion,
          marca: producto.marca,
          color: producto.color,
        };

        if (accion === "agregar") {
          await EntregaController.procesarAgregarProducto(
            prod,
            producto,
            infoProducto,
            id,
            t
          );
        } else if (accion === "quitar") {
          await EntregaController.procesarQuitarProducto(prod, producto, id, t);
        }
      }

      await actualizarEstadoEntregaCoordinado(id, t);

      await t.commit();
      transactionCommitted = true;

      // Después del commit, obtener la entrega actualizada (SIN transacción)
      const entregaActualizada = await Entrega.findByPk(id, {
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
            attributes: ["id", "nombre", "cedula", "cargo", "correo"],
          },
        ],
      });

      // Enviar email de confirmación si se proporciona email
      let emailResult = null;
      if (recipientEmail) {
        try {
          emailResult = await sendConfirmationEmail(
            entregaActualizada,
            recipientEmail,
            "actualizada"
          );
        } catch (emailError) {
          console.error("Error enviando email:", emailError);
          emailResult = { success: false, error: emailError.message };
        }
      }

      return res.status(200).json({
        success: true,
        message: `Productos ${
          accion === "agregar" ? "agregados" : "quitados"
        } correctamente`,
        data: entregaActualizada,
        emailSent: emailResult?.success || false,
        emailError: emailResult?.error || null,
      });
    } catch (error) {
      // Solo hacer rollback si la transacción no ha sido confirmada
      if (!transactionCommitted) {
        await t.rollback();
      }

      console.error("Error en updateProductos:", error);

      return res.status(400).json({
        success: false,
        message: `Error al ${
          req.body.accion || "modificar"
        } productos en la entrega`,
        error: error.message,
      });
    }
  },

  // Método auxiliar para procesar agregar productos
  async procesarAgregarProducto(
    prod,
    producto,
    infoProducto,
    entregaId,
    transaction
  ) {
    // Verificar si ya existe el producto en la entrega
    const entregaProductoExistente = await EntregaProducto.findOne({
      where: {
        EntregaId: entregaId,
        ProductoId: prod.ProductoId,
      },
      transaction,
    });

    if (
      prod.unidadesSeriadas &&
      Array.isArray(prod.unidadesSeriadas) &&
      prod.unidadesSeriadas.length > 0
    ) {
      // PRODUCTOS SERIADOS
      const cantidad = prod.unidadesSeriadas.length;

      // Verificar que todas las unidades existan y estén disponibles
      const unidadesValidas = await db.ProductoUnidad.findAll({
        where: {
          id: prod.unidadesSeriadas,
          productoId: prod.ProductoId,
          estado: ["nuevo", "usado", "reintegrado"],
        },
        transaction,
      });

      if (unidadesValidas.length !== prod.unidadesSeriadas.length) {
        const unidadesEncontradas = unidadesValidas.map((u) => u.id);
        const unidadesFaltantes = prod.unidadesSeriadas.filter(
          (id) => !unidadesEncontradas.includes(id)
        );
        throw new Error(
          `Las siguientes unidades no están disponibles o no existen: ${unidadesFaltantes.join(
            ", "
          )}`
        );
      }

      // Cambiar estado de todas las unidades
      await db.ProductoUnidad.update(
        { estado: "instalacion" },
        {
          where: { id: prod.unidadesSeriadas },
          transaction,
        }
      );

      if (entregaProductoExistente) {
        // Si ya existe, agregar las nuevas unidades seriadas
        const unidadesExistentes =
          entregaProductoExistente.unidadesSeriadas || [];
        const nuevasUnidades = [
          ...unidadesExistentes,
          ...prod.unidadesSeriadas,
        ];

        entregaProductoExistente.cantidad += cantidad;
        entregaProductoExistente.unidadesSeriadas = nuevasUnidades;
        await entregaProductoExistente.save({ transaction });
      } else {
        // Crear nuevo registro
        await EntregaProducto.create(
          {
            EntregaId: entregaId,
            ProductoId: prod.ProductoId,
            cantidad: cantidad,
            unidadesSeriadas: prod.unidadesSeriadas,
            ...infoProducto,
          },
          { transaction }
        );
      }

      // Actualizar el stock
      producto.stock -= cantidad;
      await producto.save({ transaction });
    } else if (prod.cantidad && prod.cantidad > 0) {
      // PRODUCTOS NO SERIADOS
      if (producto.stock < prod.cantidad) {
        throw new Error(
          `Stock insuficiente para el producto: ${producto.descripcion}. Stock disponible: ${producto.stock}, solicitado: ${prod.cantidad}`
        );
      }

      if (entregaProductoExistente) {
        // Si ya existe, sumar la cantidad
        entregaProductoExistente.cantidad += prod.cantidad;
        await entregaProductoExistente.save({ transaction });
      } else {
        // Crear nuevo registro
        await EntregaProducto.create(
          {
            EntregaId: entregaId,
            ProductoId: prod.ProductoId,
            cantidad: prod.cantidad,
            ...infoProducto,
          },
          { transaction }
        );
      }

      // Actualizar el stock
      producto.stock -= prod.cantidad;
      await producto.save({ transaction });
    } else {
      throw new Error(
        `Debe especificar una cantidad válida o unidades seriadas para el producto: ${producto.descripcion}`
      );
    }

    // Verificar si el stock quedó bajo el mínimo y crear notificación
    if (producto.stock <= producto.stockMinimo) {
      await db.Notificacion.create(
        {
          tipo: "stock_bajo",
          mensaje: `Stock bajo para el producto: ${producto.descripcion} (${producto.stock} unidades)`,
          detalles: {
            stockActual: producto.stock,
            stockMinimo: producto.stockMinimo,
            codigo: producto.codigo || "",
            productoId: producto.id,
          },
          nivel: producto.stock === 0 ? "urgente" : "advertencia",
          productoId: producto.id,
        },
        { transaction }
      );
    }
  },

  // Método auxiliar para procesar quitar productos
  async procesarQuitarProducto(prod, producto, entregaId, transaction) {
    const entregaProducto = await EntregaProducto.findOne({
      where: {
        EntregaId: entregaId,
        ProductoId: prod.ProductoId,
      },
      transaction,
    });

    if (!entregaProducto) {
      throw new Error(
        `El producto ${producto.descripcion} no está en esta entrega`
      );
    }

    if (
      prod.unidadesSeriadas &&
      Array.isArray(prod.unidadesSeriadas) &&
      prod.unidadesSeriadas.length > 0
    ) {
      // PRODUCTOS SERIADOS
      const unidadesActuales = entregaProducto.unidadesSeriadas || [];

      // Verificar que todas las unidades a quitar estén en la entrega
      const unidadesNoEncontradas = prod.unidadesSeriadas.filter(
        (unidadId) => !unidadesActuales.includes(unidadId)
      );

      if (unidadesNoEncontradas.length > 0) {
        throw new Error(
          `Las siguientes unidades no están en esta entrega: ${unidadesNoEncontradas.join(
            ", "
          )}`
        );
      }

      // Cambiar estado de las unidades de vuelta a disponible
      await db.ProductoUnidad.update(
        { estado: "disponible" },
        {
          where: { id: prod.unidadesSeriadas },
          transaction,
        }
      );

      // Quitar las unidades de la lista
      const unidadesRestantes = unidadesActuales.filter(
        (unidadId) => !prod.unidadesSeriadas.includes(unidadId)
      );

      const cantidadQuitada = prod.unidadesSeriadas.length;
      const nuevaCantidad = entregaProducto.cantidad - cantidadQuitada;

      if (nuevaCantidad <= 0) {
        // Si no quedan unidades, eliminar el registro
        await entregaProducto.destroy({ transaction });
      } else {
        // Actualizar el registro
        entregaProducto.cantidad = nuevaCantidad;
        entregaProducto.unidadesSeriadas = unidadesRestantes;
        await entregaProducto.save({ transaction });
      }

      // Devolver al stock
      producto.stock += cantidadQuitada;
      await producto.save({ transaction });
    } else {
      // PRODUCTOS NO SERIADOS
      const cantidadAQuitar = prod.cantidad || entregaProducto.cantidad;

      if (cantidadAQuitar > entregaProducto.cantidad) {
        throw new Error(
          `No se puede quitar ${cantidadAQuitar} unidades de ${producto.descripcion}. Solo hay ${entregaProducto.cantidad} en la entrega`
        );
      }

      const nuevaCantidad = entregaProducto.cantidad - cantidadAQuitar;

      if (nuevaCantidad <= 0) {
        // Si no quedan unidades, eliminar el registro
        await entregaProducto.destroy({ transaction });
      } else {
        // Actualizar la cantidad
        entregaProducto.cantidad = nuevaCantidad;
        await entregaProducto.save({ transaction });
      }

      // Devolver al stock
      producto.stock += cantidadAQuitar;
      await producto.save({ transaction });
    }
  },

  // Método para obtener unidades disponibles de un producto
  async getUnidadesDisponibles(req, res) {
    try {
      const { productoId } = req.params;

      const producto = await Producto.findByPk(productoId);
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
      }

      const unidadesDisponibles = await db.ProductoUnidad.findAll({
        where: {
          productoId: productoId,
          estado: ["nuevo", "usado", "reintegrado"],
        },
        order: [["serial", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        data: unidadesDisponibles,
      });
    } catch (error) {
      console.error("Error obteniendo unidades disponibles:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  },

  // Método para obtener unidades de un producto en una entrega específica
  async getUnidadesEnEntrega(req, res) {
    try {
      const { entregaId, productoId } = req.params;

      const entregaProducto = await EntregaProducto.findOne({
        where: {
          EntregaId: entregaId,
          ProductoId: productoId,
        },
      });

      if (!entregaProducto || !entregaProducto.unidadesSeriadas) {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }

      const unidadesEnEntrega = await db.ProductoUnidad.findAll({
        where: {
          id: entregaProducto.unidadesSeriadas,
          productoId: productoId,
        },
        order: [["serial", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        data: unidadesEnEntrega,
      });
    } catch (error) {
      console.error("Error obteniendo unidades en entrega:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  },

  async confirmEntrega(req, res) {
    const t = await db.sequelize.transaction();

    try {
      const { token } = req.params;

      const confirmacionToken = await db.ConfirmacionToken.findOne({
        where: {
          token: token,
          expiresAt: {
            [db.Sequelize.Op.gt]: new Date(), // Token no expirado
          },
        },
        include: [
          {
            model: Entrega,
            as: "Entrega", // <- Aquí agregas el alias correctamente
            include: [
              {
                model: EntregaProducto,
                include: [{ model: Producto }],
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
          },
        ],
        transaction: t,
      });

      if (!confirmacionToken) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Token de confirmación inválido o expirado",
        });
      }

      const entrega = confirmacionToken.Entrega;

      if (entrega.wasConfirmed) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Esta entrega ya ha sido confirmada",
        });
      }

      // Actualizar el estado de confirmación
      entrega.wasConfirmed = true;
      await entrega.save({ transaction: t });

      // Eliminar el token usado
      await confirmacionToken.destroy({ transaction: t });

      await t.commit();

      return res.status(200).json({
        success: true,
        message: "Entrega confirmada correctamente",
        data: entrega,
      });
    } catch (error) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Error al confirmar la entrega",
        error: error.message,
      });
    }
  },

  // Actualizar el estado de entrega basado en devoluciones
  async actualizarEstadoEntrega(entregaId) {
    try {
      const entrega = await Entrega.findByPk(entregaId, {
        include: [{ model: EntregaProducto }],
      });

      if (!entrega) return null;

      let totalProductosEntregados = 0;
      let totalProductosDevueltos = 0;

      entrega.EntregaProductos.forEach((ep) => {
        totalProductosEntregados += ep.cantidad;
        totalProductosDevueltos += ep.devuelto;
      });

      let nuevoEstado = "pendiente";

      if (totalProductosDevueltos === totalProductosEntregados) {
        nuevoEstado = "completamente_devuelta";
      } else if (totalProductosDevueltos > 0) {
        nuevoEstado = "parcialmente_devuelta";
      }

      entrega.estado = nuevoEstado;
      await entrega.save();

      return entrega;
    } catch (error) {
      console.error("Error al actualizar el estado de la entrega:", error);
      return null;
    }
  },
};

module.exports = EntregaController;
