import 'i18next';
import type en from '../locales/en.json';

// This augments the i18next module to provide type safety for translation keys
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
    };
    // Allow some flexibility for dynamic keys while maintaining base type safety
    returnNull: false;
    returnEmptyString: false;
  }
}
