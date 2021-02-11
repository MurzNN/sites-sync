const fs = require("fs");
const execSync = require("child_process").execSync;

function dumpFileExtractDbName(dbConnectionString, dumpFile) {
  let output = execSync(
    `mongorestore --uri=${dbConnectionString} --archive=${dumpFile} --gzip --dryRun -v=3 2>&1 | grep -Po '(?<=collections for database )([^\\s]+)'`
  );
  output = output + "";
  return output.trim();
}

module.exports = {
  dumpOutput: function (dbConnectionString) {
    const execSync = require("child_process").execSync;
    dumpCommand = `mongodump --uri=${dbConnectionString}  --gzip --archive --quiet`;
    execSync(dumpCommand, { stdio: 'inherit' });
  },

  dumpToFile: function (dbConnectionString, dumpFile) {
    const execSync = require("child_process").execSync;
    fs.existsSync(dumpFile) && fs.unlinkSync(dumpFile);
    dumpCommand = `mongodump --uri=${dbConnectionString}  --gzip --archive=${dumpFile}`;
    execSync(dumpCommand);
  },

  restoreFromFile: function (dbConnectionString, dumpFile) {
    dumpFileDbName = dumpFileExtractDbName(dbConnectionString, dumpFile);
    const { dbName } = require(__dirname + "/utils");
    restoreDbName = dbName(dbConnectionString);
    restoreCommand = `mongorestore --uri=${dbConnectionString} --gzip --drop --nsFrom "${dumpFileDbName}.*" --nsTo "${restoreDbName}.*" --gzip --archive=${dumpFile}`;
    execSync(restoreCommand);
  },
  databaseClear: function (dbConnectionString) {
    restoreCommand = `mongo ${dbConnectionString} --eval 'db.getCollectionNames().forEach(function(c) { if (c.indexOf("system.") == -1) db[c].drop(); })'`;
    execSync(restoreCommand);
  },
};
