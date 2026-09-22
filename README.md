# How to load a CSV file into a data grid

Loads a CSV two ways into the same grid: `sample.csv` fetched by URL, and any
file a visitor picks with a file input. Either way, `grid.import` parses the
text and coerces each column to match the grid's own columns, so numbers and
dates land typed rather than as plain strings: the Qty column sorts
numerically and the Ordered column renders as a formatted date.

Live demo: https://toclocoinc.github.io/lattice-grid-howto-load-a-csv-file/

**Read the how-to:** https://www.latticegrid.dev/docs/how-to/load-a-csv-file/

## The full source

Two files: `index.html` loads the grid and declares the mount point, `demo.js` configures and creates it. Copy both as they are below and it runs.

### index.html

```html
<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>How to load a CSV file into a data grid</title>
    <meta
      name="description"
      content="Load a CSV two ways into the same JavaScript data grid: fetched from a URL and picked from disk with a file input. Numbers and dates arrive typed, so a numeric sort and a date format both just work. Built with Lattice Grid loaded by script tag, no install and no build."
    />
    <link rel="icon" href="data:," />
    <!--
      The grid's stylesheet, from jsDelivr. The address names the exact
      release, 1.68.2, and carries the hash of the file it expects, so the
      page can never quietly pick up a different build than the one it was
      checked against.
    -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.css"
      integrity="sha384-mcpd7S8C5nz58bZDAXdYH6rzezEhfN7B4u2SlW426dSe20GnkxTu4TygyOILnCth"
      crossorigin="anonymous"
    />
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #f4f6f9; color: #131a24; }
      header { padding: 1.5rem 1.5rem 0.5rem; max-width: 960px; margin: 0 auto; }
      header p { color: #4a5568; }
      header a { color: #2d6bff; }
      main { max-width: 960px; margin: 0 auto; padding: 0 1.5rem 2.5rem; }
      #grid { height: 420px; }
      .toolbar { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; margin: 0 0 0.75rem; }
      #stat { font-size: 0.9rem; color: #4a5568; }
    </style>
  </head>
  <body>
    <header>
      <h1>How to load a CSV file into a data grid</h1>
      <p>
        Loaded once from <code>sample.csv</code> by URL below. Pick a CSV file of your own and it
        replaces the grid the same way. Read the
        <a href="https://www.latticegrid.dev/docs/how-to/load-a-csv-file/">full how-to</a>
        on latticegrid.dev.
      </p>
    </header>
    <main>
      <div class="toolbar">
        <label for="file-input">Or choose your own CSV:</label>
        <input type="file" id="file-input" accept=".csv,text/csv" />
        <span id="stat"></span>
      </div>
      <div id="grid"></div>
    </main>

    <!--
      The library, as a classic script tag. No npm install, no bundler, no
      type="module": the file runs as it arrives and leaves the LatticeGrid
      global behind.
    -->
    <script
      src="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.js"
      integrity="sha384-vCzLyFYn0T0lz/vkdH4x0JpJZkOazZgI2LiGui7lm5uerdZd0Z46G9hr3Aq1FFPS"
      crossorigin="anonymous"
    ></script>
    <script src="./demo.js"></script>
  </body>
</html>
```

### demo.js

```js
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
```

`grid.import.apply` reads the CSV text, matches its header row onto the
grid's own column fields, and coerces each value to that column's type
before the rows land, so a `qty` column of `"1"`, `"10"`, `"2"` sorts as
1, 2, 10, not lexically, and an `ordered` column of `"2025-01-14"` shows as
a real date rather than raw text.

## Running it yourself

Open `index.html` in a browser, or serve the folder with any static file
server. The grid loads from jsDelivr by script tag, so there is no install
and no build step. It runs keyless on `localhost`; the licence key in
`demo.js` is bound to `toclocoinc.github.io` and has no effect anywhere else.

## Licence

MIT, see [LICENSE](./LICENSE). Lattice Grid itself is licensed separately
per domain: https://www.latticegrid.dev/pricing/
