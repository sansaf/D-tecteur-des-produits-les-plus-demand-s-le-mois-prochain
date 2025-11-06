import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';

type Language = 'fr' | 'en';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [translations, setTranslations] = useState<Record<Language, any> | null>(null);
  
  const getInitialLang = (): Language => {
    const storedLang = localStorage.getItem('app-lang') as Language;
    if (storedLang && ['fr', 'en'].includes(storedLang)) {
      return storedLang;
    }
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'fr' ? 'fr' : 'en'; // Default to 'en'
  };

  const [lang, setLangState] = useState<Language>(getInitialLang);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const [frResponse, enResponse] = await Promise.all([
          fetch('./locales/fr.json'),
          fetch('./locales/en.json')
        ]);
        if (!frResponse.ok || !enResponse.ok) {
            throw new Error(`Failed to load translation files: ${frResponse.statusText}, ${enResponse.statusText}`);
        }
        const [frData, enData] = await Promise.all([
          frResponse.json(),
          enResponse.json()
        ]);
        setTranslations({ fr: frData, en: enData });
      } catch (error) {
        console.error("Could not load translations:", error);
        setTranslations({ fr: {}, en: {} }); 
      }
    };
    loadTranslations();
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('app-lang', newLang);
  }, []);

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    if (!translations) {
      return ''; 
    }
    const langTranslations = translations[lang];
    const keys = key.split('.');
    let result: any = langTranslations;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        console.warn(`Translation key "${key}" not found for language "${lang}"`);
        return key;
      }
    }
    
    let translation = String(result);

    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
        });
    }
    return translation;
  }, [lang, translations]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  if (!translations) {
      return null;
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
