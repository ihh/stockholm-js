# stockholm-js

JavaScript parser for [Stockholm format](https://en.wikipedia.org/wiki/Stockholm_format).

## Usage

Using the example alignment file from the repository, [Lysine.stock](data/Lysine.stock)

~~~~
const Stockholm = require('stockholm-js');
const fs = require('fs');

const text = fs.readFileSync ('Lysine.stock').toString();

if (Stockholm.sniff (text)) {
  let align = Stockholm.parse (text);
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