import { execSync } from "child_process";
import { siteUpstream, dbAdapter } from "./init.js";
import { siteExecCommand } from "./siteCommands.js";

export function restoreDbFromFile(file: string) {
  const dbQueryCommand = dbAdapter.generateCommand('query');
  const cmd = `zcat -f ${file} | ${dbQueryCommand}`;
  // console.log(cmd); throw 123
  const result = execSync(cmd);
}

export function siteExecToFile(cmd: string, file: string) {
  const siteCmd = siteExecCommand(cmd)
  execSync(`${siteCmd} > ${file}`);
}

export function siteDbDumpToFile(file: string) {
  const cmd = 'yarn --silent sites-sync db-dump | gzip';
  siteExecToFile(cmd, file);
}
