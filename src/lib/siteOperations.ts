import { execSync } from "child_process";
import { siteUpstream } from "./init.js";

export function siteExecCommand(cmd: string) {
  if(!siteUpstream.execTemplate) {
    throw Error('execTemplate is missing');
  }
  const siteCmd = siteUpstream.execTemplate.replace(/{%COMMMANDS%}/g, cmd);
  return siteCmd;
}

export function siteExec(cmd: string, execOptions = undefined, options = undefined) {
  const result = execSync(siteExecCommand(cmd), execOptions ?? { stdio: "inherit" });
  return result;
}

export function siteShell() {
  if(!siteUpstream.shellCommand) {
    throw Error('shellCommand is missing');
  }
  const result = execSync(siteUpstream.shellCommand, { stdio: "inherit" });
  return result;
}

export function siteStorageSync(path: string) {
  if(!siteUpstream.syncStorageTemplate) {
    throw Error('syncStorageTemplate is missing for selected site');
  }
  // const cmd = siteUpstream.syncFilesCommand;
  const cmd = siteUpstream.syncStorageTemplate.replace(/{%PATH%}/g, path);
  const result = execSync(cmd, { stdio: "inherit" });
  return result;
}

