'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EntregaProductos', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      cantidad: { type: Sequelize.INTEGER },
      descripcion: { type: Sequelize.STRING },
      serial: { type: Sequelize.STRING },
      marca: { type: Sequelize.STRING },
      color: { type: Sequelize.STRING },
      devuelto: { type: Sequelize.INTEGER, defaultValue: 0 },
      EntregaId: { type: Sequelize.INTEGER, references: { model: 'Entregas', key: 'id' } },
      ProductoId: { type: Sequelize.INTEGER, references: { model: 'Productos', key: 'id' } },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('EntregaProductos');
  }
};
