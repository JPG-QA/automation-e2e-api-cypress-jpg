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
      return `      <tr class="${passed ? 'pass' : 'fail'}">
        <td>${escapeHtml(suite.name)}</td>
        <td>${escapeHtml(testCase.name)}</td>
        <td>${escapeHtml(testCase.classname)}</td>
        <td>${passed ? 'PASS' : 'FAIL'}</td>
        <td>${testCase.time.toFixed(3)}s</td>
        <td>${testCase.failure ? escapeHtml(testCase.failure) : ''}</td>
      </tr>`;
    })
  );

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reporte de Pruebas - PetStore API</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; margin: 0; padding: 0; background: #f5f7fb; color: #111827; }
    .container { max-width: 1100px; margin: 0 auto; padding: 28px; }
    h1, h2 { margin: 0; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
    .summary { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 18px 22px; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.04); }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-top: 16px; }
    .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; }
    .summary-card strong { display: block; font-size: 1.1rem; margin-bottom: 8px; }
    .status-pill { display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 999px; font-weight: 600; letter-spacing: 0.02em; background: ${statusColor}1a; color: ${statusColor}; }
    table { width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #e5e7eb; margin-top: 24px; }
    th, td { padding: 16px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f8fafc; font-weight: 700; }
    tr.pass td { color: #1f9d55; }
    tr.fail td { color: #b91c1c; }
    .footer { margin-top: 26px; font-size: 0.95rem; color: #475569; }
    .note { margin-top: 8px; font-size: 0.95rem; }
    .filepath { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>Reporte de pruebas | PetStore API</h1>
        <p class="note">Reporte más visible generado desde el archivo JUnit.</p>
      </div>
      <div class="status-pill">${status}</div>
    </div>

    <div class="summary">
      <h2>Resumen</h2>
      <div class="summary-grid">
        <div class="summary-card"><strong>Total de tests</strong>${report.tests}</div>
        <div class="summary-card"><strong>Fallos</strong>${report.failures}</div>
        <div class="summary-card"><strong>Errores</strong>${report.errors}</div>
        <div class="summary-card"><strong>Duración</strong>${report.time.toFixed(3)}s</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Suite</th>
          <th>Test</th>
          <th>Clase</th>
          <th>Estado</th>
          <th>Duración</th>
          <th>Detalle</th>
        </tr>
      </thead>
      <tbody>
${rows.join('\n')}
      </tbody>
    </table>

    <div class="footer">
      <p>Reporte generado automáticamente en <span class="filepath">${escapeHtml(outputFile)}</span>.</p>
    </div>
  </div>
</body>
</html>`;
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
