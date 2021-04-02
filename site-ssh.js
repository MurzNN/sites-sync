#!/usr/bin/env node

const sshClient = require('ssh2-client');
const { config, sshCredentials } = require(__dirname + "/lib/utils");

const site = 'dev'
const opts = sshCredentials();
opts.privateKey = opts.identity;

const uri = opts.username + '@' + opts.host;

// TODO: not working, must set right tty
opts.pty = {
  tty: {
    term: 'xterm'
  }
}

console.log(`For the present you must manually run the \`cd\` command:
---
cd ${config.siteUpstream.path}
---`)

// Setup a live shell on remote host
sshClient
// @todo: make a changedir
  .shell(uri, opts)
  .then(() => console.log('Session finished.'))