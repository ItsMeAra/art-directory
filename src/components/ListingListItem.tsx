import type { Listing } from '../types/listing';
import { CATEGORY_MAP, BADGE_CLASSES } from '../lib/categories';
import { withOutboundUtm } from '../lib/referral-url';

interface ListingListItemProps {
  listing: Listing;
  activeTag?: string | null;
  onTagSelect?: (tag: string) => void;
}

export default function ListingListItem({ listing, activeTag, onTagSelect }: ListingListItemProps) {
  const category = CATEGORY_MAP[listing.category];
  const badgeClass =
    BADGE_CLASSES[listing.category] ??
    'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-200';

  return (
    <article
      className={`
        bg-white dark:bg-zinc-900 rounded-xl border flex flex-col gap-3 p-4 sm:p-5 sm:flex-row sm:items-start sm:gap-4
        transition-all duration-200 hover:shadow-md
        ${listing.featured
          ? 'border-violet-200 shadow-sm shadow-violet-100 dark:border-violet-800 dark:shadow-violet-950/40'
          : 'border-gray-100 dark:border-zinc-800 shadow-sm'
        }
      `}
    >
      <div className="min-w-0 flex-1 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${badgeClass}`}>
            {category?.label ?? listing.category}
          </span>
          {listing.featured && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300 shrink-0">
              ★ Featured
            </span>
          )}
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-zinc-100 text-base sm:text-lg leading-snug">
            {listing.name}
          </h2>
          {listing.location && (
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{listing.location}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2 sm:line-clamp-3">
            {listing.description}
          </p>
        </div>
        {listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {listing.tags.map(tag => {
              const isActive = activeTag === tag;
              if (onTagSelect) {
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onTagSelect(tag)}
                    aria-pressed={isActive}
                    className={`
                      cursor-pointer px-2 py-0.5 rounded text-xs transition-colors text-left
                      focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:ring-offset-1 dark:focus:ring-offset-zinc-900
                      ${isActive
                        ? 'bg-violet-100 text-violet-800 font-medium dark:bg-violet-900/50 dark:text-violet-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                      }
                    `}
                  >
                    {tag}
                  </button>
                );
              }
              return (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400 rounded text-xs"
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}
      </div>
      <div className="shrink-0 sm:pt-1 sm:self-center">
        <a
          href={withOutboundUtm(listing.url)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 dark:hover:bg-violet-400 transition-colors"
        >
          Visit
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </article>
  );
}
