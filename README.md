# How to load a CSV file into a data grid

Loads a CSV two ways into the same grid: `sample.csv` fetched by URL, and any
file a visitor picks with a file input. Either way, `grid.import` parses the
text and coerces each column to match the grid's own columns, so numbers and
dates land typed rather than as plain strings: the Qty column sorts
numerically and the Ordered column renders as a formatted date.

Live demo: https://toclocoinc.github.io/lattice-grid-howto-load-a-csv-file/

**Read the how-to:** https://www.latticegrid.dev/docs/how-to/load-a-csv-file/

## The snippet

```js
const grid = LatticeGrid.createGrid(document.getElementById('grid'), {
  rowKey: 'id',
  columns: [/* id, customer, item, qty (number), ordered (date) */],
  rows: [],
});

fetch('./sample.csv')
  .then((res) => res.text())
  .then((text) => grid.import.apply(text, { mode: 'replace' }));

fileInput.addEventListener('change', (e) => {
  e.target.files[0].text().then((text) => grid.import.apply(text, { mode: 'replace' }));
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
