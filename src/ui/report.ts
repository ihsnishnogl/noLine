import type { ScanSummary } from "../core/types.js";
import { colorize } from "./colors.js";
import { t } from "../i18n/index.js";

export function printSummary(summary: ScanSummary, attemptedClean: boolean, showAll: boolean = false): void {
  const isClean = summary.mode === "clean";

  console.log("");
  const headerKey = isClean ? "summary_clean_title" : "summary_scan_title";
  
  console.log(`  ${colorize(t(headerKey as any), "bold")}`);
  console.log(`  ${colorize(summary.rootPath, "gray")}`);
  console.log("");

  const stats = [];
  if (isClean) {
    stats.push(`${colorize(summary.changedFiles.toString(), "green")} ${t("stat_cleaned")}`);
    stats.push(`${colorize(summary.totalComments.toString(), "yellow")} ${t("stat_comments_deleted")}`);
  } else {
    stats.push(`${colorize(summary.changedFiles.toString(), "green")} ${t("stat_cleanable")}`);
    stats.push(`${colorize(summary.totalComments.toString(), "yellow")} ${t("stat_comments_found")}`);
  }
  
  if (summary.riskyFiles > 0) {
    stats.push(`${colorize(summary.riskyFiles.toString(), "red")} ${t("stat_risky")}`);
  }

  console.log(`  ${stats.join(colorize(" \u2022 ", "gray"))}`);

  const entriesToFilter = summary.entries.filter((entry) => entry.changed || entry.risky);
  const entries = showAll ? entriesToFilter : entriesToFilter.slice(0, 10);

  if (entries.length > 0) {
    console.log("");
    for (const entry of entries) {
      const statusColor = entry.risky ? "red" : isClean ? "green" : "cyan";
      const path = colorize(entry.relativePath, "gray");
      const count = colorize(`(${entry.commentCount})`, "gray");
      const icon = entry.risky ? "\u26a0\ufe0f" : "\u25cf";
      
      console.log(`    ${colorize(icon, statusColor)} ${path} ${count}`);
      if (entry.reason) {
        console.log(`       ${colorize("\u21b3 " + entry.reason, "red")}`);
      }
    }
    
    if (!showAll && entriesToFilter.length > 10) {
      const moreCount = entriesToFilter.length - 10;
      console.log(`    ${colorize(`... ve ${moreCount} ${t("more_files")}`, "gray")} ${colorize("(--all)", "yellow")}`);
    }
  }
  
  console.log("");
}

export function printJsonSummary(summary: ScanSummary): void {
  console.log(JSON.stringify(summary, null, 2));
}
