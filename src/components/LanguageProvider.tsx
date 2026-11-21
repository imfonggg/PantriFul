import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Language } from "@/data/translations";
import { accountTranslations } from "@/data/accountTranslations";

const LanguageContext = createContext({ language: "en" as Language, setLanguage: (_language: Language) => {}, t: (text: string) => text });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  const t = (text: string) => language === "en" ? text : accountTranslations[language]?.[text] ?? translations[language][text] ?? text;
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);
