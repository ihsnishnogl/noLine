import type { LanguageDefinition } from "../core/types.js";

const cStyle = {
  kind: "line-and-block" as const,
  line: "//",
  blockStart: "/*",
  blockEnd: "*/",
};

const hashStyle = {
  kind: "line" as const,
  line: "#",
};

const htmlStyle = {
  kind: "block" as const,
  blockStart: "<!--",
  blockEnd: "-->",
};

export const DEFAULT_EXCLUDED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
]);

export const LANGUAGE_DEFINITIONS: LanguageDefinition[] = [
  {
    id: "javascript",
    label: "JavaScript / TypeScript",
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    syntax: cStyle,
  },
  {
    id: "python",
    label: "Python",
    extensions: [".py"],
    syntax: hashStyle,
  },
  {
    id: "html",
    label: "HTML",
    extensions: [".html", ".htm"],
    syntax: htmlStyle,
  },
  {
    id: "web-style",
    label: "CSS / Sass",
    extensions: [".css", ".scss", ".sass"],
    syntax: cStyle,
  },
  {
    id: "java",
    label: "Java / C family",
    extensions: [".java", ".c", ".h", ".cpp", ".cc", ".cxx", ".hpp", ".cs"],
    syntax: cStyle,
  },
  {
    id: "go",
    label: "Go",
    extensions: [".go"],
    syntax: cStyle,
  },
  {
    id: "rust",
    label: "Rust",
    extensions: [".rs"],
    syntax: cStyle,
  },
  {
    id: "php",
    label: "PHP",
    extensions: [".php"],
    syntax: cStyle,
  },
  {
    id: "ruby",
    label: "Ruby",
    extensions: [".rb"],
    syntax: hashStyle,
  },
  {
    id: "shell",
    label: "Shell",
    extensions: [".sh", ".bash"],
    syntax: hashStyle,
  },
];

export function getLanguageForExtension(extension: string): LanguageDefinition | undefined {
  return LANGUAGE_DEFINITIONS.find((definition) =>
    definition.extensions.includes(extension.toLowerCase()),
  );
}
