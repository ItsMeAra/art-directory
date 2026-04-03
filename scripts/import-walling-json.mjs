import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const jsonPath = join(root, 'shop-for-art-and-toys.json');
const listingsDir = join(root, 'src/content/listings');

/** Prefer these display names over parsed Open Graph titles. */
const DISPLAY_NAME = {
  'sofvi.tokyo': 'Sofvi Tokyo',
  'damnfineprint.com': 'Damn Fine Print',
  'thepeoplesprintshop.com': "The People's Print Shop",
  'verticalgallery.com': 'Vertical Gallery',
  'lastgallery.myshopify.com': 'LAST Gallery',
  'outregallery.com': 'Outré Gallery',
  'graffitiprints.com': 'Graffiti Prints',
  'compoundeditions.com': 'Compound Editions',
  'artelli-meta.com': 'Artelli',
  'madebymutant.com': 'Made By Mutant',
  'toronto-collective.com': 'The Toronto Collective',
  'plasticempire.com': 'Plastic Empire',
  'bubblewrapptoys.com': 'Bubble Wrapp Toys',
  'uvdtoys.com': 'UVD Toys',
  'museumofgraffiti.com': 'Museum of Graffiti',
  'shop.thewynwoodwalls.com': 'Wynwood Walls Shop',
  'dke-toys.myshopify.com': 'DKE Toys',
  'thetoystimeforgot.com': 'The Toys Time Forgot',
  'standardxfuture.com': 'STANDARD X FUTURE',
  'apportfolioshop.com': 'APPortfolio Shop',
  '3whitedots.com': '3 White Dots',
  '1xrun.com': '1XRUN',
  'allstarpresschicago.com': 'All Star Press',
  'superwowgallery.com': 'Superwow Gallery',
  'stupidkrap.com': 'Stupid Krap',
  'shop.thinkspaceprojects.com': 'Thinkspace Editions',
  'shop.abvatl.com': 'ABV Gallery',
  'flatcolor.com': 'Flatcolor Gallery',
  'supersonicart.shop': 'Supersonic Art Shop',
  'clutter.co': 'Clutter',
  'dope.gallery': 'Dope! Gallery',
  'houseofroulx.com': 'House of Roulx',
  'viciousfun.com': 'Vicious Fun',
  'toyartgallery.com': 'Toy Art Gallery',
  'monsterpatroltoys.com': 'Monster Patrol Toys',
  'thefuncorner.bigcartel.com': 'The Fun Corner',
  'store.unboxindustries.info': 'Unbox Industries',
  'qpopshop.com': 'Q Pop Shop',
  'order.mandarake.co.jp': 'Mandarake',
  'ko-reko-re.com': 'Ko-Re Ko-Re',
  'sunnystudio.store': 'Sunny Studio Store',
  'takashiyoshizaka.stores.jp': 'Takashi Yoshizaka',
  'rotofugi.com': 'Rotofugi',
  'flexxlex.co.uk': 'Flexx Lex',
  'ddtstore.com': 'DDT Store',
  'munkyking.com': 'Munky King',
  'mintyfresh.eu': 'Mintyfresh',
  'wootbear.com': 'Woot Bear',
  'popcultcha.com.au': 'Popcultcha',
  '3dretro.com': '3D Retro',
  'pobber.bigcartel.com': 'Pobber',
  'heavycream.ltd': 'Heavy Cream',
  'hunttokyo.com': 'Hunt Tokyo',
  'flabslab.bigcartel.com': 'FLABSLAB',
  'mindzai.com': 'Mindzai',
  'myplasticheart.com': 'myplasticheart',
  'toyqube.com': 'ToyQube',
  'zcwostore.com': 'ZCWO Store',
  'strangecattoys.com': 'Strangecat Toys',
  'artoyz.com': 'Artoyz',
  'tomenosuke.thebase.in': 'Tomenosuke',
  'popmart.com': 'POP MART',
  'iamretro.com': 'I Am Retro',
  'tenacioustoys.com': 'Tenacious Toys',
  'mightyjaxx.com': 'Mighty Jaxx',
  'entertainmentearth.com': 'Entertainment Earth',
  'bigbadtoystore.com': 'BigBadToyStore',
  'mondoshop.com': 'Mondo',
  'mikesvintagetoys.com': "Mike's Vintage Toys",
  'fanboycollectibles.com': 'Fanboy Collectibles',
  'hottoys.com.hk': 'Hot Toys',
  'alltimetoys.com': 'All Time Toys',
  'thehobhub.com': 'The Hobby Hub',
  'fye.com': 'FYE',
  'sideshow.com': 'Sideshow',
  'artsy.net': 'Artsy',
  'ha.com': 'Heritage Auctions',
  'stockx.com': 'StockX',
  'mercari.com': 'Mercari',
  'ebay.com': 'eBay',
  'whatnot.com': 'Whatnot',
  'vinylpulse.com': 'Vinyl Pulse',
  'spankystokes.com': 'Spanky Stokes',
};

const raw = JSON.parse(readFileSync(jsonPath, 'utf8'));
const wall = raw.data ?? raw;

