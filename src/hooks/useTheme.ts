import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "meu-inventario:theme";

function readStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function readSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Tema claro/escuro do app. Sem preferência salva, segue o sistema
 * (`prefers-color-scheme`); ao alternar manualmente, a escolha vira explícita,
 * é aplicada via `data-theme` em `<html>` e persistida em localStorage —
 * mesmo padrão usado para o estado de sidebar recolhida em AppLayout.
 */
export function useTheme() {
  const [explicitTheme, setExplicitTheme] = useState<Theme | null>(() => readStoredTheme());
  const [systemTheme, setSystemTheme] = useState<Theme>(() => readSystemTheme());

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleChange(event: MediaQueryListEvent) {
      setSystemTheme(event.matches ? "dark" : "light");
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const theme = explicitTheme ?? systemTheme;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    try {
      if (explicitTheme) {
        window.localStorage.setItem(STORAGE_KEY, explicitTheme);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // O tema atual continua aplicado mesmo quando o armazenamento está indisponível.
    }
  }, [explicitTheme]);

  const toggleTheme = useCallback(() => {
    setExplicitTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return { theme, toggleTheme };
}
