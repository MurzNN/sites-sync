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

const commandsAliases: { [key: string]: Array<string> } = {
  pull: ["p"],
  terminal: ["t"],
  exec: ["e"],
  backup: ["b"],
  restore: ["r"],
  upstream: ["us"],
};

function getCommand(nameOrAlias: string): string {
  if (commandsAliases[nameOrAlias]) {
    return nameOrAlias;
  }
  for (const command in commandsAliases) {
    if (commandsAliases[command].indexOf(nameOrAlias) != -1) {
      return command;
    }
  }
  return nameOrAlias;
}

const myYargs = yargs(process.argv.slice(2))
  .scriptName("sites-sync")
  .usage("Usage: $0 <command> [options]")
  .options({
    site: {
      alias: "s",
      describe: "Use custom upstream site id",
      type: "string",
    },
  })
  .middleware(function (argv) {
    if (!argv._[0]) return;
    const command = getCommand(argv._[0] as string);
    if (command && config.commandHooks?.[command]?.before) {
      const cmd = config.commandHooks?.[command]?.before as string;
      console.log(`Executing "before" hook for command "${command}": ${cmd}`);
      execSync(cmd, { stdio: "inherit" });
      console.log(`"before" hook executing finished.`);
    }
  })

  .command(
    ["pull", ...(commandsAliases["pull"] ?? [])],
    "Pull databases and directories from remote site.",
    {},
    async (argv) => {
      doDatabasesPull();
      doSiteDirectoriesPull();
      console.log(`Pull from site "${siteUpstreamId}" successfully completed.`);
    }
  )
  .command(
    ["push", ...(commandsAliases["push"] ?? [])],
    "Push databases and directories to remote site.",
    {},
    async (argv) => {
      doDatabasesPush();
      doSiteDirectoriesPush();
      console.log(`Push to site "${siteUpstreamId}" successfully completed.`);
    }
  )

  .command(
    ["terminal", ...(commandsAliases["terminal"] ?? [])],
    "Open interactive terminal to remote site.",
    {},
    async (argv) => {
      siteTerminal();
    }
  )
  .command(
    ["exec <cmd>", ...(commandsAliases["exec"] ?? [])],
    "Execute command on remote site.",
    {},
    async (argv) => {
      const cmd = argv.cmd as string;
      siteExec(cmd);
    }
  )

  .command(
    ["backup", ...(commandsAliases["backup"] ?? [])],
    "Make a backup of current site to backup directory (databases and directories).",
    {},
    async (argv) => {
      const backupDirectory = prepareBackupDirectory();
      doDatabasesBackup(backupDirectory);
      doDirectoriesBackup(backupDirectory);
    }
  )
  .command(
    ["restore", ...(commandsAliases["restore"] ?? [])],
    "Restore current site from backup directory (databases and directories).",
    {},
    async (argv) => {
      const backupDirectoryName = (argv._[1] as string) ?? undefined;
      const backupDirectory = getBackupDirectory(backupDirectoryName);
      console.log(backupDirectory);
      doDatabasesRestore(backupDirectory);
      doDirectoriesRestore(backupDirectory);
    }
  )
  .command(
    ["delete-backups", ...(commandsAliases["delete-backups"] ?? [])],
    "Delete all backups from backup directory",
    {},
    async (argv) => {
      backupDirectoryDeleteAll();
    }
  )

  .command(
    ["db-dump [db-id]", ...(commandsAliases["db-dump"] ?? [])],
    "Dump database to stdout.",
    {},
    async (argv) => {
      const dbId = (argv.dbId as string) ?? Object.keys(config.databases)[0];
      doDatabaseDump(dbId);
    }
  )
  .command(
    ["db-query [db-id]", ...(commandsAliases["db-query"] ?? [])],
    "Execute db query from stdin.",
    {},
    async (argv) => {
      const dbId = (argv.dbId as string) ?? Object.keys(config.databases)[0];
      doDatabaseQuery(dbId);
    }
  )
  .command(
    ["db-clear [db-id]", ...(commandsAliases["db-clear"] ?? [])],
    "Clear current database.",
    {},
    async (argv) => {
      const dbId = (argv.dbId as string) ?? Object.keys(config.databases)[0];
      doDatabaseClear(dbId);
    }
  )
  .command(
    ["db-import [db-id]", ...(commandsAliases["db-import"] ?? [])],
    "Import database dump from stdin.",
    {},
    async (argv) => {
      const dbId = (argv.dbId as string) ?? Object.keys(config.databases)[0];
      doDatabaseClear(dbId);
    }
  )
  .command(
    ["db-pull", ...(commandsAliases["db-pull"] ?? [])],
    "Pull database from remote site.",
    {},
    async (argv) => {
      const dbImportOptions = {} as DbImportOptions;
      if (argv.keepFiles) {
        dbImportOptions.keepFiles = true;
      }
      doDatabasesPull(dbImportOptions);
    }
  )
  .command(
    ["db-push", ...(commandsAliases["db-push"] ?? [])],
    "Push database to remote site.",
    {},
    async (argv) => {
      const dbImportOptions = {} as DbImportOptions;
      if (argv.keepFiles) {
        dbImportOptions.keepFiles = true;
      }
      doDatabasesPush();
    }
  )

  .command(
    ["directory-pull", ...(commandsAliases["directory-pull"] ?? [])],
    "Pull all directories from remote site.",
    {},
    async (argv) => {
      doSiteDirectoriesPull();
    }
  )
  .command(
    ["directory-push", ...(commandsAliases["directory-push"] ?? [])],
    "Push all directories to remote site.",
    {},
    async (argv) => {
      doSiteDirectoriesPush();
    }
  )

  .command(
    ["id", ...(commandsAliases["id"] ?? [])],
    "Outputs an id of current site.",
    {},
    async (argv) => {
      console.log(config.siteId);
    }
  )
  .command(
    ["upstream", ...(commandsAliases["upstream"] ?? [])],
    "Outputs an id of default upstream site.",
    {},
    async (argv) => {
      console.log(config.siteUpstreamId);
    }
  )
  .strict()
  .help("h")
  .alias("h", "help")
  .epilog(
    `sites-sync version ${getVersion()}. (c) Alexey Murz Korepov <MurzNN@gmail.com>`
  );

const argv = await myYargs.parseAsync();

if (argv._.length == 0) {
  myYargs.showHelp();
} else {
  const command = getCommand(argv._[0] as string);
  if (command && config.commandHooks?.[command]?.after) {
    const cmd = config.commandHooks?.[command]?.after as string;
    console.log(`Executing "after" hook for command "${command}": ${cmd}`);
    execSync(cmd, { stdio: "inherit" });
    console.log(`"after" hook executing finished.`);
  }
}
