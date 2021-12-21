import { DbType } from "./db";

export type SitesSyncConfigSite = {
  execTemplate?: string;
  shellCommand?: string;
  host?: string;
  user?: string;
  path?: string;
};

export type SitesSyncConfigDbConnection = {
  uri?: string;
  type: DbType;
  name: string;
  host: string;
  port: number | null;
  username: string;
  password: string;
}

export type SitesSyncConfig = {
  siteId: string;
  siteUpstreamId: string;

  dumpLocation: string;
  tempDirectory: string;

  database: SitesSyncConfigDbConnection;
  sites: {
    [key: string]: SitesSyncConfigSite;
  }
};
