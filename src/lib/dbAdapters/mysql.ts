import {
  DbAdapterInterface,
  DbCommandType,
  DbGenerateCommandOptions,
} from "../../types/db.js";
import dbAdapterAbstract from "./dbAdapterAbstract.js";
import { getTmpFilename } from "../utils.js";
import { writeFileSync } from "fs";

export default class MysqlDbAdapter
  extends dbAdapterAbstract
  implements DbAdapterInterface
{
  public getDbPassFile(): string {
    if (!this.dbPassFile) {
      this.dbPassFile = getTmpFilename();
      writeFileSync(
        this.dbPassFile,
        `[client]
user=${this.connection.username}
password=${this.connection.password}
host=${this.connection.host}
port=${this.connection.port}
`,
        { mode: "600" }
      );
    }
    return this.dbPassFile;
  }

  public generateCommand(
    type: DbCommandType = "query",
    options: DbGenerateCommandOptions = {}
  ): string {
    enum binaryByType {
      "query" = "mysql",
      "dump" = "mysqldump",
    }
    const binary = this.config.customBinary?.[type] ?? binaryByType[type];

    const cmdArguments: Array<string> = [];
    if (type == "dump") {
      cmdArguments.push("--single-transaction");
    }
    const command = `${binary} --defaults-extra-file=${this.getDbPassFile()} ${cmdArguments.join(
      " "
    )} ${this.connection.dbName}`;
    return command;
  }

  public getClearDbQuery(): string {
    return `
DROP PROCEDURE IF EXISTS drop_all_tables;

DELIMITER $$
CREATE PROCEDURE drop_all_tables()
BEGIN
    DECLARE _done INT DEFAULT FALSE;
    DECLARE _tableName VARCHAR(255);
    DECLARE _cursor CURSOR FOR
        SELECT table_name
        FROM information_schema.TABLES
        WHERE table_schema = SCHEMA();
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET _done = TRUE;

    SET FOREIGN_KEY_CHECKS = 0;

    OPEN _cursor;

    REPEAT FETCH _cursor INTO _tableName;

    IF NOT _done THEN
        SET @stmt_sql = CONCAT('DROP TABLE ', _tableName);
        PREPARE stmt1 FROM @stmt_sql;
        EXECUTE stmt1;
        DEALLOCATE PREPARE stmt1;
    END IF;

    UNTIL _done END REPEAT;

    CLOSE _cursor;
    SET FOREIGN_KEY_CHECKS = 1;
END$$

DELIMITER ;

call drop_all_tables();

DROP PROCEDURE IF EXISTS drop_all_tables;
`;
  }
}
