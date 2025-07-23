const db = require("../models");
const { Op } = require("sequelize");
const Producto = db.Producto;
const ProductoUnidad = db.ProductoUnidad;
const Notificacion = db.Notificacion;
const Subcategoria = db.Subcategoria;
const Categoria = db.Categoria;
const Stant = db.Stant;

// Verificar stock bajo y crear notificaciones
const verificarStockBajo = async (producto) => {
  try {
    if (producto.stock <= producto.stockMinimo) {
      await Notificacion.create({
        tipo: "stock_bajo",
        mensaje: `Stock bajo para el producto: ${producto.descripcion} (${producto.stock} unidades)`,
        detalles: {
          stockActual: producto.stock,
          stockMinimo: producto.stockMinimo,
          codigo: producto.codigo,
        },
        nivel: producto.stock === 0 ? "urgente" : "advertencia",
        productoId: producto.id,
      });

      // También podríamos enviar un correo electrónico o una notificación push aquí
      /*  console.log(`Notificación creada: Stock bajo para ${producto.descripcion}`); */
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
        categoria, // Datos para crear una nueva categoría
        subcategoria, // Datos para crear una nueva subcategoría
        SubcategoriumId, // ID de subcategoría existente
        StantId, // ID del estante donde se ubicará el producto
        ...productoData
      } = req.body;

      let finalSubcategoriumId = SubcategoriumId;

      // Si se envían datos para crear una nueva subcategoría
      if (subcategoria && !SubcategoriumId) {
        let categoriumId = subcategoria.CategoriumId;

        // Si se especifica crear una nueva categoría para la subcategoría
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

        // Asegurar que la subcategoría esté asociada a la categoría correcta
        const nuevaSubcategoria = await Subcategoria.create(
          {
            nombre: subcategoria.nombre,
            CategoriumId: categoriumId, // Asociar a la categoría
          },
          { transaction }
        );

        finalSubcategoriumId = nuevaSubcategoria.id;
        console.log(
          `Nueva subcategoría creada: ${nuevaSubcategoria.nombre} (ID: ${finalSubcategoriumId})`
        );
      }

      // Asociar el producto con la subcategoría (existente o recién creada)
      productoData.SubcategoriumId = finalSubcategoriumId;

      // Añadir el StantId si se proporciona
      if (StantId) {
        productoData.StantId = StantId;
      }

      // **GENERACIÓN AUTOMÁTICA DEL CÓDIGO DEL PRODUCTO**
      if (!productoData.codigo) {
        // Y en el controlador usar:
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
          estado: unidad.estado || "nuevo",
          productoId: producto.id,
        }));

        await ProductoUnidad.bulkCreate(unidadesData, {
          transaction,
          validate: true,
        });

        // Actualizar el stock basado en las unidades creadas
        producto.stock = unidades.length;
        await producto.save({ transaction });
      }

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

  // Obtener todos los productos
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

      return res.status(200).json({
        success: true,
        data: producto,
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
    try {
      const { id } = req.params;
      const { unidades, ...productoData } = req.body;

      const [updated] = await Producto.update(productoData, {
        where: { id },
      });

      if (updated) {
        const producto = await Producto.findByPk(id);

        // Verificar stock después de la actualización
        await verificarStockBajo(producto);

        return res.status(200).json({
          success: true,
          message: "Producto actualizado correctamente",
          data: producto,
        });
      }

      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    } catch (error) {
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

  // Ajustar stock manualmente
  async ajustarStock(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const { id } = req.params;
      const {
        cantidad,
        unidades = [], // Array de unidades con seriales para agregar
        eliminarSeriales = [], // Array de seriales para eliminar (en caso de reducción)
      } = req.body;

      const producto = await Producto.findByPk(id);

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

      // Determinar si el producto usa seriales verificando si ya tiene unidades con serial
      const usaSeriales = unidadesActuales.length > 0;

      // Para productos que usan seriales
      if (usaSeriales) {
        if (cantidad > 0 && (!unidades || unidades.length === 0)) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message:
              "Para agregar stock en productos con seriales, debe proporcionar la lista de unidades con sus seriales",
          });
        }

        if (
          cantidad < 0 &&
          (!eliminarSeriales || eliminarSeriales.length === 0)
        ) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message:
              "Para reducir stock en productos con seriales, debe proporcionar la lista de seriales a eliminar",
          });
        }

        // Agregar nuevas unidades con seriales
        if (cantidad > 0 && unidades.length > 0) {
          // Verificar que la cantidad coincida con las unidades proporcionadas
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

          // Crear las nuevas unidades
          const unidadesData = unidades.map((unidad) => ({
            serial: unidad.serial,
            estado: unidad.estado || "nuevo",
            productoId: id,
          }));

          await ProductoUnidad.bulkCreate(unidadesData, {
            transaction,
            validate: true,
          });
        }

        // Eliminar unidades por serial
        if (cantidad < 0 && eliminarSeriales.length > 0) {
          // Verificar que la cantidad coincida con los seriales a eliminar
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

          // Verificar que todos los seriales existan
          const unidadesEliminar = await ProductoUnidad.findAll({
            where: {
              serial: eliminarSeriales,
              productoId: id,
            },
            transaction,
          });

          if (unidadesEliminar.length !== eliminarSeriales.length) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message: "Algunos seriales no existen para este producto",
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

        // Actualizar el stock basado en el conteo actual de unidades
        const unidadesRestantes = await ProductoUnidad.count({
          where: { productoId: id },
          transaction,
        });

        producto.stock = unidadesRestantes;
      } else {
        // Para productos sin seriales, simplemente ajustar el número
        const nuevoStock = producto.stock + parseInt(cantidad);

        if (nuevoStock < 0) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "Stock no puede ser negativo",
          });
        }

        producto.stock = nuevoStock;
      }

      await producto.save({ transaction });
      await transaction.commit();

      // Verificar stock después del ajuste
      await verificarStockBajo(producto);

      return res.status(200).json({
        success: true,
        message: "Stock ajustado correctamente",
        data: {
          producto,
          ajuste: cantidad,
          usaSeriales,
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

  // Obtener unidades de un producto por ID
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

  // Optener productos por Stant
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

  // Obtener productos por ID de subcategoría
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

  // Obtener productos con stock bajo
  async getStockBajo(req, res) {
    try {
      const productos = await Producto.findAll({
        where: db.sequelize.literal("stock <= stockMinimo"),
        include: [
          { model: Subcategoria, include: [Categoria] },
          { model: Stant },
          // { model: ProductoUnidad },
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
        return res.status(400).json({
          success: false,
          message: "Se requiere al menos una unidad con serial",
        });
      }

      const producto = await Producto.findByPk(id);

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
      }

      // Preparar datos de unidades
      const unidadesData = unidades.map((unidad) => ({
        ...unidad,
        productoId: producto.id,
      }));

      // Crear las unidades
      const unidadesCreadas = await ProductoUnidad.bulkCreate(unidadesData, {
        transaction,
        validate: true,
      });

      // Actualizar el stock del producto
      producto.stock += unidadesCreadas.length;
      await producto.save({ transaction });

      await transaction.commit();

      // Verificar stock después del ajuste (aunque aquí no debería ser bajo)
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

  // Cambiar estado de una unidad
  async cambiarEstadoUnidad(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!["nuevo", "usado", "baja"].includes(estado)) {
        return res.status(400).json({
          success: false,
          message: "Estado no válido. Debe ser 'nuevo', 'usado' o 'baja'",
        });
      }

      const unidad = await ProductoUnidad.findByPk(id);

      if (!unidad) {
        return res.status(404).json({
          success: false,
          message: "Unidad no encontrada",
        });
      }

      unidad.estado = estado;
      await unidad.save();

      // Si se da de baja una unidad, actualizar el stock del producto
      if (estado === "baja") {
        const producto = await Producto.findByPk(unidad.productoId);
        if (producto && producto.stock > 0) {
          producto.stock -= 1;
          await producto.save();
          await verificarStockBajo(producto);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Estado de unidad actualizado correctamente",
        data: unidad,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Error al cambiar estado de la unidad",
        error: error.message,
      });
    }
  },
};

module.exports = ProductoController;
