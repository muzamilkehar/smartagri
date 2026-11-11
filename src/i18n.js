import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import urTranslation from './locales/ur/translation.json';

i18n
  .use(LanguageDetector) // Detects user browser language
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      ur: { translation: urTranslation }
    },
    fallbackLng: 'en', // Default language if detected language is not available
    interpolation: {
      escapeValue: false // React already protects from XSS
    }
  });

  // Add this at the bottom of src/i18n.js
i18n.on('languageChanged', (lng) => {
    document.documentElement.dir = lng === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
});

export default i18n;