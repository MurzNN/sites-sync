#!/usr/bin/env node

const { config, sshCredentials } = require(__dirname + "/lib/utils");
const sshClient = require('ssh2');
const fs = require('fs');

const conn = new sshClient();
let siteSshCredentials = sshCredentials();
siteSshCredentials.privateKey = fs.readFileSync(siteSshCredentials.privateKey);
console.log(siteSshCredentials)

conn.on('ready', () => {
  console.log('Client :: ready');
  // conn.exec('cd /tmp', (err, stream) => {
  //   if (err) throw err;
  //   stream.on('data', (data) => {
  //     console.log('STDOUT: ' + data);
  //   }).stderr.on('data', (data) => {
  //     console.log('STDERR: ' + data);
  //   });
  // });
  conn.shell((err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('Stream :: close');
      conn.end();
    }).on('data', (data) => {
      // console.log('OUTPUT: ' + data);
      console.log(data  + '');
    });
    stream.end('cd ' + config.siteRemote.path + '\nyarn versions\nexit\n');
  });
}).connect(siteSshCredentials);