import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export type Language = "tr" | "en";

interface Config {
  lang: Language;
}

const CONFIG_PATH = path.join(os.homedir(), ".noline-config");

export async function getConfig(): Promise<Config> {
  try {
    const data = await fs.readFile(CONFIG_PATH, "utf8");
    return JSON.parse(data);
  } catch {
    // Varsay\u0131lan ayarlar
    return { lang: "tr" };
  }
}

export async function setConfig(config: Partial<Config>): Promise<void> {
  const current = await getConfig();
  const updated = { ...current, ...config };
  await fs.writeFile(CONFIG_PATH, JSON.stringify(updated, null, 2), "utf8");
}
