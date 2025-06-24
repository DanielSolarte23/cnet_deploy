'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('EntregaProductos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      serial: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      marca: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      devuelto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      estado: {
        type: Sequelize.ENUM(
          'pendiente',
          'devuelto_parcial',
          'devuelto_completo'
        ),
        defaultValue: 'pendiente',
      },
      unidadesSeriadas: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      EntregaId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Entregas',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      ProductoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Productos',
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
    await queryInterface.dropTable('EntregaProductos');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_EntregaProductos_estado";');
  },
};
