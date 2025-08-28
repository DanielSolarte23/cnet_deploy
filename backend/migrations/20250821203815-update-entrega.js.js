'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar el campo fechaCierre
    await queryInterface.addColumn('Entregas', 'fechaCierre', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Actualizar el ENUM del estado para incluir los nuevos estados
    await queryInterface.changeColumn('Entregas', 'estado', {
      type: Sequelize.ENUM(
        'pendiente',
        'entregada',
        'parcialmente_devuelta',
        'completamente_devuelta',
        'parcialmente_legalizada',
        'completamente_legalizada',
        'cerrada'
      ),
      allowNull: false,
      defaultValue: 'pendiente'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover el campo fechaCierre
    await queryInterface.removeColumn('Entregas', 'fechaCierre');

    // Restaurar el ENUM original del estado
    await queryInterface.changeColumn('Entregas', 'estado', {
      type: Sequelize.ENUM(
        'pendiente',
        'entregada',
        'parcialmente_devuelta',
        'completamente_devuelta'
      ),
      allowNull: false,
      defaultValue: 'pendiente'
    });
  }
};