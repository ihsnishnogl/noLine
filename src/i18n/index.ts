import { translations, TranslationKey } from "./translations.js";
import { getConfig, Language } from "../core/config.js";

let currentLang: Language = "tr";

export async function initI18n(): Promise<void> {
  const config = await getConfig();
  currentLang = config.lang;
}

export function t(key: TranslationKey): string {
  const lang = currentLang;
  return translations[lang][key] || key;
}

export function getCurrentLang(): Language {
  return currentLang;
}
