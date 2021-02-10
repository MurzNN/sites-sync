#!/usr/bin/env node

const { config, sshCredentials } = require(__dirname + "/lib/utils");
const sshClient = require('ssh2');
const fs = require('fs');

const execSync = require("child_process").execSync;
    dumpCommand = `ssh ${config.siteRemote.user}@${config.siteRemote.host}`;
    // console.log(dumpCommand);
    // result = await mongoUtils.loggedExec(dumpCommand);
    execSync(dumpCommand);
