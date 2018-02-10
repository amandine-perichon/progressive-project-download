const fs = require('fs')
const R = require('ramda')
const chunk = require('./chunk')

const project = JSON.parse(fs.readFileSync(__dirname + '/data/resolved.json'))

fs.writeFileSync(
  __dirname + '/data/chunked.json',
  JSON.stringify(chunk("express-rosegardens", project))
);
