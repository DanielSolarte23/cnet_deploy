// controllers/Legalizacion.Controller.js
const {
  Legalizacion,
  Producto,
  ProductoUnidad,
  Entrega,
  EntregaProducto,
  Personal,
  Usuario,
} = require("../models");
const db = require("../models");
const {
  actualizarEstadoEntregaCoordinado,
} = require("../services/ActualizarEstadoEntrega");

const LegalizacionController = {
  // Crear nueva legalización (desde la app móvil)
  async create(req, res) {
    const t = await db.sequelize.transaction();

    try {
      const {
        entregaId,
        productos,
        tipo,
        justificacion,
        observaciones,
        ubicacion,
        evidencia,
        personalId,
      } = req.body;

      // Validar que la entrega exista
      const entrega = await Entrega.findByPk(entregaId, { transaction: t });
      if (!entrega) {
        throw new Error("La entrega especificada no existe");
      }

      // Validar que productos sea un array
      if (!Array.isArray(productos) || productos.length === 0) {
        throw new Error(
          "Debe proporcionar al menos un producto para legalizar"
        );
      }

      const legalizacionesCreadas = [];

      // Procesar cada producto
      for (const prod of productos) {
        const { productoId, cantidad, unidadesSeriadas } = prod;

        // Validar que el producto exista
        const producto = await Producto.findByPk(productoId, {
          transaction: t,
        });
        if (!producto) {
          throw new Error(`El producto con ID ${productoId} no existe`);
        }

        // Verificar que el producto pertenece a la entrega
        const entregaProducto = await EntregaProducto.findOne({
          where: {
            EntregaId: entregaId,
            ProductoId: productoId,
          },
          transaction: t,
        });

        if (!entregaProducto) {
          throw new Error(
            `El producto ${producto.descripcion} no pertenece a esta entrega`
          );
        }

        // Calcular cantidad pendiente de legalizar
        const cantidadEntregada = entregaProducto.cantidad;
        const cantidadDevuelta = entregaProducto.devuelto || 0;

        // Obtener cantidad ya legalizada
        const legalizacionesExistentes =
          (await Legalizacion.sum("cantidad", {
            where: {
              entregaId,
              productoId,
              estado: ["pendiente", "aprobada"],
            },
            transaction: t,
          })) || 0;

        const cantidadPendiente =
          cantidadEntregada - cantidadDevuelta - legalizacionesExistentes;

        // Validar cantidad según si tiene seriales o no
        if (
          unidadesSeriadas &&
          Array.isArray(unidadesSeriadas) &&
          unidadesSeriadas.length > 0
        ) {
          // Para productos con seriales
          const cantidadSeriales = unidadesSeriadas.length;

          if (cantidad !== cantidadSeriales) {
            throw new Error(
              `Para ${producto.descripcion}: La cantidad (${cantidad}) debe coincidir con el número de unidades seriadas (${cantidadSeriales})`
            );
          }

          if (cantidadSeriales > cantidadPendiente) {
            throw new Error(
              `Para ${producto.descripcion}: Solo puedes legalizar ${cantidadPendiente} unidades`
            );
          }

          // Verificar que las unidades pertenecen a la entrega original
          const entregaUnidades = entregaProducto.unidadesSeriadas || [];
          for (const unidadId of unidadesSeriadas) {
            if (!entregaUnidades.includes(unidadId)) {
              throw new Error(
                `La unidad ${unidadId} del producto ${producto.descripcion} no pertenece a esta entrega`
              );
            }

            // Verificar que la unidad no haya sido ya legalizada o devuelta
            const unidad = await ProductoUnidad.findByPk(unidadId, {
              transaction: t,
            });
            if (!unidad || unidad.estado === "reintegrado") {
              throw new Error(
                `La unidad ${unidadId} del producto ${producto.descripcion} ya fue devuelta`
              );
            }

            // Verificar que no esté ya legalizada
            const legalizacionExistente = await Legalizacion.findOne({
              where: {
                entregaId,
                productoId,
                estado: ["pendiente", "aprobada"],
              },
              transaction: t,
            });

            if (
              legalizacionExistente &&
              legalizacionExistente.unidadesSeriadas &&
              legalizacionExistente.unidadesSeriadas.includes(unidadId)
            ) {
              throw new Error(
                `La unidad ${unidadId} del producto ${producto.descripcion} ya está legalizada`
              );
            }
          }
        } else {
          // Para productos sin seriales
          if (cantidad > cantidadPendiente) {
            throw new Error(
              `Para ${producto.descripcion}: Solo puedes legalizar ${cantidadPendiente} unidades`
            );
          }
        }

        // Crear la legalización para este producto
        const nuevaLegalizacion = await Legalizacion.create(
          {
            entregaId,
            productoId,
            personalId,
            cantidad,
            tipo,
            justificacion,
            observaciones,
            ubicacion,
            evidencia,
            unidadesSeriadas: unidadesSeriadas || null,
            estado: "pendiente",
          },
          { transaction: t }
        );

        legalizacionesCreadas.push(nuevaLegalizacion.id);
      }

      await t.commit();

      // Obtener las legalizaciones completas con sus relaciones
      const legalizacionesCompletas = await Legalizacion.findAll({
        where: {
          id: legalizacionesCreadas,
        },
        include: [
          {
            model: Producto,
            as: "producto",
            attributes: ["id", "codigo", "descripcion", "marca"],
          },
          {
            model: Personal,
            as: "tecnicoData",
            attributes: ["id", "nombre", "cedula"],
          },
          {
            model: Entrega,
            as: "entregaOriginal",
            attributes: ["id", "proyecto", "fecha"],
          },
        ],
      });

      return res.status(201).json({
        success: true,
        message: `${legalizacionesCreadas.length} legalización(es) creada(s) correctamente`,
        data: legalizacionesCompletas,
      });
    } catch (error) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Error al crear la legalización",
        error: error.message,
      });
    }
  },

  // OPCIÓN 1: Mantener aprobación individual (recomendada para flexibilidad)
  async aprobar(req, res) {
    const t = await db.sequelize.transaction();

    try {
      const { id } = req.params;
      const { almacenistaId, observaciones } = req.body;

      const legalizacion = await Legalizacion.findByPk(id, {
        include: [
          { model: Producto, as: "producto" },
          { model: Entrega, as: "entregaOriginal" },
        ],
        transaction: t,
      });

      if (!legalizacion) {
        throw new Error("Legalización no encontrada");
      }

      if (legalizacion.estado !== "pendiente") {
        throw new Error("Solo se pueden aprobar legalizaciones pendientes");
      }

      // Actualizar estado de la legalización
      legalizacion.estado = "aprobada";
      legalizacion.almacenistaId = almacenistaId;
      legalizacion.fechaAprobacion = new Date();
      if (observaciones) {
        legalizacion.observaciones = observaciones;
      }
      await legalizacion.save({ transaction: t });

      // Actualizar estados según el tipo de legalización
      if (
        legalizacion.unidadesSeriadas &&
        legalizacion.unidadesSeriadas.length > 0
      ) {
        // Para productos con seriales
        for (const unidadId of legalizacion.unidadesSeriadas) {
          const unidad = await ProductoUnidad.findByPk(unidadId, {
            transaction: t,
          });
          if (unidad) {
            unidad.estado =
              legalizacion.tipo === "instalado" ? "instalado" : "baja";
            await unidad.save({ transaction: t });
          }
        }
      }

      // Actualizar el EntregaProducto
      const entregaProducto = await EntregaProducto.findOne({
        where: {
          EntregaId: legalizacion.entregaId,
          ProductoId: legalizacion.productoId,
        },
        transaction: t,
      });

      if (entregaProducto) {
        entregaProducto.legalizado =
          (entregaProducto.legalizado || 0) + legalizacion.cantidad;
        await entregaProducto.save({ transaction: t });
      }

      // Usar la función coordinada para actualizar estados
      await actualizarEstadoEntregaCoordinado(legalizacion.entregaId, t);

      await t.commit();

      return res.status(200).json({
        success: true,
        message: "Legalización aprobada correctamente",
        data: legalizacion,
      });
    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }
      return res.status(400).json({
        success: false,
        message: "Error al aprobar la legalización",
        error: error.message,
      });
    }
  },

  // OPCIÓN 2: Aprobación masiva (nueva función)
  async aprobarMultiples(req, res) {
    const t = await db.sequelize.transaction();

    try {
      const { legalizacionIds, almacenistaId, observaciones } = req.body;

      if (!Array.isArray(legalizacionIds) || legalizacionIds.length === 0) {
        throw new Error(
          "Debe proporcionar al menos una legalización para aprobar"
        );
      }

      const legalizaciones = await Legalizacion.findAll({
        where: {
          id: legalizacionIds,
          estado: "pendiente",
        },
        include: [
          { model: Producto, as: "producto" },
          { model: Entrega, as: "entregaOriginal" },
        ],
        transaction: t,
      });

      if (legalizaciones.length !== legalizacionIds.length) {
        throw new Error(
          "Algunas legalizaciones no existen o no están pendientes"
        );
      }

      const entregasAfectadas = new Set();
      const legalizacionesAprobadas = [];

      // Procesar cada legalización
      for (const legalizacion of legalizaciones) {
        // Actualizar estado de la legalización
        legalizacion.estado = "aprobada";
        legalizacion.almacenistaId = almacenistaId;
        legalizacion.fechaAprobacion = new Date();
        if (observaciones) {
          legalizacion.observaciones = observaciones;
        }
        await legalizacion.save({ transaction: t });

        // Actualizar estados según el tipo de legalización
        if (
          legalizacion.unidadesSeriadas &&
          legalizacion.unidadesSeriadas.length > 0
        ) {
          // Para productos con seriales
          for (const unidadId of legalizacion.unidadesSeriadas) {
            const unidad = await ProductoUnidad.findByPk(unidadId, {
              transaction: t,
            });
            if (unidad) {
              unidad.estado =
                legalizacion.tipo === "instalado" ? "instalado" : "baja";
              await unidad.save({ transaction: t });
            }
          }
        }

        // Actualizar el EntregaProducto
        const entregaProducto = await EntregaProducto.findOne({
          where: {
            EntregaId: legalizacion.entregaId,
            ProductoId: legalizacion.productoId,
          },
          transaction: t,
        });

        if (entregaProducto) {
          entregaProducto.legalizado =
            (entregaProducto.legalizado || 0) + legalizacion.cantidad;
          await entregaProducto.save({ transaction: t });
        }

        entregasAfectadas.add(legalizacion.entregaId);
        legalizacionesAprobadas.push(legalizacion);
      }

      // Actualizar estados de todas las entregas afectadas
      for (const entregaId of entregasAfectadas) {
        await actualizarEstadoEntregaCoordinado(entregaId, t);
      }

      await t.commit();

      return res.status(200).json({
        success: true,
        message: `${legalizacionesAprobadas.length} legalización(es) aprobada(s) correctamente`,
        data: legalizacionesAprobadas,
      });
    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }
      return res.status(400).json({
        success: false,
        message: "Error al aprobar las legalizaciones",
        error: error.message,
      });
    }
  },

  async aprobarPorEntrega(req, res) {
    const t = await db.sequelize.transaction();

    try {
      const { entregaId } = req.params;
      const { almacenistaId, observaciones } = req.body;

      // Buscar todas las legalizaciones pendientes de la entrega
      const legalizaciones = await Legalizacion.findAll({
        where: {
          entregaId: entregaId,
          estado: "pendiente",
        },
        include: [
          { model: Producto, as: "producto" },
          { model: Entrega, as: "entregaOriginal" },
        ],
        transaction: t,
      });

      if (legalizaciones.length === 0) {
        throw new Error("No hay legalizaciones pendientes para esta entrega");
      }

      const legalizacionesAprobadas = [];

      // Procesar cada legalización
      for (const legalizacion of legalizaciones) {
        // Actualizar estado de la legalización
        legalizacion.estado = "aprobada";
        legalizacion.almacenistaId = almacenistaId;
        legalizacion.fechaAprobacion = new Date();
        if (observaciones) {
          legalizacion.observaciones = observaciones;
        }
        await legalizacion.save({ transaction: t });

        // Actualizar estados según el tipo de legalización
        if (
          legalizacion.unidadesSeriadas &&
          legalizacion.unidadesSeriadas.length > 0
        ) {
          for (const unidadId of legalizacion.unidadesSeriadas) {
            const unidad = await ProductoUnidad.findByPk(unidadId, {
              transaction: t,
            });
            if (unidad) {
              unidad.estado =
                legalizacion.tipo === "instalado" ? "instalado" : "baja";
              await unidad.save({ transaction: t });
            }
          }
        }

        // Actualizar el EntregaProducto
        const entregaProducto = await EntregaProducto.findOne({
          where: {
            EntregaId: legalizacion.entregaId,
            ProductoId: legalizacion.productoId,
          },
          transaction: t,
        });

        if (entregaProducto) {
          entregaProducto.legalizado =
            (entregaProducto.legalizado || 0) + legalizacion.cantidad;
          await entregaProducto.save({ transaction: t });
        }

        legalizacionesAprobadas.push(legalizacion);
      }

      // Actualizar estado de la entrega
      await actualizarEstadoEntregaCoordinado(entregaId, t);

      await t.commit();

      return res.status(200).json({
        success: true,
        message: `${legalizacionesAprobadas.length} legalización(es) de la entrega aprobada(s) correctamente`,
        data: legalizacionesAprobadas,
      });
    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }
      return res.status(400).json({
        success: false,
        message: "Error al aprobar las legalizaciones de la entrega",
        error: error.message,
      });
    }
  },

  // Verificar si una entrega se puede cerrar
  async verificarCierreEntrega(entregaId) {
    const entrega = await Entrega.findByPk(entregaId, {
      include: [{ model: EntregaProducto }],
    });

    if (!entrega) return;

    let todosProductosCerrados = true;
    let hayDevolucionesParciales = false;
    let hayLegalizacionesParciales = false;

    for (const producto of entrega.EntregaProductos) {
      const cantidadEntregada = producto.cantidad;
      const cantidadDevuelta = producto.devuelto || 0;
      const cantidadLegalizada = producto.legalizado || 0;
      const cantidadProcesada = cantidadDevuelta + cantidadLegalizada;

      if (cantidadProcesada < cantidadEntregada) {
        todosProductosCerrados = false;
      }

      if (cantidadDevuelta > 0 && cantidadDevuelta < cantidadEntregada) {
        hayDevolucionesParciales = true;
      }

      if (cantidadLegalizada > 0 && cantidadLegalizada < cantidadEntregada) {
        hayLegalizacionesParciales = true;
      }
    }

    // Actualizar estado de la entrega
    let nuevoEstado = entrega.estado;

    if (todosProductosCerrados) {
      nuevoEstado = "cerrada";
      if (!entrega.fechaCierre) {
        entrega.fechaCierre = new Date();
      }
    } else if (hayLegalizacionesParciales || hayDevolucionesParciales) {
      if (hayLegalizacionesParciales && hayDevolucionesParciales) {
        nuevoEstado = "parcialmente_legalizada"; // Estado mixto
      } else if (hayLegalizacionesParciales) {
        nuevoEstado = "parcialmente_legalizada";
      } else if (hayDevolucionesParciales) {
        nuevoEstado = "parcialmente_devuelta";
      }
    }

    if (nuevoEstado !== entrega.estado) {
      entrega.estado = nuevoEstado;
      await entrega.save();
    }
  },

  // Listar legalizaciones pendientes
  async getPendientes(req, res) {
    try {
      const legalizaciones = await Legalizacion.findAll({
        where: { estado: "pendiente" },
        include: [
          {
            model: Producto,
            as: "producto",
            attributes: ["id", "codigo", "descripcion", "marca"],
          },
          {
            model: Personal,
            as: "tecnicoData",
            attributes: ["id", "nombre", "cedula"],
          },
          {
            model: Entrega,
            as: "entregaOriginal",
            attributes: ["id", "proyecto", "fecha"],
          },
        ],
        order: [["fecha", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        data: legalizaciones,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener legalizaciones pendientes",
        error: error.message,
      });
    }
  },

async findAll(req, res) {
  try {
    // Extraer parámetros de paginación de la query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Validar que los parámetros sean válidos
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Parámetros de paginación inválidos. Page debe ser >= 1, limit debe estar entre 1 y 100",
      });
    }

    // Buscar con paginación
    const { count, rows: legalizaciones } = await Legalizacion.findAndCountAll({
      include: [
        {
          model: Producto,
          as: "producto",
          attributes: ["id", "codigo", "descripcion", "marca"],
        },
        {
          model: Personal,
          as: "tecnicoData",
          attributes: ["id", "nombre", "cedula"],
        },
        {
          model: Entrega,
          as: "entregaOriginal",
          attributes: ["id", "proyecto", "fecha"],
        },
      ],
      order: [["fecha", "DESC"]],
      limit: limit,
      offset: offset,
    });

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      data: legalizaciones,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: count,
        itemsPerPage: limit,
        itemsInCurrentPage: legalizaciones.length,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener legalizaciones",
      error: error.message,
    });
  }
},

  // Obtener legalización por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const legalizacion = await Legalizacion.findByPk(id, {
        include: [
          {
            model: Producto,
            as: "producto",
            attributes: ["id", "codigo", "descripcion", "marca"],
          },
          {
            model: Personal,
            as: "tecnicoData",
            attributes: ["id", "nombre", "cedula"],
          },
          {
            model: Usuario,
            as: "almacenistaData",
            attributes: ["id", "nombre"],
          },
          {
            model: Entrega,
            as: "entregaOriginal",
            attributes: ["id", "proyecto", "fecha"],
          },
        ],
      });

      if (!legalizacion) {
        return res.status(404).json({
          success: false,
          message: "Legalización no encontrada",
        });
      }

      return res.status(200).json({
        success: true,
        data: legalizacion,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener la legalización",
        error: error.message,
      });
    }
  },

  // Obtener legalizaciones por entrega
  async getByEntrega(req, res) {
    try {
      const { entregaId } = req.params;
      const { estado } = req.query; // Filtro opcional por estado

      const whereClause = { entregaId };
      if (estado) {
        whereClause.estado = estado;
      }

      const legalizaciones = await Legalizacion.findAll({
        where: whereClause,
        include: [
          {
            model: Producto,
            as: "producto",
            attributes: ["id", "codigo", "descripcion", "marca"],
          },
          {
            model: Personal,
            as: "tecnicoData",
            attributes: ["id", "nombre", "cedula"],
          },
          {
            model: Usuario,
            as: "almacenistaData",
            attributes: ["id", "nombre"],
          },
        ],
        order: [["fecha", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        data: legalizaciones,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener legalizaciones de la entrega",
        error: error.message,
      });
    }
  },

  // Obtener legalizaciones por técnico
  async getByTecnico(req, res) {
    try {
      const { personalId } = req.params;
      const { estado } = req.query;

      const whereClause = { personalId };
      if (estado) {
        whereClause.estado = estado;
      }

      const legalizaciones = await Legalizacion.findAll({
        where: whereClause,
        include: [
          {
            model: Producto,
            as: "producto",
            attributes: ["id", "codigo", "descripcion", "marca"],
          },
          {
            model: Entrega,
            as: "entregaOriginal",
            attributes: ["id", "proyecto", "fecha"],
          },
          {
            model: Usuario,
            as: "almacenistaData",
            attributes: ["id", "nombre"],
          },
        ],
        order: [["fecha", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        data: legalizaciones,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener legalizaciones del técnico",
        error: error.message,
      });
    }
  },

  // Rechazar legalización
  async rechazar(req, res) {
    const t = await db.sequelize.transaction();

    try {
      const { id } = req.params;
      const { almacenistaId, motivoRechazo } = req.body;

      if (!motivoRechazo) {
        return res.status(400).json({
          success: false,
          message: "El motivo del rechazo es obligatorio",
        });
      }

      const legalizacion = await Legalizacion.findByPk(id, { transaction: t });

      if (!legalizacion) {
        throw new Error("Legalización no encontrada");
      }

      if (legalizacion.estado !== "pendiente") {
        throw new Error("Solo se pueden rechazar legalizaciones pendientes");
      }

      // Actualizar estado de la legalización
      legalizacion.estado = "rechazada";
      legalizacion.almacenistaId = almacenistaId;
      legalizacion.motivoRechazo = motivoRechazo;
      legalizacion.fechaAprobacion = new Date();
      await legalizacion.save({ transaction: t });

      await t.commit();

      return res.status(200).json({
        success: true,
        message: "Legalización rechazada correctamente",
        data: legalizacion,
      });
    } catch (error) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Error al rechazar la legalización",
        error: error.message,
      });
    }
  },

  // Obtener estadísticas de legalizaciones
  async getStats(req, res) {
    try {
      const { fechaInicio, fechaFin, personalId, tipo } = req.query;

      let whereClause = {};
      if (fechaInicio && fechaFin) {
        whereClause.fecha = {
          [db.Sequelize.Op.between]: [fechaInicio, fechaFin],
        };
      }
      if (personalId) {
        whereClause.personalId = personalId;
      }
      if (tipo) {
        whereClause.tipo = tipo;
      }

      const stats = await Legalizacion.findAll({
        where: whereClause,
        attributes: [
          "estado",
          "tipo",
          [db.sequelize.fn("COUNT", db.sequelize.col("id")), "cantidad"],
          [
            db.sequelize.fn("SUM", db.sequelize.col("cantidad")),
            "totalUnidades",
          ],
        ],
        group: ["estado", "tipo"],
        raw: true,
      });

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener estadísticas",
        error: error.message,
      });
    }
  },

  // Eliminar legalización (debug)
  async eliminar(req, res) {
    const t = await db.sequelize.transaction();

    try {
      const { id } = req.params;

      const legalizacion = await Legalizacion.findByPk(id, { transaction: t });

      if (!legalizacion) {
        throw new Error("Legalización no encontrada");
      }

      // Si estaba aprobada, revertir efectos básicos
      if (legalizacion.estado === "aprobada") {
        // Revertir cambios en ProductoUnidad
        if (
          legalizacion.unidadesSeriadas &&
          legalizacion.unidadesSeriadas.length > 0
        ) {
          for (const unidadId of legalizacion.unidadesSeriadas) {
            const unidad = await ProductoUnidad.findByPk(unidadId, {
              transaction: t,
            });
            if (unidad) {
              unidad.estado = "disponible"; // volvemos al estado original
              await unidad.save({ transaction: t });
            }
          }
        }

        // Revertir cambios en EntregaProducto
        const entregaProducto = await EntregaProducto.findOne({
          where: {
            EntregaId: legalizacion.entregaId,
            ProductoId: legalizacion.productoId,
          },
          transaction: t,
        });

        if (entregaProducto) {
          entregaProducto.legalizado = Math.max(
            (entregaProducto.legalizado || 0) - legalizacion.cantidad,
            0
          );
          await entregaProducto.save({ transaction: t });
        }
      }

      // Eliminar la legalización en cualquier estado
      await legalizacion.destroy({ transaction: t });

      // Actualizar estado de la entrega
      await actualizarEstadoEntregaCoordinado(legalizacion.entregaId, t);

      await t.commit();

      return res.status(200).json({
        success: true,
        message: "Legalización eliminada correctamente (debug)",
      });
    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }
      return res.status(400).json({
        success: false,
        message: "Error al eliminar la legalización",
        error: error.message,
      });
    }
  },
};

module.exports = LegalizacionController;
