import path from "node:path";

export function normalizeForMatch(value: string): string {
  return value.replace(/\\/g, "/");
}

export function toRelativePath(rootPath: string, absolutePath: string): string {
  return normalizeForMatch(path.relative(rootPath, absolutePath));
}
