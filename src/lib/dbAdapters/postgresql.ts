import {
  DbAdapterInterface,
  DbCommandType,
  DbGenerateCommandOptions,
} from "../../types/db.js";
import dbAdapterAbstract from "./dbAdapterAbstract.js";
import { getTmpFilename } from "../utils.js";
import { writeFileSync } from "fs";

export default class PostgresqlDbAdapter
  extends dbAdapterAbstract
  implements DbAdapterInterface
{
  public getConfigFile(): string {
    if (!this.dbPassFile) {
      this.dbPassFile = getTmpFilename();
      writeFileSync(
        this.dbPassFile,
        `${this.connection.host ?? "localhost"}:${
          this.connection.port ?? "5432"
        }:${this.connection.dbName}:${this.connection.username ?? ""}:${
          this.connection.password ?? ""
        }`,
        { mode: "600" }
      );
    }
    return this.dbPassFile;
  }

  public generateCommand(
    type: DbCommandType = "query",
    options: DbGenerateCommandOptions = {}
  ): string {
    enum commandType {
      "query" = "psql",
      "dump" = "pg_dump",
    }

    const cmdArguments: Array<string> = [];
    if (type == "query" && !options.verbose) {
      cmdArguments.push("--quiet");
    }
    if (this.config.customParams?.[type]) {
      cmdArguments.push(this.config.customParams?.[type] ?? "");
    }

    let command: string = `PGPASSFILE=${this.getConfigFile()} ${
      commandType[type]
    } ${cmdArguments.join(" ")} -h ${this.connection.host} -U ${
      this.connection.username
    } ${this.connection.dbName}`;

    return command;
  }

  getClearDbQuery() {
    return `
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

-- Dropping all data types from database

DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())) LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END $$;
`;
  }
}
