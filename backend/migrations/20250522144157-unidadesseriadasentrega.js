// En una nueva migración
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('EntregaProducto', 'unidadesSeriadas', {
      type: Sequelize.JSON, // o Sequelize.ARRAY(Sequelize.INTEGER) para PostgreSQL
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('EntregaProducto', 'unidadesSeriadas');
  }
};