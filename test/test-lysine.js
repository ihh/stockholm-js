const assert = require('assert');
const Stockholm = require('../index.js');
const fs = require('fs');

const text = fs.readFileSync ('data/Lysine.stock').toString();
const expected = fs.readFileSync ('test/Lysine.out').toString()
const expected2 = fs.readFileSync ('test/Lysine.out2').toString()

const dummyText = "Not a Stockholm file";
const fakeText = "# STOCKHOLM 1.0\nBut it's not actually a Stockholm file\n";

describe ('parsing test', function() {

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
  
  it ('should serialize back to an alignment', function (done) {
    const out = align.toString ({ width: 80 })
    assert.equal (out, expected)
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
    const out2 = align.toString ({ width: 80 })
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
    const out3 = align.toString ({ width: 80 })
    assert.equal (out3, expected)
    done()
  })
})
