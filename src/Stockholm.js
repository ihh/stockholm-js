let Stockholm = function() {
  let obj = { gf: {},
              gr: {},
              gs: {},
              gc: {},
              seqname: [],
              seqdata: {} }
  Object.keys(obj).forEach ((prop) => this[prop] = obj[prop])
  return this
}

const formatStartRegex = /^# STOCKHOLM/;
const formatEndRegex = /^\/\/\s*$/;
const gfRegex = /^#=GF\s+(\S+)\s+(.*?)\s*$/;
const gcRegex = /^#=GC\s+(\S+)\s+(.*?)\s*$/;
const grRegex = /^#=GR\s+(\S+)\s+(\S+)\s+(.*?)\s*$/;
const gsRegex = /^#=GS\s+(\S+)\s+(\S+)\s+(.*?)\s*$/;
const lineRegex = /^\s*(\S+)\s+(\S+)\s*$/;
const nonwhiteRegex = /\S/;

const noFormatStart = "No format header: #=STOCKHOLM 1.0\n";
const noFormatEnd = "No format footer: //\n";
const badLine = "Malformed line\n";
const atLine = (n) => "(At line " + (n+1) + ") ";

const sniff = (text) => formatStartRegex.test (text);

const validate = (text) => {
  try {
    parseAll (text)
  } catch (e) {
    return false
  }
  return true
}

const parseAll = (text) => {
  let db = [], stock = null
  const lines = text.split("\n")
  lines.forEach ((line, n) => {
    let match;
    if (formatStartRegex.test(line)) {
      if (stock) throw new Error (atLine(n) + noFormatEnd);
      stock = new Stockholm();
    } else if (formatEndRegex.test(line)) {
      if (!stock) throw new Error (atLine(n) + noFormatStart);
      db.push (stock);
      stock = null;
    } else if (match = gfRegex.exec(line)) {
      if (!stock) throw new Error (atLine(n) + noFormatStart);
      stock.gf[match[1]] = stock.gf[match[1]] || [];
      stock.gf[match[1]].push (match[2]);
    } else if (match = gcRegex.exec(line)) {
      if (!stock) throw new Error (atLine(n) + noFormatStart);
      stock.gc[match[1]] = stock.gc[match[1]] || '';
      stock.gc[match[1]] += match[2];
    } else if (match = grRegex.exec(line)) {
      if (!stock) throw new Error (atLine(n) + noFormatStart);
      stock.gr[match[1]] = stock.gr[match[1]] || {};
      stock.gr[match[1]][match[2]] = stock.gr[match[1]][match[2]] || '';
      stock.gr[match[1]][match[2]] += match[3];
    } else if (match = gsRegex.exec(line)) {
      if (!stock) throw new Error (atLine(n) + noFormatStart);
      stock.gs[match[1]] = stock.gs[match[1]] || {};
      stock.gs[match[1]][match[2]] = stock.gs[match[1]][match[2]] || [];
      stock.gs[match[1]][match[2]].push (match[3]);
    } else if (match = lineRegex.exec(line)) {
      if (!stock) throw new Error (atLine(n) + noFormatStart);
      if (!stock.seqdata[match[1]]) {
        stock.seqdata[match[1]] = '';
        stock.seqname.push (match[1]);
      }
      stock.seqdata[match[1]] += match[2];
    } else if (nonwhiteRegex.test (line)) {
      throw new Error (atLine(n) + badLine);
    }
  })
  if (stock) {
    console.warn ("Warning: no end line //");
    db.push (stock);
  }
  return db;
}

const parse = (text) => {
  const db = parseAll (text);
  if (db.length === 0)
    throw new Error ("No alignments found");
  if (db.length > 1)
    throw new Error ("More than one alignment found");
  return db[0];
}

Stockholm.prototype.rows = function() {
  return this.seqname.length
}

Stockholm.prototype.columns = function() {
  let cols = 0
  this.seqname.forEach ((name) => { cols = Math.max (cols, this.seqdata[name].length) })
  Object.keys(this.gr).forEach ((tag) => Object.keys(this.gr[tag]).forEach ((name) => {
    cols = Math.max (cols, this.gr[tag][name].length)
  }))
  return cols
}

Stockholm.prototype.allNames = function() {
  let isName = {},
      names = [],
      addName = (name) => { if (!isName[name]) { isName[name] = true; names.push (name) } },
      addNames = (list) => list.forEach (addName);
  addNames (this.seqname);
  Object.keys(this.gr).forEach ((tag) => addNames (Object.keys(this.gr[tag])));
  Object.keys(this.gs).forEach ((tag) => addNames (Object.keys(this.gs[tag])));
  return names
}

Stockholm.prototype.allTags = function() {
  let isTag = {}
  const addTags = (obj) => Object.keys(obj).forEach ((tag) => isTag[tag] = true)
  addTags (this.gc)
  addTags (this.gf)
  addTags (this.gr)
  addTags (this.gs)
  return Object.keys(isTag).sort()
}

Stockholm.prototype.addRow = function (name, data) {
  if (this.seqdata[name])
    throw new Error ("Duplicate row name")
  this.seqname.push (name)
  this.seqdata[name] = data || ''
  return this
}

Stockholm.prototype.deleteRow = function (name) {
  if (!this.seqdata[name])
    throw new Error ("Row not found")
  this.seqname = this.seqname.filter ((n) => n !== name);
  delete this.seqdata[name];
  return this
}

function leftPad (text, width) {
  while (text.length < width)
    text = ' ' + text
  return text
}

function space (width) {
  return leftPad ("", width)
}

Stockholm.prototype.toString = function (opts) {
  opts = opts || { width: 80 }
  const names = this.allNames(), cols = this.columns()
  const width = opts.width || cols
  const nameWidth = Math.max.apply (null, names.map ((name) => name.length))
  const tagWidth = Math.max.apply (null, this.allTags().map ((tag) => tag.length))
  const seqIndent = tagWidth ? (tagWidth + 6) : 0;
  let offsets = [0]
  for (let offset = width; offset < cols; offset += width)
    offsets.push (offset)
  return "# STOCKHOLM 1.0\n"
    + Object.keys(this.gf).sort().map (tag => this.gf[tag].map((line) => "#=GF " + leftPad(tag,tagWidth) + " " + line + "\n").join('')).join('')
    + Object.keys(this.gs).sort().map (tag => Object.keys(this.gs[tag]).map((name) => this.gs[tag][name].map ((line) => "#=GS " + leftPad(tag,tagWidth) + " " + leftPad(name,nameWidth) + " " + line + "\n").join('')).join('')).join('')
    + offsets.map ((offset) =>
                   Object.keys(this.gc).sort().map (tag => "#=GC " + leftPad(tag,tagWidth) + space(nameWidth+2) + this.gc[tag].substr(offset,width) + "\n").join('')
                   + names.map ((name) => Object.keys(this.gr).filter ((tag) => this.gr[tag][name]).sort().map ((tag) => "#=GR " + leftPad(tag,tagWidth) + " " + leftPad(name,nameWidth) + " " + this.gr[tag][name].substr(offset,width) + "\n").join('')
                                + (this.seqdata[name]
                                   ? (leftPad(name,nameWidth+seqIndent) + " " + this.seqdata[name].substr(offset,width) + "\n")
                                   : '')).join('')).join("\n")
    + "//\n"
}

module.exports = { sniff, validate, parse, parseAll, Stockholm }
