const fs = require("fs");
const yaml = require("js-yaml");
const path = require('path');
const os = require('os');
const configFilename = "sites-sync.yaml";
const { URL } = require("url");

function configInit() {
  try {
    const config = yaml.load(fs.readFileSync(configFilename, "utf8"));
    config.siteCurrent = {};
    config.siteCurrent.db = {};
    if (config.dbUriEnv) {
      require("dotenv").config();
      config.siteCurrent.db.connectionString = process.env[config.dbUriEnv];
    } else {
      config.siteCurrent.db.connectionString = process.env[config.dbUri];
    }
    let dbConnectionUrl = new URL(config.siteCurrent.db.connectionString);
    config.siteCurrent.db.type = dbConnectionUrl.protocol.slice(0, -1);
    config.siteCurrent.db.database = dbConnectionUrl.pathname?.substring(1);
    config.siteCurrent.db.host = dbConnectionUrl.host || 'localhost';
    config.siteCurrent.db.port = dbConnectionUrl.port;
    config.siteCurrent.db.username = dbConnectionUrl.username;
    config.siteCurrent.db.password = dbConnectionUrl.password;

    config.siteRemoteName = process.argv[2] ?? config.siteDefaultName;
    config.siteRemote = config.sites[config.siteRemoteName];
    return config;
  } catch (err) {
    throw new Error(`Can't read and parse the config file ${configFilename}, error:
${err}
Please lookup ${configFilename}.example file in package folder for examples.`);
  }
}
const config = configInit();

module.exports = {
  config,
  dbDump: function () {
    const { dumpOutput } = require(__dirname + `/db/${config.siteCurrent.db.type}`);
    dumpOutput(config.siteCurrent.db);
  },
  dbBackup: function () {
    const { dumpToFile } = require(`./db/${config.siteCurrent.db.type}`);
    dumpToFile(config.siteCurrent.db, config.dumpFile);
  },
  dbBackupDelete: function () {
    fs.unlinkSync(config.dumpFile);
  },
  dbRestore: function () {
    const { restoreFromFile } = require(`./db/${config.siteCurrent.db.type}`);
    restoreFromFile(config.siteCurrent.db, config.dumpFile);
  },
  dbClear: function () {
    const { databaseClear } = require(`./db/${config.siteCurrent.db.type}`);
    databaseClear(config.siteCurrent.db);
  },
  sshCredentials: function () {
    return {
      host: config.siteRemote.host,
      username: config.siteRemote.user,
      privateKey: path.join(os.homedir(), '.ssh', 'id_rsa')
    };
  },
};
