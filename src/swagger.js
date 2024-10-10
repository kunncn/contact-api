// src/swagger.js
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0", // OpenAPI version
    info: {
      title: "Contact API", // Title of the API
      version: "1.0.0", // Version of the API
      description: "API for managing contacts", // Description of the API
    },
    servers: [
      {
        url: "http://localhost:5000", // Your server URL
      },
    ],
  },
  apis: ["./src/routes.js"], // Path to your API docs (define where to look for annotations)
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
