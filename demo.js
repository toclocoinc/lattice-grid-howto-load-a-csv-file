/**
 * Load a CSV file into a data grid, two ways.
 *
 * Below, sample.csv is fetched by URL and its text handed to grid.import,
 * which parses it and coerces each column to the type the grid's own columns
 * declare: qty lands as a real number, ordered as a real date. The file input
 * does the same with a file picked from disk, so either path fills the same
 * grid the same way.
 */

// Tied to toclocoinc.github.io only; has no effect anywhere else and needs
// no key at all to run this page from a local copy.
LatticeGrid.setLicence(
  'LG1.eyJ2IjoxLCJwIjoibGF0dGljZS1ncmlkIiwidCI6IlRPQ0xPQ08gSW5jIC0gcHVibGljIGRlbW9zIiwiZSI6IjIwMzAtMDEtMDEiLCJkIjpbInRvY2xvY29pbmMuZ2l0aHViLmlvIl19.9De42ua3aCGpiMB6EVRP7Tv-upUlDI-0T07rlSPzvCrsqg8t4YJi7SRnStEpAg48uzmcG7il1fR_TfwkUE7iCA'
);

const grid = LatticeGrid.createGrid(document.getElementById('grid'), {
  rowKey: 'id',
  columns: [
    { field: 'id', title: 'Order', layout: { width: 110 } },
    { field: 'customer', title: 'Customer', layout: { flex: 1, min: 150 } },
    { field: 'item', title: 'Item', layout: { flex: 1, min: 140 } },
    { field: 'qty', title: 'Qty', type: 'number', layout: { width: 90 } },
    { field: 'ordered', title: 'Ordered', type: 'date', format: { pattern: 'd MMM yyyy' }, layout: { width: 140 } },
  ],
  rows: [],
});
window.__demoGrid = grid; // read by tools/verify.mjs

const stat = document.getElementById('stat');

function load(text, source) {
  grid.import.apply(text, { mode: 'replace' });
  stat.textContent = `${grid.rows.count()} rows loaded from ${source}`;
}

// The URL path: fetch a file that already lives somewhere and read it.
fetch('./sample.csv')
  .then((res) => res.text())
  .then((text) => load(text, 'sample.csv'))
  .catch((err) => { stat.textContent = `Could not load sample.csv: ${err.message}`; });

// The file-picker path: read whatever the visitor chooses from disk.
document.getElementById('file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  file.text().then((text) => load(text, file.name));
});
