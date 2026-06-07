const fs = require('fs');
const path = require('path');

const reportsDir = path.resolve(__dirname, '../cypress/reports/junit');
const outputFile = path.resolve(__dirname, '../cypress/reports/report.html');

function findReportFile() {
  const candidates = fs.readdirSync(reportsDir)
    .filter((file) => file.endsWith('.xml'))
    .map((file) => ({
      file,
      mtime: fs.statSync(path.join(reportsDir, file)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (!candidates.length) {
    throw new Error(`No XML report files found in ${reportsDir}`);
  }

  return path.join(reportsDir, candidates[0].file);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getAttr(attrs, name) {
  const match = attrs.match(new RegExp(`\\b${name}="([\\s\\S]*?)"`));
  return match ? match[1] : null;
}

function parseJUnit(xml) {
  const rootTag = xml.match(/<(testsuites?|testsuite)\b([^>]*)>/);
  const rootAttrs = rootTag ? rootTag[2] : '';
  let tests = Number(getAttr(rootAttrs, 'tests') || 0);
  let failures = Number(getAttr(rootAttrs, 'failures') || 0);
  let errors = Number(getAttr(rootAttrs, 'errors') || 0);
  let time = Number(getAttr(rootAttrs, 'time') || 0);

  const suiteMatches = [...xml.matchAll(/<testsuite\b([^>]*)>([\s\S]*?)<\/testsuite>/g)];

  const suites = suiteMatches.map((match) => {
    const suiteAttrs = match[1];
    const suiteBody = match[2];
    const suiteName = getAttr(suiteAttrs, 'name') || 'Unknown Suite';
    const suiteTests = Number(getAttr(suiteAttrs, 'tests') || 0);
    const suiteFailures = Number(getAttr(suiteAttrs, 'failures') || 0);
    const suiteTime = Number(getAttr(suiteAttrs, 'time') || 0);

    const testMatches = [...suiteBody.matchAll(/<testcase\b([^>]*)>([\s\S]*?)<\/testcase>/g)];

    const cases = testMatches.map((testMatch) => {
      const testAttrs = testMatch[1];
      const body = testMatch[2];
      const failureMatch = body.match(/<failure\b[^>]*>([\s\S]*?)<\/failure>/);
      return {
        name: getAttr(testAttrs, 'name') || 'Unknown Test',
        time: Number(getAttr(testAttrs, 'time') || 0),
        classname: getAttr(testAttrs, 'classname') || 'Unknown Class',
        failure: failureMatch ? failureMatch[1].trim() : null
      };
    });

    return {
      name: suiteName,
      tests: suiteTests,
      failures: suiteFailures,
      time: suiteTime,
      cases
    };
  });

  if (!tests && suites.length) {
    tests = suites.reduce((sum, suite) => sum + suite.tests, 0);
  }

  if (!failures && suites.length) {
    failures = suites.reduce((sum, suite) => sum + suite.failures, 0);
  }

  if (!time && suites.length) {
    time = suites.reduce((sum, suite) => sum + suite.time, 0);
  }

  return { tests, failures, errors, time, suites };
}

function buildHtml(report) {
  const status = report.failures + report.errors > 0 ? 'FAILED' : 'PASSED';
  const statusColor = report.failures + report.errors > 0 ? '#d9480f' : '#1f9d55';

  const rows = report.suites.flatMap((suite) =>
    suite.cases.map((testCase) => {
      const passed = !testCase.failure;
      return `      <tr class="${passed ? 'pass' : 'fail'}">\n        <td>${escapeHtml(suite.name)}</td>\n        <td>${escapeHtml(testCase.name)}</td>\n        <td>${escapeHtml(testCase.classname)}</td>\n        <td>${passed ? 'PASS' : 'FAIL'}</td>\n        <td>${testCase.time.toFixed(3)}s</td>\n        <td>${testCase.failure ? escapeHtml(testCase.failure) : ''}</td>\n      </tr>`;
    })
  );

  return `<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Reporte de Pruebas</title>\n  <style>\n    body { font-family: Inter, system-ui, sans-serif; margin: 0; padding: 0; background: #f5f7fb; color: #111827; }\n    .container { max-width: 1100px; margin: 0 auto; padding: 28px; }\n    h1, h2 { margin: 0; }\n    .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 24px; }\n    .summary { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 18px 22px; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.04); }\n    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-top: 16px; }\n    .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; }\n    .summary-card strong { display: block; font-size: 1.1rem; margin-bottom: 8px; }\n    .status-pill { display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 999px; font-weight: 600; letter-spacing: 0.02em; background: ${statusColor}1a; color: ${statusColor}; }\n    table { width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #e5e7eb; margin-top: 24px; }\n    th, td { padding: 16px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }\n    th { background: #f8fafc; font-weight: 700; }\n    tr.pass td { color: #1f9d55; }\n    tr.fail td { color: #b91c1c; }\n    .footer { margin-top: 26px; font-size: 0.95rem; color: #475569; }\n    .note { margin-top: 8px; font-size: 0.95rem; }\n    .filepath { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <div class="header">\n      <div>\n        <h1>Reporte de pruebas</h1>\n        <p class="note">Reporte más visible generado desde el archivo JUnit.</p>\n      </div>\n      <div class="status-pill">${status}</div>\n    </div>\n\n    <div class="summary">\n      <h2>Resumen</h2>\n      <div class="summary-grid">\n        <div class="summary-card"><strong>Total de tests</strong>${report.tests}</div>\n        <div class="summary-card"><strong>Fallos</strong>${report.failures}</div>\n        <div class="summary-card"><strong>Errores</strong>${report.errors}</div>\n        <div class="summary-card"><strong>Duración</strong>${report.time.toFixed(3)}s</div>\n      </div>\n    </div>\n\n    <table>\n      <thead>\n        <tr>\n          <th>Suite</th>\n          <th>Test</th>\n          <th>Clase</th>\n          <th>Estado</th>\n          <th>Duración</th>\n          <th>Detalle</th>\n        </tr>\n      </thead>\n      <tbody>\n${rows.join('\n')}\n      </tbody>\n    </table>\n\n    <div class="footer">\n      <p>Reporte generado automáticamente en <span class="filepath">${escapeHtml(outputFile)}</span>.</p>\n    </div>\n  </div>\n</body>\n</html>`;
}

function cleanupOldReports(latestFile) {
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }

  const xmlFiles = fs.readdirSync(reportsDir)
    .filter((file) => file.endsWith('.xml'))
    .map((file) => path.join(reportsDir, file));

  for (const file of xmlFiles) {
    if (file !== latestFile) {
      fs.unlinkSync(file);
    }
  }
}

function main() {
  const reportFile = findReportFile();
  cleanupOldReports(reportFile);

  const xml = fs.readFileSync(reportFile, 'utf8');
  const report = parseJUnit(xml);
  const html = buildHtml(report);

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, html, 'utf8');

  console.log(`HTML report generated at: ${outputFile}`);
}

main();
