#!/usr/bin/env node

const fs = require("fs");

const { config, dbDump } = require(__dirname + "/lib/utils");

dbDump();
