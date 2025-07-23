'use strict';

// Migración para agregar la columna
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ReintegroProductos', 'ProductoUnidads', {
      type: Sequelize.JSON,
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ReintegroProductos', 'ProductoUnidads');
  }
};