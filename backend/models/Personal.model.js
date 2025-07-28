module.exports = (sequelize, DataTypes) => {
  const Personal = sequelize.define("Personal", {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre no puede estar vacío",
        },
      },
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El apellido no puede estar vacío",
        },
      },
    },
    cedula: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La cédula no puede estar vacía",
        },
      },
    },
    expedicion: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La expedición no puede estar vacía",
        },
      },
    },
    fecha_nacimiento: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: "La fecha de nacimiento debe ser una fecha válida",
        },
        notEmpty: {
          msg: "La fecha de nacimiento no puede estar vacía",
        },
      },
    },
    cargo: DataTypes.STRING,
    departamento: DataTypes.STRING,
    telefono: DataTypes.STRING,
    correo: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La contraseña no puede estar vacía",
        },
      },
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    firma_path:DataTypes.STRING
  });

  Personal.associate = (models) => {
    // Un personal puede tener muchas entregas
    Personal.hasMany(models.Entrega, {
      foreignKey: "personalId",
      as: "entregas",
    });

    // Un personal puede hacer varios reintegros
    Personal.hasMany(models.Reintegro, {
      foreignKey: "personalId",
      as: "reintegros",
    });
  };

  return Personal;
};
