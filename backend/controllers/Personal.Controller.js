const db = require('../models');
const Personal = db.Personal;
const Entrega = db.Entrega;

const PersonalController = {
  // Crear un nuevo personal
  async create(req, res) {
    try {
      const personal = await Personal.create(req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Personal creado correctamente',
        data: personal
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error al crear el personal',
        error: error.message
      });
    }
  },

  // Obtener todos los personales
  async findAll(req, res) {
    try {
      const personales = await Personal.findAll({
        order: [['nombre', 'ASC']]
      });
      
      return res.status(200).json({
        success: true,
        count: personales.length,
        data: personales
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el personal',
        error: error.message
      });
    }
  },

  // Obtener personal activo
  async findActive(req, res) {
    try {
      const personales = await Personal.findAll({
        where: { activo: true },
        order: [['nombre', 'ASC']]
      });
      
      return res.status(200).json({
        success: true,
        count: personales.length,
        data: personales
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el personal activo',
        error: error.message
      });
    }
  },

  // Obtener un personal por ID
  async findOne(req, res) {
    try {
      const { id } = req.params;
      const personal = await Personal.findByPk(id);
      
      if (!personal) {
        return res.status(404).json({
          success: false,
          message: 'Personal no encontrado'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: personal
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el personal',
        error: error.message
      });
    }
  },

  // Actualizar un personal
  async update(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Personal.update(req.body, {
        where: { id }
    });
      
    if (updated) {
      const personal = await Personal.findByPk(id);
      return res.status(200).json({
        success: true,
        message: 'Personal actualizado correctamente',
        data: personal
      });
    }
    
    return res.status(404).json({
      success: false,
      message: 'Personal no encontrado'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Error al actualizar el personal',
      error: error.message
    });
  }
},

// Eliminar un personal (desactivar)
async delete(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar si tiene entregas asociadas
    const entregasAsociadas = await Entrega.count({
      where: { personalId: id }
    });
    
    if (entregasAsociadas > 0) {
      // En lugar de eliminar, desactivamos
      await Personal.update(
        { activo: false },
        { where: { id } }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Personal desactivado correctamente (tiene entregas asociadas)'
      });
    }
    
    // Si no tiene entregas, puede eliminarse completamente
    const deleted = await Personal.destroy({
      where: { id }
    });
    
    if (deleted) {
      return res.status(200).json({
        success: true,
        message: 'Personal eliminado correctamente'
      });
    }
    
    return res.status(404).json({
      success: false,
      message: 'Personal no encontrado'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar/desactivar el personal',
      error: error.message
    });
  }
},

// Obtener entregas por personal
async getEntregas(req, res) {
  try {
    const { id } = req.params;
    const personal = await Personal.findByPk(id);
    
    if (!personal) {
      return res.status(404).json({
        success: false,
        message: 'Personal no encontrado'
      });
    }
    
    const entregas = await Entrega.findAll({
      where: { personalId: id },
      include: [
        { 
          model: db.EntregaProducto,
          include: [{ model: db.Producto }]
        },
        {
          model: db.Usuario,
          as: 'almacenistaData',
          attributes: ['id', 'nombre', 'username']
        }
      ],
      order: [['fecha', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      count: entregas.length,
      data: {
        personal,
        entregas
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las entregas del personal',
      error: error.message
    });
  }
}
};

module.exports = PersonalController;