import { execSync } from "child_process";
import { dbAdapter } from "./init.js";
import { siteExecCommand } from "./siteCommands.js";
export function restoreDbFromFile(file) {
    const dbQueryCommand = dbAdapter.generateCommand('query');
    const cmd = `zcat -f ${file} | ${dbQueryCommand}`;
    // console.log(cmd); throw 123
    const result = execSync(cmd);
}
export function siteExecToFile(cmd, file) {
    const siteCmd = siteExecCommand(cmd);
    execSync(`${siteCmd} > ${file}`);
}
export function siteDbDumpToFile(file) {
    const cmd = 'yarn --silent sites-sync db-dump | gzip';
    siteExecToFile(cmd, file);
}
//# sourceMappingURL=localCommands.js.map