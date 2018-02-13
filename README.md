# Running the client
* replace 'config goes here' by the remote DB config
* run python -m SimpleHTTPServer 3000

## Testing first project load
To test the first load, delete your localDB to force the client to resync with the remote DB

## Testing a push from the remote DB
update an entry (e.g. express-rosegardens) through couch's interface: `http://${IP}:5984/_utils/`
`http://${IP}:${PORT}/_utils/#/database/projects/_all_docs`

# Uploading data to the DB
The steps here describe how to upload data in the DB
This has already been done, hence you can just run the client

## View large JSON
jq . < data/resolved.json | less

## Resolve project without updates
node resolveProject.js

## Chunk resolved project
node chunkProject.js

## Upload to DB
Environment variables IP and PASSWORD have to be set up
PASSWORD=... IP=... node upload.js
