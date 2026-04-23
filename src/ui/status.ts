import readline from "node:readline";
import { colorize } from "./colors.js";
import { t } from "../i18n/index.js";

const frames = ["\u280b", "\u2819", "\u2839", "\u2838", "\u283c", "\u2834", "\u2826", "\u2827", "\u2807", "\u280f"];

export function createSpinner(labelKey: string) {
  let timer: NodeJS.Timeout | undefined;
  let frameIndex = 0;
  const label = t(labelKey as any);

  return {
    start() {
      if (!process.stdout.isTTY) {
        console.log(`  ${label}...`);
        return;
      }

      timer = setInterval(() => {
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`  ${colorize(frames[frameIndex], "cyan")} ${colorize(label, "gray")}`);
        frameIndex = (frameIndex + 1) % frames.length;
      }, 80);
    },
    stop(messageKey: string, tone: "success" | "warn" | "error" = "success") {
      if (timer) {
        clearInterval(timer);
        timer = undefined;
      }
      if (process.stdout.isTTY) {
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);
      }
      const message = t(messageKey as any);
      const icon = tone === "success" ? "\u2714\ufe0f" : tone === "warn" ? "\u26a0\ufe0f" : "\u2716\ufe0f";
      const color = tone === "success" ? "green" : tone === "warn" ? "yellow" : "red";
      console.log(`  ${colorize(icon, color)} ${message}`);
    },
  };
}

export function createProgressBar(total: number, labelKey: string) {
  let current = 0;
  const label = t(labelKey as any);

  return {
    tick(currentFile?: string) {
      current += 1;
      renderBar(label, current, total, currentFile);
    },
    done() {
      if (process.stdout.isTTY) {
        process.stdout.write("\n");
      }
    },
  };
}

function renderBar(label: string, current: number, total: number, currentFile?: string): void {
  if (!process.stdout.isTTY) {
    if (current === total) {
      console.log(`  ${label}: ${current}/${total}`);
    }
    return;
  }

  const width = 30;
  const ratio = total === 0 ? 1 : current / total;
  const filledCount = Math.round(width * ratio);
  
  // Use smooth block characters for the bar
  const filled = "\u2501".repeat(filledCount);
  const empty = "\u2505".repeat(width - filledCount);
  
  const bar = colorize(filled, "cyan") + colorize(empty, "gray");
  const percent = Math.round(ratio * 100).toString().padStart(3) + "%";
  const stats = colorize(`(${current}/${total})`, "gray");
  
  // Truncate filename if it's too long
  let suffix = "";
  if (currentFile) {
    const maxFileLen = 20;
    const fileName = currentFile.length > maxFileLen ? "..." + currentFile.slice(-(maxFileLen - 3)) : currentFile;
    suffix = ` ${colorize(fileName, "gray")}`;
  }

  readline.cursorTo(process.stdout, 0);
  process.stdout.write(`  ${bar} ${colorize(percent, "bold")} ${stats}${suffix}`);
}
