import yargsUnparse from "yargs-unparser";
import { DbAdapterInterface, DbCommandType, DbConnection, DbCustomParams, DbType } from "../../types/db.js";
import { execSync, ExecSyncOptionsWithBufferEncoding } from "child_process";

import { SitesSyncConfigDbConnection } from "../../types/config.js";
import { stdin } from "process";
import { dump } from "js-yaml";

enum commandType {
  "query" = "psql",
  "dump" = "pg_dump"
}

type GenerateCommandOptions = {
  verbose?: boolean;
}

export default class DbAdapter implements DbAdapterInterface {
  public connection: DbConnection;
  public customParams: DbCustomParams | undefined;

  constructor(public config: SitesSyncConfigDbConnection) {
    const dbConnectionUrl = new URL(config.uri);
    const dbType = dbConnectionUrl.protocol.slice(0, -1) as DbType;

    this.connection = {
      type: dbType,
      name: dbConnectionUrl.pathname?.substring(1),
      host: dbConnectionUrl.host || 'localhost',
      port: dbConnectionUrl.port ? parseInt(dbConnectionUrl.port) : null,
      username: dbConnectionUrl.username ?? '',
      password: dbConnectionUrl.password ?? '',
    }
  }

  public generateCommand(type: DbCommandType = "query", options: GenerateCommandOptions = {}) {
    let pgOptions: yargsUnparse.Arguments = {
      d: this.connection.name,
      h: this.connection.host,
      p: this.connection.port,
      U: this.connection.username,
      '_': []
    };

    if(type == 'query' && !options.verbose) {
      pgOptions.quiet =true;
    }
    const pgArguments: yargsUnparse.Arguments = {
      // Removing empty values
      ...Object.fromEntries(
        Object.entries(pgOptions).filter(([_, v]) => v != null)
      ),
      _: []
    };

    let command: string =
      `PGPASSWORD=${this.connection.password} ` +
      commandType[type] +
      " " +
      yargsUnparse(pgArguments).join(" ");

    if(this.config.customParams?.[type]) {
      command = command + ' ' + this.config.customParams[type];
    }
    return command;
  }

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
    return this.exec('dump', null, execOptions);
  }

  public query(input: string|null = null, execOptions: ExecSyncOptionsWithBufferEncoding = {}) {
    return this.exec('query', input, execOptions);
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

  }

  public dumpToFile(file: string) {
    const dbQueryCommand = this.generateCommand('dump');
    const cmd = `${dbQueryCommand} | gzip > ${file}`;
    const result = execSync(cmd);
  }

}
