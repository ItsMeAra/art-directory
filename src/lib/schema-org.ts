import type { Listing } from '../types/listing';

const SITE_NAME = 'Hunt & Haul';

/** Avoid breaking out of `<script type="application/ld+json">` if content contains `</script>`. */
export function jsonLdToScriptContent(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function trimText(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function listingItem(listing: Listing, position: number) {
  const item: Record<string, unknown> = {
    '@type':       'Organization',
    name:          listing.name,
    url:           listing.url,
    description:   trimText(listing.description, 500),
  };
  if (listing.location) {
    item.location = {
      '@type': 'Place',
      name:    listing.location,
    };
  }
  if (listing.tags.length > 0) {
    item.keywords = listing.tags.join(', ');
  }
  return {
    '@type':  'ListItem',
    position,
    item,
  };
}

/** Homepage: WebSite + Organization + CollectionPage + ItemList (directory listings). */
export function buildHomeJsonLd(
  site: URL,
  listings: Listing[],
  pageDescription: string,
  options?: { sameAs?: string[] },
): object {
  const origin = site.origin.replace(/\/$/, '');
  const pageUrl = `${origin}/`;

  const org: Record<string, unknown> = {
    '@type':       'Organization',
    '@id':         `${origin}/#organization`,
    name:          SITE_NAME,
    url:           origin,
    description:   pageDescription,
  };
  if (options?.sameAs?.length) {
    org.sameAs = options.sameAs;
  }

  return {
    '@context': 'https://schema.org',
    '@graph':   [
      org,
      {
        '@type':           'WebSite',
        '@id':             `${origin}/#website`,
        name:              SITE_NAME,
        url:               pageUrl,
        description:       pageDescription,
        publisher:         { '@id': `${origin}/#organization` },
        inLanguage:        'en-US',
      },
      {
        '@type':           'CollectionPage',
        '@id':             `${origin}/#webpage`,
        url:               pageUrl,
        name:              SITE_NAME,
        description:       pageDescription,
        isPartOf:          { '@id': `${origin}/#website` },
        about:             {
          '@type': 'Thing',
          name:    'Art and designer toy shops, galleries, and marketplaces',
        },
        mainEntity:        { '@id': `${origin}/#directory` },
        inLanguage:        'en-US',
      },
      {
        '@type':            'ItemList',
        '@id':              `${origin}/#directory`,
        name:               `${SITE_NAME} listings`,
        description:        'Curated places to buy art, designer toys, sofubi, and related collectibles.',
        numberOfItems:      listings.length,
        itemListElement:    listings.map((l, i) => listingItem(l, i + 1)),
      },
    ],
  };
}

/** Submit page: WebPage connected to the site graph. */
export function buildSubmitPageJsonLd(site: URL, pageDescription: string): object {
  const origin = site.origin.replace(/\/$/, '');
  const pageUrl = `${origin}/submit/`;

  return {
    '@context': 'https://schema.org',
    '@graph':   [
      {
        '@type':     'WebPage',
        '@id':       `${pageUrl}#webpage`,
        url:         pageUrl,
        name:        `Submit a listing — ${SITE_NAME}`,
        description: pageDescription,
        isPartOf:    { '@id': `${origin}/#website` },
        inLanguage:  'en-US',
      },
    ],
  };
}
