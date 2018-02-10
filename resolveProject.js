const fs = require('fs')
const resolveWithoutUpdates = require('./resolve')

const project = JSON.parse(fs.readFileSync(__dirname + '/data/rosegardens.json'))

fs.writeFileSync(
  __dirname + '/data/resolved.json',
  JSON.stringify(resolveWithoutUpdates(project))
)
