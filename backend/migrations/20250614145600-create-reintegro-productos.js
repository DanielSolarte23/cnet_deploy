'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ReintegroProductos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
      ReintegroId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Reintegros',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      ProductoId: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('ReintegroProductos');
  },
};
