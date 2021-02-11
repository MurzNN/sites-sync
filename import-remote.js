#!/usr/bin/env node

const { config, sshCredentials } = require(__dirname + "/lib/utils");
const sshClient = require('ssh2');
const fs = require('fs');

const execSync = require("child_process").execSync;

execSync(`ssh ${config.siteRemote.user}@${config.siteRemote.host} "cd ${config.siteRemote.path}; yarn --silent db-dump" > ${config.dumpFile}`);
execSync(`yarn --silent db-restore`);
