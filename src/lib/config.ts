import fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import yaml from "js-yaml";
import dotenv from "dotenv";
import envsubst from "@tuplo/envsubst";
import { SitesSyncConfig } from "../types/config.js"
import { dbAdapterFactory } from "./dbAdapterFactory.js";
import { checkUtilitesAvailability } from "./utils.js";

const configFilename = "sites-sync.yaml";

const configFileContents = fs.readFileSync(configFilename).toString();
dotenv.config();
const configFileContentsSubstituted = envsubst(configFileContents);
export const config = yaml.load(configFileContentsSubstituted) as SitesSyncConfig;

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

checkUtilitesAvailability();
