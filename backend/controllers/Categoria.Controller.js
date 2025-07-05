const db = require("../models");
const Categoria = db.Categoria;
const Subcategoria = db.Subcategoria;
const Producto = db.Producto;

// Controller de Categoría
const CategoriaController = {
  // Crear una nueva categoría
    async create(req, res) {
      try {
        const categoria = await Categoria.create(req.body);

        return res.status(201).json({
          success: true,
          message: "Categoría creada correctamente",
          data: categoria,
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Error al crear la categoría",
          error: error.message,
        });
      }
    },

  // Obtener todas las categorías
  async findAll(req, res) {
    try {
      const categorias = await Categoria.findAll({
        include: [
          {
            model: Subcategoria,
            attributes: ["id", "nombre"],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        count: categorias.length,
        data: categorias,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener las categorías",
        error: error.message,
      });
    }
  },

  // Obtener una categoría por ID
  async findOne(req, res) {
    try {
      const { id } = req.params;
      const categoria = await Categoria.findByPk(id, {
        include: [
          {
            model: Subcategoria,
            attributes: ["id", "nombre"],
          },
        ],
      });

      if (!categoria) {
        return res.status(404).json({
          success: false,
          message: "Categoría no encontrada",
        });
      }

      return res.status(200).json({
        success: true,
        data: categoria,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener la categoría",
        error: error.message,
      });
    }
  },

  // Actualizar una categoría
  async update(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Categoria.update(req.body, {
        where: { id },
      });

      if (updated) {
        const categoria = await Categoria.findByPk(id);
        return res.status(200).json({
          success: true,
          message: "Categoría actualizada correctamente",
          data: categoria,
        });
      }

      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Error al actualizar la categoría",
        error: error.message,
      });
    }
  },

  // Eliminar una categoría
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar si hay subcategorías asociadas
      const subcategoriasAsociadas = await Subcategoria.count({
        where: { CategoriaId: id },
      });

      if (subcategoriasAsociadas > 0) {
        return res.status(400).json({
          success: false,
          message:
            "No se puede eliminar la categoría porque tiene subcategorías asociadas",
        });
      }

      const deleted = await Categoria.destroy({
        where: { id },
      });

      if (deleted) {
        return res.status(200).json({
          success: true,
          message: "Categoría eliminada correctamente",
        });
      }

      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al eliminar la categoría",
        error: error.message,
      });
    }
  },
};

// Controller de Subcategoría
const SubcategoriaController = {
  // Crear una nueva subcategoría
  async create(req, res) {
    try {
      const subcategoria = await Subcategoria.create(req.body);

      return res.status(201).json({
        success: true,
        message: "Subcategoría creada correctamente",
        data: subcategoria,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Error al crear la subcategoría",
        error: error.message,
      });
    }
  },

  // Obtener todas las subcategorías
  async findAll(req, res) {
    try {
      const subcategorias = await Subcategoria.findAll({
        include: [
          {
            model: Categoria,
            attributes: ["id", "nombre"],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        count: subcategorias.length,
        data: subcategorias,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener las subcategorías",
        error: error.message,
      });
    }
  },

  // Obtener subcategorías por categoría
  async findByCategoria(req, res) {
    try {
      const { id } = req.params;
      const subcategorias = await Subcategoria.findAll({
        where: { CategoriumId: id },
      });

      return res.status(200).json({
        success: true,
        count: subcategorias.length,
        data: subcategorias,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener las subcategorías",
        error: error.message,
      });
    }
  },

  // Obtener una subcategoría por ID
  async findOne(req, res) {
    try {
      const { id } = req.params;
      const subcategoria = await Subcategoria.findByPk(id, {
        include: [{ model: Categoria }],
      });

      if (!subcategoria) {
        return res.status(404).json({
          success: false,
          message: "Subcategoría no encontrada",
        });
      }

      return res.status(200).json({
        success: true,
        data: subcategoria,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener la subcategoría",
        error: error.message,
      });
    }
  },

  // Actualizar una subcategoría
  async update(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Subcategoria.update(req.body, {
        where: { id },
      });

      if (updated) {
        const subcategoria = await Subcategoria.findByPk(id);
        return res.status(200).json({
          success: true,
          message: "Subcategoría actualizada correctamente",
          data: subcategoria,
        });
      }

      return res.status(404).json({
        success: false,
        message: "Subcategoría no encontrada",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Error al actualizar la subcategoría",
        error: error.message,
      });
    }
  },

  // Eliminar una subcategoría
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar si hay productos asociados
      const productosAsociados = await Producto.count({
        where: { SubcategoriumId: id },
      });

      if (productosAsociados > 0) {
        return res.status(400).json({
          success: false,
          message:
            "No se puede eliminar la subcategoría porque tiene productos asociados",
        });
      }

      const deleted = await Subcategoria.destroy({
        where: { id },
      });

      if (deleted) {
        return res.status(200).json({
          success: true,
          message: "Subcategoría eliminada correctamente",
        });
      }

      return res.status(404).json({
        success: false,
        message: "Subcategoría no encontrada",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al eliminar la subcategoría",
        error: error.message,
      });
    }
  },
};

module.exports = {
  CategoriaController,
  SubcategoriaController,
};