"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Personals", "fecha_nacimiento", {
      type: Sequelize.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: "La fecha de nacimiento debe ser una fecha válida",
        },
        notEmpty: {
          msg: "La fecha de nacimiento no puede estar vacía",
        },
      },
    });
    await queryInterface.addColumn("Personals", "password", {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La contraseña no puede estar vacía",
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Personals", "fecha_nacimiento");
    await queryInterface.removeColumn("Personals", "password");
  },
};
