'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Producto', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      descripcion: { type: Sequelize.STRING },
      serial: { type: Sequelize.STRING },
      marca: { type: Sequelize.STRING },
      color: { type: Sequelize.STRING },
      stock: { type: Sequelize.INTEGER },
      StantId: { type: Sequelize.INTEGER, references: { model: 'Stants', key: 'id' } },
      SubcategoriaId: { type: Sequelize.INTEGER, references: { model: 'Subcategorias', key: 'id' } },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Producto');
  }
};
