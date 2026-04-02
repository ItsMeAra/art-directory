import type { Listing } from '../types/listing';
import { CATEGORY_MAP, BADGE_CLASSES } from '../lib/categories';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const category = CATEGORY_MAP[listing.category];
  const badgeClass = BADGE_CLASSES[listing.category] ?? 'bg-gray-100 text-gray-700';

  return (
    <div className={`
      bg-white rounded-xl border flex flex-col gap-3 p-5
      transition-all duration-200 hover:shadow-md
      ${listing.featured
        ? 'border-violet-200 shadow-sm shadow-violet-100'
        : 'border-gray-100 shadow-sm'
      }
    `}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${badgeClass}`}>
            {category?.label ?? listing.category}
          </span>
          {listing.featured && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-600 shrink-0">
              ★ Featured
            </span>
          )}
        </div>

      </div>

      <div className='pt-2'>
        <h2 className="font-semibold text-gray-900 text-lg leading-snug">{listing.name}</h2>
        {listing.location && (
          <span className="text-xs text-gray-400 shrink-0 pt-0.5 py-1 block">{listing.location}</span>
        )}
        <p className="text-sm text-gray-500 mt-1 line-clamp-3">{listing.description}</p>
      </div>

      {listing.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto py-2">
          {listing.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <a
        href={listing.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
      >
        Visit
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>


    </div>
  );
}
