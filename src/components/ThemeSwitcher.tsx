import { useCallback, useEffect, useLayoutEffect, useId, useState } from 'react';
import {
  THEME_STORAGE_KEY,
  type ThemePreference,
  applyThemeClass,
  getStoredTheme,
} from '../lib/theme';

const OPTIONS: { value: ThemePreference; label: string; title: string }[] = [
  { value: 'light', label: 'Light', title: 'Light theme' },
  { value: 'dark', label: 'Dark', title: 'Dark theme' },
  { value: 'system', label: 'Auto', title: 'Match system appearance' },
];

const btnBase = `
  relative flex-1 min-w-0 px-3 py-2 text-sm font-medium transition-colors
  focus:z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset
  focus-visible:ring-violet-500 dark:focus-visible:ring-violet-400
`;

const btnInactive = `
  text-gray-600 dark:text-zinc-400 hover:bg-gray-50/90 dark:hover:bg-zinc-700/50
`;

const btnActive = `
  bg-white dark:bg-zinc-900 text-violet-700 dark:text-violet-300
`;

export default function ThemeSwitcher() {
  const labelId = useId();
  const [pref, setPref] = useState<ThemePreference>('system');

  useLayoutEffect(() => {
    const stored = getStoredTheme();
    setPref(stored);
    applyThemeClass(stored);
  }, []);

  useEffect(() => {
    if (pref !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyThemeClass('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [pref]);

  const choose = useCallback((next: ThemePreference) => {
    setPref(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyThemeClass(next);
  }, []);

  return (
    <div className="flex flex-col gap-2 pt-2">
      <hr className="border-gray-200 dark:border-zinc-600 mb-2" />
      <p id={labelId} className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
        Appearance
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="
          inline-flex rounded-lg border border-gray-200 dark:border-zinc-600 bg-gray-100/90 dark:bg-zinc-800/90
          overflow-hidden divide-x divide-gray-200 dark:divide-zinc-600
          w-full sm:w-auto min-w-[min(100%,15rem)] shadow-sm
        "
      >
        {OPTIONS.map(({ value, label, title }) => {
          const selected = pref === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              title={title}
              onClick={() => choose(value)}
              className={`${btnBase} ${selected ? btnActive : btnInactive}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
