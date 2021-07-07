#!/usr/bin/env node

const sshClient = require('ssh2-client');
const { argv, config, sshCredentials } = require(__dirname + "/lib/utils");

const site = argv['_'][0] ?? config.siteUpstreamName;
const opts = sshCredentials(site);
opts.privateKey = opts.identity;

const uri = opts.username + '@' + opts.host;

// TODO: not working, must set right tty
opts.pty = {
  tty: {
    term: 'xterm'
  }
}
console.log(`Connecting to: ${opts.username}@${opts.host} ...`);

console.log(`For the present you must manually run the \`cd\` command:
---
cd ${config.sites[site].path}
---`);

// Setup a live shell on remote host
sshClient
// @todo: make a changedir
  .shell(uri, opts)
  .then(() => console.log('Session finished.'))