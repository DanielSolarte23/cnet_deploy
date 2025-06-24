'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Notificacions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tipo: {
        type: Sequelize.ENUM('stock_bajo', 'devolucion_pendiente', 'producto_nuevo', 'otro'),
        allowNull: false,
      },
      mensaje: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      detalles: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      leida: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      fechaGeneracion: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      fechaLectura: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      nivel: {
        type: Sequelize.ENUM('informativa', 'advertencia', 'urgente'),
        defaultValue: 'informativa',
      },
      productoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Productos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Notificacions');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Notificacions_tipo";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Notificacions_nivel";');
  },
};
