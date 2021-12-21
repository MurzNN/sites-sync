var _a, _b, _c, _d;
import fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import yaml from "js-yaml";
import { URL } from "url";
import dotenv from "dotenv";
import envsubst from "@tuplo/envsubst";
const configFilename = "sites-sync.yaml";
const configFileContents = fs.readFileSync(configFilename).toString();
dotenv.config();
process.env.TIMESTAMP = Date.now().toString();
const configFileContentsSubstituted = envsubst(configFileContents);
export const config = yaml.load(configFileContentsSubstituted);
if (config.database.uri) {
    const dbConnectionUrl = new URL(config.database.uri);
    config.database = Object.assign(Object.assign({}, config.database), { type: dbConnectionUrl.protocol.slice(0, -1), name: (_a = dbConnectionUrl.pathname) === null || _a === void 0 ? void 0 : _a.substring(1), host: dbConnectionUrl.host || 'localhost', port: dbConnectionUrl.port ? parseInt(dbConnectionUrl.port) : null, username: (_b = dbConnectionUrl.username) !== null && _b !== void 0 ? _b : '', password: (_c = dbConnectionUrl.password) !== null && _c !== void 0 ? _c : '' });
}
export const argv = await yargs(hideBin(process.argv))
    .alias('s', 'site')
    .alias('d', 'directory')
    .argv;
export const siteUpstreamId = (_d = argv['site']) !== null && _d !== void 0 ? _d : config.siteUpstreamId;
export const siteUpstream = config.sites[siteUpstreamId];
if (!siteUpstream && argv['site']) {
    throw Error('Upstream site is not found.');
}
const dbType = 'postgresql';
const dbClass = await import(`./db/${dbType}.js`);
export const dbAdapter = new dbClass.dbAdapterClass(config.database);
export const getDumpLocation = function () {
    var _a;
    const dumpLocation = (_a = argv['directory']) !== null && _a !== void 0 ? _a : config.dumpLocation;
    if (!dumpLocation) {
        throw Error('Dump location is not defined.');
    }
    if (!fs.existsSync(dumpLocation)) {
        fs.mkdirSync(dumpLocation, { recursive: true });
    }
    return dumpLocation;
};
export const getTmpFilename = function () {
    const tmpFileName = '_' + Math.random().toString(36).substring(2, 9);
    return config.tempDirectory + '/' + tmpFileName;
};
//# sourceMappingURL=init.js.map