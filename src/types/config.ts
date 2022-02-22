import {
  DbAdapterClass,
  DbAdapterInterface,
  DbCustomParams,
  DbType,
} from "./db";

export type SitesSyncConfigSite = {
  execCommand: string;
  terminalCommand: string;
  rootDirectory?: string;
  shell?: string;
  quoteCommands?: boolean;
  databasesOverride?: SitesSyncConfigDbConnection;
  disableDestructiveOperations?: boolean;
  commandsHooks?: {
    [key: string]: SitesSyncConfigHook;
  };
};

export type SitesSyncConfigDbConnection = {
  uri: string;
  customParams?: DbCustomParams;
  customExecutable?: DbCustomParams;
  adapter: DbAdapterInterface;
};

export type SitesSyncConfigHook = {
  before?: string;
  after?: string;
};

export type SitesSyncConfig = {
  siteId: string;
  siteUpstreamId?: string;

  backup?: {
    directory: string;
    nameFormat: string;
    keepAmount?: number;
  };
  tempDirectory?: string;

  databases?: {
    [key: string]: SitesSyncConfigDbConnection;
  };

  directories?: {
    [key: string]: string;
  };

  commandsHooks?: {
    [key: string]: SitesSyncConfigHook;
  };

  sites: {
    [key: string]: SitesSyncConfigSite;
  };
  siteCurrent?: SitesSyncConfigSite;
};

export type DirectoryPath = string & { __brand: "directory" };
export type FilePath = string & { __brand: "file" };
