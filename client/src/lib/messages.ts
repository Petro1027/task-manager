export type AppLanguage = "hu" | "en";

export type MessageKey =
  | "preferences"
  | "language"
  | "theme"
  | "hungarian"
  | "english"
  | "dark"
  | "light";

export const messages: Record<AppLanguage, Record<MessageKey, string>> = {
  hu: {
    preferences: "Beállítások",
    language: "Nyelv",
    theme: "Megjelenés",
    hungarian: "Magyar",
    english: "Angol",
    dark: "Sötét",
    light: "Világos",
  },
  en: {
    preferences: "Preferences",
    language: "Language",
    theme: "Appearance",
    hungarian: "Hungarian",
    english: "English",
    dark: "Dark",
    light: "Light",
  },
};
