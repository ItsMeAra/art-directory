import type { FaqEntry } from './schema-org';

/** Swap to `/images/about-author.jpg` (or `.webp`) after you add your photo under `public/images/`. */
export const ABOUT_AUTHOR_IMAGE = '/images/ara-illo-min.JPG';
export const ABOUT_AUTHOR_IMAGE_ALT = 'Ara — collector behind Hunt & Haul';

export const AUTHOR_LINKTREE_URL = 'https://linktr.ee/artcollectorwtf';

export const ABOUT_HERO = {
  title: 'About Hunt & Haul',
  lead:
    'A curated list of places to discover art toys, sofubi, galleries, and more.',
  paragraphs: [
    'Listings are chosen for collectors and curious newcomers alike: independent galleries, specialty retailers, artist-run stores, marketplaces, and blogs that care about the scene.',
    'This site doesn’t sell anything and we’re not paid to feature listings. It’s a living directory you can help grow: suggest a shop through our form or contribute listings on GitHub. Whether you’re hunting your first piece or adding to a shelf you’ve curated for years—happy hauling.',
  ] as const,
};

export const WHO_MADE_THIS = {
  heading: 'Who made this?',
  /** First-person blurb — edit anytime in this file. */
  paragraphs: [
    'I’m Ara (Art Collector WTF online). I collect art in many forms—prints, designer toys, sofubi, and whatever else grabs me. I co-host “Technically” Toy Talk on YouTube, write a bit about the hobby. I created Hunt & Haul because I wanted a single place to log all of the places to shop and discover art and toys.',
    'If you want more of my day-to-day collecting, shows, and links, everything lives in one place:',
  ] as const,
  linkLabel: 'Linktree — @artcollectorwtf',
};

/** Optional: used in JSON-LD Person node. */
export const AUTHOR_SCHEMA_NAME = 'Ara';

/** FAQ block (must match on-page copy for structured data). */
export const ABOUT_FAQ_ENTRIES: readonly FaqEntry[] = [
  {
    question: 'What is a designer toy?',
    answer:
      'Designer toys (often called “art toys”) are limited-run figures produced as collectibles and art objects, not mass-market kids’ toys. They’re usually created by independent artists or studios, released in small editions, and sold through galleries, specialty shops, or direct-to-fan drops. Styles range from vinyl and resin to soft vinyl (sofubi) and plush.',
  },
  {
    question: 'What is sofubi?',
    answer:
      'Sofubi (ソフビ) is Japanese soft vinyl: hollow, rotocast figures traditionally made in Japan from flexible PVC. The process and material give sofubi a distinct look and feel, and the scene is tied to kaiju, character art, and indie sculptors. Many collectors seek vintage Japanese sofubi as well as new work from contemporary makers worldwide.',
  },
  {
    question: 'What should I collect?',
    answer:
      'There is no single “right” collection—follow what you like to look at, what fits your budget, and what you’re willing to store. Some people focus on one artist or brand, one material (e.g. sofubi only), a theme (kaiju, cute, horror), or a region. Starting with pieces you genuinely enjoy beats chasing hype; scarcity and resale value are optional layers, not requirements.',
  },
  {
    question: 'How do I start collecting?',
    answer:
      'Pick a comfortable budget, follow a few artists and shops (directories like Hunt & Haul can help), and buy from reputable sources. Read edition sizes and materials, join community spaces (forums, Discord, social) to learn, and store figures away from direct sun and heat. It’s fine to start with one piece and grow slowly—collecting is a marathon, not a sprint.',
  },
  {
    question: 'What is Hunt & Haul?',
    answer:
      'Hunt & Haul is a curated directory of galleries, shops, online marketplaces, artist stores, and other places to discover art, designer toys, sofubi, and related collectibles. Listings are maintained by the project team and community contributions.',
  },
  {
    question: 'How do I suggest a new listing?',
    answer:
      'Use the Submit a listing page to send details through our form, or add a Markdown file under src/content/listings/ in the GitHub repository and open a pull request. Submissions are reviewed before they go live.',
  },
  {
    question: 'Are you affiliated with the shops and sites listed?',
    answer:
      'No. Hunt & Haul is an independent discovery resource. Being listed does not imply endorsement by the directory or by the listed businesses, unless explicitly stated.',
  },
];
