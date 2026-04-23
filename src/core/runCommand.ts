import fs from "node:fs/promises";
import path from "node:path";
import { analyzeFile } from "./analyzeFiles.js";
import { collectSupportedFiles } from "./fileScanner.js";
import type { CliOptions, CommandName, ScanSummary } from "./types.js";
import { askForConfirmation } from "../ui/prompt.js";
import { printJsonSummary, printSummary } from "../ui/report.js";
import { createProgressBar, createSpinner } from "../ui/status.js";
import { colorize } from "../ui/colors.js";
import { t } from "../i18n/index.js";

export async function runCommand(command: CommandName, targetPath: string, options: CliOptions): Promise<void> {
  const rootPath = path.resolve(targetPath);
  const scannerSpinner = createSpinner("scanning");
  scannerSpinner.start();

  const scannedFiles = await collectSupportedFiles(rootPath, {
    include: options.include,
    exclude: options.exclude,
  });

  scannerSpinner.stop(`${colorize(String(scannedFiles.length), "bold")} ${t("files_found")}`, "success");

  if (scannedFiles.length === 0) {
    console.log(`  ${colorize("\u2139\ufe0f", "cyan")} ${t("no_files")}`);
    return;
  }

  const progress = createProgressBar(scannedFiles.length, "analyzing");
  const entries = [];

  for (const file of scannedFiles) {
    const entry = await analyzeFile(file);
    entries.push(entry);
    progress.tick(file.relativePath);
  }

  progress.done();

  const summary: ScanSummary = {
    rootPath,
    mode: command,
    filesVisited: scannedFiles.length,
    supportedFiles: scannedFiles.length,
    changedFiles: entries.filter((entry) => entry.changed && !entry.risky).length,
    riskyFiles: entries.filter((entry) => entry.risky).length,
    totalComments: entries.reduce((total, entry) => total + entry.commentCount, 0),
    skippedFiles: entries.filter((entry) => entry.risky).length,
    entries,
  };

  if (command === "clean" && summary.changedFiles > 0) {
    const shouldBackup = options.yes 
      ? false 
      : await askForConfirmation(t("backup_ask"));

    if (shouldBackup) {
      const backupPath = `${rootPath}-backup`;
      const backupSpinner = createSpinner("backup_progress");
      backupSpinner.start();
      try {
        await fs.cp(rootPath, backupPath, { recursive: true, force: true });
        backupSpinner.stop(t("backup_success"), "success");
      } catch (err: any) {
        backupSpinner.stop(`${t("backup_error")}: ${err.message}`, "error");
        const proceed = await askForConfirmation(t("backup_failed_proceed"));
        if (!proceed) return;
      }
    }

    const shouldWrite = options.yes || (await askForConfirmation(t("clean_ask")));

    if (shouldWrite) {
      const writeSpinner = createSpinner("writing_files");
      writeSpinner.start();
      for (const entry of entries) {
        if (!entry.changed || entry.risky) {
          continue;
        }
        await fs.writeFile(entry.absolutePath, entry.cleanedContent, "utf8");
      }
      writeSpinner.stop(t("write_success"), "success");
    }
  }

  if (options.json) {
    printJsonSummary(summary);
    return;
  }

  printSummary(summary, command === "clean", options.all);
}
