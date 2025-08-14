const { Personal, Entrega, EntregaProducto, Producto, ProductoUnidad, Usuario } = require('../models');
const { Op } = require('sequelize');

const productosAsignadosController = {
  // Búsqueda global de productos asignados por serial o descripción
  async buscarProductosGlobal(req, res) {
    try {
      const { busqueda, tipo = 'ambos', estado = 'todos', page = 1, limit = 10 } = req.query;

      if (!busqueda || busqueda.trim() === '') {
        return res.status(400).json({
          success: false,
          message: "El término de búsqueda es requerido"
        });
      }

      const busquedaTerm = busqueda.trim();

      // Construir condiciones de búsqueda
      let whereConditionsEntregaProducto = {};
      let whereConditionsProducto = {};

      // Filtros de búsqueda por serial o descripción
      switch (tipo) {
        case 'serial':
          whereConditionsEntregaProducto[Op.or] = [
            { serial: { [Op.like]: `%${busquedaTerm}%` } },
            { '$unidadesSeriadas$': { [Op.like]: `%${busquedaTerm}%` } }
          ];
          break;
        case 'descripcion':
          whereConditionsProducto[Op.or] = [
            { descripcion: { [Op.like]: `%${busquedaTerm}%` } },
            { codigo: { [Op.like]: `%${busquedaTerm}%` } },
            { marca: { [Op.like]: `%${busquedaTerm}%` } },
            { modelo: { [Op.like]: `%${busquedaTerm}%` } }
          ];
          break;
        case 'ambos':
        default:
          // Buscar en ambos campos
          const serialConditions = {
            [Op.or]: [
              { serial: { [Op.like]: `%${busquedaTerm}%` } },
              { '$unidadesSeriadas$': { [Op.like]: `%${busquedaTerm}%` } }
            ]
          };
          const descripcionConditions = {
            [Op.or]: [
              { descripcion: { [Op.like]: `%${busquedaTerm}%` } },
              { codigo: { [Op.like]: `%${busquedaTerm}%` } },
              { marca: { [Op.like]: `%${busquedaTerm}%` } },
              { modelo: { [Op.like]: `%${busquedaTerm}%` } }
            ]
          };
          
          // Primero buscar por serial
          whereConditionsEntregaProducto = serialConditions;
          whereConditionsProducto = descripcionConditions;
          break;
      }

      // Filtros por estado del producto en la entrega
      if (estado !== 'todos') {
        whereConditionsEntregaProducto.estado = estado;
      }

      // Paginación
      const offset = (page - 1) * limit;

      // Realizar la búsqueda
      let resultados = [];

      // Búsqueda en EntregaProducto (por serial o campos de entrega)
      if (tipo === 'serial' || tipo === 'ambos') {
        const entregasPorSerial = await EntregaProducto.findAll({
          where: whereConditionsEntregaProducto,
          include: [
            {
              model: Entrega,
              include: [
                {
                  model: Personal,
                  as: "tecnicoData",
                  attributes: ["id", "nombre", "apellido", "cedula", "cargo", "departamento", "telefono", "correo"]
                },
                {
                  model: Usuario,
                  as: "almacenistaData",
                  attributes: ["id", "nombre", "username"]
                }
              ]
            },
            {
              model: Producto,
              attributes: ["id", "codigo", "descripcion", "marca", "modelo", "color", "unidadMedida"]
            }
          ],
          order: [['createdAt', 'DESC']]
        });

        resultados = [...resultados, ...entregasPorSerial];
      }

      // Búsqueda en Producto (por descripción, código, marca, modelo)
      if (tipo === 'descripcion' || tipo === 'ambos') {
        const entregasPorProducto = await EntregaProducto.findAll({
          include: [
            {
              model: Producto,
              where: whereConditionsProducto,
              attributes: ["id", "codigo", "descripcion", "marca", "modelo", "color", "unidadMedida"]
            },
            {
              model: Entrega,
              include: [
                {
                  model: Personal,
                  as: "tecnicoData",
                  attributes: ["id", "nombre", "apellido", "cedula", "cargo", "departamento", "telefono", "correo"]
                },
                {
                  model: Usuario,
                  as: "almacenistaData",
                  attributes: ["id", "nombre", "username"]
                }
              ]
            }
          ],
          where: estado !== 'todos' ? { estado } : {},
          order: [['createdAt', 'DESC']]
        });

        // Evitar duplicados
        const idsExistentes = new Set(resultados.map(r => r.id));
        const nuevosResultados = entregasPorProducto.filter(ep => !idsExistentes.has(ep.id));
        resultados = [...resultados, ...nuevosResultados];
      }

      // Búsqueda adicional en ProductoUnidad por serial
      if (tipo === 'serial' || tipo === 'ambos') {
        const unidadesPorSerial = await ProductoUnidad.findAll({
          where: { 
            serial: { [Op.like]: `%${busquedaTerm}%` }
          },
          include: [
            {
              model: Producto,
              attributes: ["id", "codigo", "descripcion", "marca", "modelo", "color", "unidadMedida"],
              include: [
                {
                  model: EntregaProducto,
                  include: [
                    {
                      model: Entrega,
                      include: [
                        {
                          model: Personal,
                          as: "tecnicoData",
                          attributes: ["id", "nombre", "apellido", "cedula", "cargo", "departamento", "telefono", "correo"]
                        },
                        {
                          model: Usuario,
                          as: "almacenistaData",
                          attributes: ["id", "nombre", "username"]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        });

        // Procesar unidades seriadas y agregarlas a los resultados
        unidadesPorSerial.forEach(unidad => {
          if (unidad.Producto && unidad.Producto.EntregaProductos) {
            unidad.Producto.EntregaProductos.forEach(ep => {
              if (ep.Entrega && ep.Entrega.tecnicoData) {
                // Crear un objeto similar a EntregaProducto para mantener consistencia
                const resultado = {
                  id: `unidad_${unidad.id}_${ep.id}`,
                  cantidad: 1,
                  devuelto: 0,
                  estado: ep.estado,
                  serial: unidad.serial,
                  serialUnidad: unidad.serial,
                  estadoUnidad: unidad.estado,
                  fechaIngresoUnidad: unidad.fechaIngreso,
                  Producto: unidad.Producto,
                  Entrega: ep.Entrega,
                  esUnidadSeriada: true
                };
                
                // Verificar que no sea duplicado
                const isDuplicate = resultados.some(r => 
                  r.Entrega && r.Entrega.id === ep.Entrega.id && 
                  r.Producto && r.Producto.id === unidad.Producto.id
                );
                
                if (!isDuplicate) {
                  resultados.push(resultado);
                }
              }
            });
          }
        });
      }

      // Ordenar resultados por fecha de entrega más reciente
      resultados.sort((a, b) => {
        const fechaA = a.Entrega ? new Date(a.Entrega.fecha) : new Date(0);
        const fechaB = b.Entrega ? new Date(b.Entrega.fecha) : new Date(0);
        return fechaB - fechaA;
      });

      // Aplicar paginación manual
      const totalResultados = resultados.length;
      const resultadosPaginados = resultados.slice(offset, offset + parseInt(limit));

      // Formatear los resultados para una respuesta más limpia
      const productosEncontrados = resultadosPaginados.map(entregaProducto => {
        const entrega = entregaProducto.Entrega;
        const producto = entregaProducto.Producto;
        const personal = entrega ? entrega.tecnicoData : null;
        const almacenista = entrega ? entrega.almacenistaData : null;

        return {
          // Información de la entrega
          entregaId: entrega ? entrega.id : null,
          fechaEntrega: entrega ? entrega.fecha : null,
          proyecto: entrega ? entrega.proyecto : null,
          estadoEntrega: entrega ? entrega.estado : null,
          observaciones: entrega ? entrega.observaciones : null,
          fechaEstimadaDevolucion: entrega ? entrega.fechaEstimadaDevolucion : null,

          // Información del producto en la entrega
           entregaProductoId: entregaProducto.esUnidadSeriada ? null : entregaProducto.id,
          cantidadEntregada: entregaProducto.cantidad || 0,
          cantidadDevuelta: entregaProducto.devuelto || 0,
          cantidadPendiente: (entregaProducto.cantidad || 0) - (entregaProducto.devuelto || 0),
          estadoProductoEntrega: entregaProducto.estado,
          serialEntrega: entregaProducto.serial,
          descripcionEntrega: entregaProducto.descripcion,
          marcaEntrega: entregaProducto.marca,
          colorEntrega: entregaProducto.color,

          // Información del producto
          producto: {
            id: producto ? producto.id : null,
            codigo: producto ? producto.codigo : null,
            descripcion: producto ? producto.descripcion : null,
            marca: producto ? producto.marca : null,
            modelo: producto ? producto.modelo : null,
            color: producto ? producto.color : null,
            unidadMedida: producto ? producto.unidadMedida : null
          },

          // Información del personal asignado
          personalAsignado: personal ? {
            id: personal.id,
            nombre: `${personal.nombre} ${personal.apellido}`,
            cedula: personal.cedula,
            cargo: personal.cargo,
            departamento: personal.departamento,
            telefono: personal.telefono,
            correo: personal.correo
          } : null,

          // Información del almacenista
          almacenista: almacenista ? {
            id: almacenista.id,
            nombre: almacenista.nombre,
            username: almacenista.username
          } : null,

          // Información adicional si es unidad seriada
          esUnidadSeriada: entregaProducto.unidadesSeriadas?  true : false,
          serialUnidad: entregaProducto.unidadesSeriadas? entregaProducto.unidadesSeriadas : null,
          estadoUnidad: entregaProducto.estado || null,
          fechaIngresoUnidad: entregaProducto.fechaIngresoUnidad || null
        };
      });

      return res.status(200).json({
        success: true,
        message: `Se encontraron ${totalResultados} producto(s) con el término: "${busquedaTerm}"`,
        data: {
          productos: productosEncontrados,
          busqueda: {
            termino: busquedaTerm,
            tipo,
            estado
          },
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalResultados / limit),
            totalItems: totalResultados,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < Math.ceil(totalResultados / limit),
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Error en búsqueda global de productos:', error);
      return res.status(500).json({
        success: false,
        message: "Error al buscar productos asignados",
        error: error.message,
      });
    }
  },

  // Búsqueda rápida (para autocompletado)
  async busquedaRapida(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "El término de búsqueda debe tener al menos 2 caracteres"
        });
      }

      const termino = q.trim();

      // Búsqueda rápida limitada para autocompletado
      const [entregasSerial, entregasProducto] = await Promise.all([
        // Buscar por serial
        EntregaProducto.findAll({
          where: {
            [Op.or]: [
              { serial: { [Op.like]: `%${termino}%` } },
              { '$unidadesSeriadas$': { [Op.like]: `%${termino}%` } }
            ]
          },
          include: [
            {
              model: Producto,
              attributes: ["descripcion", "codigo"]
            },
            {
              model: Entrega,
              include: [{
                model: Personal,
                as: "tecnicoData",
                attributes: ["nombre", "apellido"]
              }]
            }
          ],
          limit: 10,
          attributes: ["serial", "estado"]
        }),

        // Buscar por descripción/código de producto
        EntregaProducto.findAll({
          include: [
            {
              model: Producto,
              where: {
                [Op.or]: [
                  { descripcion: { [Op.like]: `%${termino}%` } },
                  { codigo: { [Op.like]: `%${termino}%` } }
                ]
              },
              attributes: ["descripcion", "codigo"]
            },
            {
              model: Entrega,
              include: [{
                model: Personal,
                as: "tecnicoData",
                attributes: ["nombre", "apellido"]
              }]
            }
          ],
          limit: 10,
          attributes: ["serial", "estado"]
        })
      ]);

      const sugerencias = [];
      const agregados = new Set();

      // Procesar resultados de serial
      entregasSerial.forEach(ep => {
        if (ep.serial && !agregados.has(ep.serial)) {
          sugerencias.push({
            tipo: 'serial',
            valor: ep.serial,
            descripcion: ep.Producto ? ep.Producto.descripcion : '',
            personal: ep.Entrega && ep.Entrega.tecnicoData ? 
              `${ep.Entrega.tecnicoData.nombre} ${ep.Entrega.tecnicoData.apellido}` : ''
          });
          agregados.add(ep.serial);
        }
      });

      // Procesar resultados de producto
      entregasProducto.forEach(ep => {
        const clave = ep.Producto ? ep.Producto.descripcion : '';
        if (clave && !agregados.has(clave)) {
          sugerencias.push({
            tipo: 'descripcion',
            valor: clave,
            codigo: ep.Producto ? ep.Producto.codigo : '',
            personal: ep.Entrega && ep.Entrega.tecnicoData ? 
              `${ep.Entrega.tecnicoData.nombre} ${ep.Entrega.tecnicoData.apellido}` : ''
          });
          agregados.add(clave);
        }
      });

      return res.status(200).json({
        success: true,
        data: sugerencias.slice(0, 10) // Limitar a 10 sugerencias
      });

    } catch (error) {
      console.error('Error en búsqueda rápida:', error);
      return res.status(500).json({
        success: false,
        message: "Error en la búsqueda rápida",
        error: error.message,
      });
    }
  }
};

module.exports = productosAsignadosController;