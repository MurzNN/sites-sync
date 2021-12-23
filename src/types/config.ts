import { DbAdapterClass, DbAdapterInterface, DbCustomParams, DbType } from "./db";

export type SitesSyncConfigSite = {
  execTemplate?: string;
  shellCommand?: string;
  syncStorageTemplate?: string;
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

  storages: {
    [key: string]: string;
  }

  sites: {
    [key: string]: SitesSyncConfigSite;
  }
};
