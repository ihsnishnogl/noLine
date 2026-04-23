export type CommandName = "scan" | "clean";

export interface CliOptions {
  include: string[];
  exclude: string[];
  yes: boolean;
  json: boolean;
  all: boolean;
}

export interface CommentSyntax {
  kind: "line" | "line-and-block" | "block";
  line?: string;
  blockStart?: string;
  blockEnd?: string;
}

export interface LanguageDefinition {
  id: string;
  label: string;
  extensions: string[];
  syntax: CommentSyntax;
}

export interface FileAnalysis {
  absolutePath: string;
  relativePath: string;
  languageId: string;
  commentCount: number;
  changed: boolean;
  risky: boolean;
  reason?: string;
  originalContent: string;
  cleanedContent: string;
}

export interface ScanSummary {
  rootPath: string;
  mode: CommandName;
  filesVisited: number;
  supportedFiles: number;
  changedFiles: number;
  riskyFiles: number;
  totalComments: number;
  skippedFiles: number;
  entries: FileAnalysis[];
}
