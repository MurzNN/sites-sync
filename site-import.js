#!/usr/bin/env node

const { config, sshCredentials } = require(__dirname + "/lib/utils");
const sshClient = require('ssh2');
const fs = require('fs');
const prettyBytes = require("pretty-bytes");

if (typeof config.siteRemote === 'undefined') {
  throw new Error("Can't find info for remote site with name !");
}

if (typeof config.siteRemote.user === 'undefined') {
  throw new Error("User of remote site is not defined!");;
}

const execSync = require("child_process").execSync;
console.log(`Connecting to remote site for dump and download the database via:
  ssh://${config.siteRemote.user}@${config.siteRemote.host}${config.siteRemote.path} ...`);

let result = execSync(`ssh ${config.siteRemote.user}@${config.siteRemote.host} "cd ${config.siteRemote.path}; yarn --silent db-dump" > ${config.dumpFile}`);
console.log(result.toString());
dumpFileStat = fs.statSync(config.dumpFile);
console.log(`Database downloaded from remote site to ${config.dumpFile} (` + prettyBytes(dumpFileStat.size) + ` compressed). Importing...`);
result = execSync(`yarn --silent db-restore`);
console.log(result.toString());
fs.unlinkSync(config.dumpFile);
console.log('Database successfully imported from remote site.');
