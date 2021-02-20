const fs = require("fs");
const execSync = require("child_process").execSync;

function dumpFileExtractDbName(db, dumpFile) {
  let output = execSync(
    `mongorestore --uri=${db.connectionString} --archive=${dumpFile} --gzip --dryRun -v=3 2>&1 | grep -Po '(?<=collections for database )([^\\s]+)'`
  );
  output = output + "";
  return output.trim();
}

module.exports = {
  dumpOutput: function (db) {
    const execSync = require("child_process").execSync;
    dumpCommand = `mongodump --uri=${db.connectionString}  --gzip --archive --quiet`;
    execSync(dumpCommand, { stdio: 'inherit' });
  },

  dumpToFile: function (db, dumpFile) {
    const execSync = require("child_process").execSync;
    fs.existsSync(dumpFile) && fs.unlinkSync(dumpFile);
    dumpCommand = `mongodump --uri=${db.connectionString}  --gzip --archive=${dumpFile}`;
    execSync(dumpCommand);
  },

  restoreFromFile: function (db, dumpFile) {
    dumpFileDbName = dumpFileExtractDbName(db, dumpFile);
    restoreCommand = `mongorestore --uri=${db.connectionString} --gzip --drop --nsFrom "${dumpFileDbName}.*" --nsTo "${db.database}.*" --gzip --archive=${dumpFile}`;
    execSync(restoreCommand);
  },
  databaseClear: function (db) {
    restoreCommand = `mongo ${db.connectionString} --eval 'db.getCollectionNames().forEach(function(c) { if (c.indexOf("system.") == -1) db[c].drop(); })'`;
    execSync(restoreCommand);
  },
};
