#!/usr/bin/env node

const fs = require("fs");
const prettyBytes = require("pretty-bytes");

const { argv, config, dbClear, dbRestore } = require(__dirname + "/lib/utils");
let dumpFile = argv['_'][0] ?? config.dumpFile;

if (!fs.existsSync(dumpFile || config.dumpFile)) {
  console.log("ERROR: Database dump file " + dumpFile + " not exists!");
  process.exit(1);
}

dumpFileStat = fs.statSync(dumpFile);
console.log("Restoring database from file " + dumpFile
  + "(size: " + prettyBytes(dumpFileStat.size) + " to current db...");
dbClear();
console.log("Working database cleared.");
dbRestore(dumpFile);
console.log("Database successfully restored.");
