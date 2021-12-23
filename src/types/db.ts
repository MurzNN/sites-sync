import { ExecSyncOptionsWithBufferEncoding } from "child_process";
import { SitesSyncConfigDbConnection } from "./config";

export type DbType = 'postgresql' | 'mongodb';

export type DbCommandType = 'query' | 'dump';


export type DbAdapterClass = {
  dbAdapter: DbAdapterInterface;
}
export type DbCustomParams = {
    dump?: string;
    query?: string;
}

export interface DbAdapterInterface {
  config: SitesSyncConfigDbConnection;
  connection: DbConnection;
  dump(execOptions?: ExecSyncOptionsWithBufferEncoding): string|void;
  query(input?: string|null , execOptions?: ExecSyncOptionsWithBufferEncoding): string|void;
  restoreFromFile(file: string): void;
  dumpToFile(file: string): void;
  clear(): void;
}

export type DbConnection = {
  type: DbType;
  name: string;
  host: string;
  port: number | null;
  username: string;
  password: string;
}

export type DbImportOptions = {
  keepFiles?: boolean;
}