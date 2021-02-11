#!/usr/bin/env node

const fs = require("fs");
const prettyBytes = require("pretty-bytes");

const { config, dbDump } = require(__dirname + "/lib/utils");

console.log("Creating dump of database to file " + config.dumpFile + "...");
dbDump(config.siteCurrent.dbConnectionString, config.dumpFile);
dumpFileStat = fs.statSync(config.dumpFile);
console.log(
  "Database dump file created: " +
    config.dumpFile +
    "; size: " +
    prettyBytes(dumpFileStat.size)
);
