import fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import yaml from "js-yaml";
import { URL } from "url";
import dotenv from "dotenv";
import envsubst from "@tuplo/envsubst";
import type {SitesSyncConfig } from "../types/config.js"
import { DbType } from "../types/db.js";

const configFilename = "sites-sync.yaml";

const configFileContents = fs.readFileSync(configFilename).toString();
dotenv.config();
process.env.TIMESTAMP = Date.now().toString();
const configFileContentsSubstituted = envsubst(configFileContents);
export const config = yaml.load(configFileContentsSubstituted) as SitesSyncConfig;

if(config.database.uri) {
  const dbConnectionUrl = new URL(config.database.uri);
  config.database = {
    ...config.database,
    type: dbConnectionUrl.protocol.slice(0, -1) as DbType,
    name: dbConnectionUrl.pathname?.substring(1),
    host: dbConnectionUrl.host || 'localhost',
    port: dbConnectionUrl.port ? parseInt(dbConnectionUrl.port) : null,
    username: dbConnectionUrl.username ?? '',
    password: dbConnectionUrl.password ?? '',
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
const dbType = 'postgresql';
const dbClass = await import(`./db/${dbType}.js`);
export const dbAdapter = new dbClass.dbAdapterClass(config.database);

export const getDumpLocation = function() {
  const dumpLocation = argv['directory'] as string ?? config.dumpLocation;
  if(!dumpLocation) {
    throw Error('Dump location is not defined.');
  }
  if (!fs.existsSync(dumpLocation)){
    fs.mkdirSync(dumpLocation,{ recursive: true });
  }
  return dumpLocation;
}

export const getTmpFilename = function() {
  const tmpFileName = '_' + Math.random().toString(36).substring(2, 9);
  return config.tempDirectory + '/' + tmpFileName;
}