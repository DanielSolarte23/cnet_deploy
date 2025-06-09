const db = require("../models");
const Reintegro = db.Reintegro;
const ReintegroProducto = db.ReintegroProducto;
const Entrega = db.Entrega;
const EntregaProducto = db.EntregaProducto;
const Producto = db.Producto;
const Usuario = db.Usuario;
const Personal = db.Personal;
const { Op } = require("sequelize");

const ReintegroController = {
  // Crear un nuevo reintegro con sus productos
  async create(req, res) {
    const t = await db.sequelize.transaction();

    try {
      const { reintegro, productos } = req.body;

      // Verificar que la entrega exista
      if (reintegro.entregaId) {
        const entregaExiste = await Entrega.findByPk(reintegro.entregaId, {
          transaction: t,
        });
        if (!entregaExiste) {
          throw new Error(`La entrega con ID ${reintegro.entregaId} no existe`);
        }
      }

      // Crear el reintegro
      const nuevoReintegro = await Reintegro.create(reintegro, {
        transaction: t,
      });

      // Procesar los productos del reintegro
      for (const prod of productos) {
        // Buscar el producto en inventario
        const producto = await Producto.findByPk(prod.ProductoId, {
          transaction: t,
        });

        if (!producto) {
          throw new Error(`El producto con ID ${prod.ProductoId} no existe`);
        }

        // Obtener información base del producto para incluir en ReintegroProducto
        const infoProducto = {
          descripcion: producto.descripcion,
          marca: producto.marca,
          color: producto.color,
        };

        // Si viene de una entrega, verificar que se pueda devolver
        if (reintegro.entregaId) {
          const entregaProducto = await EntregaProducto.findOne({
            where: {
              EntregaId: reintegro.entregaId,
              ProductoId: prod.ProductoId,
            },
            transaction: t,
          });

          if (!entregaProducto) {
            throw new Error(
              `El producto ${producto.descripcion} no pertenece a la entrega seleccionada`
            );
          }

          const cantidadPendiente =
            entregaProducto.cantidad - entregaProducto.devuelto;

          if (prod.cantidad > cantidadPendiente) {
            throw new Error(
              `No se puede devolver más cantidad de la que se entregó para ${producto.descripcion}`
            );
          }

          // Verificar si el producto tiene unidades con seriales
          if (
            prod.unidadesSeriadas &&
            Array.isArray(prod.unidadesSeriadas) &&
            prod.unidadesSeriadas.length > 0
          ) {
            // Para productos con seriales, verificamos cada unidad específica
            const cantidad = prod.unidadesSeriadas.length;

            // Verificar que todas las unidades existan y pertenezcan al producto original
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

              // Verificar que la unidad esté en las unidades entregadas originalmente
              if (
                entregaProducto.unidadesSeriadas &&
                !entregaProducto.unidadesSeriadas.includes(unidadId)
              ) {
                throw new Error(
                  `La unidad con ID ${unidadId} no fue entregada en la entrega original`
                );
              }

              // Aquí podrías actualizar el estado de la unidad si es necesario
              // Por ejemplo: unidad.estado = 'devuelto';
              // await unidad.save({ transaction: t });
            }

            // Actualizar el campo devuelto en EntregaProducto
            entregaProducto.devuelto += cantidad;

            // Crear el registro en ReintegroProducto con las unidades seriadas
            await ReintegroProducto.create(
              {
                ReintegroId: nuevoReintegro.id,
                ProductoId: prod.ProductoId,
                cantidad: cantidad,
                unidadesSeriadas: prod.unidadesSeriadas,
                ...infoProducto,
              },
              { transaction: t }
            );

            // Actualizar el stock
            producto.stock += cantidad;
            await producto.save({ transaction: t });
          } else {
            // Actualizar el campo devuelto en EntregaProducto
            entregaProducto.devuelto += prod.cantidad;

            // Crear el registro en ReintegroProducto
            await ReintegroProducto.create(
              {
                ReintegroId: nuevoReintegro.id,
                ProductoId: prod.ProductoId,
                cantidad: prod.cantidad,
                ...infoProducto,
              },
              { transaction: t }
            );

            // Actualizar el stock
            producto.stock += prod.cantidad;
            await producto.save({ transaction: t });
          }

          // Actualizar el estado del EntregaProducto
          if (entregaProducto.devuelto === entregaProducto.cantidad) {
            entregaProducto.estado = "devuelto_completo";
          } else if (entregaProducto.devuelto > 0) {
            entregaProducto.estado = "devuelto_parcial";
          }

          await entregaProducto.save({ transaction: t });
        } else {
          // Si no viene de una entrega específica (reintegro directo)
          if (
            prod.unidadesSeriadas &&
            Array.isArray(prod.unidadesSeriadas) &&
            prod.unidadesSeriadas.length > 0
          ) {
            const cantidad = prod.unidadesSeriadas.length;

            // Crear el registro en ReintegroProducto con las unidades seriadas
            await ReintegroProducto.create(
              {
                ReintegroId: nuevoReintegro.id,
                ProductoId: prod.ProductoId,
                cantidad: cantidad,
                unidadesSeriadas: prod.unidadesSeriadas,
                ...infoProducto,
              },
              { transaction: t }
            );

            // Actualizar el stock
            producto.stock += cantidad;
            await producto.save({ transaction: t });
          } else {
            // Crear el registro en ReintegroProducto
            await ReintegroProducto.create(
              {
                ReintegroId: nuevoReintegro.id,
                ProductoId: prod.ProductoId,
                cantidad: prod.cantidad,
                ...infoProducto,
              },
              { transaction: t }
            );

            // Actualizar el stock
            producto.stock += prod.cantidad;
            await producto.save({ transaction: t });
          }
        }
      }

      await t.commit();

      // Actualizar el estado de la entrega si corresponde
      if (reintegro.entregaId) {
        const entregaController = require("./Entrega.Controller");
        await entregaController.actualizarEstadoEntrega(reintegro.entregaId);
      }

      // Obtener el reintegro completo con sus relaciones
      const reintegroCompleto = await Reintegro.findByPk(nuevoReintegro.id, {
        include: [
          {
            model: ReintegroProducto,
            include: [{ model: Producto }],
            // Asegurar que se incluyan todos los campos, incluyendo unidadesSeriadas
            attributes: { 
              include: ['unidadesSeriadas'] // Explícitamente incluir el campo
            }
          },
          {
            model: Usuario,
            as: "almacenistaData",
            attributes: ["id", "nombre", "username"],
          },
          {
            model: Personal,
            as: "tecnicoData",
            attributes: ["id", "nombre", "cedula", "cargo"],
          },
          {
            model: Entrega,
            as: "entregaOriginal",
          },
        ],
      });

      return res.status(201).json({
        success: true,
        message: "Reintegro creado correctamente",
        data: reintegroCompleto,
      });
    } catch (error) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Error al crear el reintegro",
        error: error.message,
      });
    }
  },

  // Obtener todos los reintegros
  async findAll(req, res) {
    try {
      const reintegros = await Reintegro.findAll({
        include: [
          {
            model: ReintegroProducto,
            include: [{ model: Producto }],
            // Asegurar que se incluyan todos los campos, incluyendo unidadesSeriadas
            attributes: { 
              include: ['unidadesSeriadas'] // Explícitamente incluir el campo
            }
          },
          {
            model: Usuario,
            as: "almacenistaData",
            attributes: ["id", "nombre", "username"],
          },
          {
            model: Personal,
            as: "tecnicoData",
            attributes: ["id", "nombre", "cedula", "cargo"],
          },
          {
            model: Entrega,
            as: "entregaOriginal",
          },
        ],
        order: [["fecha", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        count: reintegros.length,
        data: reintegros,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener los reintegros",
        error: error.message,
      });
    }
  },

  // Obtener un reintegro por ID
  async findOne(req, res) {
    try {
      const { id } = req.params;
      const reintegro = await Reintegro.findByPk(id, {
        include: [
          {
            model: ReintegroProducto,
            include: [{ model: Producto }],
            // Asegurar que se incluyan todos los campos, incluyendo unidadesSeriadas
            attributes: { 
              include: ['unidadesSeriadas'] // Explícitamente incluir el campo
            }
          },
          {
            model: Usuario,
            as: "almacenistaData",
            attributes: ["id", "nombre", "username"],
          },
          {
            model: Personal,
            as: "tecnicoData",
            attributes: ["id", "nombre", "cedula", "cargo"],
          },
          {
            model: Entrega,
            as: "entregaOriginal",
          },
        ],
      });

      if (!reintegro) {
        return res.status(404).json({
          success: false,
          message: "Reintegro no encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        data: reintegro,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener el reintegro",
        error: error.message,
      });
    }
  },

  // Obtener reintegros por filtros (fecha, entrega, técnico)
  async findByFilters(req, res) {
    try {
      const { fechaInicio, fechaFin, entregaId, personalId, estado } = req.query;

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

      if (entregaId) {
        filtros.entregaId = entregaId;
      }

      if (personalId) {
        filtros.personalId = personalId;
      }

      if (estado) {
        filtros.estado = estado;
      }

      const reintegros = await Reintegro.findAll({
        where: filtros,
        include: [
          {
            model: ReintegroProducto,
            include: [{ model: Producto }],
            // Asegurar que se incluyan todos los campos, incluyendo unidadesSeriadas
            attributes: { 
              include: ['unidadesSeriadas'] // Explícitamente incluir el campo
            }
          },
          {
            model: Usuario,
            as: "almacenistaData",
            attributes: ["id", "nombre", "username"],
          },
          {
            model: Personal,
            as: "tecnicoData",
            attributes: ["id", "nombre", "cedula", "cargo"],
          },
          {
            model: Entrega,
            as: "entregaOriginal",
          },
        ],
        order: [["fecha", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        count: reintegros.length,
        data: reintegros,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener los reintegros",
        error: error.message,
      });
    }
  },

  // Actualizar un reintegro (solo datos principales, no productos)
  async update(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Reintegro.update(req.body, {
        where: { id },
      });

      if (updated) {
        const reintegro = await Reintegro.findByPk(id, {
          include: [
            {
              model: ReintegroProducto,
              include: [{ model: Producto }],
              // Asegurar que se incluyan todos los campos, incluyendo unidadesSeriadas
              attributes: { 
                include: ['unidadesSeriadas'] // Explícitamente incluir el campo
              }
            },
            {
              model: Usuario,
              as: "almacenistaData",
              attributes: ["id", "nombre", "username"],
            },
            {
              model: Personal,
              as: "tecnicoData",
              attributes: ["id", "nombre", "cedula", "cargo"],
            },
            {
              model: Entrega,
              as: "entregaOriginal",
            },
          ],
        });

        return res.status(200).json({
          success: true,
          message: "Reintegro actualizado correctamente",
          data: reintegro,
        });
      }

      return res.status(404).json({
        success: false,
        message: "Reintegro no encontrado",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Error al actualizar el reintegro",
        error: error.message,
      });
    }
  },

  // Verificar un reintegro (cambiar estado a verificado)
  async verificar(req, res) {
    try {
      const { id } = req.params;
      const reintegro = await Reintegro.findByPk(id);

      if (!reintegro) {
        return res.status(404).json({
          success: false,
          message: "Reintegro no encontrado",
        });
      }

      reintegro.estado = "verificado";
      await reintegro.save();

      return res.status(200).json({
        success: true,
        message: "Reintegro verificado correctamente",
        data: reintegro,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Error al verificar el reintegro",
        error: error.message,
      });
    }
  },

  // Eliminar un reintegro (devuelve los productos a su estado anterior)
  async delete(req, res) {
    const t = await db.sequelize.transaction();

    try {
      const { id } = req.params;

      // Verificar si el reintegro existe
      const reintegro = await Reintegro.findByPk(id, {
        include: [{ model: ReintegroProducto }],
        transaction: t,
      });

      if (!reintegro) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: "Reintegro no encontrado",
        });
      }

      // Si está asociado a una entrega, actualizar los campos "devuelto"
      if (reintegro.entregaId) {
        for (const reintegroProducto of reintegro.ReintegroProductos) {
          const entregaProducto = await EntregaProducto.findOne({
            where: {
              EntregaId: reintegro.entregaId,
              ProductoId: reintegroProducto.ProductoId,
            },
            transaction: t,
          });

          if (entregaProducto) {
            entregaProducto.devuelto -= reintegroProducto.cantidad;

            // Validar que no quede negativo
            if (entregaProducto.devuelto < 0) {
              entregaProducto.devuelto = 0;
            }

            // Actualizar el estado del EntregaProducto
            if (entregaProducto.devuelto === 0) {
              entregaProducto.estado = "pendiente";
            } else if (entregaProducto.devuelto < entregaProducto.cantidad) {
              entregaProducto.estado = "devuelto_parcial";
            }

            await entregaProducto.save({ transaction: t });
          }
        }
      }

      // Restar del inventario los productos devueltos
      for (const reintegroProducto of reintegro.ReintegroProductos) {
        const producto = await Producto.findByPk(reintegroProducto.ProductoId, {
          transaction: t,
        });

        if (producto) {
          producto.stock -= reintegroProducto.cantidad;

          // Validar que no quede negativo
          if (producto.stock < 0) {
            producto.stock = 0;
          }

          await producto.save({ transaction: t });
        }
      }

      // Eliminar los productos del reintegro
      await ReintegroProducto.destroy({
        where: { ReintegroId: id },
        transaction: t,
      });

      // Eliminar el reintegro
      await Reintegro.destroy({
        where: { id },
        transaction: t,
      });

      await t.commit();

      // Actualizar el estado de la entrega si corresponde
      if (reintegro.entregaId) {
        const entregaController = require("./Entrega.Controller");
        await entregaController.actualizarEstadoEntrega(reintegro.entregaId);
      }

      return res.status(200).json({
        success: true,
        message: "Reintegro eliminado correctamente",
      });
    } catch (error) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Error al eliminar el reintegro",
        error: error.message,
      });
    }
  },

  // NUEVA FUNCIONALIDAD: Procesar entregas vencidas
  async procesarEntregasVencidas(req, res) {
    const t = await db.sequelize.transaction();

    try {
      const { diasVencimiento = 30 } = req.query; // Por defecto 30 días
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasVencimiento);

      // Buscar entregas que han superado el límite de tiempo y no están completamente devueltas
      const entregasVencidas = await Entrega.findAll({
        where: {
          fecha: {
            [Op.lt]: fechaLimite,
          },
          estado: {
            [Op.notIn]: ['completamente_devuelta', 'dada_de_baja']
          }
        },
        include: [
          {
            model: EntregaProducto,
            where: {
              [Op.or]: [
                { devuelto: { [Op.lt]: db.Sequelize.col('cantidad') } },
                { devuelto: { [Op.is]: null } }
              ]
            }
          }
        ],
        transaction: t,
      });

      let entregasProcesadas = 0;
      let productosAfectados = 0;

      for (const entrega of entregasVencidas) {
        let entregaModificada = false;

        for (const entregaProducto of entrega.EntregaProductos) {
          const cantidadPendiente = entregaProducto.cantidad - (entregaProducto.devuelto || 0);

          if (cantidadPendiente > 0) {
            // Marcar como dado de baja
            entregaProducto.devuelto = entregaProducto.cantidad;
            entregaProducto.estado = "dado_de_baja";
            entregaProducto.fechaBaja = new Date();
            entregaProducto.motivoBaja = `Vencimiento automático - ${diasVencimiento} días`;

            await entregaProducto.save({ transaction: t });

            productosAfectados++;
            entregaModificada = true;

            // Crear notificación de baja
            await db.Notificacion.create(
              {
                tipo: "producto_dado_baja",
                mensaje: `Producto dado de baja por vencimiento: ${entregaProducto.descripcion}`,
                detalles: {
                  entregaId: entrega.id,
                  productoId: entregaProducto.ProductoId,
                  cantidad: cantidadPendiente,
                  fechaEntrega: entrega.fecha,
                  diasVencidos: Math.ceil((new Date() - entrega.fecha) / (1000 * 60 * 60 * 24)),
                },
                nivel: "informativo",
                entregaId: entrega.id,
              },
              { transaction: t }
            );
          }
        }

        if (entregaModificada) {
          // Actualizar el estado de la entrega
          entrega.estado = "dada_de_baja";
          entrega.fechaBaja = new Date();
          entrega.motivoBaja = `Vencimiento automático - ${diasVencimiento} días`;
          
          await entrega.save({ transaction: t });
          entregasProcesadas++;
        }
      }

      await t.commit();

      return res.status(200).json({
        success: true,
        message: "Proceso de vencimiento completado",
        data: {
          entregasProcesadas,
          productosAfectados,
          fechaLimite,
          diasVencimiento
        },
      });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({
        success: false,
        message: "Error al procesar entregas vencidas",
        error: error.message,
      });
    }
  },

  // NUEVA FUNCIONALIDAD: Obtener entregas próximas a vencer
  async obtenerEntregasProximasVencer(req, res) {
    try {
      const { diasAlerta = 7, diasVencimiento = 30 } = req.query;
      
      const fechaAlerta = new Date();
      fechaAlerta.setDate(fechaAlerta.getDate() - (diasVencimiento - diasAlerta));

      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() - diasVencimiento);

      const entregasProximasVencer = await Entrega.findAll({
        where: {
          fecha: {
            [Op.between]: [fechaVencimiento, fechaAlerta],
          },
          estado: {
            [Op.notIn]: ['completamente_devuelta', 'dada_de_baja']
          }
        },
        include: [
          {
            model: EntregaProducto,
            where: {
              [Op.or]: [
                { devuelto: { [Op.lt]: db.Sequelize.col('cantidad') } },
                { devuelto: { [Op.is]: null } }
              ]
            },
            include: [{ model: Producto }],
          },
          {
            model: Usuario,
            as: "almacenistaData",
            attributes: ["id", "nombre", "username"],
          },
          {
            model: Personal,
            as: "tecnicoData",
            attributes: ["id", "nombre", "cedula", "cargo"],
          },
        ],
        order: [["fecha", "ASC"]],
      });

      // Calcular días restantes para cada entrega
      const entregasConDias = entregasProximasVencer.map(entrega => {
        const diasTranscurridos = Math.ceil((new Date() - entrega.fecha) / (1000 * 60 * 60 * 24));
        const diasRestantes = diasVencimiento - diasTranscurridos;
        
        return {
          ...entrega.toJSON(),
          diasTranscurridos,
          diasRestantes: Math.max(0, diasRestantes),
          estadoVencimiento: diasRestantes <= 0 ? 'vencida' : diasRestantes <= diasAlerta ? 'proxima_vencer' : 'normal'
        };
      });

      return res.status(200).json({
        success: true,
        count: entregasConDias.length,
        data: entregasConDias,
        configuracion: {
          diasAlerta,
          diasVencimiento
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener entregas próximas a vencer",
        error: error.message,
      });
    }
  },

  // NUEVA FUNCIONALIDAD: Obtener estadísticas de reintegros
  async obtenerEstadisticas(req, res) {
    try {
      const { fechaInicio, fechaFin } = req.query;
      
      const filtroFecha = {};
      if (fechaInicio && fechaFin) {
        filtroFecha.fecha = {
          [Op.between]: [new Date(fechaInicio), new Date(fechaFin)],
        };
      }

      // Estadísticas generales
      const totalReintegros = await Reintegro.count({
        where: filtroFecha
      });

      const reintegrosPorEstado = await Reintegro.findAll({
        where: filtroFecha,
        attributes: [
          'estado',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'cantidad']
        ],
        group: ['estado']
      });

      // Productos más devueltos
      const productosMasDevueltos = await ReintegroProducto.findAll({
        attributes: [
          'ProductoId',
          'descripcion',
          [db.sequelize.fn('SUM', db.sequelize.col('cantidad')), 'totalDevuelto']
        ],
        include: [
          {
            model: Reintegro,
            where: filtroFecha,
            attributes: []
          }
        ],
        group: ['ProductoId', 'descripcion'],
        order: [[db.sequelize.fn('SUM', db.sequelize.col('cantidad')), 'DESC']],
        limit: 10
      });

      // Técnicos con más reintegros
      const tecnicosConMasReintegros = await Reintegro.findAll({
        where: filtroFecha,
        attributes: [
          'personalId',
          [db.sequelize.fn('COUNT', db.sequelize.col('Reintegro.id')), 'totalReintegros']
        ],
        include: [
          {
            model: Personal,
            as: "tecnicoData",
            attributes: ["nombre", "cedula", "cargo"],
          }
        ],
        group: ['personalId', 'tecnicoData.id'],
        order: [[db.sequelize.fn('COUNT', db.sequelize.col('Reintegro.id')), 'DESC']],
        limit: 10
      });

      return res.status(200).json({
        success: true,
        data: {
          totalReintegros,
          reintegrosPorEstado: reintegrosPorEstado.map(r => ({
            estado: r.estado,
            cantidad: parseInt(r.dataValues.cantidad)
          })),
          productosMasDevueltos: productosMasDevueltos.map(p => ({
            productoId: p.ProductoId,
            descripcion: p.descripcion,
            totalDevuelto: parseInt(p.dataValues.totalDevuelto)
          })),
          tecnicosConMasReintegros: tecnicosConMasReintegros.map(t => ({
            personalId: t.personalId,
            tecnico: t.tecnicoData,
            totalReintegros: parseInt(t.dataValues.totalReintegros)
          }))
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener estadísticas de reintegros",
        error: error.message,
      });
    }
  }
};

module.exports = ReintegroController;