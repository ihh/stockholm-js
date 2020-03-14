# Stockholm

JavaScript parser for [Stockholm format](https://en.wikipedia.org/wiki/Stockholm_format).

## Usage

~~~~
const Stockholm = require('stockholm-js');
const fs = require('fs');

const text = fs.readFileSync ('data/Lysine.stock').toString();
let align = Stockholm.parse (text);

if (Stockholm.sniff (align)) {
  let rows = align.rows(),
      columns = align.columns(),
      names = align.seqname;

  if (rows) {
    let newRow = align.seqdata[names[0]].replace(/./g,'N');
    align.addRow ("NewRow", newRow);
    align.deleteRow ("AE017267.1/95018-94836");
  }

  console.warn ("Tree is " + align.gf.NH.join(''))
  console.warn ("Consensus structure is " + align.gc.SS_cons)
  
  const seq = 'M93419.1/332-511'
  console.warn ("Structure of " + seq + " is " + align.gr.SS[seq])

  console.log (align.toString());

} else {
  console.error ("Doesn't look like Stockholm format");
}
~~~~