import { useState } from "react";

/**
 * Theme system — a warm parchment "light" mode and a modern, premium "dark"
 * mode. Personalization in its own right: the reader picks the vibe, and it
 * persists. Switching only redefines the CSS design tokens, so every screen and
 * all 57 tests restyle at once.
 */

export type Theme = "light" | "dark";
const KEY = "psyche-theme";

export function loadTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "dark" || v === "light") return v;
  } catch {
    /* ignore */
  }
  // First-time visitors inherit their OS preference for a modern default.
  try {
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  } catch {
    /* ignore */
  }
  return "light";
}

export function applyTheme(t: Theme): void {
  if (typeof document !== "undefined") document.documentElement.setAttribute("data-theme", t);
}

function saveTheme(t: Theme): void {
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* ignore */
  }
  applyTheme(t);
}

const ICON: Record<Theme, string> = { light: "🌙", dark: "☀" };
const LABEL: Record<string, { light: string; dark: string }> = {
  en: { light: "Dark mode", dark: "Light mode" },
  es: { light: "Modo oscuro", dark: "Modo claro" },
  fr: { light: "Mode sombre", dark: "Mode clair" },
};

export function ThemeToggle({ locale = "en" }: { locale?: string }) {
  const [theme, setTheme] = useState<Theme>(() => loadTheme());
  const L = locale === "es" || locale === "fr" ? locale : "en";
  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    saveTheme(next);
  };
  return (
    <button className="theme-toggle" onClick={toggle} title={LABEL[L][theme]} aria-label={LABEL[L][theme]}>
      {ICON[theme]}
    </button>
  );
}
