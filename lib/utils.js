const fs = require("fs");
const yaml = require("js-yaml");
const path = require('path');
const os = require('os');
const configFilename = "sites-sync.yaml";
const { URL } = require("url");
const SSH2Promise = require('ssh2-promise');
const yargs = require('yargs/yargs');

const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

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

    config.siteUpstreamName = argv['site'] ?? process.env[config.siteUpstreamNameEnv] ?? config.siteUpstreamName;
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

function sshCredentials() {
  return {
    host: config.siteUpstream.host,
    username: config.siteUpstream.user,
    identity: path.join(os.homedir(), '.ssh', 'id_rsa')
  };
};


module.exports = {
  config,
  argv,
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
  sshCredentials: sshCredentials,
  sshExec: async function (command, outputToConsole = true) {
    let sshConfig = sshCredentials()
    let ssh = new SSH2Promise(sshConfig);

    await ssh.connect();
    return new Promise(async (resolve, reject) => {
      try {
        // return ssh.exec(command);
        let socket = await ssh.spawn(command);
        let output = '';
        socket.on('data', (data) => {
          if(outputToConsole) console.log(data.toString());
          output = output + data;
        });
        socket.stderr.on('data', (err) => {
          console.log('STDERR: ' + err.toString());
        })
        socket.on('close', () => {
          console.log('close')
          resolve(output);
        })

        // socket.on('finish', () => {
        //   console.log('finish')
        //   resolve(output);
        // })
      } catch (err) {
        return reject(err);
      }
    });
  },
  sshExecMulti: async function (commandsArray) {
    let sshConfig = sshCredentials()
    let ssh = new SSH2Promise(sshConfig);
    await ssh.connect();
    let output = '';
    for (command of commands) {
      output = output + await ssh.exec(command);
    }
    return output;
  },
};
