// Migración para agregar la columna
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('EntregaProductos', 'ProductoUnidads', {
      type: Sequelize.JSON,
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('EntregaProductos', 'ProductoUnidads');
  }
};