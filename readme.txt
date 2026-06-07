Resumen del proyecto

Este repositorio contiene dos proyectos independientes, cada uno con su propia configuración de Cypress y sus archivos de documentación.

1. Sauce Demo E2E
   - Carpeta: `sauce-demo-e2e`
   - Prueba funcional de compra en https://www.saucedemo.com
   - Usa Page Object Model para organizar las acciones de página.
   - Ejecutar desde esa carpeta con:
       npm install
       npm test

2. PetStore API
   - Carpeta: `petstore-api`
   - Prueba REST para crear, consultar y actualizar una mascota en https://petstore.swagger.io
   - Usa un objeto de servicio POM para encapsular los endpoints de mascota.
   - Ejecutar desde esa carpeta con:
       npm install
       npm test

Cada subproyecto tiene:
   - `package.json`
   - `cypress.config.js`
   - `cypress/support/e2e.js`
   - `cypress/e2e/*.spec.js`
   - `readme.txt`
   - `conclusiones.txt`
   - `.gitignore`
