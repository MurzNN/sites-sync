import { statSync, unlinkSync } from "fs";
import prettyBytes from "pretty-bytes";
import { DirectoryPath, FilePath } from "../types/config.js";
import { DbImportOptions } from "../types/db.js";
import { siteUpstreamId, config, destructiveOperationCheck } from "./config.js";
import { getTmpFilename } from "./utils.js";
import {
  backupDirectoryToFile,
  backupFilePath,
  restoreDirectoryFromFile,
} from "./utils.js";
import {
  siteDbClear,
  siteDbDumpToFile,
  siteDbImportFromFile,
  siteDirectoryPull,
  siteDirectoryPush,
} from "./siteUtils.js";
import { dbAdapters } from "./dbAdapters.js";

export function doDatabaseDump(dbId: string) {
  if (!config.databases?.[dbId]) {
    throw Error(`Database with id ${dbId} not found in config`);
  }
  dbAdapters[dbId].dump();
}

export function doDatabaseQuery(dbId: string, query: string | null = null) {
  if (!config.databases?.[dbId]) {
    throw Error(`Database with id ${dbId} not found in config`);
  }
  dbAdapters[dbId].query(query);
}
export function doDatabaseClear(dbId: string) {
  destructiveOperationCheck();
  if (!config.databases?.[dbId]) {
    throw Error(`Database with id ${dbId} not found in config`);
  }
  dbAdapters[dbId].clear();
}

export function doDatabasesPull(options: DbImportOptions = {}) {
  destructiveOperationCheck();
  for (const dbId in config.databases) {
    doDatabasePull(dbId, options);
  }
}

export function doDatabasePull(dbId: string, options: DbImportOptions = {}) {
  destructiveOperationCheck();
  const dbAdapter = dbAdapters[dbId];
  const tempFile = getTmpFilename();
  console.log(
    `Dumping database "${dbId}" from remote site "${siteUpstreamId}" to temporary file ${tempFile} ...`
  );
  siteDbDumpToFile(dbId, tempFile);
  const { size } = statSync(tempFile);
  const tempFileSize = prettyBytes(size);
  console.log(
    `Remote database dump (${tempFileSize}) downloaded successfully.`
  );

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
  console.log(`Pull of database "${dbId}" to site finished.`);
}

export function doDatabasesPush(options: DbImportOptions = {}) {
  destructiveOperationCheck(siteUpstreamId);
  for (const dbId in config.databases) {
    doDatabasePush(dbId, options);
  }
}

export function doDatabasePush(dbId: string, options: DbImportOptions = {}) {
  destructiveOperationCheck(siteUpstreamId);
  const dbAdapter = dbAdapters[dbId];
  const tempFile = getTmpFilename();
  console.log(
    `Dumping local database "${dbId}" to temporary file ${tempFile} ...`
  );
  dbAdapter.dumpToFile(tempFile);
  const { size } = statSync(tempFile);
  const tempFileSize = prettyBytes(size);
  console.log(`Local database dump (${tempFileSize}) created successfully.`);

  console.log(`Clearing remote database...`);
  siteDbClear(dbId);
  console.log(`Importing dump on remote site "${siteUpstreamId}" ...`);
  siteDbImportFromFile(dbId, tempFile);
  unlinkSync(tempFile);
  console.log(`Push of database "${dbId}" finished.`);
}

export function doDatabasesBackup(backupDirectory: DirectoryPath): void {
  for (const dbId in config.databases) {
    const file = backupFilePath("database", dbId, backupDirectory);
    console.log(`Backing up database "${dbId}" to file "${file}" ...`);
    doDatabaseBackup(dbId, file);
    const { size } = statSync(file);
    const fileSize = prettyBytes(size);
    console.log(
      `Database "${dbId}" is backed up to file ${file} (${fileSize}).`
    );
  }
}

export function doDatabaseBackup(dbId: string, file: FilePath): void {
  if (!config.databases?.[dbId]) {
    throw Error(`Database with id ${dbId} not found in config`);
  }
  dbAdapters[dbId].dumpToFile(file);
}

export function doDatabasesRestore(backupDirectory: DirectoryPath): void {
  destructiveOperationCheck();
  for (const dbId in config.databases) {
    const file = backupFilePath("database", dbId, backupDirectory);
    doDatabaseRestore(dbId, file);
  }
}

export function doDatabaseRestore(dbId: string, file: FilePath): void {
  destructiveOperationCheck();
  if (!config.databases?.[dbId]) {
    throw Error(`Database with id ${dbId} not found in config`);
  }
  dbAdapters[dbId].restoreFromFile(file);
}

export function doSiteDirectoriesPull() {
  destructiveOperationCheck();
  for (const directoryId in config.directories) {
    console.log(
      `Pulling directory "${directoryId}" (${config.directories[directoryId]}) from remote site "${siteUpstreamId}" ...`
    );
    siteDirectoryPull(config.directories[directoryId]);
    console.log(`Directory "${directoryId}" pulling is finished.`);
  }
}

export function doSiteDirectoriesPush(): void {
  destructiveOperationCheck(siteUpstreamId);
  for (const directoryId in config.directories) {
    console.log(
      `Pushing directory "${directoryId}" (${config.directories[directoryId]}) to remote site "${siteUpstreamId}" ...`
    );
    siteDirectoryPush(config.directories[directoryId]);
    console.log(`Directory "${directoryId}" pushing is finished.`);
  }
}

export function doDirectoriesBackup(backupDirectory: DirectoryPath): void {
  for (const directoryId in config.directories) {
    doDirectoryBackup(directoryId, backupDirectory);
  }
}

export function doDirectoryBackup(
  directoryId: string,
  backupDirectory: DirectoryPath
): void {
  const path = config.directories?.[directoryId] as DirectoryPath;
  const file = backupFilePath("directory", directoryId, backupDirectory);
  console.log(
    `Backing up directory "${directoryId}" to archive file "${file}" ...`
  );
  backupDirectoryToFile(path, file);
  console.log(`Backup of directory "${directoryId}" is finished.`);
}

export function doDirectoriesRestore(backupDirectory: DirectoryPath): void {
  destructiveOperationCheck();
  for (const directoryId in config.directories) {
    doDirectoryRestore(directoryId, backupDirectory);
  }
}

export function doDirectoryRestore(
  directoryId: string,
  backupDirectory: DirectoryPath
): void {
  destructiveOperationCheck();
  const path = config.directories?.[directoryId] as DirectoryPath;
  const file = backupFilePath("directory", directoryId, backupDirectory);
  console.log(
    `Restoring directory "${directoryId}" from archive file "${file}" ...`
  );
  restoreDirectoryFromFile(path, file);
  console.log(`Restoration of directory "${directoryId}" is finished.`);
}
