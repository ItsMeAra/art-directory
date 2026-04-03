const UTM_SOURCE = 'huntandhaul';
const UTM_MEDIUM = 'referral';

/**
 * Adds standard UTM params for analytics on the destination site.
 * Skips entirely if `utm_source` is already present (e.g. partner / campaign links).
 */
export function withOutboundUtm(url: string): string {
  try {
    const u = new URL(url);
    if (u.searchParams.has('utm_source')) {
      return u.toString();
    }
    u.searchParams.set('utm_source', UTM_SOURCE);
    u.searchParams.set('utm_medium', UTM_MEDIUM);
    return u.toString();
  } catch {
    return url;
  }
}
