"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Notificacions", "personalId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Personals", // nombre de la tabla (plural según tu config)
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Notificacions", "personalId");
  },
};
