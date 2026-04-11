import { useState, useMemo, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import Fuse from 'fuse.js';
import type { Listing } from '../types/listing';
import type { CATEGORIES } from '../lib/categories';
import { BADGE_CLASSES } from '../lib/categories';
import { HOME_HERO } from '../lib/home-content';
import ListingCard from './ListingCard';
import ListingListItem from './ListingListItem';

const LAYOUT_STORAGE_KEY = 'hunt-haul-directory-layout';
type LayoutView = 'grid' | 'list';

const POPULAR_TAG_LIMIT = 12;
const MD_MIN = '(min-width: 768px)';

/** For queries at least this long, prefer literal substring matches so “dunny” doesn’t rank “Sunny” via fuzzy edit distance. */
const SUBSTRING_PREF_MIN_QUERY_LEN = 4;

function listingSearchHaystack(l: Listing): string {
  return [l.name, l.description, ...l.tags, l.location ?? '', l.url].join(' ').toLowerCase();
}

interface DirectoryAppProps {
  listings:       Listing[];
  categories:     typeof CATEGORIES;
  categoryCounts: Record<string, number>;
}

function syncFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    category: params.get('category'),
    tag:      params.get('tag'),
  };
}

export default function DirectoryApp({ listings, categories, categoryCounts }: DirectoryAppProps) {
  const [searchQuery, setSearchQuery]       = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag]           = useState<string | null>(null);
  /** false = mobile-first; desktop opens in useLayoutEffect before first paint (avoids mobile drawer flash). */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [layoutView, setLayoutView] = useState<LayoutView>('grid');

  useLayoutEffect(() => {
    setSidebarOpen(window.matchMedia(MD_MIN).matches);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (stored === 'grid' || stored === 'list') setLayoutView(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, layoutView);
    } catch {
      /* ignore */
    }
  }, [layoutView]);

  useEffect(() => {
    const mq = window.matchMedia(MD_MIN);
    const onChange = () => {
      setSidebarOpen(mq.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const closeSidebarIfMobile = useCallback(() => {
    if (!window.matchMedia(MD_MIN).matches) setSidebarOpen(false);
  }, []);

  useEffect(() => {
    const read = () => {
      const { category, tag } = syncFiltersFromUrl();
      setActiveCategory(category);
      setActiveTag(tag);
    };
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(value), 250);
  };

  const pushFilterUrl = useCallback((category: string | null, tag: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (category) params.set('category', category);
    else params.delete('category');
    if (tag) params.set('tag', tag);
    else params.delete('tag');
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    history.pushState(null, '', newUrl);
  }, []);

  const handleCategoryChange = useCallback((category: string | null) => {
    setActiveCategory(category);
    closeSidebarIfMobile();
    pushFilterUrl(category, activeTag);
  }, [activeTag, closeSidebarIfMobile, pushFilterUrl]);

  const handleTagChange = useCallback((tag: string | null) => {
    setActiveTag(tag);
    closeSidebarIfMobile();
    pushFilterUrl(activeCategory, tag);
  }, [activeCategory, closeSidebarIfMobile, pushFilterUrl]);

  const handleTagToggle = useCallback((tag: string) => {
    const next = activeTag === tag ? null : tag;
    handleTagChange(next);
  }, [activeTag, handleTagChange]);

  const clearAllFilters = useCallback(() => {
    setActiveCategory(null);
    setActiveTag(null);
    setSearchQuery('');
    setDebouncedQuery('');
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    history.pushState(null, '', window.location.pathname);
  }, []);

  const popularTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of listings) {
      for (const t of l.tags) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, POPULAR_TAG_LIMIT)
      .map(([tag, count]) => ({ tag, count }));
  }, [listings]);

  const fuse = useMemo(
    () =>
      new Fuse(listings, {
        keys: [
          { name: 'name',        weight: 0.42 },
          { name: 'description', weight: 0.34 },
          { name: 'tags',        weight: 0.14 },
          { name: 'location',    weight: 0.05 },
          { name: 'url',         weight: 0.05 },
        ],
        /** Higher = fuzzier; pairs with ignoreLocation so long descriptions still surface terms like “Dunny”. */
        threshold:       0.32,
        ignoreLocation:    true,
        includeScore:      true,
        minMatchCharLength: 2,
      }),
    [listings],
  );

  const filteredListings = useMemo(() => {
    let results = listings;

    if (debouncedQuery.trim()) {
      const q        = debouncedQuery.trim();
      const needle   = q.toLowerCase();
      const ranked   = fuse.search(q);

      if (needle.length >= SUBSTRING_PREF_MIN_QUERY_LEN) {
        const withLiteral = ranked.filter(r => listingSearchHaystack(r.item).includes(needle));
        results = (withLiteral.length > 0 ? withLiteral : ranked).map(r => r.item);
      } else {
        results = ranked.map(r => r.item);
      }
    }

    if (activeCategory) {
      results = results.filter(l => l.category === activeCategory);
    }

    if (activeTag) {
      results = results.filter(l => l.tags.includes(activeTag));
    }

    return results;
  }, [debouncedQuery, activeCategory, activeTag, fuse, listings]);

  const totalCount = filteredListings.length;

  return (
    <div className="flex flex-1 w-full min-h-0 min-w-0">
      <button
        type="button"
        tabIndex={sidebarOpen ? 0 : -1}
        aria-hidden={!sidebarOpen}
        className={`
          fixed inset-0 top-16 z-40 md:hidden cursor-pointer bg-gray-900/50 dark:bg-black/60
          motion-reduce:transition-none
          transition-opacity duration-300 ease-out
          ${sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}
        `}
        aria-label="Close filters panel"
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        id="directory-filters"
        {...(!sidebarOpen ? { 'aria-hidden': true as const } : {})}
        className={`
          flex shrink-0 flex-col bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700
          motion-reduce:transition-none
          fixed z-50 left-0 top-16 bottom-0 h-[calc(100dvh-4rem)] w-64 max-w-[min(16rem,85vw)]
          transition-[transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          md:sticky md:top-16 md:z-0 md:max-w-none md:self-start md:h-[calc(100dvh-4rem)] md:max-h-[calc(100dvh-4rem)]
          md:transition-[width,transform,border-color] md:duration-200 md:ease-out
          ${sidebarOpen
            ? 'translate-x-0 border-r shadow-xl shadow-gray-900/10 dark:shadow-black/40 md:w-64 md:shadow-none'
            : '-translate-x-full border-transparent md:translate-x-0 md:w-0 md:border-r-0 md:overflow-hidden'
          }
        `}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden p-4 md:min-w-[16rem]">
            <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Categories</p>
            <nav className="flex flex-col gap-1" aria-label="Category filters">
              <button
                type="button"
                onClick={() => handleCategoryChange(null)}
                aria-current={activeCategory === null ? 'true' : undefined}
                className={`
                  cursor-pointer flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-left transition-colors
                  ${activeCategory === null
                    ? 'bg-violet-50 text-violet-700 font-semibold dark:bg-violet-950/50 dark:text-violet-300'
                    : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }
                `}
              >
                <span>All</span>
                <span className={`text-xs tabular-nums ${activeCategory === null ? 'text-violet-500 dark:text-violet-400' : 'text-gray-400 dark:text-zinc-500'}`}>
                  {listings.length}
                </span>
              </button>

              {categories.map(cat => {
                const count = categoryCounts[cat.value] ?? 0;
                const isActive = activeCategory === cat.value;
                const badgeClass =
                  BADGE_CLASSES[cat.value] ??
                  'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300';
                return (
                  <button
                    type="button"
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`
                      cursor-pointer flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-left transition-colors
                      ${isActive
                        ? 'bg-violet-50 text-violet-700 font-semibold dark:bg-violet-950/50 dark:text-violet-300'
                        : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                      }
                    `}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-xs tabular-nums px-1.5 py-0.5 rounded-full ${isActive ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/60 dark:text-violet-300' : badgeClass}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>

            {popularTags.length > 0 && (
              <>
                <div className="border-t border-gray-100 dark:border-zinc-800 mt-4 pt-4" />
                <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Popular tags</p>
                <nav className="flex flex-col gap-1" aria-label="Tag filters (toggle)">
                  {popularTags.map(({ tag, count }) => {
                    const isActive = activeTag === tag;
                    const label = isActive
                      ? `Clear tag filter “${tag}” (click again to show all listings)`
                      : `Filter by tag “${tag}” (${count} listings)`;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        aria-pressed={isActive}
                        aria-label={label}
                        className={`
                          cursor-pointer flex items-center justify-between gap-2 w-full px-3 py-2 rounded-lg text-sm text-left transition-colors
                          ${isActive
                            ? 'bg-violet-50 text-violet-700 font-semibold ring-1 ring-inset ring-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-800'
                            : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                          }
                        `}
                      >
                        <span className="truncate min-w-0" title={tag}>{tag}</span>
                        <span className="flex items-center gap-1 shrink-0">
                          {isActive && (
                            <span
                              className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-200/80 text-violet-700 dark:bg-violet-800/80 dark:text-violet-200 text-sm font-medium leading-none"
                              aria-hidden
                            >
                              ×
                            </span>
                          )}
                          <span className={`text-xs tabular-nums px-1.5 py-0.5 rounded-full ${isActive ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/60 dark:text-violet-300' : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                            {count}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </>
            )}
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col py-6 px-4 sm:px-6 lg:px-8">
        <header className="mb-5 rounded-xl border border-violet-200/70 dark:border-violet-800/50 bg-linear-to-br from-violet-50/90 via-white to-fuchsia-50/40 dark:from-violet-950/40 dark:via-zinc-900/80 dark:to-fuchsia-950/20 px-5 py-4 sm:px-6 sm:py-5 shadow-sm shadow-violet-900/5 dark:shadow-black/30">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50 text-balance">
            {HOME_HERO.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-gray-600 dark:text-zinc-400 leading-relaxed text-pretty">
            {HOME_HERO.tagline}
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={() => setSidebarOpen(o => !o)}
            aria-expanded={sidebarOpen}
            aria-controls="directory-filters"
            aria-label={sidebarOpen ? 'Hide filters panel' : 'Show filters panel'}
            className="cursor-pointer inline-flex shrink-0 items-center gap-2 px-3 py-2.5 text-sm font-medium border border-gray-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 dark:text-zinc-100"
          >
            {sidebarOpen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
            <span className="hidden sm:inline">{sidebarOpen ? 'Hide filters' : 'Show filters'}</span>
            <span className="sm:hidden">Filters</span>
            {(activeCategory || activeTag) && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-violet-600 text-white text-xs tabular-nums">
                {(activeCategory ? 1 : 0) + (activeTag ? 1 : 0)}
              </span>
            )}
          </button>

          <div className="relative flex-1 min-w-48 max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search listings..."
              aria-label="Search listings"
              className="block w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 placeholder-gray-400 dark:placeholder-zinc-500 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent"
            />
          </div>

          <div
            className="flex w-full sm:w-auto sm:shrink-0 justify-end"
            role="group"
            aria-label="Listing layout"
          >
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-zinc-600 p-0.5 bg-gray-50 dark:bg-zinc-800/80">
              <button
                type="button"
                onClick={() => setLayoutView('grid')}
                aria-pressed={layoutView === 'grid'}
                aria-label="Grid layout"
                title="Grid layout"
                className={`
                  cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors
                  ${layoutView === 'grid'
                    ? 'bg-white text-violet-700 shadow-sm dark:bg-zinc-900 dark:text-violet-300'
                    : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutView('list')}
                aria-pressed={layoutView === 'list'}
                aria-label="List layout"
                title="List layout"
                className={`
                  cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors
                  ${layoutView === 'list'
                    ? 'bg-white text-violet-700 shadow-sm dark:bg-zinc-900 dark:text-violet-300'
                    : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
                </svg>
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
            {totalCount === listings.length
              ? `${totalCount} listing${totalCount !== 1 ? 's' : ''}`
              : `${totalCount} of ${listings.length} listing${listings.length !== 1 ? 's' : ''}`
            }
            {activeCategory && (
              <span> in <strong className="text-gray-700 dark:text-zinc-200">{categories.find(c => c.value === activeCategory)?.label}</strong></span>
            )}
            {activeTag && (
              <span> tagged <strong className="text-gray-700 dark:text-zinc-200">{activeTag}</strong></span>
            )}
            {debouncedQuery && (
              <span> matching <strong className="text-gray-700 dark:text-zinc-200">"{debouncedQuery}"</strong></span>
            )}
          </p>

          {filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-5xl mb-4">🔍</span>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-zinc-200">No listings found</h2>
              <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">Try a different search, category, or tag.</p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 text-sm text-violet-600 dark:text-violet-400 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : layoutView === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
              {filteredListings.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  activeTag={activeTag}
                  onTagSelect={handleTagToggle}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredListings.map(listing => (
                <ListingListItem
                  key={listing.id}
                  listing={listing}
                  activeTag={activeTag}
                  onTagSelect={handleTagToggle}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
