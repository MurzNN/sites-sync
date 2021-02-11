#!/usr/bin/env node

const fs = require("fs");
const prettyBytes = require("pretty-bytes");

const { config, dbRestore } = require(__dirname + "/lib/utils");

if (!fs.existsSync(config.dumpFile)) {
  console.log("ERROR: Database dump file " + config.dumpFile + " not exists!");
  process.exit(1);
}

dumpFileStat = fs.statSync(config.dumpFile);
console.log("Restoring database from file " + config.dumpFile
  + "(size: " + prettyBytes(dumpFileStat.size) + " to current db...");
dbRestore(config.siteCurrent.dbConnectionString, config.dumpFile);
console.log("Database successfully restored.");
