#!/usr/bin/env -S node --loader ts-node/esm --no-warnings

import yargs from 'yargs';
import { siteUpstreamId, config } from "./lib/config.js";
import { siteShell, siteExec } from "./lib/siteUtils.js";
import { doDatabaseClear, doDatabaseDump, doDatabaseQuery, doDatabasesBackup, doDatabasesPull, doDatabasesPush, doDatabasesRestore, doDirectoriesBackup, doDirectoriesRestore, doSiteDirectoriesPull, doSiteDirectoriesPush } from './lib/commands.js';
import { DbImportOptions } from './types/db.js';
import { backupDirectoryDeleteAll, getBackupDirectory, prepareBackupDirectory } from './lib/utils.js';

const myYargs = yargs(process.argv.slice(2))
  .scriptName('sites-sync')
  .usage('Usage: $0 <command> [options]')

  .command(['pull', 'p'], 'Pull databases and directories from remote site.', {}, async (argv) => {
    doDatabasesPull();
    doSiteDirectoriesPull();
    console.log(`Pull from site "${siteUpstreamId}" successfully completed.`);
    process.exit(0);
  })
  .command('push', 'Push databases and directories to remote site.', {}, async (argv) => {
    doDatabasesPush();
    doSiteDirectoriesPush();
    console.log(`Push to site "${siteUpstreamId}" successfully completed.`);
    process.exit(0);
  })

  .command(['terminal', 't'], 'Open interactive terminal to remote site.', {}, async (argv) => {
    siteShell();
    process.exit(0);
  })
  .command(['exec', 'e'], 'Execute command on remote site.', {}, async (argv) => {
    const cmd = argv._[1] as string;
    siteExec(cmd);
    process.exit(0)
  })

  .command(['backup', 'b'], 'Make a backup of current site to backup directory (databases and directories).', {}, async (argv) => {
    const backupDirectory = prepareBackupDirectory();
    doDatabasesBackup(backupDirectory);
    doDirectoriesBackup(backupDirectory);
    process.exit(0)
  })
  .command(['restore', 'r'], 'Restore current site from backup directory (databases and directories).', {}, async (argv) => {
    const backupDirectoryName = argv._[1] as string ?? undefined;
    const backupDirectory = getBackupDirectory(backupDirectoryName);
    console.log(backupDirectory);
    doDatabasesRestore(backupDirectory);
    doDirectoriesRestore(backupDirectory);
    process.exit(0)
  })
  .command(['delete-backups'], 'Delete all backups from backup directory', {}, async (argv) => {
    backupDirectoryDeleteAll();
    process.exit(0)
  })


  .command('db-dump', 'Dump database to stdout.', {}, async (argv) => {
    const dbId = argv._[1] as string ?? Object.keys(config.databases)[0];
    doDatabaseDump(dbId);
    process.exit(0)
  })
  .command('db-query', 'Execute db query from stdin.', {}, async (argv) => {
    const dbId = argv._[1] as string ?? Object.keys(config.databases)[0];
    doDatabaseQuery(dbId);
    process.exit(0)
  })
  .command('db-clear', 'Clear current database.', {}, async (argv) => {
    const dbId = argv._[1] as string ?? Object.keys(config.databases)[0];
    doDatabaseClear(dbId);
    process.exit(0)
  })
  .command('db-import', 'Import database dump from stdin.', {}, async (argv) => {
    const dbId = argv._[1] as string ?? Object.keys(config.databases)[0];
    doDatabaseClear(dbId);
    process.exit(0)
  })
  .command('db-pull', 'Pull database from remote site.', {}, async (argv) => {
    const dbImportOptions = {} as DbImportOptions;
    if(argv.keepFiles) {
      dbImportOptions.keepFiles = true;
    }
    doDatabasesPull(dbImportOptions);
    process.exit(0);
  })
  .command('db-push', 'Push database to remote site.', {}, async (argv) => {
    const dbImportOptions = {} as DbImportOptions;
    if(argv.keepFiles) {
      dbImportOptions.keepFiles = true;
    }
    doDatabasesPush();
    process.exit(0);
  })

  .command('directory-pull', 'Pull all directories from remote site.', {}, async (argv) => {
    doSiteDirectoriesPull()
    process.exit(0);
  })
  .command('directory-push', 'Push all directories to remote site.', {}, async (argv) => {
    doSiteDirectoriesPush()
    process.exit(0);
  })

  .command('id', 'Outputs an id of current site.', {}, async (argv) => {
    console.log(config.siteId);
    process.exit(0);
  })
  .command('upstream', 'Outputs an id of default upstream site.', {}, async (argv) => {
    console.log(config.siteUpstreamId);
    process.exit(0);
  })

  .help('h')
  .alias('h', 'help')
  .epilog('Sites-sync tool. (c) Alexey Murz Korepov <MurzNN@gmail.com>')
  ;

await myYargs.argv;

myYargs.showHelp();
