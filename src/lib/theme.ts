export const THEME_STORAGE_KEY = 'hunt-haul-theme';

export type ThemePreference = 'light' | 'dark' | 'system';

export function getStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const v = localStorage.getItem(THEME_STORAGE_KEY);
  if (v === 'light' || v === 'dark' || v === 'system') return v;
  return 'system';
}

/** Sync `<html class="dark">` from stored preference + system when `system`. */
export function applyThemeClass(pref: ThemePreference) {
  const root = document.documentElement;
  const useDark =
    pref === 'dark' ||
    (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', useDark);
}
