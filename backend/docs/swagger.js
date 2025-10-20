// docs/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sistema colombianet',
      version: '1.0.0',
      description: 'Documentación automática generada con Swagger para API MVC en Express',
    },
    servers: [
      {
        url: 'http://localhost:3004/api',
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./routes/*.js'], // aquí se leerán las anotaciones JSDoc
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = swaggerDocs;
