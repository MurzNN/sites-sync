import fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import yaml from "js-yaml";
import dotenv from "dotenv";
import envsubst from "@tuplo/envsubst";
import { SitesSyncConfig } from "../types/config.js"
import { dbAdapterFactory } from "./dbAdapterFactory.js";

const configFilename = "sites-sync.yaml";

const getTimeHumanReadable = function() {
  const pad = function(num: number) { return ('00'+num).slice(-2) };

  const date = new Date();
  const dateString =
    date.getUTCFullYear()        + '-' +
    pad(date.getUTCMonth() + 1)  + '-' +
    pad(date.getUTCDate())       + '_' +
    pad(date.getUTCHours())      + '-' +
    pad(date.getUTCMinutes())    + '-' +
    pad(date.getUTCSeconds());
  return dateString;
}

const configFileContents = fs.readFileSync(configFilename).toString();
dotenv.config();
process.env.TIMESTAMP = Date.now().toString();
process.env.TIME = getTimeHumanReadable();
const configFileContentsSubstituted = envsubst(configFileContents);
export const config = yaml.load(configFileContentsSubstituted) as SitesSyncConfig;

for (const dbId in config.databases) {
  const dbConnection = config.databases[dbId];
  if(!dbConnection.uri) {
    throw Error(`Database ${dbId} have empty "uri"`);
  }
  config.databases[dbId].adapter = await dbAdapterFactory(dbConnection);
}

for (const directoryId in config.directories) {
  if(config.directories[directoryId].slice(-1) !== '/') {
    config.directories[directoryId] += '/';
  }
}

for (const siteId in config.sites) {
  if(config.sites[siteId].rootDirectory && config.sites[siteId].rootDirectory?.slice(-1) !== '/') {
    config.sites[siteId].rootDirectory += '/';
  }
}

export const argv = await yargs(hideBin(process.argv))
  .alias('s', 'site')
  .alias('d', 'directory')
  .argv;

export const siteUpstreamId: string = argv['site'] as string ?? config.siteUpstreamId;

export const siteUpstream = config.sites[siteUpstreamId];
if(!siteUpstream && argv['site'] ) {
  throw Error('Upstream site is not found.');
}

export const getbackupLocation = function() {
  const backupLocation = argv['directory'] as string ?? config.backupLocation;
  if(!backupLocation) {
    throw Error('Dump location is not defined.');
  }
  if (!fs.existsSync(backupLocation)){
    fs.mkdirSync(backupLocation,{ recursive: true });
  }
  return backupLocation;
}

export const getTmpFilename = function() {
  const tmpFileName = '_' + Math.random().toString(36).substring(2, 9);
  return config.tempDirectory + '/' + tmpFileName;
}