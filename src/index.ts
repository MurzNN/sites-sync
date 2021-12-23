#!/usr/bin/env -S node --loader ts-node/esm --no-warnings

import yargs from 'yargs';
import { siteUpstreamId, config } from "./lib/init.js";
import { siteShell, siteExec } from "./lib/siteOperations.js";
import { doDbClear, doDbDump, doDbQuery, doDbsImport, doSiteStoragesSync } from './lib/operations.js';
import { DbImportOptions } from './types/db.js';

const myYargs = yargs(process.argv.slice(2))
  .scriptName('sites-sync')
  .usage('Usage: $0 <command> [options]')

  .command(['shell', 'sh', 's'], 'Interactive shell to remote site.', {}, async (argv) => {
    siteShell();
    process.exit(0);
  })
  .command(['exec', 'e'], 'Execute command on remote site.', {}, async (argv) => {
    const cmd = argv._[1] as string;
    siteExec(cmd);
    process.exit(0)
  })
  .command('db-dump', 'Dump database to stdout.', {}, async (argv) => {
    const dbId = argv._[1] as string ?? Object.keys(config.databases)[0];
    doDbDump(dbId);
    process.exit(0)
  })
  .command('db-query', 'Execute db query from stdin.', {}, async (argv) => {
    const dbId = argv._[1] as string ?? Object.keys(config.databases)[0];
    doDbQuery(dbId);
    process.exit(0)
  })
  .command('db-clear', 'Clear current database.', {}, async (argv) => {
    const dbId = argv._[1] as string ?? Object.keys(config.databases)[0];
    doDbClear(dbId);
    process.exit(0)
  })
  .command('db-import', 'Import database dump from stdin.', {}, async (argv) => {
    const dbId = argv._[1] as string ?? Object.keys(config.databases)[0];
    doDbClear(dbId);
    process.exit(0)
  })
  .command('db-pull', 'Pull database from remote site.', {}, async (argv) => {
    const dbImportOptions = {} as DbImportOptions;
    if(argv.keepFiles) {
      dbImportOptions.keepFiles = true;
    }
    doDbsImport(dbImportOptions);

    process.exit(0);
  })

  .command('storage-pull', 'Pull all storages from remote site.', {}, async (argv) => {
    doSiteStoragesSync();
    process.exit(0);
  })

  .command('pull', 'Pull all databases and storages from remote site.', {}, async (argv) => {
    doDbsImport();
    doSiteStoragesSync();
    console.log(`Import from site "${siteUpstreamId}" successfully completed.`);
    process.exit(0);
  })

  // .command(['backup', 'b'], 'Make a backup of current site to single file (files and databases).', {}, async (argv) => {
  //   throw 'Not yet implemented.';
  //   process.exit(0)
  // })
  // .command(['restore', 'r'], 'Restore current site from single file (files and databases).', {}, async (argv) => {
  //   throw 'Not yet implemented.';
  //   process.exit(0)
  // })

  .help('h')
  .alias('h', 'help')
  .epilog('Sites-sync tool. (c) Alexey Murz Korepov <MurzNN@gmail.com>')
  ;

await myYargs.argv;

myYargs.showHelp();
