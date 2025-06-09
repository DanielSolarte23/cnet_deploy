//modelo usuario
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define(
    "Usuario",
    {
      nombre: DataTypes.STRING,
      cedula: DataTypes.STRING,
      telefono: DataTypes.STRING,
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
        validate: {
          notEmpty: {
            msg: "El nombre de usuario no puede estar vacío",
          },
        },
      },
      correo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "el correo no puede estar vacio",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "La contraseña no puede estar vacía",
          },
        },
      },
      rol: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [["administrador", "almacenista", "talento humano"]],
        },
      },
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  Usuario.prototype.validatePassword = async function (password) {
    if (!this.password) {
      return false;
    }
    return await bcrypt.compare(password, this.password);
  };
  return Usuario;
};

//modelo Personal 

module.exports = (sequelize, DataTypes) => {
  const Personal = sequelize.define("Personal", {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre no puede estar vacío"
        }
      }
    },
    cedula: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La cédula no puede estar vacía"
        }
      }
    },
    cargo: DataTypes.STRING,
    departamento: DataTypes.STRING,
    telefono: DataTypes.STRING,
    correo: DataTypes.STRING,
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  Personal.associate = (models) => {
    // Un personal puede tener muchas entregas
    Personal.hasMany(models.Entrega, {
      foreignKey: 'personalId',
      as: 'entregas'
    });
    
    // Un personal puede hacer varios reintegros
    Personal.hasMany(models.Reintegro, {
      foreignKey: 'personalId',
      as: 'reintegros'
    });
  };

  return Personal;
};

//modelo stant
module.exports = (sequelize, DataTypes) => {
  const Stant = sequelize.define("Stant", {
    nombre: DataTypes.STRING,
  });

  Stant.associate = (models) => {
    Stant.hasMany(models.Producto);
  };

  return Stant;
};

//modelo Producto
module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define("Producto", {
    codigo: {
      type: DataTypes.STRING,
      unique: true
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    serial: DataTypes.STRING,
    marca: DataTypes.STRING,
    modelo: DataTypes.STRING,
    color: DataTypes.STRING,
    unidadMedida: {
      type: DataTypes.STRING,
      defaultValue: 'unidad'
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    stockMinimo: {
      type: DataTypes.INTEGER,
      defaultValue: 5
    },
    fechaIngreso: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    estado: {
      type: DataTypes.ENUM('disponible', 'agotado', 'baja'),
      defaultValue: 'disponible'
    },
    notas: DataTypes.TEXT
  });

  Producto.associate = (models) => {
    Producto.belongsTo(models.Stant);
    Producto.belongsTo(models.Subcategoria);
    Producto.hasMany(models.EntregaProducto);
    Producto.hasMany(models.ReintegroProducto);
  };

  return Producto;
};
//modelo Categoria

module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define("Categoria", {
    nombre: DataTypes.STRING,
  });

  Categoria.associate = (models) => {
    Categoria.hasMany(models.Subcategoria);
  };

  return Categoria;
};

//modelo Subcategoria

module.exports = (sequelize, DataTypes) => {
  const Subcategoria = sequelize.define("Subcategoria", {
    nombre: DataTypes.STRING,
  });

  Subcategoria.associate = (models) => {
    Subcategoria.belongsTo(models.Categoria);
    Subcategoria.hasMany(models.Producto);
  };

  return Subcategoria;
};

//modelo Entrega
module.exports = (sequelize, DataTypes) => {
  const Entrega = sequelize.define("Entrega", {
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    proyecto: {
      type: DataTypes.STRING,
      allowNull: false
    },
    observaciones: DataTypes.TEXT,
    estado: {
      type: DataTypes.ENUM('pendiente', 'entregada', 'parcialmente_devuelta', 'completamente_devuelta'),
      defaultValue: 'pendiente'
    },
    fechaEstimadaDevolucion: DataTypes.DATE
  });

  Entrega.associate = (models) => {
    Entrega.hasMany(models.EntregaProducto);
    
    // Relación con el almacenista (Usuario)
    Entrega.belongsTo(models.Usuario, {
      foreignKey: "almacenista",
      as: "almacenistaData",
    });
    
    // Relación con la persona que recibe (Personal)
    Entrega.belongsTo(models.Personal, {
      foreignKey: "personalId",
      as: "tecnicoData",
      allowNull: true // Puede ser nulo como solicitaste
    });
  };

  return Entrega;
};
//modelo EntregaProducto
module.exports = (sequelize, DataTypes) => {
  const EntregaProducto = sequelize.define("EntregaProducto", {
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    descripcion: DataTypes.STRING,
    serial: DataTypes.STRING,
    marca: DataTypes.STRING,
    color: DataTypes.STRING,
    devuelto: { 
      type: DataTypes.INTEGER, 
      defaultValue: 0,
      validate: {
        isValidDevuelto(value) {
          if (value < 0) {
            throw new Error('El valor devuelto no puede ser negativo');
          }
        }
      }
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'devuelto_parcial', 'devuelto_completo'),
      defaultValue: 'pendiente'
    }
  });

  EntregaProducto.associate = (models) => {
    EntregaProducto.belongsTo(models.Entrega);
    EntregaProducto.belongsTo(models.Producto);
  };

  return EntregaProducto;
};
//modelo Reintegro

module.exports = (sequelize, DataTypes) => {
  const Reintegro = sequelize.define("Reintegro", {
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    observaciones: DataTypes.TEXT,
    estado: {
      type: DataTypes.ENUM('pendiente', 'verificado', 'completado'),
      defaultValue: 'pendiente'
    }
  });

  Reintegro.associate = (models) => {
    Reintegro.hasMany(models.ReintegroProducto);
    
    // Relación con el almacenista que recibe
    Reintegro.belongsTo(models.Usuario, {
      foreignKey: "almacenistaId",
      as: "almacenistaData"
    });
    
    // Relación con la entrega original
    Reintegro.belongsTo(models.Entrega, {
      foreignKey: "entregaId",
      as: "entregaOriginal"
    });
    
    // Relación con el personal que devuelve
    Reintegro.belongsTo(models.Personal, {
      foreignKey: "personalId",
      as: "tecnicoData",
      allowNull: true
    });
  };

  return Reintegro;
};

//modelo ReintegroProducto

module.exports = (sequelize, DataTypes) => {
  const ReintegroProducto = sequelize.define("ReintegroProducto", {
    cantidad: DataTypes.INTEGER,
    descripcion: DataTypes.STRING,
    serial: DataTypes.STRING,
    marca: DataTypes.STRING,
    color: DataTypes.STRING,
  });

  ReintegroProducto.associate = (models) => {
    ReintegroProducto.belongsTo(models.Reintegro);
    ReintegroProducto.belongsTo(models.Producto);
  };

  return ReintegroProducto;
};
