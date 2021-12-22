import yargsUnparse from "yargs-unparser";
import { dbAdapterInterface, DbCommandType } from "../../types/db.js";
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

export class dbAdapterClass implements dbAdapterInterface {

  constructor(public connection: SitesSyncConfigDbConnection) {
  }

  generateCommand(type: DbCommandType = "query", options: GenerateCommandOptions = {}) {
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

    if(this.connection.customParams?.[type]) {
      command = command + ' ' + this.connection.customParams[type];
    }
    return command;
  }

  exec(type: DbCommandType, input: string | null = null, options: ExecSyncOptionsWithBufferEncoding = {}) {
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

  dump(execOptions: ExecSyncOptionsWithBufferEncoding = {}) {
    return this.exec('dump', null, execOptions);
  }

  query(input: string|null = null, execOptions: ExecSyncOptionsWithBufferEncoding = {}) {
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

}
