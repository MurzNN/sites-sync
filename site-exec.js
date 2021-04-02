#!/usr/bin/env node

const { argv, config, sshExec } = require(__dirname + "/lib/utils");

let cmdToRun = argv['_'][0];

(async function () {
  cmdToRun = `cd ${config.siteUpstream.path}; ` + cmdToRun;
  try {
    // console.log(await sshExec(cmdToRun));
    await sshExec(cmdToRun, true);
  } catch (e) {
    console.log("ERROR:");
    console.log(e.toString());
  }
  process.exit();
})();
