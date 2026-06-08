import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { STRINGS, LOCALES, type Locale, type StringKey } from "./strings";

const KEY = "psyche.locale";

function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(KEY) as Locale | null;
    if (saved && STRINGS[saved]) return saved;
  } catch {
    /* ignore */
  }
  const nav = (typeof navigator !== "undefined" && navigator.language ? navigator.language : "en").slice(0, 2);
  return (Object.keys(STRINGS) as Locale[]).includes(nav as Locale) ? (nav as Locale) : "en";
}

interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: StringKey, fallback?: string) => string;
}

const Ctx = createContext<I18nValue>({ locale: "en", setLocale: () => {}, t: (k) => STRINGS.en[k] ?? k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  useEffect(() => {
    try { document.documentElement.lang = locale; } catch { /* ignore */ }
  }, [locale]);

  const setLocale = (l: Locale) => {
    try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
    setLocaleState(l);
  };

  const t = (key: StringKey, fallback?: string): string => STRINGS[locale][key] ?? STRINGS.en[key] ?? fallback ?? key;

  const value = useMemo<I18nValue>(() => ({ locale, setLocale, t }), [locale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(Ctx);
}

/** A compact language selector. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <label className={`lang-switch ${className}`} title={t("lang.label")}>
      <span className="lang-globe" aria-hidden="true">🌐</span>
      <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)} aria-label={t("lang.label")}>
        {LOCALES.map((l) => (
          <option key={l.id} value={l.id}>{l.label}</option>
        ))}
      </select>
    </label>
  );
}

// Re-export so callers import from one place.
export { LOCALES };
export type { Locale, StringKey };
