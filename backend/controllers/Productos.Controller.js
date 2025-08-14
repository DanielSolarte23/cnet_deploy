const db = require("../models");
const { Op } = require("sequelize");
const Producto = db.Producto;
const ProductoUnidad = db.ProductoUnidad;
const Notificacion = db.Notificacion;
const Subcategoria = db.Subcategoria;
const Categoria = db.Categoria;
const Stant = db.Stant;

// Función para calcular stock disponible basado en estados
const calcularStockDisponible = async (productoId, transaction = null) => {
  try {
    // Para productos con unidades seriadas, contar solo las unidades con estado válido
    const unidadesDisponibles = await ProductoUnidad.count({
      where: {
        productoId: productoId,
        estado: ["nuevo", "usado"], // Solo estos estados cuentan como stock disponible
      },
      transaction,
    });

    return unidadesDisponibles;
  } catch (error) {
    console.error("Error calculando stock disponible:", error);
    return 0;
  }
};

// Función para sincronizar el stock del producto con las unidades disponibles
const sincronizarStock = async (producto, transaction = null) => {
  try {
    // Verificar si el producto tiene unidades seriadas
    const tieneUnidadesSeriadas =
      (await ProductoUnidad.count({
        where: { productoId: producto.id },
        transaction,
      })) > 0;

    if (tieneUnidadesSeriadas) {
      // Para productos seriados, el stock debe ser igual a las unidades disponibles
      const stockDisponible = await calcularStockDisponible(
        producto.id,
        transaction
      );
      producto.stock = stockDisponible;

      // Actualizar estado del producto basado en stock
      if (stockDisponible === 0) {
        producto.estado = "agotado";
      } else {
        producto.estado = "disponible";
      }

      await producto.save({ transaction });
    }

    return producto;
  } catch (error) {
    console.error("Error sincronizando stock:", error);
    throw error;
  }
};

// Verificar stock bajo y crear notificaciones
const verificarStockBajo = async (producto) => {
  try {
    if (producto.stock <= producto.stockMinimo) {
      await Notificacion.create({
        tipo: "stock_bajo",
        mensaje: `Stock bajo para el producto: ${producto.descripcion} (${producto.stock} unidades disponibles)`,
        detalles: {
          stockActual: producto.stock,
          stockMinimo: producto.stockMinimo,
          codigo: producto.codigo,
        },
        nivel: producto.stock === 0 ? "urgente" : "advertencia",
        productoId: producto.id,
      });

      if (producto.stock === 0) {
        producto.estado = "agotado";
        await producto.save();
      }
    }
  } catch (error) {
    console.error("Error al crear notificación de stock:", error);
  }
};

//Funcion para generar el codigo de productos automatico
const generarCodigoProducto = async (
  prefijo = "PRD",
  digitos = 4,
  transaction
) => {
  try {
    const ultimoProducto = await Producto.findOne({
      order: [["id", "DESC"]],
      transaction,
      attributes: ["codigo"],
    });

    let siguienteNumero = 1;

    if (ultimoProducto && ultimoProducto.codigo) {
      const regex = new RegExp(`${prefijo}-(\\d+)`);
      const match = ultimoProducto.codigo.match(regex);
      if (match) {
        siguienteNumero = parseInt(match[1]) + 1;
      }
    }

    const nuevoCodigo = `${prefijo}-${siguienteNumero
      .toString()
      .padStart(digitos, "0")}`;

    // Verificar unicidad
    const codigoExistente = await Producto.findOne({
      where: { codigo: nuevoCodigo },
      transaction,
    });

    if (codigoExistente) {
      const timestamp = Date.now().toString().slice(-6);
      return `${prefijo}-${timestamp}`;
    }

    return nuevoCodigo;
  } catch (error) {
    console.error("Error generando código:", error);
    const timestamp = Date.now().toString().slice(-6);
    return `${prefijo}-${timestamp}`;
  }
};

