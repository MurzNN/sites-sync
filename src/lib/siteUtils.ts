import { execSync } from "child_process";
import { siteUpstream, siteUpstreamId } from "./init.js";
import { checkUtilitesAvailability } from "./utils.js";

export function siteExecCommand(cmd: string) {
  if (!siteUpstream.execCommand) {
      throw Error(`execCommand is missing for site "${siteUpstreamId}"`);
  }
  if(siteUpstream.rootDirectory) {
    cmd = `cd ${siteUpstream.rootDirectory} && (${cmd})`;
  }
  cmd = cmd.replace(/'/g, "''");
  const siteCmd = `${siteUpstream.execCommand} -- sh -c '${cmd}'`;
  return siteCmd;
}
export function siteExec(cmd: string, execOptions = undefined, options = undefined) {
  checkUtilitesAvailability(true);
  const siteCmd = siteExecCommand(cmd)
  const result = execSync(siteCmd, execOptions ?? { stdio: "inherit" });
  return result;
}
export function siteShell() {
  execSync(siteUpstream.terminalCommand, { stdio: "inherit" });
}

export function siteExecToFile(cmd: string, file: string) {
  const siteCmd = siteExecCommand(cmd);
  execSync(`${siteCmd} > ${file}`);
}

export function siteDbImportFromFile(dbId: string, file: string) {
  const cmd = `gunzip | yarn --silent sites-sync db-query ${dbId}`;
  const siteCmd = siteExecCommand(cmd);
  execSync(`cat ${file} | ${siteCmd}`);
}

export function siteDbQuery(dbId: string) {
  const cmd = `yarn --silent sites-sync db-query ${dbId}`;
  siteExec(cmd);
}

export function siteDbQueryGunzip(dbId: string) {
  const cmd = `gunzip | yarn --silent sites-sync db-query ${dbId}`;
  siteExec(cmd);
}

export function siteDbClear(dbId: string) {
  const cmd = `yarn --silent sites-sync db-clear ${dbId}`;
  siteExec(cmd);
}

export function siteDbDumpToFile(dbId: string, file: string) {
  const cmd = `yarn --silent sites-sync db-dump ${dbId} | gzip -f`;
  siteExecToFile(cmd, file);
}



function rsyncCommand(path: string, direction: 'pull'|'push') {
  const prefix = `rsync -rlpt --blocking-io --info=progress2 --delete --rsync-path=${siteUpstream.rootDirectory ?? ''}${path} --rsh=\"${siteUpstream.execCommand}\ --"`
  return prefix + ' '
    + (direction == 'pull'
      ? `rsync: ${path}`
      : `${path} rsync:`
    );
}

export function siteIsExecutableExists(cmd: string) {
}


export function siteDirectoryPull(path: string) {
  const cmd = rsyncCommand(path, 'pull');
  execSync(cmd, { stdio: "inherit" });
}

export function siteDirectoryPush(path: string) {
  const cmd = rsyncCommand(path, 'push');
  execSync(cmd, { stdio: "inherit" });
}