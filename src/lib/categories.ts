export const CATEGORIES = [
  { value: 'gallery',            label: 'Galleries',          color: 'rose' },
  { value: 'store',              label: 'Stores',             color: 'emerald' },
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
  gallery:            'bg-rose-100 text-rose-700',
  store:              'bg-emerald-100 text-emerald-700',
  'online-marketplace': 'bg-blue-100 text-blue-700',
  'artist-shop':      'bg-violet-100 text-violet-700',
  'auction-house':    'bg-amber-100 text-amber-700',
  'pop-up':           'bg-cyan-100 text-cyan-700',
};
