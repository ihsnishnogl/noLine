import { normalizeForMatch } from "./pathUtils.js";

export function matchesAnyGlob(targetPath: string, patterns: string[]): boolean {
  if (patterns.length === 0) {
    return false;
  }

  const normalized = normalizeForMatch(targetPath);
  return patterns.some((pattern) => globToRegExp(pattern).test(normalized));
}

function globToRegExp(pattern: string): RegExp {
  const normalized = normalizeForMatch(pattern).replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const doubleStar = normalized.replace(/\*\*/g, "<<<DOUBLE>>>");
  const singleStar = doubleStar.replace(/\*/g, "[^/]*");
  const question = singleStar.replace(/\?/g, ".");
  const finalPattern = question.replace(/<<<DOUBLE>>>/g, ".*");
  return new RegExp(`^${finalPattern}$`);
}
