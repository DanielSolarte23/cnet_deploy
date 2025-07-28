module.exports = (sequelize, DataTypes) => {
  const ConfirmacionToken = sequelize.define("ConfirmacionToken", {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    entregaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Entregas',
        key: 'id'
      }
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'ConfirmacionTokens',
    timestamps: true,
    updatedAt: false // Solo necesitamos createdAt
  });

  ConfirmacionToken.associate = (models) => {
    ConfirmacionToken.belongsTo(models.Entrega, {
      foreignKey: "entregaId",
      as: "Entrega",
    });
  };

  return ConfirmacionToken;
};