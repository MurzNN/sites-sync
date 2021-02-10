#!/usr/bin/env node

const sshClient = require('ssh2-client');
const { config, sshCredentials } = require(__dirname + "/lib/utils");

const site = 'dev'
const opts = sshCredentials();
const uri = opts.username + '@' + opts.host;

// Setup a live shell on remote host
sshClient
// @todo: make a changedir
  .shell(uri, opts)
  .then(() => console.log('Session finished.'))