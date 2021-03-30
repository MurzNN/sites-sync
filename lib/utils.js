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
    config.siteCurrent.name = process.env[config.siteNameEnv];
    let dbConnectionUrl = new URL(config.siteCurrent.db.connectionString);
    config.siteCurrent.db.type = dbConnectionUrl.protocol.slice(0, -1);
    config.siteCurrent.db.database = dbConnectionUrl.pathname?.substring(1);
    config.siteCurrent.db.host = dbConnectionUrl.host || 'localhost';
    config.siteCurrent.db.port = dbConnectionUrl.port;
    config.siteCurrent.db.username = dbConnectionUrl.username;
    config.siteCurrent.db.password = dbConnectionUrl.password;

    config.siteUpstreamName = process.argv[2] ?? process.env[config.siteUpstreamNameEnv] ?? config.siteUpstreamName;
    config.siteUpstream = config.sites[config.siteUpstreamName];
    return config;
  } catch (err) {
    throw new Error(`Can't read and parse the config file ${configFilename}, error:
${err}
Please lookup ${configFilename}.example file in package folder for examples.`);
  }
}
const config = configInit();

function siteCheckProtection(site) {
  if (config.sites[site]?.protected == true) {
    throw new Error(`Site ${config.siteCurrent.name} is protected, database write operations are disabled!`);
  }
}

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
    siteCheckProtection(config.siteCurrent.name);
    const { restoreFromFile } = require(`./db/${config.siteCurrent.db.type}`);
    restoreFromFile(config.siteCurrent.db, config.dumpFile);
  },
  dbClear: function () {
    const { databaseClear } = require(`./db/${config.siteCurrent.db.type}`);
    databaseClear(config.siteCurrent.db);
  },
  sshCredentials: function () {
    return {
      host: config.siteUpstream.host,
      username: config.siteUpstream.user,
      privateKey: path.join(os.homedir(), '.ssh', 'id_rsa')
    };
  },
};
