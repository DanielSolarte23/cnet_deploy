const db = require('../models');
const Stant = db.Stant;
const Producto = db.Producto;
const { fn, col } = require("sequelize");

const StantController = {
  // Crear un nuevo estante
  async create(req, res) {
    try {
      const stant = await Stant.create(req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Estante creado correctamente',
        data: stant
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error al crear el estante',
        error: error.message
      });
    }
  },

async findAll(req, res) {
  try {
    const stants = await Stant.findAll({
      attributes: [
        'id', 'nombre', // o los atributos del estante que realmente necesites
        [fn('COUNT', col('Productos.id')), 'cantidadProductos']
      ],
      include: [
        {
          model: Producto,
          attributes: [],
        }
      ],
      group: ['Stant.id']
    });

    return res.status(200).json({
      success: true,
      count: stants.length,
      data: stants
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los estantes',
      error: error.message
    });
  }
},


  // Obtener un estante por ID
  async findOne(req, res) {
    try {
      const { id } = req.params;
      const stant = await Stant.findByPk(id, {
        include: [
          {
            model: Producto,
            attributes: ['id', 'descripcion', 'stock', 'marca', 'serial']
          }
        ]
      });
      
      if (!stant) {
        return res.status(404).json({
          success: false,
          message: 'Estante no encontrado'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: stant
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el estante',
        error: error.message
      });
    }
  },

  // Actualizar un estante
  async update(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Stant.update(req.body, {
        where: { id }
      });
      
      if (updated) {
        const stant = await Stant.findByPk(id);
        return res.status(200).json({
          success: true,
          message: 'Estante actualizado correctamente',
          data: stant
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'Estante no encontrado'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error al actualizar el estante',
        error: error.message
      });
    }
  },

  // Eliminar un estante
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar si hay productos asociados
      const productosAsociados = await Producto.count({
        where: { StantId: id }
      });
      
      if (productosAsociados > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar el estante porque tiene productos asociados'
        });
      }
      
      const deleted = await Stant.destroy({
        where: { id }
      });
      
      if (deleted) {
        return res.status(200).json({
          success: true,
          message: 'Estante eliminado correctamente'
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'Estante no encontrado' 
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar el estante',
        error: error.message
      });
    }
  }
};

module.exports = StantController;