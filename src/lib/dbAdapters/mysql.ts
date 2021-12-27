import { DbAdapterInterface, DbCommandType, DbGenerateCommandOptions } from "../../types/db.js";
import dbAdapterAbstract from "./dbAdapterAbstract.js";
import { getTmpFilename } from "../utils.js";
import { unlinkSync, writeFileSync } from "fs";


export default class MysqlDbAdapter extends dbAdapterAbstract implements DbAdapterInterface {
  public configFile?: string;

  public getConfigFile(): string {
    if(!this.configFile) {
      this.configFile = getTmpFilename();
      writeFileSync(this.configFile, `[client]
user=${this.connection.username}
password=${this.connection.password}
host=${this.connection.host}
port=${this.connection.port}
`, {mode: '600'});
    }
    return this.configFile;
  }

  public generateCommand(type: DbCommandType = "query", options: DbGenerateCommandOptions = {}): string {
    enum commandType {
      "query" = "mysql",
      "dump" = "mysqldump"
    };

    const command = `${commandType[type]} --defaults-extra-file=${this.getConfigFile()} ${this.connection.dbName}`;

    return command;
  }

  public cleanup() {
    if(this.configFile) {
      unlinkSync(this.configFile);
    }
  }
}
