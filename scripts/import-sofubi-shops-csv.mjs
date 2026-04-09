#!/usr/bin/env node
/**
 * One-off / repeatable: SofubiShops.csv → src/content/listings/*.md
 * Skips rows whose URL or host already exists (see MULTI_PATH_HOSTS).
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LISTINGS_DIR = resolve(ROOT, 'src/content/listings');
const CSV_PATH = resolve(ROOT, 'SofubiShops.csv');

const MULTI_PATH_HOSTS = new Set([
  'kenelephant.co.jp',
  'mct.tokyo',
  'shop-pro.jp',
  'thebase.in',
  'stores.jp',
  'square.site',
  'bigcartel.com',
  'cashier.ecpay.com.tw',
]);

/** Hosts where many distinct “shops” share the same domain (path identifies the listing). */
function allowsMultiplePaths(hostname) {
  const hk = hostKey(hostname);
  if (MULTI_PATH_HOSTS.has(hk) || hk.endsWith('.myshopify.com')) return true;
  if (hk === 'instagram.com' || hk === 'ebay.com') return true;
  return false;
}

function hostKey(hostname) {
  return hostname.replace(/^www\./i, '').toLowerCase();
}

function normalizeUrlKey(href) {
  try {
    const u = new URL(href);
    if (!/^https?:$/i.test(u.protocol)) return null;
    u.hash = '';
    const host = hostKey(u.hostname);
    let path = u.pathname.replace(/\/$/, '') || '';
    const search = u.search ? u.search.toLowerCase() : '';
    return `https://${host}${path}${search}`.toLowerCase();
  } catch {
    return null;
  }
}

function ensureAbsoluteUrl(raw) {
  let u = raw.trim();
  if (!u) return null;
  if (/^\/\//.test(u)) u = 'https:' + u;
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u.replace(/^\/+/, '');
  u = u.replace(
    /(https?:\/\/(?:www\.)?instagram\.com\/)([^/?#]+)/i,
    (_, pre, user) =>
      `${pre}${user.replace(/%5C/gi, '').replace(/\\/g, '')}`,
  );
  return u;
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
}

function parseCsv(content) {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 2) continue;
    rows.push({
      name: cols[0].trim(),
      url: cols[1].trim(),
      location: (cols[2] ?? '').trim(),
    });
  }
  return rows;
}

function loadExisting() {
  const urlKeys = new Set();
  const hostsCovered = new Set();
  const re = /^url:\s*(\S+)/im;
  for (const f of readdirSync(LISTINGS_DIR).filter(x => x.endsWith('.md'))) {
    const m = re.exec(readFileSync(resolve(LISTINGS_DIR, f), 'utf8'));
    if (!m) continue;
    const raw = m[1].trim();
    const abs = ensureAbsoluteUrl(raw);
    const key = abs ? normalizeUrlKey(abs) : null;
    if (key) urlKeys.add(key);
    urlKeys.add(raw.toLowerCase().replace(/\/$/, ''));
    try {
      const u = new URL(abs || raw);
      if (allowsMultiplePaths(u.hostname)) continue;
      hostsCovered.add(hostKey(u.hostname));
    } catch {
      /* ignore */
    }
  }
  return { urlKeys, hostsCovered };
}

function shouldSkipHost(host, hostsCovered) {
  if (allowsMultiplePaths(host)) return false;
  return hostsCovered.has(hostKey(host));
}

function guessCategory(name, url) {
  const t = `${name} ${url}`.toLowerCase();
  if (t.includes('ebay.com')) return 'online-marketplace';
  if (/\bgallery\b/.test(name.toLowerCase()) && !/toy gallery/i.test(name)) return 'gallery';
  return 'store';
}

function regionTag(location) {
  const l = (location || '').toLowerCase();
  if (!l) return null;
  if (
    /\b(japan|tokyo|osaka|hiroshima|niigata|saitama|nagoya|fukuoka|kyoto)\b/.test(l) ||
    /chūō|nakano|shibuya|edogawa|setagaya|ikebukuro|shinjuku|nerima|sumida|chiyoda|shirogane|ueno|itabashi|suginami|広島|新潟|名古屋|福岡|さいたま|大宮/.test(l) ||
    /\ball over japan\b/.test(l)
  )
    return 'japan';
  if (/\b(hong kong)\b/.test(l) || /\bhk\b/.test(l)) return 'hong-kong';
  if (/\b(taiwan|taipei|taichung|tainan|kaohsiung|chiayi)\b/.test(l)) return 'taiwan';
  if (/\b(thailand|bangkok)\b/.test(l)) return 'thailand';
  if (/\b(australia|brisbane|melbourne)\b/.test(l)) return 'australia';
  if (/\b(mexico|mexico city)\b/.test(l)) return 'mexico';
  if (/\b(canada|toronto|markham)\b/.test(l) || /,\s*on\b/.test(l)) return 'canada';
  if (l === 'europe' || /\b(europe|eu)\b/.test(l)) return 'europe';
  if (
    /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|IA|ID|IL|IN|KS|KY|LA|MA|MD|ME|MI|MN|MO|MS|MT|NC|ND|NE|NH|NJ|NM|NV|NY|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VA|VT|WA|WI|WV|WY)\b/.test(location)
  )
    return 'united-states';
  if (
    /las vegas|los angeles|san francisco|san diego|new york|chicago|philadelphia|portland|orlando|tampa|richmond|louisville|albuquerque|brunswick|beacon|emeryville|torrance|alhambra|whittier|brooklyn|tacoma|seattle|miami|denver|austin|houston|dallas|phoenix|detroit|minneapolis|kansas city|salt lake|honolulu|baltimore|milwaukee|indianapolis|columbus|charlotte|nashville|pittsburgh|sacramento|fresno|omaha|raleigh|omaha|wichita|bakersfield/i.test(
      l,
    )
  )
    return 'united-states';
  return null;
}

