import fs from "node:fs/promises";
import path from "node:path";
import { getLanguageForExtension } from "../languages/definitions.js";
import { stripComments } from "./commentStripper.js";
import type { FileAnalysis } from "./types.js";
import type { ScannedFile } from "./fileScanner.js";

export async function analyzeFile(file: ScannedFile): Promise<FileAnalysis> {
  const extension = path.extname(file.absolutePath);
  const language = getLanguageForExtension(extension);

  if (!language) {
    throw new Error(`Unsupported file encountered unexpectedly: ${file.relativePath}`);
  }

  const originalContent = await fs.readFile(file.absolutePath, "utf8");
  const result = stripComments(originalContent, language.syntax);

  return {
    absolutePath: file.absolutePath,
    relativePath: file.relativePath,
    languageId: language.id,
    commentCount: result.commentCount,
    changed: result.changed,
    risky: result.risky,
    reason: result.reason,
    originalContent,
    cleanedContent: result.content,
  };
}
