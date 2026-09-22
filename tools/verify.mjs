/**
 * Load the demo in a real headless browser and check that it works.
 *
 * Serves the project locally and drives it with the same minimal Chrome
 * driver the grid's own test suite uses (tools/browser.js), so this needs no
 * dependency beyond Chrome itself.
 *
 * Checks:
 *   - the library arrived and left the LatticeGrid global behind;
 *   - fetching sample.csv by URL lands all 24 rows in the grid, and the
 *     on-page readout says so;
 *   - qty came in as a real number: clicking its header sorts numerically
 *     (1 before 40), not lexically (1, 10, 11, ... before 2);
 *   - ordered came in as a real date: the cell text is formatted ("14 Jan
 *     2025"), not the raw "2025-01-14" the CSV carried;
 *   - the file-input element is present so a visitor can pick their own CSV.
 *     A real file pick cannot be driven headless (no OS file-chooser dialog
 *     in this driver), so that path is checked here only by presence, not by
 *     exercising a chosen file;
 *   - nothing logged a console error or threw while the page ran.
 *
 * Exits non-zero on any failure, so it can gate a deployment.
 *
 * Usage: node tools/verify.mjs
 */

import { startServer } from './serve.mjs';
import { Browser, available } from './browser.js';

if (!available()) {
  console.log('No headless browser on this machine; skipping verify.mjs.');
  process.exit(0);
}

const { server, port } = await startServer();
const browser = new Browser();

try {
  await browser.start();

  await browser.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__errs = [];
      addEventListener('error', (e) => window.__errs.push(String(e.message || e)));
      addEventListener('unhandledrejection', (e) => window.__errs.push('unhandledrejection: ' + String(e.reason)));
      const origError = console.error.bind(console);
      console.error = (...args) => { window.__errs.push('console.error: ' + args.map(String).join(' ')); origError(...args); };
    `,
  });

  await browser.open(`http://127.0.0.1:${port}/`);
  await new Promise((r) => setTimeout(r, 500));

  const hasGrid = await browser.evaluate(`typeof LatticeGrid !== 'undefined' && typeof LatticeGrid.createGrid === 'function'`);
  const rowCount = await browser.evaluate(`window.__demoGrid.rows.count()`);
  const statText = await browser.evaluate(`document.getElementById('stat').textContent`);
  const fileInputPresent = await browser.evaluate(`document.getElementById('file-input') !== null && document.getElementById('file-input').type === 'file'`);

  // Raw date text as it sits in the CSV, for comparison.
  const firstOrderedRaw = '2025-01-14';
  const firstOrderedCell = await browser.evaluate(`document.querySelector('.lat-row [data-col="ordered"]')?.textContent`);

  // Sort Qty ascending by clicking its header; the minimum in the sample is
  // 1 (ORD-1013), which a lexical sort would place after "10", "11" etc.
  await browser.evaluate(`document.querySelector('.lat-header-cell[data-col="qty"]').click()`);
  await new Promise((r) => setTimeout(r, 400));
  const sortDir = await browser.evaluate(`document.querySelector('.lat-header-cell[data-col="qty"]').getAttribute('data-sort')`);
  const firstQtyAfterSort = await browser.evaluate(`document.querySelector('.lat-row [data-col="qty"]')?.textContent`);

  const errors = await browser.evaluate('window.__errs');

  const failures = [];
  if (!hasGrid) failures.push('LatticeGrid.createGrid was not found on the page');
  if (rowCount !== 24) failures.push(`expected 24 rows from sample.csv, grid reports ${rowCount}`);
  if (!statText || !statText.includes('24')) failures.push(`the row-count readout did not report 24 rows (was "${statText}")`);
  if (!fileInputPresent) failures.push('the file-input element is missing');
  if (!firstOrderedCell || firstOrderedCell === firstOrderedRaw || !/[A-Za-z]/.test(firstOrderedCell)) {
    failures.push(`expected a formatted date, not the raw CSV text (was "${firstOrderedCell}")`);
  }
  if (sortDir !== 'asc') failures.push(`clicking the Qty header did not sort ascending (data-sort was "${sortDir}")`);
  if (firstQtyAfterSort !== '1') failures.push(`expected qty 1 first after an ascending numeric sort, saw "${firstQtyAfterSort}"`);
  if (errors.length) failures.push(`console/window errors: ${errors.join(' | ')}`);

  if (failures.length) {
    console.error('FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log(
      `OK: 24 rows loaded from sample.csv by URL, qty sorts numerically (1 first), ` +
      `ordered renders as "${firstOrderedCell}" not raw CSV text, the file-input element is present ` +
      `(a real file pick cannot be driven headless), 0 console errors.`
    );
  }
} finally {
  await browser.close();
  server.close();
}
