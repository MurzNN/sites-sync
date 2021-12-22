#!/usr/bin/env -S node --loader ts-node/esm --no-warnings

import yargs from 'yargs';
import { statSync, unlinkSync } from 'fs';
import { dbAdapter, getDumpLocation, getTmpFilename, siteUpstreamId } from "./lib/init.js";
import { restoreDbFromFile, siteExecToFile, siteDbDumpToFile } from './lib/localCommands.js';
import { siteShell, siteExec } from "./lib/siteCommands.js";
import prettyBytes from 'pretty-bytes';

const myYargs = await yargs(process.argv.slice(2))
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
    .command(['import', 'i'], 'Import remote site to current (files and databases).', {}, async (argv) => {
      throw 'Not yet implemented.';
      process.exit(0)
    })
    .command(['backup', 'b'], 'Make a backup of current site to single file (files and databases).', {}, async (argv) => {
      throw 'Not yet implemented.';
      process.exit(0)
    })
    .command(['restore', 'r'], 'Restore current site from single file (files and databases).', {}, async (argv) => {
      throw 'Not yet implemented.';
      process.exit(0)
    })
    .command('db-dump', 'Dump database to output.', {}, async (argv) => {
      await dbAdapter.dump();
      process.exit(0)
    })
    .command('db-query', 'Execute db query from stdin.', {}, async (argv) => {
      await dbAdapter.query();
      process.exit(0)
    })
    .command('db-clear', 'Clear current database and fill by SQL commands from stdin.', {}, async (argv) => {
      await dbAdapter.clear();
      process.exit(0)
    })
    .command('db-import', 'Import database from remote site.', {}, async (argv) => {
      const tempFile = getTmpFilename();
      console.log(`Dumping database from remote site '${siteUpstreamId}' to temporary file ${tempFile} ...`);
      siteDbDumpToFile(tempFile);
      const {size} = statSync(tempFile);
      const tempFileSize = prettyBytes(size)
      console.log(`Remote database dump (${tempFileSize}) downloaded successfully.`);
      console.log(`Clearing local database...`);
      await dbAdapter.clear();
      console.log(`Importing dump locally...`);
      restoreDbFromFile(tempFile);
      unlinkSync(tempFile);
      console.log(`Database import finished successfully.`);
      process.exit(0);
    })
    // .showHelp()
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2019')
    ;

const argv = await myYargs.argv;

myYargs.showHelp();
