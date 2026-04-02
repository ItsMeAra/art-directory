import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Fuse from 'fuse.js';
import type { Listing } from '../types/listing';
import type { CATEGORIES } from '../lib/categories';
import { BADGE_CLASSES } from '../lib/categories';
import ListingCard from './ListingCard';

interface DirectoryAppProps {
  listings:       Listing[];
  categories:     typeof CATEGORIES;
  categoryCounts: Record<string, number>;
}

export default function DirectoryApp({ listings, categories, categoryCounts }: DirectoryAppProps) {
  const [searchQuery, setSearchQuery]       = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore category from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) setActiveCategory(cat);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(value), 250);
  };

  const handleCategoryChange = useCallback((category: string | null) => {
    setActiveCategory(category);
    setShowMobileSidebar(false);
    const params = new URLSearchParams(window.location.search);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    history.pushState(null, '', newUrl);
  }, []);

  const fuse = useMemo(() => new Fuse(listings, {
    keys: [
      { name: 'name',        weight: 0.5 },
      { name: 'description', weight: 0.3 },
      { name: 'tags',        weight: 0.2 },
    ],
    threshold: 0.35,
    includeScore: true,
  }), [listings]);

  const filteredListings = useMemo(() => {
    let results = listings;

    if (debouncedQuery.trim()) {
      results = fuse.search(debouncedQuery).map(r => r.item);
    }

    if (activeCategory) {
      results = results.filter(l => l.category === activeCategory);
    }

    return results;
  }, [debouncedQuery, activeCategory, fuse, listings]);

  const totalCount = filteredListings.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Search bar */}
      <div className="mb-6 flex gap-3 items-center">
        <div className="relative flex-1 max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search listings..."
            aria-label="Search listings"
            className="block w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowMobileSidebar(s => !s)}
          className="md:hidden inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
          aria-label="Toggle filters"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
          {activeCategory && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-600 text-white text-xs">1</span>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className={`
          ${showMobileSidebar ? 'block' : 'hidden'} md:block
          w-full md:w-56 shrink-0
          md:sticky md:top-24 md:self-start
        `}>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categories</p>
            <nav className="flex flex-col gap-1" aria-label="Category filters">
              <button
                onClick={() => handleCategoryChange(null)}
                aria-current={activeCategory === null ? 'true' : undefined}
                className={`
                  flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-left transition-colors
                  ${activeCategory === null
                    ? 'bg-violet-50 text-violet-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <span>All</span>
                <span className={`text-xs tabular-nums ${activeCategory === null ? 'text-violet-500' : 'text-gray-400'}`}>
                  {listings.length}
                </span>
              </button>

              {categories.map(cat => {
                const count = categoryCounts[cat.value] ?? 0;
                const isActive = activeCategory === cat.value;
                const badgeClass = BADGE_CLASSES[cat.value] ?? 'bg-gray-100 text-gray-600';
                return (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`
                      flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-left transition-colors
                      ${isActive
                        ? 'bg-violet-50 text-violet-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-xs tabular-nums px-1.5 py-0.5 rounded-full ${isActive ? 'bg-violet-100 text-violet-600' : badgeClass}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-4">
            {totalCount === listings.length
              ? `${totalCount} listing${totalCount !== 1 ? 's' : ''}`
              : `${totalCount} of ${listings.length} listing${listings.length !== 1 ? 's' : ''}`
            }
            {activeCategory && (
              <span> in <strong className="text-gray-700">{categories.find(c => c.value === activeCategory)?.label}</strong></span>
            )}
            {debouncedQuery && (
              <span> matching <strong className="text-gray-700">"{debouncedQuery}"</strong></span>
            )}
          </p>

          {filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-5xl mb-4">🔍</span>
              <h2 className="text-lg font-semibold text-gray-700">No listings found</h2>
              <p className="text-sm text-gray-400 mt-1">Try a different search or category.</p>
              <button
                onClick={() => { handleCategoryChange(null); handleSearchChange(''); }}
                className="mt-4 text-sm text-violet-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
