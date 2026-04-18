import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import da from "./locales/da.json";
import sv from "./locales/sv.json";
import en from "./locales/en.json";
import de from "./locales/de.json";

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        da: { translation: da },
        sv: { translation: sv },
        en: { translation: en },
        de: { translation: de },
      },
      fallbackLng: "da",
      lng: "da",
      supportedLngs: ["da", "sv", "en", "de"],
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
      },
    });
}

export default i18n;
