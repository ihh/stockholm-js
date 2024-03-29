const assert = require('assert');
const Stockholm = require('../index.js');
const fs = require('fs');

const text = fs.readFileSync ('data/Lysine.stock').toString();
const expected = fs.readFileSync ('test/Lysine.out').toString()
const expected2 = fs.readFileSync ('test/Lysine.out2').toString()
const expected3 = fs.readFileSync ('test/Lysine.out3').toString()
const expectedFasta = fs.readFileSync ('test/Lysine.fasta').toString()
const expectedCols = fs.readFileSync ('test/Lysine.cols2345.out').toString()

const seqIndex = { b: 'EFGH', xxx: 'ABCD', c: 'IJKL' }  // note out of order
const seqOrder = ['xxx', 'b', 'c']
const rowList = [['xxx', 'ABCD'], ['b', 'EFGH'], ['c', 'IJKL']]
const expectedFrom = "# STOCKHOLM 1.0\nxxx ABCD\nb   EFGH\nc   IJKL\n//\n"

const dummyText = "Not a Stockholm file";
const fakeText = "# STOCKHOLM 1.0\nBut it's not actually a Stockholm file\n";
const malformed = "Missing AAAAA\nA BBBBB\nHeader CCCCC\n";

describe ('Stockholm test', function() {

  var align
  it ('should sniff a Stockholm file', function (done) {
    assert.equal (Stockholm.sniff(text), true);
    done()
  })
  
  it ('should sniff a non-Stockholm file', function (done) {
    assert.equal (Stockholm.sniff(dummyText), false);
    done()
  })
  
  it ('should validate a Stockholm file', function (done) {
    assert.equal (Stockholm.validate(text), true);
    done()
  })
  
  it ('should not validate non-Stockholm files', function (done) {
    assert.equal (Stockholm.validate(dummyText), false);
    assert.equal (Stockholm.validate(fakeText), false);
    assert.equal (Stockholm.validate(malformed), false);
    done()
  })
  
  it ('should parse a Stockholm alignment file', function (done) {
    align = Stockholm.parse (text);
    done()
  })
  
  it ('should have 60 rows', function (done) {
    assert.equal (align.rows(), 60)
    done()
  })
  
  it ('should have 240 columns', function (done) {
    assert.equal (align.columns(), 240)
    done()
  })
  
  it ('should have one #=GF NH tag', function (done) {
    assert.equal (align.gf.NH.length, 1)
    done()
  })
  
  it ('should have 3444 chars in its #=GF NH tag', function (done) {
    assert.equal (align.gf.NH[0].length, 3444)
    done()
  })
  
  it ('should serialize back to Stockholm', function (done) {
    const out = align.toString ({ width: 118, indentNames: true })
    assert.equal (out, expected)
    done()
  })
  
  it ('should not indent names unless asked', function (done) {
    const out = align.toString ({ width: 118, indentNames: false })
    assert.equal (out, expected3)
    done()
  })

  it ('should serialize to FASTA', function (done) {
    const outFasta = align.toFasta ({ width: 80 })
    assert.equal (outFasta, expectedFasta)
    done()
  })

  it ('should be able to add a row', function (done) {
    let newRow = align.seqdata[align.seqname[0]].replace(/./g,'N');
    align.addRow ("NewRow", newRow);
    done()
  })

  it ('should now have 61 rows', function (done) {
    assert.equal (align.rows(), 61)
    done()
  })

  it ('should serialize to a new alignment', function (done) {
    const out2 = align.toString ({ width: 118, indentNames: true })
    assert.equal (out2, expected2)
    done()
  })

  it ('should be able to delete a row', function (done) {
    align.deleteRow ('NewRow');
    done()
  })

  it ('should now have 60 rows again', function (done) {
    assert.equal (align.rows(), 60)
    done()
  })

  it ('should serialize back to the original alignment', function (done) {
    const out3 = align.toString ({ width: 118, indentNames: true })
    assert.equal (out3, expected)
    done()
  })

  it ('should parse permissively with { strict: false }', function (done) {
    malAlign = Stockholm.parse (malformed, { strict: false, quiet: true });
    assert.equal (malAlign.rows(), 3)
    assert.equal (malAlign.columns(), 5)
    assert.equal (malAlign.seqdata.Missing, 'AAAAA')
    assert.equal (malAlign.seqdata.Header, 'CCCCC')
    done()
  })

  it ('should construct from a sequence index', function (done) {
    const fromIndex = Stockholm.fromSeqIndex (seqIndex)
    assert.equal (fromIndex.rows(), 3)
    assert.equal (fromIndex.columns(), 4)
    assert.equal (fromIndex.seqdata.xxx, 'ABCD')
    assert.equal (fromIndex.seqdata.b, 'EFGH')
    assert.equal (fromIndex.seqdata.c, 'IJKL')
    done()
  })

  it ('should construct from an ordered sequence index', function (done) {
    const fromIndex2 = Stockholm.fromSeqIndex (seqIndex, seqOrder)
    assert.equal (fromIndex2.rows(), 3)
    assert.equal (fromIndex2.columns(), 4)
    assert.equal (fromIndex2.toString(), expectedFrom)
    done()
  })

  it ('should construct from a row list', function (done) {
    const fromRows = Stockholm.fromRowList (rowList)
    assert.equal (fromRows.rows(), 3)
    assert.equal (fromRows.columns(), 4)
    assert.equal (fromRows.toString(), expectedFrom)
    done()
  })

  it ('should convert to a row list', function (done) {
    const fromRows = Stockholm.fromRowList (rowList)
    assert.equal (JSON.stringify(fromRows.toRowList()), JSON.stringify(rowList))
    done()
  })

  it ('should do a deep-copy', function (done) {
    const copy = align.copy()
    assert.equal (copy.rows(), 60)
    copy.deleteRow ('J03294.1/2297-2476')
    assert.equal (copy.rows(), 59)
    assert.equal (align.rows(), 60)
    done()
  })
  
  it ('should extract specified columns', function (done) {
    const cols = align.extractColumns ([2,3,4,5])
    assert.equal (cols.toString(), expectedCols)
    done()
  })

  it ('should extract a range of columns', function (done) {
    const cols = align.extractColumnRange (2, 5)
    assert.equal (cols.toString(), expectedCols)
    done()
  })

  it ('should map alignment to sequence co-ordinates', function (done) {
    const pos2col = align.seqpos2col ('AE001799.1/20444-20268')
    assert.equal (pos2col[0], 1)
    assert.equal (pos2col[1], 2)
    assert.equal (pos2col[13], 14)
    assert.equal (pos2col[14], 16)
    done()
  })

  it ('should map sequence to alignment co-ordinates', function (done) {
    const col2pos = align.col2seqpos ('AE001799.1/20444-20268')
    assert.equal (col2pos[0], -0.5)
    assert.equal (col2pos[1], 0)
    assert.equal (col2pos[2], 1)
    assert.equal (col2pos[14], 13)
    assert.equal (col2pos[15], 13.5)
    assert.equal (col2pos[16], 14)
    done()
  })
  
})
