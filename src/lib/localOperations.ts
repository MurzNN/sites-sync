import { execSync } from "child_process";
import { DirectoryPath, FilePath } from "../types/config";

export function backupDirectoryToFile(path: DirectoryPath, file: FilePath) {
  if(!path || path == '/' || path.slice(-1) !== '/') {
    throw Error(`Passed empty or wrong path ${path}, backup is disabled`);
  }
  const cmd = `cd ${path} && tar -czvf ${file} .`;
  execSync(cmd);
}

export function restoreDirectoryFromFile(path: DirectoryPath, file: FilePath) {
  if(!path || path == '/' || path.slice(-1) !== '/') {
    throw Error(`Passed empty or wrong path ${path}, restoring is disabled`);
  }
  const cmd = `cd ${path} && (ls -A1 | xargs rm -f) && tar -xzf ${file}`;
  execSync(cmd);
}

export function backupFilePath(type: 'database'|'directory', id: string, directory: DirectoryPath): FilePath {
  if(!directory || directory == '/' || directory.slice(-1) !== '/') {
    throw Error(`Passed empty or wrong directory ${directory}`);
  }
  const path = `${directory}${type}-${id}.tar.gz` as FilePath;
  return path;
}