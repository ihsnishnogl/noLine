import { colorize } from "./colors.js";
import { t } from "../i18n/index.js";
import { LANGUAGE_DEFINITIONS } from "../languages/definitions.js";

export function printHelp(): void {
  const divider = colorize("\u2500".repeat(50), "gray");
  
  // Desteklenen t\u00fcm uzant\u0131lar\u0131 topla
  const allExtensions = LANGUAGE_DEFINITIONS.flatMap(lang => lang.extensions).join(", ");

  console.log("");
  console.log(`  ${colorize(t("help_title"), "bold")} ${colorize("v0.1.0", "gray")}`);
  console.log(`  ${colorize(t("help_desc"), "gray")}`);
  console.log("");

  console.log(`  ${colorize(t("usage"), "cyan")}`);
  console.log(`    ${colorize("$", "gray")} noline ${colorize("<komut>", "yellow")} ${colorize("[se\u00e7enekler]", "gray")}`);
  console.log("");

  console.log(`  ${colorize(t("commands"), "cyan")}`);
  printItem("scan", t("scan_desc"));
  printItem("clean", t("clean_desc"));
  printItem("lang <tr|en>", "Dili de\u011fi\u015ftir / Change language");
  console.log("");

  console.log(`  ${colorize(t("options"), "cyan")}`);
  printItem("--include <globs>", t("include_desc"));
  printItem("--exclude <globs>", t("exclude_desc"));
  printItem("--yes", t("yes_desc"));
  printItem("--json", t("json_desc"));
  printItem("--all", t("all_desc"));
  printItem("--help, -h", t("help_opt_desc"));
  console.log("");

  console.log(`  ${colorize(t("examples"), "cyan")}`);
  console.log(`    ${colorize("$", "gray")} noline scan .`);
  console.log(`    ${colorize("$", "gray")} noline clean . --yes`);
  console.log(`    ${colorize("$", "gray")} noline lang en`);
  console.log("");

  console.log(`  ${colorize(t("security_flow"), "cyan")}`);
  console.log(`    ${colorize("1.", "green")} ${t("scanning")}`);
  console.log(`    ${colorize("2.", "green")} ${t("analyzing")}`);
  console.log(`    ${colorize("3.", "green")} ${t("write_success")}`);
  console.log("");

  console.log(`  ${divider}`);
  console.log(`  ${colorize(t("support_label"), "gray")} ${colorize(allExtensions, "gray")}`);
  console.log("");
}

function printItem(label: string, description: string): void {
  const dot = colorize("\u25ab\ufe0f", "green");
  const paddedLabel = label.padEnd(20);
  console.log(`    ${dot} ${colorize(paddedLabel, "yellow")} ${colorize(description, "gray")}`);
}
