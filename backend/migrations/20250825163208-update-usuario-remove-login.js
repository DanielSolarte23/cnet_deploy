'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Usuarios', 'correo');
    await queryInterface.removeColumn('Usuarios', 'password');
    await queryInterface.removeColumn('Usuarios', 'username');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Usuarios', 'correo', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('Usuarios', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('Usuarios', 'username', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  }
};
