const fs = require('fs');
const { execSync } = require('child_process');

const IP = process.env.IP
const PORT = "5984"
const DB = "projects"
const USERNAME = "admin"
const PASSWORD = process.env.PASSWORD
const BATCH_SIZE = 200

let i = 0;

function putDocumentBatch(documents) {

  documents.forEach(doc => {
    doc._id = doc.id
  })

  const docString = JSON.stringify({docs: documents})
  fs.writeFileSync("./tmp.json", docString);
  const curl = `curl -H 'Content-Type: application/json' -X POST http://${USERNAME}:${PASSWORD}@${IP}:${PORT}/${DB}/_bulk_docs -d @tmp.json 2>/dev/null`;
  const result = JSON.parse(execSync(curl).toString());
  for (row of result) {
    if (row.ok !== true) {
      console.log("FAILURE", row)
    }
  }
  i += BATCH_SIZE;
  console.log(`OK (${i})`);
}

let chunkeds = JSON.parse(fs.readFileSync('./data/chunked.json'))

while(chunkeds.length > 0) {
  const docs = chunkeds.slice(0, BATCH_SIZE);
  putDocumentBatch(docs);
  chunkeds = chunkeds.slice(BATCH_SIZE);
}
