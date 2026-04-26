import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import da from "./locales/da.json";
import en from "./locales/en.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
import hu from "./locales/hu.json";

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        da: { translation: da },
        en: { translation: en },
        de: { translation: de },
        it: { translation: it },
        hu: { translation: hu },
      },
      // Per spec: missing translations fall back to English (not Danish)
      fallbackLng: "en",
      lng: "da",
      supportedLngs: ["da", "en", "de", "it", "hu"],
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
        lookupLocalStorage: "i18nextLng",
      },
      returnEmptyString: false,
    });
}

export default i18n;