// Controlador para productos
const ProductoController = {
  // Crear un nuevo producto con unidades opcionales
  async create(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const {
        unidades,
        categoria,
        subcategoria,
        SubcategoriumId,
        StantId,
        ...productoData
      } = req.body;

      let finalSubcategoriumId = SubcategoriumId;

      // Si se envían datos para crear una nueva subcategoría
      if (subcategoria && !SubcategoriumId) {
        let categoriumId = subcategoria.CategoriumId;

        if (subcategoria.crearCategoria && categoria) {
          const nuevaCategoria = await Categoria.create(
            {
              nombre: categoria.nombre,
            },
            { transaction }
          );

          categoriumId = nuevaCategoria.id;
          console.log(
            `Nueva categoría creada: ${nuevaCategoria.nombre} (ID: ${categoriumId})`
          );
        }

        const nuevaSubcategoria = await Subcategoria.create(
          {
            nombre: subcategoria.nombre,
            CategoriumId: categoriumId,
          },
          { transaction }
        );

        finalSubcategoriumId = nuevaSubcategoria.id;
        console.log(
          `Nueva subcategoría creada: ${nuevaSubcategoria.nombre} (ID: ${finalSubcategoriumId})`
        );
      }

      productoData.SubcategoriumId = finalSubcategoriumId;

      if (StantId) {
        productoData.StantId = StantId;
      }

      // Generación automática del código del producto
      if (!productoData.codigo) {
        productoData.codigo = await generarCodigoProducto(
          "PRD",
          4,
          transaction
        );
      }

      // Crear el producto base
      const producto = await Producto.create(productoData, {
        transaction,
      });

      // Si se enviaron unidades con seriales, crearlas
      if (unidades && Array.isArray(unidades) && unidades.length > 0) {
        const unidadesData = unidades.map((unidad) => ({
          serial: unidad.serial,
          estado: unidad.estado || "nuevo", // Por defecto 'nuevo'
          productoId: producto.id,
        }));

        await ProductoUnidad.bulkCreate(unidadesData, {
          transaction,
          validate: true,
        });
      }

      // Sincronizar el stock con las unidades creadas
      await sincronizarStock(producto, transaction);

      await transaction.commit();

      // Verificar stock después de la creación
      await verificarStockBajo(producto);

      return res.status(201).json({
        success: true,
        message: "Producto creado correctamente",
        data: producto,
      });
    } catch (error) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Error al crear el producto",
        error: error.message,
      });
    }
  },

  // Obtener todos los productos con stock calculado dinámicamente
  async findAll(req, res) {
    try {
      const productos = await Producto.findAll({
        include: [
          {
            model: Subcategoria,
            include: [
              {
                model: Categoria,
              },
            ],
          },
          {
            model: Stant,
          },
          {
            model: ProductoUnidad,
          },
        ],
      });

      // Calcular stock real para cada producto
      const productosConStockReal = await Promise.all(
        productos.map(async (producto) => {
          const productoJSON = producto.toJSON();

          // Si tiene unidades seriadas, calcular stock disponible
          if (
            productoJSON.ProductoUnidads &&
            productoJSON.ProductoUnidads.length > 0
          ) {
            const stockDisponible = productoJSON.ProductoUnidads.filter(
              (unidad) => ["nuevo", "usado"].includes(unidad.estado)
            ).length;

            productoJSON.stockDisponible = stockDisponible;
            productoJSON.stockTotal = productoJSON.ProductoUnidads.length;

            // Desglose por estado
            productoJSON.stockPorEstado = {
              nuevo: productoJSON.ProductoUnidads.filter(
                (u) => u.estado === "nuevo"
              ).length,
              usado: productoJSON.ProductoUnidads.filter(
                (u) => u.estado === "usado"
              ).length,
              baja: productoJSON.ProductoUnidads.filter(
                (u) => u.estado === "baja"
              ).length,
              instalacion: productoJSON.ProductoUnidads.filter(
                (u) => u.estado === "instalacion"
              ).length,
              instalado: productoJSON.ProductoUnidads.filter(
                (u) => u.estado === "instalado"
              ).length,
              reintegrado: productoJSON.ProductoUnidads.filter(
                (u) => u.estado === "reintegrado"
              ).length,
            };
          } else {
            // Para productos no seriados, usar el stock directo
            productoJSON.stockDisponible = productoJSON.stock;
            productoJSON.stockTotal = productoJSON.stock;
          }

          return productoJSON;
        })
      );

      return res.status(200).json({
        success: true,
        count: productosConStockReal.length,
        data: productosConStockReal,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener los productos",
        error: error.message,
      });
    }
  },

  async findAllLite(req, res) {
    try {
      const productos = await Producto.findAll({
        attributes: [
          "id",
          "codigo",
          "descripcion",
          "marca",
          "modelo",
          "stock",
          "StantId",
        ],
        include: [
          {
            model: Stant,
            attributes: ["nombre"],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        count: productos.length,
        data: productos,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener los productos",
        error: error.message,
      });
    }
  },

  // Obtener un producto por ID
  async findOne(req, res) {
    try {
      const { id } = req.params;
      const producto = await Producto.findByPk(id, {
        include: [
          {
            model: Subcategoria,
            include: [
              {
                model: Categoria,
              },
            ],
          },
          {
            model: Stant,
          },
          {
            model: ProductoUnidad,
          },
        ],
      });

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
      }

      const productoJSON = producto.toJSON();

      // Calcular información de stock
      if (
        productoJSON.ProductoUnidads &&
        productoJSON.ProductoUnidads.length > 0
      ) {
        const stockDisponible = productoJSON.ProductoUnidads.filter((unidad) =>
          ["nuevo", "usado"].includes(unidad.estado)
        ).length;

        productoJSON.stockDisponible = stockDisponible;
        productoJSON.stockTotal = productoJSON.ProductoUnidads.length;

        productoJSON.stockPorEstado = {
          nuevo: productoJSON.ProductoUnidads.filter(
            (u) => u.estado === "nuevo"
          ).length,
          usado: productoJSON.ProductoUnidads.filter(
            (u) => u.estado === "usado"
          ).length,
          baja: productoJSON.ProductoUnidads.filter((u) => u.estado === "baja")
            .length,
          instalacion: productoJSON.ProductoUnidads.filter(
            (u) => u.estado === "instalacion"
          ).length,
          instalado: productoJSON.ProductoUnidads.filter(
            (u) => u.estado === "instalado"
          ).length,
          reintegrado: productoJSON.ProductoUnidads.filter(
            (u) => u.estado === "reintegrado"
          ).length,
        };
      } else {
        productoJSON.stockDisponible = productoJSON.stock;
        productoJSON.stockTotal = productoJSON.stock;
      }

      return res.status(200).json({
        success: true,
        data: productoJSON,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener el producto",
        error: error.message,
      });
    }
  },

  // Actualizar un producto
  async update(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const { id } = req.params;
      const { unidades, ...productoData } = req.body;

      const [updated] = await Producto.update(productoData, {
        where: { id },
        transaction,
      });

      if (updated) {
        const producto = await Producto.findByPk(id, { transaction });

        // Sincronizar stock después de la actualización
        await sincronizarStock(producto, transaction);

        await transaction.commit();

        // Verificar stock después de la actualización
        await verificarStockBajo(producto);

        return res.status(200).json({
          success: true,
          message: "Producto actualizado correctamente",
          data: producto,
        });
      }

      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    } catch (error) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Error al actualizar el producto",
        error: error.message,
      });
    }
  },

  // Eliminar un producto
  async delete(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const { id } = req.params;

      // Eliminar primero las unidades asociadas
      await ProductoUnidad.destroy({
        where: { productoId: id },
        transaction,
      });

      // Luego eliminar el producto
      const deleted = await Producto.destroy({
        where: { id },
        transaction,
      });

      if (deleted) {
        await transaction.commit();
        return res.status(200).json({
          success: true,
          message: "Producto eliminado correctamente",
        });
      }

      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({
        success: false,
        message: "Error al eliminar el producto",
        error: error.message,
      });
    }
  },

  // Ajustar stock manualmente - VERSIÓN MEJORADA
  async ajustarStock(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const { id } = req.params;
      const {
        cantidad,
        unidades = [], // Array de unidades con seriales para agregar
        eliminarSeriales = [], // Array de seriales para eliminar
      } = req.body;

      const producto = await Producto.findByPk(id, { transaction });

      if (!producto) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
      }

      // Obtener las unidades actuales del producto
      const unidadesActuales = await ProductoUnidad.findAll({
        where: { productoId: id },
        transaction,
      });

      // Determinar si el producto usa seriales
      const usaSeriales = unidadesActuales.length > 0;

      if (usaSeriales) {
        // PRODUCTOS CON SERIALES
        if (cantidad > 0) {
          // AGREGAR STOCK
          if (!unidades || unidades.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message:
                "Para agregar stock en productos con seriales, debe proporcionar la lista de unidades con sus seriales",
            });
          }

          if (unidades.length !== cantidad) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message: `La cantidad (${cantidad}) no coincide con el número de unidades proporcionadas (${unidades.length})`,
            });
          }

          // Verificar seriales duplicados
          const serialesExistentes = await ProductoUnidad.findAll({
            where: {
              serial: unidades.map((u) => u.serial),
              productoId: id,
            },
            transaction,
          });

          if (serialesExistentes.length > 0) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message: "Algunos seriales ya existen en el sistema",
              seriales: serialesExistentes.map((u) => u.serial),
            });
          }

          // Crear las nuevas unidades con estado 'nuevo' o 'usado'
          const unidadesData = unidades.map((unidad) => ({
            serial: unidad.serial,
            estado: ["nuevo", "usado"].includes(unidad.estado)
              ? unidad.estado
              : "nuevo",
            productoId: id,
          }));

          await ProductoUnidad.bulkCreate(unidadesData, {
            transaction,
            validate: true,
          });
        } else if (cantidad < 0) {
          // REDUCIR STOCK
          if (!eliminarSeriales || eliminarSeriales.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message:
                "Para reducir stock en productos con seriales, debe proporcionar la lista de seriales a eliminar",
            });
          }

          if (eliminarSeriales.length !== Math.abs(cantidad)) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message: `La cantidad (${Math.abs(
                cantidad
              )}) no coincide con el número de seriales a eliminar (${
                eliminarSeriales.length
              })`,
            });
          }

          // Verificar que todos los seriales existan y estén disponibles
          const unidadesEliminar = await ProductoUnidad.findAll({
            where: {
              serial: eliminarSeriales,
              productoId: id,
              estado: ["nuevo", "usado"], // Solo permitir eliminar unidades disponibles
            },
            transaction,
          });

          if (unidadesEliminar.length !== eliminarSeriales.length) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message:
                "Algunos seriales no existen, no pertenecen a este producto o no están disponibles para eliminar",
            });
          }

          // Eliminar las unidades
          await ProductoUnidad.destroy({
            where: {
              serial: eliminarSeriales,
              productoId: id,
            },
            transaction,
          });
        }

        // Actualizar el stock basado en unidades disponibles
        await sincronizarStock(producto, transaction);
      } else {
        // PRODUCTOS SIN SERIALES
        const nuevoStock = producto.stock + parseInt(cantidad);

        if (nuevoStock < 0) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "Stock no puede ser negativo",
          });
        }

        producto.stock = nuevoStock;

        if (nuevoStock === 0) {
          producto.estado = "agotado";
        } else {
          producto.estado = "disponible";
        }

        await producto.save({ transaction });
      }

      await transaction.commit();

      // Recargar el producto con información actualizada
      const productoActualizado = await Producto.findByPk(id, {
        include: [{ model: ProductoUnidad }],
      });

      // Verificar stock después del ajuste
      await verificarStockBajo(productoActualizado);

      return res.status(200).json({
        success: true,
        message: "Stock ajustado correctamente",
        data: {
          producto: productoActualizado,
          ajuste: cantidad,
          usaSeriales,
          stockDisponible: usaSeriales
            ? await calcularStockDisponible(id)
            : productoActualizado.stock,
        },
      });
    } catch (error) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Error al ajustar stock",
        error: error.message,
      });
    }
  },

  // Resto de métodos sin cambios significativos...
  async findUnidades(req, res) {
    try {
      const { id } = req.params;
      const unidades = await ProductoUnidad.findAll({
        where: { productoId: id },
        include: [
          {
            model: Producto,
            include: [
              {
                model: Subcategoria,
                include: [Categoria],
              },
              {
                model: Stant,
              },
            ],
          },
        ],
      });
      if (!unidades) {
        return res.status(404).json({
          success: false,
          message: "No se encontraron unidades para este producto",
        });
      }
      return res.status(200).json({
        success: true,
        count: unidades.length,
        data: unidades,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener las unidades del producto",
        error: error.message,
      });
    }
  },

  async findByStant(req, res) {
    try {
      const { stantId } = req.params;
      const productos = await Producto.findAll({
        where: { StantId: stantId },
        include: [
          {
            model: Subcategoria,
            include: [Categoria],
          },
          {
            model: Stant,
          },
          {
            model: ProductoUnidad,
          },
        ],
      });

      return res.status(200).json({
        success: true,
        count: productos.length,
        data: productos,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener los productos por estante",
        error: error.message,
      });
    }
  },

  async findBySubcategoria(req, res) {
    try {
      const { subcategoriaId } = req.params;
      const productos = await Producto.findAll({
        where: { subcategoriaId: subcategoriaId },
        include: [
          {
            model: Subcategoria,
            include: [Categoria],
          },
          {
            model: Stant,
          },
          {
            model: ProductoUnidad,
          },
        ],
      });

      return res.status(200).json({
        success: true,
        count: productos.length,
        data: productos,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener los productos por subcategoría",
        error: error.message,
      });
    }
  },

  // Obtener productos con stock bajo - Mejorado para considerar estados
  async getStockBajo(req, res) {
    try {
      const productos = await Producto.findAll({
        where: {
          isStockLow: false, 
        },
        include: [
          { model: Subcategoria, include: [Categoria] },
          { model: Stant },
          { model: ProductoUnidad },
        ],
      });

      // Filtrar productos con stock bajo considerando solo unidades disponibles
      const productosStockBajo = [];

      for (const producto of productos) {
        let stockDisponible;

        if (producto.ProductoUnidads && producto.ProductoUnidads.length > 0) {
          // Para productos seriados, contar solo unidades disponibles
          stockDisponible = producto.ProductoUnidads.filter((unidad) =>
            ["nuevo", "usado"].includes(unidad.estado)
          ).length;
        } else {
          // Para productos no seriados
          stockDisponible = producto.stock;
        }

        if (stockDisponible <= producto.stockMinimo) {
          const productoJSON = producto.toJSON();
          productoJSON.stockDisponible = stockDisponible;
          productosStockBajo.push(productoJSON);
        }
      }

      return res.status(200).json({
        success: true,
        count: productosStockBajo.length,
        data: productosStockBajo,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener productos con stock bajo",
        error: error.message,
      });
    }
  },

  // Agregar nuevas unidades a un producto existente
  async agregarUnidades(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const { id } = req.params;
      const { unidades } = req.body;

      if (!unidades || !Array.isArray(unidades) || unidades.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Se requiere al menos una unidad con serial",
        });
      }

      const producto = await Producto.findByPk(id, { transaction });

      if (!producto) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
      }

      // Preparar datos de unidades, asegurando estado válido
      const unidadesData = unidades.map((unidad) => ({
        ...unidad,
        estado: ["nuevo", "usado"].includes(unidad.estado)
          ? unidad.estado
          : "nuevo",
        productoId: producto.id,
      }));

      // Crear las unidades
      const unidadesCreadas = await ProductoUnidad.bulkCreate(unidadesData, {
        transaction,
        validate: true,
      });

      // Sincronizar el stock del producto
      await sincronizarStock(producto, transaction);

      await transaction.commit();

      // Verificar stock después del ajuste
      await verificarStockBajo(producto);

      return res.status(200).json({
        success: true,
        message: `${unidadesCreadas.length} unidades agregadas correctamente`,
        data: {
          producto,
          unidadesAgregadas: unidadesCreadas,
        },
      });
    } catch (error) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Error al agregar unidades",
        error: error.message,
      });
    }
  },

  // Buscar productos por serial
  async buscarPorSerial(req, res) {
    try {
      const { serial } = req.params;

      const unidad = await ProductoUnidad.findOne({
        where: { serial },
        include: [
          {
            model: Producto,
            include: [
              { model: Subcategoria, include: [Categoria] },
              { model: Stant },
            ],
          },
        ],
      });

      if (!unidad) {
        return res.status(404).json({
          success: false,
          message: "No se encontró ningún producto con ese serial",
        });
      }

      return res.status(200).json({
        success: true,
        data: unidad,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al buscar producto por serial",
        error: error.message,
      });
    }
  },

  async buscarEntregaPorProducto(req, res) {
    try {
      const { busqueda } = req.query;

      if (!busqueda || busqueda.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Debe proporcionar un valor de búsqueda",
        });
      }

      // Buscar por descripción de producto
      const entregasPorDescripcion = await db.Entrega.findAll({
        include: [
          {
            model: db.EntregaProducto,
            include: [
              {
                model: db.Producto,
                where: {
                  descripcion: {
                    [Op.like]: `%${busqueda}%`,
                  },
                },
              },
            ],
          },
          {
            model: db.Personal,
            as: "tecnicoData",
          },
        ],
      });

      // Filtrar entregas donde unidadesSeriadas incluyan alguna unidad con el serial buscado
      const entregasSerialFiltradas = productoPorSerial.filter((entrega) =>
        entrega.EntregaProductos.some(
          (ep) =>
            Array.isArray(ep.unidadesSeriadas) &&
            ep.unidadesSeriadas.some((id) => idsUnidad.includes(id))
        )
      );

      // Juntar resultados, eliminando duplicados
      const entregasTotales = [
        ...entregasPorDescripcion,
        ...entregasSerialFiltradas,
      ];
      const entregasUnicas = [];

      const idsUnicos = new Set();
      for (const entrega of entregasTotales) {
        if (!idsUnicos.has(entrega.id)) {
          idsUnicos.add(entrega.id);
          entregasUnicas.push(entrega);
        }
      }

      // Formatear la respuesta
      const resultado = entregasUnicas.map((entrega) => ({
        entregaId: entrega.id,
        fecha: entrega.fecha,
        proyecto: entrega.proyecto,
        tecnico: entrega.tecnicoData
          ? `${entrega.tecnicoData.nombre} ${entrega.tecnicoData.apellido}`
          : "No asignado",
        productos: entrega.EntregaProductos.map((ep) => ({
          descripcion: ep.descripcion,
          cantidad: ep.cantidad,
          seriales: ep.unidadesSeriadas,
          producto: ep.Producto?.descripcion || "Desconocido",
        })),
      }));

      return res.status(200).json({
        success: true,
        count: resultado.length,
        resultados: resultado,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        success: false,
        message: "Error al buscar la entrega",
        error: error.message,
      });
    }
  },

  // Cambiar estado de una unidad - MEJORADO
  async cambiarEstadoUnidad(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (
        ![
          "nuevo",
          "usado",
          "baja",
          "instalacion",
          "instalado",
          "reintegrado",
        ].includes(estado)
      ) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message:
            "Estado no válido. Debe ser 'nuevo', 'usado', 'baja', 'instalacion', 'instalado' o 'reintegrado'",
        });
      }

      const unidad = await ProductoUnidad.findByPk(id, { transaction });

      if (!unidad) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Unidad no encontrada",
        });
      }

      const estadoAnterior = unidad.estado;
      unidad.estado = estado;
      await unidad.save({ transaction });

      // Actualizar el stock del producto basado en los nuevos estados
      const producto = await Producto.findByPk(unidad.productoId, {
        transaction,
      });
      await sincronizarStock(producto, transaction);

      await transaction.commit();

      // Verificar stock después del cambio de estado
      await verificarStockBajo(producto);

      return res.status(200).json({
        success: true,
        message: "Estado de unidad actualizado correctamente",
        data: {
          unidad,
          estadoAnterior,
          estadoNuevo: estado,
          productoActualizado: producto,
        },
      });
    } catch (error) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Error al cambiar estado de la unidad",
        error: error.message,
      });
    }
  },

  // Método adicional para sincronizar todos los productos
  async sincronizarTodosLosStocks(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const productos = await Producto.findAll({
        include: [{ model: ProductoUnidad }],
        transaction,
      });

      let productosActualizados = 0;

      for (const producto of productos) {
        const stockAnterior = producto.stock;
        await sincronizarStock(producto, transaction);

        if (stockAnterior !== producto.stock) {
          productosActualizados++;
        }
      }

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: `Sincronización completada. ${productosActualizados} productos actualizados.`,
        data: {
          productosRevisados: productos.length,
          productosActualizados,
        },
      });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({
        success: false,
        message: "Error al sincronizar stocks",
        error: error.message,
      });
    }
  },

  // Método para obtener resumen de stock por estados
  async getResumenStock(req, res) {
    try {
      const { id } = req.params;

      const producto = await Producto.findByPk(id, {
        include: [{ model: ProductoUnidad }],
      });

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
      }

      const resumen = {
        producto: {
          id: producto.id,
          codigo: producto.codigo,
          descripcion: producto.descripcion,
          stockRegistrado: producto.stock,
        },
        unidades: {
          total: producto.ProductoUnidads.length,
          porEstado: {
            nuevo: producto.ProductoUnidads.filter((u) => u.estado === "nuevo")
              .length,
            usado: producto.ProductoUnidads.filter((u) => u.estado === "usado")
              .length,
            baja: producto.ProductoUnidads.filter((u) => u.estado === "baja")
              .length,
            instalacion: producto.ProductoUnidads.filter(
              (u) => u.estado === "instalacion"
            ).length,
            instalado: producto.ProductoUnidads.filter(
              (u) => u.estado === "instalado"
            ).length,
            reintegrado: producto.ProductoUnidads.filter(
              (u) => u.estado === "reintegrado"
            ).length,
          },
        },
        stockDisponible: producto.ProductoUnidads.filter((u) =>
          ["nuevo", "usado"].includes(u.estado)
        ).length,
        stockNoDisponible: producto.ProductoUnidads.filter(
          (u) => !["nuevo", "usado"].includes(u.estado)
        ).length,
        inconsistencia:
          producto.stock !==
          producto.ProductoUnidads.filter((u) =>
            ["nuevo", "usado"].includes(u.estado)
          ).length,
      };

      return res.status(200).json({
        success: true,
        data: resumen,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener resumen de stock",
        error: error.message,
      });
    }
  },

  // Agregar este método al ProductoController existente
  // Búsqueda rápida de productos
  async busquedaRapida(req, res) {
    try {
      const { q, limite = 10, incluirUnidades = false } = req.query;

      if (!q || q.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Debe proporcionar un término de búsqueda",
        });
      }

      const termino = q.trim();
      const limitNum = parseInt(limite) || 10;

      // Construir la consulta con múltiples criterios de búsqueda
      const whereConditions = {
        [Op.or]: [
          { codigo: { [Op.like]: `%${termino}%` } },
          { descripcion: { [Op.like]: `%${termino}%` } },
          { marca: { [Op.like]: `%${termino}%` } },
          { modelo: { [Op.like]: `%${termino}%` } },
        ],
      };

      // Configurar includes
      const includes = [
        {
          model: Subcategoria,
          include: [{ model: Categoria }],
        },
        {
          model: Stant,
        },
      ];

      // Si se solicita incluir unidades, agregarlas
      if (incluirUnidades === "true") {
        includes.push({
          model: ProductoUnidad,
        });
      }

      // Ejecutar la búsqueda principal
      const productos = await Producto.findAll({
        where: whereConditions,
        include: includes,
        limit: limitNum,
        order: [
          // Priorizar coincidencias exactas en código
          [
            db.sequelize.literal(`CASE 
        WHEN codigo LIKE '${termino}%' THEN 1
        WHEN descripcion LIKE '${termino}%' THEN 2
        WHEN marca LIKE '${termino}%' THEN 3
        ELSE 4
      END`),
            "ASC",
          ],
          ["descripcion", "ASC"],
        ],
      });

      // Búsqueda adicional por serial si no hay suficientes resultados
      let unidadesPorSerial = [];
      if (productos.length < limitNum) {
        const restante = limitNum - productos.length;

        unidadesPorSerial = await ProductoUnidad.findAll({
          where: {
            serial: { [Op.like]: `%${termino}%` },
          },
          include: [
            {
              model: Producto,
              include: [
                { model: Subcategoria, include: [{ model: Categoria }] },
                { model: Stant },
              ],
            },
          ],
          limit: restante,
        });
      }

      // Procesar resultados de productos - SIMPLIFICADO
      const productosConStock = productos.map((producto) => {
        const productoJSON = producto.toJSON();

        // Usar el stock ya calculado del modelo
        productoJSON.stockDisponible = producto.stock;
        productoJSON.stockTotal = producto.stock;

        // Si incluye unidades y las tiene, agregar desglose por estado
        if (
          incluirUnidades === "true" &&
          productoJSON.ProductoUnidads &&
          productoJSON.ProductoUnidads.length > 0
        ) {
          // Desglose por estado solo para productos con unidades seriadas
          productoJSON.stockPorEstado = {
            nuevo: productoJSON.ProductoUnidads.filter(
              (u) => u.estado === "nuevo"
            ).length,
            usado: productoJSON.ProductoUnidads.filter(
              (u) => u.estado === "usado"
            ).length,
            baja: productoJSON.ProductoUnidads.filter(
              (u) => u.estado === "baja"
            ).length,
            instalacion: productoJSON.ProductoUnidads.filter(
              (u) => u.estado === "instalacion"
            ).length,
            instalado: productoJSON.ProductoUnidads.filter(
              (u) => u.estado === "instalado"
            ).length,
            reintegrado: productoJSON.ProductoUnidads.filter(
              (u) => u.estado === "reintegrado"
            ).length,
          };
        }

        productoJSON.tipoResultado = "producto";
        productoJSON.coincidencia = {
          codigo: producto.codigo
            ?.toLowerCase()
            .includes(termino.toLowerCase()),
          descripcion: producto.descripcion
            ?.toLowerCase()
            .includes(termino.toLowerCase()),
          marca: producto.marca?.toLowerCase().includes(termino.toLowerCase()),
          modelo: producto.modelo
            ?.toLowerCase()
            .includes(termino.toLowerCase()),
        };

        return productoJSON;
      });

      // Procesar resultados de unidades por serial
      const unidadesConProducto = unidadesPorSerial.map((unidad) => {
        const unidadJSON = unidad.toJSON();
        unidadJSON.tipoResultado = "serial";
        unidadJSON.coincidencia = {
          serial: unidad.serial?.toLowerCase().includes(termino.toLowerCase()),
        };
        return unidadJSON;
      });

      // Combinar resultados
      const resultados = [...productosConStock, ...unidadesConProducto];

      // Estadísticas de búsqueda
      const estadisticas = {
        totalEncontrados: resultados.length,
        productos: productosConStock.length,
        unidadesPorSerial: unidadesConProducto.length,
        terminoBusqueda: termino,
        tiempoRespuesta: new Date().toISOString(),
      };

      return res.status(200).json({
        success: true,
        data: resultados,
        estadisticas,
        meta: {
          limite: limitNum,
          incluyeUnidades: incluirUnidades === "true",
          hayMasResultados: resultados.length === limitNum,
        },
      });
    } catch (error) {
      console.error("Error en búsqueda rápida:", error);
      return res.status(500).json({
        success: false,
        message: "Error al realizar la búsqueda",
        error: error.message,
      });
    }
  },

  // Sugerencias de búsqueda (autocompletado)
  async obtenerSugerencias(req, res) {
    try {
      const { q, limite = 5 } = req.query;

      if (!q || q.trim() === "" || q.length < 2) {
        return res.status(200).json({
          success: true,
          data: [],
          message: "Mínimo 2 caracteres para sugerencias",
        });
      }

      const termino = q.trim();
      const limitNum = parseInt(limite) || 5;

      // Obtener sugerencias de diferentes campos
      const [
        sugerenciasCodigo,
        sugerenciasDescripcion,
        sugerenciasMarca,
        sugerenciasModelo,
      ] = await Promise.all([
        // Códigos
        Producto.findAll({
          attributes: ["codigo"],
          where: {
            codigo: { [Op.like]: `${termino}%` },
            codigo: { [Op.not]: null },
          },
          limit: limitNum,
          raw: true,
        }),
        // Descripciones
        Producto.findAll({
          attributes: ["descripcion"],
          where: {
            descripcion: { [Op.like]: `${termino}%` },
            descripcion: { [Op.not]: null },
          },
          limit: limitNum,
          raw: true,
        }),
        // Marcas
        Producto.findAll({
          attributes: [
            [db.sequelize.fn("DISTINCT", db.sequelize.col("marca")), "marca"],
          ],
          where: {
            marca: { [Op.like]: `${termino}%` },
            marca: { [Op.not]: null },
          },
          limit: limitNum,
          raw: true,
        }),
        // Modelos
        Producto.findAll({
          attributes: [
            [db.sequelize.fn("DISTINCT", db.sequelize.col("modelo")), "modelo"],
          ],
          where: {
            modelo: { [Op.like]: `${termino}%` },
            modelo: { [Op.not]: null },
          },
          limit: limitNum,
          raw: true,
        }),
      ]);

      // Formatear sugerencias
      const sugerencias = [
        ...sugerenciasCodigo.map((item) => ({
          valor: item.codigo,
          tipo: "codigo",
          icono: "tag",
        })),
        ...sugerenciasDescripcion.map((item) => ({
          valor: item.descripcion,
          tipo: "descripcion",
          icono: "package",
        })),
        ...sugerenciasMarca.map((item) => ({
          valor: item.marca,
          tipo: "marca",
          icono: "trademark",
        })),
        ...sugerenciasModelo.map((item) => ({
          valor: item.modelo,
          tipo: "modelo",
          icono: "settings",
        })),
      ].slice(0, limitNum);

      return res.status(200).json({
        success: true,
        data: sugerencias,
        meta: {
          termino,
          total: sugerencias.length,
        },
      });
    } catch (error) {
      console.error("Error obteniendo sugerencias:", error);
      return res.status(500).json({
        success: false,
        message: "Error al obtener sugerencias",
        error: error.message,
      });
    }
  },
};

module.exports = ProductoController;
