'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar el campo legalizado
    await queryInterface.addColumn('EntregaProductos', 'legalizado', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Actualizar el ENUM del estado para incluir los nuevos estados
    // Primero eliminamos la restricción ENUM existente
    // await queryInterface.sequelize.query(
    //   `ALTER TABLE "EntregaProductos" DROP CONSTRAINT IF EXISTS "EntregaProductos_estado_check";`
    // );
    
    // Ahora actualizamos el campo con los nuevos valores ENUM
    await queryInterface.changeColumn('EntregaProductos', 'estado', {
      type: Sequelize.ENUM(
        'pendiente',
        'devuelto_parcial', 
        'devuelto_completo',
        'legalizado_parcial',
        'legalizado_completo',
        'cerrado'
      ),
      allowNull: false,
      defaultValue: 'pendiente'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover el campo legalizado
    await queryInterface.removeColumn('EntregaProductos', 'legalizado');

    // Eliminar la restricción ENUM actual
    // await queryInterface.sequelize.query(
    //   `ALTER TABLE "EntregaProductos" DROP CONSTRAINT IF EXISTS "EntregaProductos_estado_check";`
    // );

    // Restaurar el ENUM original del estado
    await queryInterface.changeColumn('EntregaProductos', 'estado', {
      type: Sequelize.ENUM(
        'pendiente',
        'devuelto_parcial',
        'devuelto_completo'
      ),
      allowNull: false,
      defaultValue: 'pendiente'
    });
  }
};