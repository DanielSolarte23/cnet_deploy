'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ConfirmacionTokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      entregaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Entregas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Añadir índice para mejorar las consultas
    await queryInterface.addIndex('ConfirmacionTokens', ['token']);
    await queryInterface.addIndex('ConfirmacionTokens', ['entregaId']);
    await queryInterface.addIndex('ConfirmacionTokens', ['expiresAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ConfirmacionTokens');
  }
};