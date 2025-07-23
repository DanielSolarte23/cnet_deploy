'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ProductoUnidades', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      serial: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      estado: {
        type: Sequelize.ENUM('nuevo', 'usado', 'baja', 'instalacion','instalado','reintegrado'),
        defaultValue: 'nuevo'
      },
      fechaIngreso: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      productoId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Productos', // debe coincidir con el nombre de la tabla del modelo Producto
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ProductoUnidades');
  }
};
