#!/usr/bin/env node

const fs = require("fs");
const prettyBytes = require("pretty-bytes");

const { config, dbDump } = require(__dirname + "/lib/utils");

dbDump(config.siteCurrent.dbConnectionString, config.dumpFile);
