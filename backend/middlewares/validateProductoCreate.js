const validateProductoCreate = (req, res, next) => {
    const {
      codigo,
      descripcion,
      SubcategoriumId,
      categoria,
      subcategoria,
      unidades,
    } = req.body;
  
    // Validar que el producto tenga descripción (requerido según tu modelo)
    if (!descripcion) {
      return res.status(400).json({
        success: false,
        message: "La descripción del producto es obligatoria",
      });
    }
  
    // Validar que se haya especificado una subcategoría (existente o nueva)
    if (!SubcategoriumId && !subcategoria) {
      return res.status(400).json({
        success: false,
        message:
          "Debe especificar una subcategoría existente (SubcategoriumId) o datos para crear una nueva (subcategoria)",
      });
    }
  
    // Si se está creando una nueva categoría y subcategoría
    if (!SubcategoriumId && subcategoria) {
      // Validar que la subcategoría tenga nombre
      if (!subcategoria.nombre) {
        return res.status(400).json({
          success: false,
          message: "El nombre de la subcategoría es obligatorio",
        });
      }
      
      // Si se necesita crear una categoría para la subcategoría
      if (subcategoria.crearCategoria && !subcategoria.CategoriumId) {
        if (!categoria || !categoria.nombre) {
          return res.status(400).json({
            success: false,
            message: "El nombre de la categoría es obligatorio para crear una nueva categoría",
          });
        }
      }
      
      // Si no se especifica crear categoría, debe tener un CategoriumId
      if (!subcategoria.crearCategoria && !subcategoria.CategoriumId) {
        return res.status(400).json({
          success: false,
          message: "Debe especificar a qué categoría pertenece la subcategoría (CategoriumId)",
        });
      }
    }
  
    // Si se proporcionan unidades, validar que tengan seriales
    if (unidades && Array.isArray(unidades)) {
      for (let i = 0; i < unidades.length; i++) {
        if (!unidades[i].serial) {
          return res.status(400).json({
            success: false,
            message: `La unidad #${i + 1} no tiene serial, el cual es obligatorio`,
          });
        }
      }
    }
  
    // Validar que el código sea único (esto se puede manejar en el controlador o en el modelo)
    if (codigo) {
      // Aquí podrías hacer una verificación adicional en la base de datos
      // para asegurarte de que el código sea único antes de proceder
    }
  
    next();
  };

  module.exports = validateProductoCreate;