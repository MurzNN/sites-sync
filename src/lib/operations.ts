import { ExecOptions, execSync } from "child_process";
import { statSync, unlinkSync } from "fs";
import prettyBytes from "pretty-bytes";
import { SitesSyncConfigDbConnection } from "../types/config.js";
import { DbImportOptions } from "../types/db.js";
import { siteUpstream, siteUpstreamId, config, getTmpFilename } from "./init.js";
import { restoreDbFromFile } from "./localCommands.js";
import { siteExecCommand, siteStorageSync } from "./siteOperations.js";

export function doDbDump(dbId: string) {
  if(!config.databases[dbId]) {
    throw Error(`Database with id ${dbId} not found in config`);
  }
  config.databases[dbId].adapter.dump();
}

export function doDbQuery(dbId: string, query: string|null = null) {
  if(!config.databases[dbId]) {
    throw Error(`Database with id ${dbId} not found in config`);
  }
  config.databases[dbId].adapter.query(query);

}
export function doDbClear(dbId: string) {
  if(!config.databases[dbId]) {
    throw Error(`Database with id ${dbId} not found in config`);
  }
  config.databases[dbId].adapter.clear();
}

export function doDbsImport(options: DbImportOptions = {}) {
  for (const dbId in config.databases) {
    doDbImport(dbId, options);
  }
}

export function doDbImport(dbId: string, options: DbImportOptions = {}) {
  const dbAdapter = config.databases[dbId].adapter;
  const tempFile = getTmpFilename();
  console.log(`Dumping database "${dbId}" from remote site '${siteUpstreamId}' to temporary file ${tempFile} ...`);
  siteDbDumpToFile(dbId, tempFile);
  const {size} = statSync(tempFile);
  const tempFileSize = prettyBytes(size)
  console.log(`Remote database dump (${tempFileSize}) downloaded successfully.`);

  console.log(`Clearing local database...`);
  dbAdapter.clear();

  console.log(`Importing dump locally...`);
  dbAdapter.restoreFromFile(tempFile);

  if (options.keepFiles ?? false) {
    console.log(`Skipping remove downloaded files.`);
  } else {
    console.log(`Removing downloaded files...`);
    unlinkSync(tempFile);
  }
  console.log(`Import of database "${dbId}" finished.`);
}

export function siteExecToFile(cmd: string, file: string) {
  const siteCmd = siteExecCommand(cmd)
  execSync(`${siteCmd} > ${file}`);
}

export function siteDbDumpToFile(dbId: string, file: string) {
  const cmd = `yarn --silent sites-sync db-dump ${dbId} | gzip`;
  siteExecToFile(cmd, file);
}

export function doSiteStoragesSync() {
  for (const storage in config.storages) {
    console.log(`Synchronizing storage "${storage}" (${config.storages[storage]})...`);
    siteStorageSync(config.storages[storage]);
    console.log(`Storage "${storage}" synchronization finished.`);
  }
}

