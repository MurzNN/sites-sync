const fs = require("fs");
const execSync = require("child_process").execSync;
const unparse = require('yargs-unparser');

function pgOptions(db) {
  let pgOptions = {
    d: db.database,
    h: db.host,
    p: db.port,
    U: db.username,
  };
  Object.keys(pgOptions).forEach((k) => (pgOptions[k] == '' || pgOptions[k] == null || pgOptions[k] == undefined) && delete pgOptions[k]);
  return unparse(pgOptions).join(' ');
}

module.exports = {
  dumpOutput: function (db) {
    const execSync = require("child_process").execSync;
    dumpCommand = `PGPASSWORD=${db.password} pg_dump ` + pgOptions(db) + ' | gzip -f';
    // console.log(dumpCommand)
    execSync(dumpCommand, { stdio: 'inherit' });
  },

  dumpToFile: function (db, dumpFile) {
    const execSync = require("child_process").execSync;
    fs.existsSync(dumpFile) && fs.unlinkSync(dumpFile);
    dumpCommand = `PGPASSWORD=${db.password} pg_dump ` + pgOptions(db) + ` | gzip -f > ${dumpFile}`;
    execSync(dumpCommand);
  },

  restoreFromFile: function (db, dumpFile) {
    restoreCommand = `zcat ${dumpFile} | psql ` + pgOptions(db);
    execSync(restoreCommand);
  },
  databaseClear: function (db) {
    deleteTablesQuery = `DO \\\\$\\\\$ DECLARE
    r RECORD;
    BEGIN
    FOR r IN(SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
    EXECUTE 'DROP TABLE ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    END \\\\$\\\\$;`

    deleteTablesCommand = `QUERY=\`cat <<EOT\n${deleteTablesQuery}\nEOT\`; echo $QUERY | psql ` + pgOptions(db);
    execSync(deleteTablesCommand);
  },
};
