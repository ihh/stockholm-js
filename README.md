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
  const rows = align.rows(),
        columns = align.columns(),
        names = align.seqname;  // the order of alignment rows is well-defined

  if (rows) {
    const newRow = align.seqdata[names[0]].replace(/./g,'N');
    align.addRow ("NewRow", newRow);
    align.deleteRow ("AE017267.1/95018-94836");
  }

  console.warn ("Tree is " + align.gf.NH.join(''))
  console.warn ("Consensus structure is " + align.gc.SS_cons)
  
  const seq = 'M93419.1/332-511'
  console.warn ("Structure of " + seq + " is " + align.gr.SS[seq])
  console.warn ("First column of " + seq + " is " + align.seqdata[seq][0])

  console.log (align.toString());
  console.log (align.toFasta());

} else {
  console.error ("Doesn't look like Stockholm format");
}

const align2 = Stockholm.fromSeqIndex ({ row1: 'AAAA', row2: 'GGGG', row3: 'AGAG' })
console.log (align2.toString())

const align3 = Stockholm.fromRowList ([['ancestor', 'AAAA'], ['descendant', 'AAGA']])
console.log (align3.toFasta())
~~~~