function canonicalUrl(u) {
  try {
    const x = new URL(u);
    x.search = '';
    let path = x.pathname.replace(/\/$/, '') || '';
    return `${x.protocol}//${x.host}${path}`;
  } catch {
    return u;
  }
}

function normHost(u) {
  try {
    return new URL(u).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
}

function existingHosts() {
  const hosts = new Set();
  for (const f of readdirSync(listingsDir)) {
    if (!f.endsWith('.md')) continue;
    const text = readFileSync(join(listingsDir, f), 'utf8');
    const m = text.match(/^url:\s*(.+)$/m);
    if (m) hosts.add(normHost(m[1].trim()));
  }
  return hosts;
}

function sectionToCategory(title) {
  const t = title.replace(/&amp;/g, '&').toLowerCase();
  if (t.includes('online marketplace')) return 'online-marketplace';
  if (t.includes('print') && t.includes('galler')) return 'gallery';
  if (t.includes('news')) return 'blog';
  if (t.includes('sofubi')) return 'store';
  if (t.includes('designer toy')) return 'store';
  if (t.includes('action figure')) return 'store';
  return 'store';
}

function categoryOverride(host, sectionCat) {
  if (host === 'ha.com' || host.endsWith('.ha.com')) return 'auction-house';
  return sectionCat;
}

function hostToSlug(url) {
  return normHost(url).replace(/\./g, '-');
}

function hostToName(url) {
  const host = normHost(url);
  if (DISPLAY_NAME[host]) return DISPLAY_NAME[host];
  if (!host) return 'Listing';
  const main = host.split('.')[0];
  return main.charAt(0).toUpperCase() + main.slice(1).replace(/-/g, ' ');
}

const BAD_TITLE = /^(home|shop|all products|products|prints for sale|new releases)$/i;

function cleanName(title, url) {
  const host = normHost(url);
  if (DISPLAY_NAME[host]) return DISPLAY_NAME[host];

  if (!title || /^https?:\/\//i.test(title.trim())) {
    return hostToName(url);
  }
  const t = title.trim();
  if (BAD_TITLE.test(t)) return hostToName(url);

  let n = t.split('|')[0].split(' – ')[0].trim();
  if (/^['"`「]/.test(n)) return hostToName(url);
  if (/\b(Vinyl Figure|Screen Print|Special Plexi Edition)\b/i.test(n) && n.length > 30) {
    return hostToName(url);
  }
  if (/\bby [A-Z][a-z]+ [A-Z]/.test(n) && n.length > 45) return hostToName(url);
  if (n.length > 90) return hostToName(url);
  return n;
}

function cleanDescription(desc, title) {
  let s = (desc || '').replace(/\s+/g, ' ').trim();
  if (!s) s = (title || '').replace(/\s+/g, ' ').trim();
  if (!s) s = 'Art, prints, or collectibles shop.';
  if (s.length > 400) {
    s = s.slice(0, 397).trim();
    const last = Math.max(s.lastIndexOf(' '), s.lastIndexOf('.'));
    if (last > 280) s = s.slice(0, last + 1);
    s = s.trim() + '…';
  }
  return s;
}

function yamlEscapeBlock(s) {
  return s.replace(/\r\n/g, '\n');
}

const SECTION_TAG = {
  NEWS: ['blog', 'news'],
  "Print Studio's & Galleries": ['prints', 'gallery'],
  Sofubi: ['sofubi', 'designer-toys'],
  'Designer Toys': ['designer-toys'],
  'Toys & Action Figures': ['action-figures', 'collectibles'],
  'Online Marketplaces': ['marketplace'],
};

function tagsForSection(title, description) {
  const key = title.replace(/&amp;/g, '&');
  const base = [...(SECTION_TAG[key] || SECTION_TAG[title] || ['directory'])];
  const d = (description || '').toLowerCase();
  if (d.includes('japan') || d.includes('tokyo')) base.push('japan');
  return [...new Set(base)].slice(0, 8);
}

const seenHosts = new Set();
const existing = existingHosts();

const entries = [];
for (const section of wall.sections || []) {
  if (section.deleted) continue;
  const secCat = sectionToCategory(section.title);
  for (const brick of section.bricks || []) {
    for (const obj of brick.objects || []) {
      if (obj.type !== 'link' || !obj.url) continue;
      const url = canonicalUrl(obj.url);
      const host = normHost(url);
      if (!host || seenHosts.has(host)) continue;
      seenHosts.add(host);
      if (existing.has(host)) continue;

      const name = cleanName(obj.title, url);
      const description = cleanDescription(obj.description, obj.title);
      const category = categoryOverride(host, secCat);
      const tags = tagsForSection(section.title, description);
      const slug = hostToSlug(url);

      entries.push({ slug, name, category, tags, url, description });
    }
  }
}

for (const e of entries) {
  const nameYaml = JSON.stringify(e.name);
  const body = `---
name: ${nameYaml}
category: ${e.category}
tags:
${e.tags.map((t) => `  - ${t}`).join('\n')}
url: ${e.url}
description: >
  ${yamlEscapeBlock(e.description)}
featured: false
---
`;
  writeFileSync(join(listingsDir, `${e.slug}.md`), body, 'utf8');
  console.log('wrote', e.slug, '→', e.name);
}

console.log('total new:', entries.length);
