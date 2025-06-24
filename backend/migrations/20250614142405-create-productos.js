'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Productos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      codigo: {
        type: Sequelize.STRING,
        unique: true,
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      marca: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      modelo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      unidadMedida: {
        type: Sequelize.STRING,
        defaultValue: 'unidad',
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      stockMinimo: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
      },
      fechaIngreso: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      estado: {
        type: Sequelize.ENUM('disponible', 'agotado', 'baja'),
        defaultValue: 'disponible',
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      StantId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Stants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      SubcategoriaId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Subcategorias',
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
    await queryInterface.dropTable('Productos');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Productos_estado";');
  },
};
