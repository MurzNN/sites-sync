import { execSync } from "child_process";
export class dbAdapterClass {
    constructor(connection) {
        this.connection = connection;
    }
    // function dumpFileExtractDbName(db, dumpFile) {
    //   let output = execSync(
    //     `mongorestore --uri=${db.connectionString} --archive=${dumpFile} --gzip --dryRun -v=3 2>&1 | grep -Po '(?<=collections for database )([^\\s]+)'`
    //   );
    //   output = output + "";
    //   return output.trim();
    // }
    dump() {
        const dumpCommand = `mongodump --uri=${this.connection.uri} --archive --quiet`;
        execSync(dumpCommand, { stdio: 'inherit' });
    }
    query() {
        const dumpCommand = `mongo --uri=${this.connection.uri}`;
        execSync(dumpCommand, { stdio: 'inherit' });
    }
    // restoreFromFile(dumpFile: string) {
    // dumpFileDbName = dumpFileExtractDbName(db, dumpFile);
    // restoreCommand = `mongorestore --uri=${db.connectionString} --gzip --drop --nsFrom "${dumpFileDbName}.*" --nsTo "${db.database}.*" --gzip --archive=${dumpFile}`;
    // execSync(restoreCommand);
    // }
    clear() {
        const restoreCommand = `mongo ${this.connection.uri} --eval 'db.getCollectionNames().forEach(function(c) { if (c.indexOf("system.") == -1) db[c].drop(); })'`;
        execSync(restoreCommand);
    }
}
//# sourceMappingURL=mongodb.js.map