function slugFromUrl(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return 'listing-unknown.md';
  }
  const host = u.hostname.replace(/^www\./i, '');
  let path = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '');
  const raw = `${host}${path}${u.search ? u.search.replace(/[?&=.%]/g, '-') : ''}`
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  const base = raw.slice(0, 80) || 'listing';
  return `${base}.md`;
}

function yamlName(s) {
  if (/[:#"']/.test(s)) return JSON.stringify(s);
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function buildDescription(name, location) {
  const bits = ['Sofubi-friendly shop or retailer.'];
  if (location) bits.push(location + '.');
  bits.push('Source: community Sofubi shops list (CSV).');
  let d = bits.join(' ').replace(/\s+/g, ' ').trim();
  if (d.length > 500) d = `${d.slice(0, 497)}…`;
  return d;
}

function wrapDesc(text, width = 72) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    if (!line) line = w;
    else if (line.length + 1 + w.length <= width) line += ` ${w}`;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines.map(l => `  ${l}`);
}

function validateUrlForZod(href) {
  try {
    const u = new URL(href);
    return /^https?:$/i.test(u.protocol);
  } catch {
    return false;
  }
}

function main() {
  const csv = readFileSync(CSV_PATH, 'utf8');
  const rows = parseCsv(csv);
  const { urlKeys, hostsCovered } = loadExisting();
  const usedSlugs = new Set(readdirSync(LISTINGS_DIR));
  let written = 0;
  const skipped = [];

  for (const row of rows) {
    if (!row.name || !row.url) continue;
    const href = ensureAbsoluteUrl(row.url);
    if (!href || !validateUrlForZod(href)) {
      skipped.push({ name: row.name, reason: 'bad-url' });
      continue;
    }
    const key = normalizeUrlKey(href);
    if (!key) {
      skipped.push({ name: row.name, reason: 'normalize' });
      continue;
    }
    if (urlKeys.has(key) || urlKeys.has(href.toLowerCase().replace(/\/$/, ''))) {
      skipped.push({ name: row.name, reason: 'duplicate-url' });
      continue;
    }
    try {
      if (shouldSkipHost(new URL(href).hostname, hostsCovered)) {
        skipped.push({ name: row.name, reason: 'host-covered' });
        continue;
      }
    } catch {
      skipped.push({ name: row.name, reason: 'parse-host' });
      continue;
    }

    let slug = slugFromUrl(href);
    let base = slug.replace(/\.md$/, '');
    let n = 0;
    while (usedSlugs.has(slug)) {
      n += 1;
      slug = `${base}-${n}.md`;
    }
    usedSlugs.add(slug);

    const category = guessCategory(row.name, href);
    const tags = ['designer-toys', 'sofubi'];
    const rt = regionTag(row.location);
    if (rt) tags.push(rt);

    const desc = buildDescription(row.name, row.location);
    const lines = [
      '---',
      `name: ${yamlName(row.name)}`,
      `category: ${category}`,
      'tags:',
      ...tags.map(t => `  - ${t}`),
      `url: ${href}`,
    ];
    if (row.location) lines.push(`location: ${yamlName(row.location)}`);
    lines.push('description: >', ...wrapDesc(desc), 'featured: false', '---', '');

    writeFileSync(resolve(LISTINGS_DIR, slug), lines.join('\n'), 'utf8');
    written++;
    urlKeys.add(key);
    console.error(`+ ${slug}  ${row.name}`);
  }

  console.error(`\nWrote ${written} listings; skipped ${skipped.length}.`);
}

main();
