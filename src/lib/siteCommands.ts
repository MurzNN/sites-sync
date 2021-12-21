import { execSync } from "child_process";
import { siteUpstream } from "./init.js";

export function siteExecCommand(cmd: string) {
  if(!siteUpstream.execTemplate) {
    throw Error('execTemplate is missing');
  }
  const siteCmd = siteUpstream.execTemplate.replace("{{COMMMANDS}}", cmd);
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

