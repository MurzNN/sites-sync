const fs = require("fs");
const execSync = require("child_process").execSync;
const unparse = require('yargs-unparser');

function pgOptions(db, optionsAdditional) {
  let pgOptions = {
    d: db.database,
    h: db.host,
    p: db.port,
    U: db.username,
  };
  Object.keys(pgOptions).forEach((k) => (pgOptions[k] == '' || pgOptions[k] == null || pgOptions[k] == undefined) && delete pgOptions[k]);
  pgOptions = {
    ...optionsAdditional,
    ...pgOptions
  };
  return unparse(pgOptions).join(' ');
}

module.exports = {
  dumpOutput: function (db) {
    const execSync = require("child_process").execSync;
    dumpCommand = `PGPASSWORD=${db.password} pg_dump ` + pgOptions(db, { 'no-owner': '' }) + ` | grep -v -E '^(CREATE\ EXTENSION|COMMENT\ ON)' | gzip -f`;
    execSync(dumpCommand, { stdio: 'inherit' });
  },

  dumpToFile: function (db, dumpFile) {
    const execSync = require("child_process").execSync;
    fs.existsSync(dumpFile) && fs.unlinkSync(dumpFile);
    dumpCommand = `PGPASSWORD=${db.password} pg_dump ` + pgOptions(db, { 'no-owner': '' }) + ` | grep -v -E '^(CREATE\ EXTENSION|COMMENT\ ON)' | gzip -f > ${dumpFile}`;
    execSync(dumpCommand);
  },

  restoreFromFile: function (db, dumpFile) {
    restoreCommand = `zcat ${dumpFile} | PGPASSWORD=${db.password} psql ` + pgOptions(db);
    execSync(restoreCommand);
  },
  databaseClear: function (db) {
    deleteTablesQuery = `DO \\\\$\\\\$ DECLARE r RECORD;
    BEGIN
    FOR r IN(SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
    EXECUTE 'DROP TABLE ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    FOR r IN(SELECT sequence_name FROM information_schema.sequences WHERE sequence_catalog = current_database()) LOOP
    EXECUTE 'DROP SEQUENCE ' || quote_ident(r.sequence_name);
    END LOOP;
    END \\\\$\\\\$;`

    deleteTablesCommand = `echo \`cat <<EOT\n${deleteTablesQuery}\nEOT\n\` | PGPASSWORD=${db.password} psql -w ` + pgOptions(db) + ` 2>&1 | grep -v -E '(NOTICE|DETAIL):'`;
    execSync(deleteTablesCommand);
  },
};
