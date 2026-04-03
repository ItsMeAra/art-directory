import type { Listing } from '../types/listing';

const SITE_NAME = 'Hunt & Haul';

export interface FaqEntry {
  question: string;
  answer: string;
}

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

function faqMainEntity(faq: readonly FaqEntry[]) {
  return faq.map(q => ({
    '@type':        'Question',
    name:           q.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text:    q.answer,
    },
  }));
}

/** /about — AboutPage + Person + FAQPage + breadcrumbs (FAQ copy must match on-page content). */
export function buildAboutPageJsonLd(
  site: URL,
  pageTitle: string,
  pageDescription: string,
  faq: readonly FaqEntry[],
  authorImageAbsoluteUrl: string,
  creator: { name: string; sameAs: string },
): object {
  const origin = site.origin.replace(/\/$/, '');
  const homeUrl = `${origin}/`;
  const pageUrl = `${origin}/about/`;
  const breadcrumbId = `${pageUrl}#breadcrumb`;
  const creatorId = `${pageUrl}#creator`;

  return {
    '@context': 'https://schema.org',
    '@graph':   [
      {
        '@type':         'BreadcrumbList',
        '@id':           breadcrumbId,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: homeUrl },
          { '@type': 'ListItem', position: 2, name: 'About', item: pageUrl },
        ],
      },
      {
        '@type':     'Person',
        '@id':       creatorId,
        name:        creator.name,
        url:         creator.sameAs,
        sameAs:      [creator.sameAs],
        image:       authorImageAbsoluteUrl,
      },
      {
        '@type':               'AboutPage',
        '@id':                 `${pageUrl}#webpage`,
        url:                   pageUrl,
        name:                  pageTitle,
        description:           pageDescription,
        isPartOf:              { '@id': `${origin}/#website` },
        breadcrumb:            { '@id': breadcrumbId },
        author:                { '@id': creatorId },
        inLanguage:            'en-US',
        primaryImageOfPage:    {
          '@type': 'ImageObject',
          url:     authorImageAbsoluteUrl,
        },
      },
      {
        '@type':     'FAQPage',
        '@id':       `${pageUrl}#faqpage`,
        url:         pageUrl,
        name:        `${pageTitle} — FAQ`,
        description: pageDescription,
        isPartOf:    { '@id': `${origin}/#website` },
        mainEntity:  faqMainEntity(faq),
      },
    ],
  };
}

/** Submit page: WebPage + BreadcrumbList (matches visible breadcrumbs). */
export function buildSubmitPageJsonLd(site: URL, pageDescription: string): object {
  const origin = site.origin.replace(/\/$/, '');
  const homeUrl = `${origin}/`;
  const pageUrl = `${origin}/submit/`;

  const breadcrumbId = `${pageUrl}#breadcrumb`;

  return {
    '@context': 'https://schema.org',
    '@graph':   [
      {
        '@type':       'BreadcrumbList',
        '@id':         breadcrumbId,
        itemListElement: [
          {
            '@type':    'ListItem',
            position:   1,
            name:       SITE_NAME,
            item:       homeUrl,
          },
          {
            '@type':    'ListItem',
            position:   2,
            name:       'Submit a listing',
            item:       pageUrl,
          },
        ],
      },
      {
        '@type':       'WebPage',
        '@id':         `${pageUrl}#webpage`,
        url:           pageUrl,
        name:          `Submit a listing — ${SITE_NAME}`,
        description:   pageDescription,
        isPartOf:      { '@id': `${origin}/#website` },
        breadcrumb:    { '@id': breadcrumbId },
        inLanguage:    'en-US',
      },
    ],
  };
}
