import { execSync } from "child_process";
import { emptyDirSync } from "fs-extra";
import { DirectoryPath, FilePath } from "../types/config.js";
import { config, siteUpstreamId } from "./config.js";
import dateFormat from "dateformat";
import { existsSync, mkdirSync, readdir, readdirSync, rmSync } from "fs";
import { siteExec } from "./siteUtils.js";

export function prepareDirectoryPath(path: string): string {
  if(!path || path == '/') {
    throw Error('Bad directory path');
  }
  if(path.slice(-1) !== '/') {
    path += '/';
  }
  return path;
}

export const getTmpFilename = function() {
  const tmpFileName = '_' + Math.random().toString(36).substring(2, 9);
  return config.tempDirectory + '/' + tmpFileName;
}

export function prepareBackupDirectory(): DirectoryPath {
  let directoryName = config.backup.nameFormat;
  const matches = /{%TIME:(?<time>[^%]+)%}/.exec(directoryName);
  if(matches?.groups?.time) {
    const date = new Date();
    directoryName = directoryName.replace(/{%TIME:([^%]+)%}/, dateFormat(date, matches.groups.time));
  }

  const backupDirectory = config.backup.directory + directoryName as DirectoryPath;
  console.log(`Creating backup directory: ${backupDirectory}`);
  if (!existsSync(backupDirectory)){
    mkdirSync(backupDirectory,{ recursive: true });
  }
  backupDirectoryCleanup();
  return backupDirectory;
}

export function getBackupDirectory(backupName?: string): DirectoryPath {
  if(!backupName) {
    backupName = execSync(`ls -1 -t ${config.backup.directory} | head -n 1`).toString().trim();
  }
  return `${config.backup.directory}${backupName}/` as DirectoryPath;
}


export function backupDirectoryCleanup(): void {
  const BackupDirectory = prepareDirectoryPath(config.backup.directory);
  if((config.backup.keepAmount ?? 0) < 1) {
    return;
  }
  // We need to use system ls, because node's readdir misses sort by date ability
  let backupsToCleanup =
    execSync(`ls -1 -tr ${config.backup.directory} | head -n -${config.backup.keepAmount}`)
    .toString()
    .trim()
    .split("\n")
    .filter(n => n);

  for (const backupToCleanup of backupsToCleanup) {
    const path = `${BackupDirectory}${backupToCleanup}`
    console.log(`Removing old backup directory: ${path}`);
    rmSync(path, { recursive: true, force: true });
  }
}

export function backupDirectoryDeleteAll(): void {
  const BackupDirectory = prepareDirectoryPath(config.backup.directory);
  if((config.backup.keepAmount ?? 0) < 1) {
    return;
  }
  // We need to use system ls, because node's readdir misses sort by date ability
  let backupsToCleanup =
    execSync(`ls -1 -tr ${config.backup.directory}`)
    .toString()
    .trim()
    .split("\n")
    .filter(n => n);

  for (const backupToCleanup of backupsToCleanup) {
    const path = `${BackupDirectory}${backupToCleanup}`
    console.log(`Removing backup directory: ${path}`);
    rmSync(path, { recursive: true, force: true });
  }
}

export function backupDirectoryToFile(path: DirectoryPath, file: FilePath) {
  const  pathPrepared = prepareDirectoryPath(path);
  const cmd = `tar -czvf ${file} -C ${pathPrepared} .`;
  execSync(cmd);
}

export function restoreDirectoryFromFile(path: DirectoryPath, file: FilePath) {
  const pathPrepared = prepareDirectoryPath(path);
  const cmd = `tar -xzf ${file} -C ${pathPrepared}`;
  emptyDirSync(pathPrepared);
  execSync(cmd);
}

export function backupFilePath(type: 'database'|'directory', id: string, directory: DirectoryPath): FilePath {
  const directoryPrepared = prepareDirectoryPath(directory);
  const extension = type == 'database' ? 'gz' : 'tar.gz';
  const path = `${directoryPrepared}${type}-${id}.${extension}` as FilePath;
  return path;
}

function getSystemUtilitiesList() {
  return {
    rsync: 'rsync --version',
    tar: 'tar --version',
    gzip: 'gzip --version',
    gunzip: 'gunzip --version',
    yarn: 'yarn --version',
    ls: 'ls --version',
    head: 'head --version',
  };
}

export function checkUtilitesAvailability(checkOnSite: boolean = false) {
  const utilites = getSystemUtilitiesList();
  const execString = Object.values(utilites).join(' && ');
  const execFunction = checkOnSite ? 'execSync' : 'siteExec'
  try {
    if(checkOnSite) {
      siteExec(execString);
    } else {
      execSync(execString);
    }
  }
  catch(e) {
    const utilitesList = Object.keys(utilites).join(', ');
    if(checkOnSite) {
      throw Error(`Site "${siteUpstreamId}" is missing one of those utilites: ${utilitesList}`);
    } else {
      throw Error(`System is missing one of those utilites: ${utilitesList}`);
    }
  }
}