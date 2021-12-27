import { DbAdapterInterface, DbCommandType, DbConnection, DbCustomParams, DbType, DbGenerateCommandOptions } from "../../types/db.js";
import { execSync, ExecSyncOptionsWithBufferEncoding } from "child_process";

import { SitesSyncConfigDbConnection } from "../../types/config.js";
import { stdin } from "process";
import { dump } from "js-yaml";
import { unlinkSync } from "fs";


export default abstract class dbAdapterAbstract implements DbAdapterInterface {
  public configFile?: string;
  public connection: DbConnection;
  public customParams: DbCustomParams | undefined;


  constructor(public config: SitesSyncConfigDbConnection) {
    const dbConnectionUrl = new URL(config.uri);
    const dbType = dbConnectionUrl.protocol.slice(0, -1) as DbType;

    this.connection = {
      type: dbType,
      dbName: dbConnectionUrl.pathname?.substring(1),
      host: dbConnectionUrl.hostname || 'localhost',
      port: dbConnectionUrl.port ? parseInt(dbConnectionUrl.port) : null,
      username: dbConnectionUrl.username ?? '',
      password: dbConnectionUrl.password ?? '',
    }
  }

  public abstract generateCommand(type: DbCommandType, options?: DbGenerateCommandOptions): string;

  public exec(type: DbCommandType, input: string | null = null, options: ExecSyncOptionsWithBufferEncoding = {}) {
    if(input) {
      options.input = input;
    } else if(!options.stdio) {
      if(type == 'dump') {
        options.stdio = 'inherit';
      } else {
      options.stdio = [0, 'inherit', 'inherit'];
      }
    }

    const cmd = this.generateCommand(type);

    const result = execSync(cmd, options);
    if(result) {
      return result.toString();
    }
  }

  public dump(execOptions: ExecSyncOptionsWithBufferEncoding = {}) {
    const result = this.exec('dump', null, execOptions);
    this.cleanup();
    return result;
  }

  public query(input: string|null = null, execOptions: ExecSyncOptionsWithBufferEncoding = {}) {
    const result = this.exec('query', input, execOptions);
    this.cleanup();
    return result;
  }

  clear() {
    const dropAllTablesQuery = `
-- Dropping all tables from database

SET client_min_messages TO ERROR;
DO $$ DECLARE
r RECORD;
BEGIN
FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
END LOOP;
END $$;


-- Dropping all sequences from database

DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT relname FROM pg_class where relkind = 'S') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.relname) || ' CASCADE';
    END LOOP;
END $$;
`;

    this.query(dropAllTablesQuery);
  }

  public restoreFromFile(file: string) {
    const dbQueryCommand = this.generateCommand('query');
    const cmd = `zcat -f ${file} | ${dbQueryCommand}`;
    this.clear();
    const result = execSync(cmd);
    this.cleanup()
  }

  public dumpToFile(file: string) {
    const dbQueryCommand = this.generateCommand('dump');
    const cmd = `${dbQueryCommand} | gzip > ${file}`;
    const result = execSync(cmd);
    this.cleanup()
  }

  public cleanup() {
    if(this.configFile) {
      unlinkSync(this.configFile);
    }
    this.configFile = undefined;
  }

}
