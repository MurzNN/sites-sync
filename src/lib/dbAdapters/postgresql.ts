import { DbAdapterInterface, DbCommandType, DbGenerateCommandOptions } from "../../types/db.js";
import dbAdapterAbstract from "./dbAdapterAbstract.js";
import { getTmpFilename } from "../utils.js";
import { writeFileSync } from "fs";

export default class PostgresqlDbAdapter extends dbAdapterAbstract implements DbAdapterInterface {

  public getConfigFile(): string {
    if(!this.configFile) {
      this.configFile = getTmpFilename();
      writeFileSync(this.configFile, `${this.connection.host}:${this.connection.port}:${this.connection.dbName}:${this.connection.username}:${this.connection.password}`, {mode: '600'});
    }
    return this.configFile;
  }

  public generateCommand(type: DbCommandType = "query", options: DbGenerateCommandOptions): string {

    enum commandType {
      "query" = "psql",
      "dump" = "pg_dump"
    };

    const pgOptions = [];
    if(type == 'query' && !options.verbose) {
      pgOptions.push('--quet');
    }
    if(this.config.customParams?.[type]) {
      pgOptions.push(this.config.customParams?.[type]);
    }

    let command: string =`PGPASSFILE=${this.getConfigFile()} ${commandType[type]} ${pgOptions.join(" ")} ${this.connection.dbName}`;

    return command;
  }

}
