const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const {
  Entrega,
  EntregaProducto,
  Producto,
  Usuario,
  Personal,
  ProductoUnidad,
} = require("../models");

const ActaController = {
  /**
   * Renderiza y devuelve el PDF del acta de entrega/devolución
   */
  async generarActa(req, res) {
    try {
      const { id } = req.params;

      // Obtener la entrega completa con todos sus detalles
      const entrega = await Entrega.findByPk(id, {
        include: [
          {
            model: EntregaProducto,
            include: [{ model: Producto }],
          },
          {
            model: Usuario,
            as: "almacenistaData",
            attributes: ["id", "nombre", "username"],
          },
          {
            model: Personal,
            as: "tecnicoData",
            attributes: ["id", "nombre", "cedula", "cargo"],
          },
        ],
      });

      if (!entrega) {
        return res.status(404).json({
          success: false,
          message: "Entrega no encontrada",
        });
      }

      // Formatear datos para la plantilla
      const datosActa = {
        fecha: new Date(entrega.fecha).toLocaleDateString("es-ES"),
        destinoElemento: entrega.proyecto || "Actividades operativas",
        productos: await ActaController.formatearProductosParaActa(
          entrega.EntregaProductos
        ),
        tecnico: {
          nombre: entrega.tecnicoData ? entrega.tecnicoData.nombre : "",
          cargo: entrega.tecnicoData ? entrega.tecnicoData.cargo : "",
          cedula: entrega.tecnicoData ? entrega.tecnicoData.cedula : "",
        },
        almacenista: {
          nombre: entrega.almacenistaData
            ? entrega.almacenistaData.nombre
            : "Leidy Viviana Bolaños",
          cargo: "Almacén",
          cedula: "1061720521",
        },
        estado: entrega.estado,
      };

      // Generar el HTML
      let htmlContent = await ActaController.generarHTMLActa(datosActa);

      // Si la entrega está parcialmente o completamente devuelta, añadir acta de devolución
      if (
        entrega.estado === "parcialmente_devuelta" ||
        entrega.estado === "completamente_devuelta"
      ) {
        const htmlDevolucion =
          await ActaController.generarHTMLDevolucionCompleta(datosActa);
        htmlContent += '<div class="page-break"></div>' + htmlDevolucion;
      } else {
        const htmlDevolucion = await ActaController.generarHTMLDevolucion(
          datosActa
        );
        htmlContent += '<div class="page-break"></div>' + htmlDevolucion;
      }

      // Convertir HTML a PDF
      const pdfBuffer = await ActaController.generarPDF(htmlContent);

      // Configurar cabeceras para descargar el PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=acta-entrega-${id}.pdf`
      );

      // Enviar el PDF
      return res.send(pdfBuffer);
    } catch (error) {
      console.error("Error al generar el acta:", error);
      return res.status(500).json({
        success: false,
        message: "Error al generar el acta",
        error: error.message,
      });
    }
  },

  /**
   * Vista previa del acta (HTML)
   */
  async vistaPrevia(req, res) {
    try {
      const { id } = req.params;

      // Obtener la entrega completa con todos sus detalles
      const entrega = await Entrega.findByPk(id, {
        include: [
          {
            model: EntregaProducto,
            include: [{ model: Producto }],
          },
          {
            model: Usuario,
            as: "almacenistaData",
            attributes: ["id", "nombre", "username"],
          },
          {
            model: Personal,
            as: "tecnicoData",
            attributes: ["id", "nombre", "cedula", "cargo", "firma_path"],
          },
        ],
      });

      if (!entrega) {
        return res.status(404).json({
          success: false,
          message: "Entrega no encontrada",
        });
      }

      // Formatear datos para la plantilla
      // En tu ActaController, modifica la parte donde formateas los datos:

      const datosActa = {
        fecha: new Date(entrega.fecha).toLocaleDateString("es-ES"),
        destinoElemento: entrega.proyecto || "Actividades operativas",
        productos: await ActaController.formatearProductosParaActa(
          entrega.EntregaProductos
        ),
        tecnico: {
          nombre: entrega.tecnicoData ? entrega.tecnicoData.nombre : "",
          cargo: entrega.tecnicoData ? entrega.tecnicoData.cargo : "",
          cedula: entrega.tecnicoData ? entrega.tecnicoData.cedula : "",
          firma_path:
            entrega.wasConfirmed && entrega.tecnicoData?.firma_path
              ? `/${entrega.tecnicoData.firma_path}`
              : "",
        },

        almacenista: {
          nombre: entrega.almacenistaData
            ? entrega.almacenistaData.nombre
            : "Leidy Viviana Bolaños",
          cargo: "Almacén",
          cedula: "1061720521",
        },
        estado: entrega.estado,
      };

      // Generar el HTML
      let htmlContent = await ActaController.generarHTMLActa(datosActa);

      // Si la entrega está parcialmente o completamente devuelta, añadir acta de devolución
      if (
        entrega.estado === "parcialmente_devuelta" ||
        entrega.estado === "completamente_devuelta"
      ) {
        const htmlDevolucion =
          await ActaController.generarHTMLDevolucionCompleta(datosActa);
        htmlContent += '<div class="page-break"></div>' + htmlDevolucion;
      } else {
        const htmlDevolucion = await ActaController.generarHTMLDevolucion(
          datosActa
        );
        htmlContent += '<div class="page-break"></div>' + htmlDevolucion;
      }

      // Enviar directamente el HTML para vista previa
      return res.send(htmlContent);
    } catch (error) {
      console.error("Error al generar la vista previa del acta:", error);
      return res.status(500).json({
        success: false,
        message: "Error al generar la vista previa del acta",
        error: error.message,
      });
    }
  },

  /**
   * Formatea los productos para mostrar en el acta
   * Maneja productos con y sin seriales específicos
   */
  async formatearProductosParaActa(entregaProductos) {
    const productosFormateados = [];
    let numeroItem = 1;

    for (const ep of entregaProductos) {
      // Si el producto tiene unidades seriadas específicas
      if (
        ep.unidadesSeriadas &&
        Array.isArray(ep.unidadesSeriadas) &&
        ep.unidadesSeriadas.length > 0
      ) {
        // Obtener los detalles de cada unidad seriada
        const unidadesDetalles = await ProductoUnidad.findAll({
          where: {
            id: ep.unidadesSeriadas,
          },
        });

        // Crear una entrada por cada unidad seriada
        for (const unidad of unidadesDetalles) {
          productosFormateados.push({
            numero: numeroItem++,
            cantidad: 1, // Cada unidad seriada es única
            tipoCantidad: "Unidad",
            elemento: ep.descripcion,
            marca: ep.marca || "",
            serial: unidad.serial,
            cantidadDevuelta: ActaController.calcularDevueltaPorUnidad(
              ep,
              unidad.id
            ),
            color: ep.color || "",
            estado: unidad.estado || "nuevo",
          });
        }
      } else {
        // Para productos sin seriales específicos (comportamiento original)
        productosFormateados.push({
          numero: numeroItem++,
          cantidad: ep.cantidad,
          tipoCantidad: "Unidad",
          elemento: ep.descripcion,
          marca: ep.marca || "",
          serial: "N/A",
          cantidadDevuelta: ep.devuelto || 0,
          color: ep.color || "",
          estado: "N/A",
        });
      }
    }

    return productosFormateados;
  },

  /**
   * Calcula la cantidad devuelta para una unidad específica
   * (Esto podría necesitar ajustes según tu lógica de devoluciones)
   */
  calcularDevueltaPorUnidad(entregaProducto, unidadId) {
    if (!entregaProducto.devuelto || entregaProducto.devuelto === 0) {
      return 0;
    }

    if (entregaProducto.devuelto >= entregaProducto.cantidad) {
      return 1;
    }
    return 0;
  },

  /**
   * Genera el HTML del acta de entrega
   */
  async generarHTMLActa(datos) {
    // Leer la plantilla desde un archivo
    const templatePath = path.join(
      __dirname,
      "../views/templates/acta-entrega.hbs"
    );
    const source = fs.readFileSync(templatePath, "utf8");

    // Compilar la plantilla
    const template = handlebars.compile(source);

    // Generar el HTML con los datos
    return template(datos);
  },

  /**
   * Genera el HTML del acta de devolución
   */
  async generarHTMLDevolucion(datos) {
    // Leer la plantilla desde un archivo
    const templatePath = path.join(
      __dirname,
      "../views/templates/acta-devolucion-en-0.hbs"
    );
    const source = fs.readFileSync(templatePath, "utf8");

    // Compilar la plantilla
    const template = handlebars.compile(source);

    // Añadir la fecha actual para la devolución
    datos.fechaDevolucion = new Date().toLocaleDateString("es-ES");

    // Filtrar solo los productos que tienen devoluciones
    datos.productosDevueltos = datos.productos.filter(
      (p) => p.cantidadDevuelta > 0
    );

    // Generar el HTML con los datos
    return template(datos);
  },
  async generarHTMLDevolucionCompleta(datos) {
    // Leer la plantilla desde un archivo
    const templatePath = path.join(
      __dirname,
      "../views/templates/acta-devolucion.hbs"
    );
    const source = fs.readFileSync(templatePath, "utf8");

    // Compilar la plantilla
    const template = handlebars.compile(source);

    // Añadir la fecha actual para la devolución
    datos.fechaDevolucion = new Date().toLocaleDateString("es-ES");

    // Filtrar solo los productos que tienen devoluciones
    datos.productosDevueltos = datos.productos.filter(
      (p) => p.cantidadDevuelta > 0
    );

    // Generar el HTML con los datos
    return template(datos);
  },

  /**
   * Convierte el HTML a PDF usando Puppeteer
   */
  async generarPDF(html) {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Establecer el contenido HTML
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // Configurar estilo para página completa
    await page.addStyleTag({
      content: `
        @page {
          size: A4;
          margin: 0;
        }
        body {
          margin: 0;
        }
        .page-break {
          page-break-after: always;
          height: 0;
          display: block;
        }
      `,
    });

    // Generar PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
    });

    await browser.close();

    return pdf;
  },
};

module.exports = ActaController;
