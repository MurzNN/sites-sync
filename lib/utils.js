const fs = require("fs");
const yaml = require("js-yaml");
const path = require('path');
const os = require('os');
const configFilename = "sites-sync.yaml";

function configInit() {
  try {
    const config = yaml.load(fs.readFileSync(configFilename, "utf8"));
    config.dumpFile =
      config.dumpDirectory + "/sites-sync_db-dump_" + config.namespace + ".gz";
    config.siteCurrent = {};
    if (config.dbUriEnv) {
      require("dotenv").config();
      config.siteCurrent.dbConnectionString = process.env[config.dbUriEnv];
    } else {
      config.siteCurrent.dbConnectionString = process.env[config.dbUri];
    }
    config.siteRemoteName = process.argv[2] ?? config.siteDefaultName;
    config.siteRemote = config.sites[config.siteRemoteName];
    return config;
  } catch (err) {
    throw new Error("Can't read and parse the config file " + configFilename + "!\n"
    + "Please lookup " + configFilename + ".example file in package folder for examples.");
  }
}
const config = configInit();

module.exports = {
  config,
  dbDumpCreate: function () {
    const { dumpToFile } = require(__dirname + "/db-mongo");
    dumpToFile(config.siteCurrent.dbConnectionString, config.dumpFile);
  },
  dbDumpDelete: function () {
    fs.unlinkSync(config.dumpFile);
  },
  dbDumpRestore: function () {
    const { restoreFromFile } = require(__dirname + "/db-mongo");
    restoreFromFile(config.siteCurrent.dbConnectionString, config.dumpFile);
  },
  dbName: function (dbConnectionString) {
    if (dbConnectionString == undefined) {
      dbConnectionString = config.siteCurrent.dbConnectionString;
    }
    const parseURL = require("url").parse;
    dbConnectionParts = parseURL(dbConnectionString);
    return dbConnectionParts["path"].substring(1);
  },
  sshCredentials: function () {
    return {
      host: config.siteRemote.host,
      username: config.siteRemote.user,
      privateKey: path.join(os.homedir(), '.ssh', 'id_rsa')
    };
  },
};
