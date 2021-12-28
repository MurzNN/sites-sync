import { SitesSyncConfigDbConnection } from "../types/config";
import { DbAdapterClass, DbAdapterInterface, DbType } from "../types/db";

export async function dbAdapterFactory(
  dbConnection: SitesSyncConfigDbConnection
) {
  const dbConnectionUrl = new URL(dbConnection.uri);
  const dbType = dbConnectionUrl.protocol.slice(0, -1) as DbType;
  const DbAdapterFile = await import(`./dbAdapters/${dbType}.js`);
  const DbAdapter = DbAdapterFile.default;
  const dbAdapter = new DbAdapter(dbConnection);
  return dbAdapter;
}
