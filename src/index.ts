#!/usr/bin/env node

import { runCli } from "./cli/runCli.js";
import { initI18n } from "./i18n/index.js";

async function start() {
  await initI18n();
  await runCli(process.argv.slice(2));
}

start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exitCode = 1;
});
