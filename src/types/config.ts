import { DbAdapterClass, DbAdapterInterface, DbCustomParams, DbType } from "./db";

export type SitesSyncConfigSite = {
  execCommand: string;
  terminalCommand: string;
  rootDirectory?: string;
  shell?: string;
};

export type SitesSyncConfigDbConnection = {
  uri: string;
  customParams?: DbCustomParams;
  adapter: DbAdapterInterface;
}

export type SitesSyncConfig = {
  siteId: string;
  siteUpstreamId: string;

  backupLocation: string;
  tempDirectory: string;

  databases: {
    [key: string]: SitesSyncConfigDbConnection;
  }

  directories: {
    [key: string]: string;
  }

  sites: {
    [key: string]: SitesSyncConfigSite;
  }
};

export type DirectoryPath = string & {__brand: 'directory'};;
export type FilePath = string & {__brand: 'file'};
