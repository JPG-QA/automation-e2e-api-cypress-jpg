Proyecto Sauce Demo E2E (Cypress)

1. Objetivo
   - Automatizar un flujo funcional de compra en https://www.saucedemo.com.
   - Validar el login, selección de productos, carrito, checkout y confirmación final.
   - Demostrar un diseño de pruebas mantenible y reutilizable usando mejores prácticas de automatización.

2. Tecnologías usadas
   - Cypress 12.x
   - JavaScript (CommonJS)
   - Node.js

3. Cómo está organizado el proyecto
   - `package.json`: dependencias y scripts de ejecución.
   - `cypress.config.js`: configuración global de Cypress.
   - `cypress/support/e2e.js`: configuraciones, hooks y comandos globales.
   - `cypress/pages/`: Page Objects para cada pantalla del flujo.
      - `loginPage.js`
      - `inventoryPage.js`
      - `cartPage.js`
      - `checkoutPage.js`
      - `checkoutOverviewPage.js`
   - `cypress/selectors/`: selectores reutilizables para separar los locators de la lógica.
      - `loginSelectors.js`
   - `cypress/fixtures/`: datos de prueba externalizados y fáciles de mantener.
      - `credentials.json`
      - `purchaseData.json`
   - `cypress/e2e/sauceDemo.spec.js`: caso E2E principal que ejecuta todo el flujo de compra.

4. Instalación
   1. Abrir terminal en la carpeta `sauce-demo-e2e`.
   2. Ejecutar:
      npm install

5. Ejecución
   - Ejecutar el flujo completo en modo headless (Electron):
      npm test
  - Al ejecutar `npm test` ahora se limpian los reportes antiguos en `cypress/reports`,
    se ejecutan las pruebas y se genera automáticamente un reporte visible en
    `cypress/reports/report.html`.
   - `npm test` también genera los archivos JUnit XML en `cypress/reports/junit`
      y guarda la grabación de la ejecución en `cypress/videos` (video por spec).
   - El suite incluye un test negativo que valida que el usuario bloqueado
      (`LOCKED_USER` en `cypress/fixtures/credentials.json`) muestra el mensaje
      de error esperado al intentar iniciar sesión.
  - Regenerar solo el reporte HTML a partir del último XML generado:
     npm run report
   - Ejecutar el flujo completo en Chrome headed:
      npx cypress run --spec "cypress/e2e/sauceDemo.spec.js" --browser chrome --headed
   - Abrir el runner interactivo de Cypress:
      npm run open

6. Entrega
   - Subir el proyecto a un repositorio público de GitHub.
   - Repositorio público: https://github.com/JPG-QA/automation-e2e-api-cypress-jpg
   - Incluir la URL del repositorio en los comentarios de la entrega.
   - Empaquetar el proyecto en `.zip` o `.rar` con todos los archivos, scripts, reportes y evidencia de ejecución.

7. Buenas prácticas aplicadas
   - Diseño basado en Page Object Model para mantener el código modular y reutilizable.
   - Separación de datos de prueba en fixtures para evitar hardcode en los tests.
   - Selectores centralizados para facilitar el mantenimiento ante cambios de UI.
   - Uso de `failOnStatusCode: false` y timeouts configurables para mejorar la robustez de la ejecución.
   - En un entorno empresarial, la información sensible se manejaría en `.env` y no se almacenaría en el control de versiones.
   - El flujo valida explícitamente cada paso clave y comprueba el mensaje final: "Thank you for your order!".
   - Nota: el enunciado menciona el texto "THANK YOU FOR YOUR ORDER", pero la UI
     actual muestra "Thank you for your order!".
   - Se recomienda integrar esta prueba en CI con reportes y screenshots automáticos.
   - Se incluyó un test negativo para usuario bloqueado; documentar añadidos en el
      readme y conservar los artefactos (`cypress/reports`, `cypress/videos`) en CI.
