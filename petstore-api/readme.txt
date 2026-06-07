Proyecto PetStore API (Cypress)

1. Objetivo
   - Probar la API de mascotas en https://petstore.swagger.io.
   - Crear, consultar y actualizar una mascota usando solicitudes REST.

2. Tecnologías usadas
   - Cypress 12.x
   - JavaScript
   - Node.js

3. Estructura del proyecto
   - package.json
   - cypress.config.js
   - cypress/support/e2e.js
   - cypress/pages/petService.js
   - cypress/e2e/petstore-api.spec.js

4. Arquitectura POM
   - El caso API utiliza un objeto de servicio para representar las acciones sobre mascotas.
   - Cada método encapsula un endpoint y facilita la lectura del spec.
   - Esto mejora la organización y permite reutilizar las llamadas REST.

5. Instalación
   1. Abrir terminal en la carpeta `petstore-api`.
   2. Ejecutar:
      npm install

6. Ejecución
   - Ejecutar el caso API y generar reporte HTML visible:
      npm test
   - Regenerar solo el reporte desde el XML existente:
      npm run report
   - Abrir Cypress en modo interactivo:
      npm run open
   - El comando `npm test` borra los reportes antiguos en `cypress/reports` antes de ejecutar las pruebas.

7. Repositorio público
   - https://github.com/JPG-QA/automation-e2e-api-cypress-jpg
   - `npm test` también genera los archivos JUnit XML en `cypress/reports/junit` y
     guarda la grabación de la ejecución en `cypress/videos` (video por spec).

7. Notas
   - El caso cubre POST, GET y PUT sobre el recurso de mascotas.
   - Cada requisito de la prueba API se implementa como un caso de prueba independiente.
   - Se valida que la mascota actualizada aparezca en el listado por estado `sold`.
   - El reporte HTML se guarda en `cypress/reports/report.html`.
         - El reporte HTML se genera a partir del último archivo JUnit XML creado por Cypress.
         - Si se repite la ejecución, los artefactos antiguos se limpian y se mantiene solo el reporte actual.
      - Los vídeos de ejecución se guardan en `cypress/videos`.
      - Recomendación: en CI, persistir `cypress/reports` y `cypress/videos` como artefactos para auditoría y trazabilidad.
   - Si no hay instalación local de Cypress, instalar dependencias en `petstore-api` primero.
