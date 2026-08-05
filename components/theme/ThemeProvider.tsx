"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "seek-theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Runs before paint so the document never flashes the wrong theme.
 * Kept in sync with ThemeProvider below: both read the same storage key.
 *
 * **Dark is the default**, regardless of the OS setting. The product is a night
 * map, every 3D scene on the site is lit for black, and the store artwork is
 * black: dark is the version the work was designed in, so it is what a
 * first-time visitor should land on.
 *
 * A stored choice always wins. Someone who has picked light gets light on
 * every visit.
 *
 * To follow the operating system instead, replace the fallback below with
 * `window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"`.
 * Nothing else has to change.
 */
export const themeInitScript = `(function(){try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var t=s==="light"?"light":"dark";document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  // Freeze transitions for a frame so large surfaces flip cleanly instead of
  // smearing through an intermediate colour.
  root.classList.add("theme-switching");
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      root.classList.remove("theme-switching");
    });
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  /* Adopt whatever the pre-paint script decided, but only when it differs from
     the default already rendered. Setting state unconditionally in an effect
     is a cascading render on every mount for the majority case, which is a
     visitor on the default. */
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") === "light"
      ? "light"
      : "dark";
    setThemeState((prev) => (prev === current ? prev : current));
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
