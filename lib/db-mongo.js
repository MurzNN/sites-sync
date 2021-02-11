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
    console.log(dumpCommand)
    execSync(dumpCommand);
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
    restoreCommand = `mongorestore --archive=${dbConnectionString} --gzip --drop --nsFrom "${dumpFileDbName}.*" --nsTo "${restoreDbName}.*"--uri=  --gzip --archive=${dumpFile}`;
    execSync(restoreCommand);
  },
};
