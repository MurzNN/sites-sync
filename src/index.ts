#!/usr/bin/env -S node --loader ts-node/esm --no-warnings

import yargs from "yargs";
import { siteUpstreamId, config } from "./lib/config.js";
import { siteTerminal, siteExec } from "./lib/siteUtils.js";
import {
  doDatabaseClear,
  doDatabaseDump,
  doDatabaseQuery,
  doDatabasesBackup,
  doDatabasesPull,
  doDatabasesPush,
  doDatabasesRestore,
  doDirectoriesBackup,
  doDirectoriesRestore,
  doSiteDirectoriesPull,
  doSiteDirectoriesPush,
} from "./lib/commands.js";
import { DbImportOptions } from "./types/db.js";
import {
  backupDirectoryDeleteAll,
  getBackupDirectory,
  prepareBackupDirectory,
} from "./lib/utils.js";
import { execSync } from "child_process";
import { readFileSync } from "fs";

function getVersion() {
  const packageJson = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url)).toString()
  );
  return packageJson.version;
}

const myYargs = yargs(process.argv.slice(2))
  .scriptName("sites-sync")
  .usage("Usage: $0 <command> [options]")

  .middleware(function (argv) {
    if (!argv._[0]) return;
    const commandMain = argv._[0];
    if (config.commandHooks?.[commandMain]?.before) {
      const cmd = config.commandHooks?.[commandMain]?.before as string;
      console.log(
        `Executing "before" hook for command "${commandMain}": ${cmd}`
      );
      execSync(cmd, { stdio: "inherit" });
      console.log(`"before" hook executing finished.`);
    }
  })

  .command(
    ["pull", "p"],
    "Pull databases and directories from remote site.",
    {},
    async (argv) => {
      doDatabasesPull();
      doSiteDirectoriesPull();
      console.log(`Pull from site "${siteUpstreamId}" successfully completed.`);
      process.exit(0);
    }
  )
  .command(
    "push",
    "Push databases and directories to remote site.",
    {},
    async (argv) => {
      doDatabasesPush();
      doSiteDirectoriesPush();
      console.log(`Push to site "${siteUpstreamId}" successfully completed.`);
      process.exit(0);
    }
  )

  .command(
    ["terminal", "t"],
    "Open interactive terminal to remote site.",
    {},
    async (argv) => {
      siteTerminal();
      process.exit(0);
    }
  )
  .command(
    ["exec", "e"],
    "Execute command on remote site.",
    {},
    async (argv) => {
      const cmd = argv._[1] as string;
      siteExec(cmd);
      process.exit(0);
    }
  )

  .command(
    ["backup", "b"],
    "Make a backup of current site to backup directory (databases and directories).",
    {},
    async (argv) => {
      const backupDirectory = prepareBackupDirectory();
      doDatabasesBackup(backupDirectory);
      doDirectoriesBackup(backupDirectory);
      process.exit(0);
    }
  )
  .command(
    ["restore", "r"],
    "Restore current site from backup directory (databases and directories).",
    {},
    async (argv) => {
      const backupDirectoryName = (argv._[1] as string) ?? undefined;
      const backupDirectory = getBackupDirectory(backupDirectoryName);
      console.log(backupDirectory);
      doDatabasesRestore(backupDirectory);
      doDirectoriesRestore(backupDirectory);
      process.exit(0);
    }
  )
  .command(
    ["delete-backups"],
    "Delete all backups from backup directory",
    {},
    async (argv) => {
      backupDirectoryDeleteAll();
      process.exit(0);
    }
  )

  .command("db-dump", "Dump database to stdout.", {}, async (argv) => {
    const dbId = (argv._[1] as string) ?? Object.keys(config.databases)[0];
    doDatabaseDump(dbId);
    process.exit(0);
  })
  .command("db-query", "Execute db query from stdin.", {}, async (argv) => {
    const dbId = (argv._[1] as string) ?? Object.keys(config.databases)[0];
    doDatabaseQuery(dbId);
    process.exit(0);
  })
  .command("db-clear", "Clear current database.", {}, async (argv) => {
    const dbId = (argv._[1] as string) ?? Object.keys(config.databases)[0];
    doDatabaseClear(dbId);
    process.exit(0);
  })
  .command(
    "db-import",
    "Import database dump from stdin.",
    {},
    async (argv) => {
      const dbId = (argv._[1] as string) ?? Object.keys(config.databases)[0];
      doDatabaseClear(dbId);
      process.exit(0);
    }
  )
  .command("db-pull", "Pull database from remote site.", {}, async (argv) => {
    const dbImportOptions = {} as DbImportOptions;
    if (argv.keepFiles) {
      dbImportOptions.keepFiles = true;
    }
    doDatabasesPull(dbImportOptions);
    process.exit(0);
  })
  .command("db-push", "Push database to remote site.", {}, async (argv) => {
    const dbImportOptions = {} as DbImportOptions;
    if (argv.keepFiles) {
      dbImportOptions.keepFiles = true;
    }
    doDatabasesPush();
    process.exit(0);
  })

  .command(
    "directory-pull",
    "Pull all directories from remote site.",
    {},
    async (argv) => {
      doSiteDirectoriesPull();
      process.exit(0);
    }
  )
  .command(
    "directory-push",
    "Push all directories to remote site.",
    {},
    async (argv) => {
      doSiteDirectoriesPush();
      process.exit(0);
    }
  )

  .command("id", "Outputs an id of current site.", {}, async (argv) => {
    console.log("sleeping");
    await new Promise((f) => setTimeout(f, 2000));
    console.log(config.siteId);
    // process.exit(0);
  })
  .command(
    "upstream",
    "Outputs an id of default upstream site.",
    {},
    async (argv) => {
      console.log(config.siteUpstreamId);
      process.exit(0);
    }
  )
  .strict()
  .help("h")
  .alias("h", "help")
  .epilog(
    `Sites-sync version ${getVersion()}. (c) Alexey Murz Korepov <MurzNN@gmail.com>`
  );

const argv = await myYargs.parseAsync();

if (argv._.length == 0) {
  myYargs.showHelp();
}
