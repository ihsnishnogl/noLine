import fs from "node:fs/promises";
import path from "node:path";
import { DEFAULT_EXCLUDED_DIRECTORIES, getLanguageForExtension } from "../languages/definitions.js";
import { matchesAnyGlob } from "../utils/glob.js";
import { toRelativePath } from "../utils/pathUtils.js";

export interface ScannedFile {
  absolutePath: string;
  relativePath: string;
  languageId: string;
}

export interface ScannerOptions {
  include: string[];
  exclude: string[];
}

export async function collectSupportedFiles(rootPath: string, options: ScannerOptions): Promise<ScannedFile[]> {
  const absoluteRoot = path.resolve(rootPath);
  const collected: ScannedFile[] = [];

  await walkDirectory(absoluteRoot, absoluteRoot, collected, options);

  return collected.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

async function walkDirectory(
  absoluteRoot: string,
  currentDirectory: string,
  collected: ScannedFile[],
  options: ScannerOptions,
): Promise<void> {
  const entries = await fs.readdir(currentDirectory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(currentDirectory, entry.name);
    const relativePath = toRelativePath(absoluteRoot, absolutePath);

    if (entry.isDirectory()) {
      if (DEFAULT_EXCLUDED_DIRECTORIES.has(entry.name) || matchesAnyGlob(relativePath, options.exclude)) {
        continue;
      }

      await walkDirectory(absoluteRoot, absolutePath, collected, options);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name);
    const language = getLanguageForExtension(extension);
    if (!language) {
      continue;
    }

    if (options.include.length > 0 && !matchesAnyGlob(relativePath, options.include)) {
      continue;
    }

    if (matchesAnyGlob(relativePath, options.exclude)) {
      continue;
    }

    collected.push({
      absolutePath,
      relativePath,
      languageId: language.id,
    });
  }
}
