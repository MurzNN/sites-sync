#!/usr/bin/env node

const fs = require("fs");
const prettyBytes = require("pretty-bytes");

const { config, dbBackup } = require(__dirname + "/lib/utils");

console.log("Creating dump of database to file " + config.dumpFile + "...");
dbBackup();
dumpFileStat = fs.statSync(config.dumpFile);
console.log(
  "Database dump file created: " +
  config.dumpFile +
  "; size: " +
  prettyBytes(dumpFileStat.size)
);
