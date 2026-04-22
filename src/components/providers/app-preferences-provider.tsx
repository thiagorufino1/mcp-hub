"use client";

import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { translate, type AppLocale, type TranslationKey } from "@/lib/i18n";

const LOCALE_STORAGE_KEY = "ai-chat-locale";

type AppPreferencesContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: TranslationKey) => string;
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

function getInitialLocale(): AppLocale {
  if (typeof window === "undefined") {
    return "en";
  }

  try {
    const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
    return storedLocale === "pt-BR" || storedLocale === "en" ? storedLocale : "en";
  } catch {
    return "en";
  }
}

export function AppPreferencesProvider({ children }: PropsWithChildren) {
  const [locale, setLocale] = useState<AppLocale>(getInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Ignore storage failures.
    }
  }, [locale]);

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => translate(locale, key),
    }),
    [locale],
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);
  if (!context) {
    throw new Error("useAppPreferences must be used inside AppPreferencesProvider.");
  }
  return context;
}
