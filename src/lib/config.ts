import fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import yaml from "js-yaml";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import envsubst from "@tuplo/envsubst";
import { SitesSyncConfig } from "../types/config.js";
import { dbAdapterFactory } from "./dbAdapterFactory.js";
import merge from "lodash.merge";

const configFilename = "sites-sync.yaml";

const configFileContents = fs.readFileSync(configFilename).toString();
var myEnv = dotenv.config();
dotenvExpand(myEnv)

const configFileContentsSubstituted = envsubst(configFileContents);
export const config = yaml.load(
  configFileContentsSubstituted
) as SitesSyncConfig;

if (config.sites[config.siteId]) {
  config.siteCurrent = config.sites[config.siteId];
  if (config.sites[config.siteId]?.databasesOverride) {
    config.databases = merge(
      config.databases,
      config.sites[config.siteId]?.databasesOverride
    );
  }
}

for (const directoryId in config.directories) {
  if (config.directories[directoryId].slice(-1) !== "/") {
    config.directories[directoryId] += "/";
  }
}

for (const siteId in config.sites) {
  if (
    config.sites[siteId].rootDirectory &&
    config.sites[siteId].rootDirectory?.slice(-1) !== "/"
  ) {
    config.sites[siteId].rootDirectory += "/";
  }
}
export const argv = await yargs(hideBin(process.argv))
  .alias("s", "site")
  .alias("d", "directory").argv;

export const siteUpstreamId: string =
  (argv["site"] as string) ?? config.siteUpstreamId;

export const siteUpstream = config.sites[siteUpstreamId];
if (!siteUpstream && argv["site"]) {
  throw Error("Upstream site is not found.");
}

export function destructiveOperationCheck(siteId?: string) {
  const siteTocheck = siteId ? config.sites[siteId] : config.siteCurrent;
  if (siteTocheck?.disableDestructiveOperations) {
    console.error(`Destructive operations are disabled on site ${siteId}!`);
    process.exit(1);
  }
}
