import { config } from "./config.js"
import { dbAdapterFactory } from "./dbAdapterFactory.js";

export const dbAdapters: any = {};

for (const dbId in config.databases) {
  const dbConnection = config.databases[dbId];
  if(!dbConnection.uri) {
    throw Error(`Database ${dbId} have empty "uri"`);
  }
  dbAdapters[dbId] = await dbAdapterFactory(dbConnection);
}
