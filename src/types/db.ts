import { ExecSyncOptionsWithBufferEncoding } from "child_process";
import { SitesSyncConfigDbConnection } from "./config";

export type DbType = 'postgresql' | 'mongodb';

export type DbCommandType = 'query' | 'dump';

export interface dbAdapterInterface {
  dump(execOptions: ExecSyncOptionsWithBufferEncoding): any|null,
  query(input: string|null , execOptions: ExecSyncOptionsWithBufferEncoding): any|null,
}