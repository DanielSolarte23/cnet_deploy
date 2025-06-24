'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Personals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      apellido: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cedula: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      expedicion: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fecha_nacimiento: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      cargo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      departamento: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      correo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable('Personals');
  },
};
