# Stockholm

JavaScript parser for [Stockholm format](https://en.wikipedia.org/wiki/Stockholm_format).

## Usage

~~~~
const Stockholm = require('Stockholm');
let align = Stockholm.parse (fs.readFileSync ('Lysine.stock').toString());
if (Stockholm.sniff (align)) {
  let rows = align.rows(), columns = align.columns(), names = align.seqname;
  if (rows) {
    let newRow = align.seqdata[names[0]].replace(/./g,'N');
    align.addRow ("NewRow", newRow);
  }
  console.log (align.toString());
} else {
  console.error ("Doesn't look like Stockholm format");
}
console.log (align.toString());
~~~~