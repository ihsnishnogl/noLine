import { runCommand } from "../core/runCommand.js";
import { printHelp } from "../ui/help.js";
import type { CliOptions, CommandName } from "../core/types.js";
import { setConfig, Language } from "../core/config.js";
import { colorize } from "../ui/colors.js";

export async function runCli(argv: string[]): Promise<void> {
  // Dil de\u011fi\u015ftirme komutu kontrol\u00fc
  if (argv[0] === "lang") {
    const newLang = argv[1] as Language;
    if (newLang === "tr" || newLang === "en") {
      await setConfig({ lang: newLang });
      const msg = newLang === "tr" ? "Dil T\u00fcrk\u00e7e olarak ayarland\u0131." : "Language set to English.";
      console.log(`\n  \u2714\ufe0f ${colorize(msg, "green")}\n`);
    } else {
      console.log(`\n  \u2716\ufe0f ${colorize("Ge\u00e7ersiz dil. / Invalid language. Use: tr | en", "red")}\n`);
    }
    return;
  }

  const parsed = parseArgs(argv);

  if (parsed.help || !parsed.command) {
    printHelp();
    return;
  }

  if (!parsed.targetPath) {
    throw new Error("A target path is required. Example: noline scan ./src");
  }

  await runCommand(parsed.command, parsed.targetPath, parsed.options);
}

function parseArgs(argv: string[]): {
  command?: CommandName;
  targetPath?: string;
  help: boolean;
  options: CliOptions;
} {
  const options: CliOptions = {
    include: [],
    exclude: [],
    yes: false,
    json: false,
    all: false,
  };

  let command: CommandName | undefined;
  let targetPath: string | undefined;
  let help = false;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--help" || token === "-h") {
      help = true;
      continue;
    }

    if (token === "--yes") {
      options.yes = true;
      continue;
    }


    if (token === "--json") {
      options.json = true;
      continue;
    }
    if (token === "--all") {
      options.all = true;
      continue;
    }
    if (token === "--include" || token === "--exclude") {
      const next = argv[index + 1];
      if (!next) {
        throw new Error(`${token} expects a comma-separated value.`);
      }
      const values = next
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      if (token === "--include") {
        options.include.push(...values);
      } else {
        options.exclude.push(...values);
      }
      index += 1;
      continue;
    }

    if (!command && isCommand(token)) {
      command = token;
      continue;
    }

    if (!targetPath) {
      targetPath = token;
      continue;
    }

    throw new Error(`Unexpected argument: ${token}`);
  }

  return { command, targetPath, help, options };
}

function isCommand(value: string): value is CommandName {
  return value === "scan" || value === "clean";
}
