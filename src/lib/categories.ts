export const CATEGORIES = [
  { value: 'gallery',            label: 'Galleries',          color: 'rose' },
  { value: 'store',              label: 'Stores',             color: 'emerald' },
  { value: 'blog',               label: 'Blogs',              color: 'indigo' },
  { value: 'online-marketplace', label: 'Online Marketplaces', color: 'blue' },
  { value: 'artist-shop',        label: 'Artist Shops',       color: 'violet' },
  { value: 'auction-house',      label: 'Auction Houses',     color: 'amber' },
  { value: 'pop-up',             label: 'Pop-Ups & Events',   color: 'cyan' },
] as const;

export type CategoryValue = typeof CATEGORIES[number]['value'];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map(c => [c.value, c])
) as Record<CategoryValue, typeof CATEGORIES[number]>;

export const BADGE_CLASSES: Record<string, string> = {
  gallery:
    'bg-rose-100 text-rose-700 dark:bg-rose-950/55 dark:text-rose-200',
  store:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/55 dark:text-emerald-200',
  blog:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/55 dark:text-indigo-200',
  'online-marketplace':
    'bg-blue-100 text-blue-700 dark:bg-blue-950/55 dark:text-blue-200',
  'artist-shop':
    'bg-violet-100 text-violet-700 dark:bg-violet-950/55 dark:text-violet-200',
  'auction-house':
    'bg-amber-100 text-amber-800 dark:bg-amber-950/55 dark:text-amber-200',
  'pop-up':
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/55 dark:text-cyan-200',
};
