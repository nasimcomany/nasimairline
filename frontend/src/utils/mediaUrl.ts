/**
 * Normalize CMS/media URLs for the SPA and provide public fallbacks when /media is empty.
 */

export function toSameOriginMediaUrl(url?: string | null): string {
  if (!url) return '';
  try {
    if (url.startsWith('/')) return url;
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    // Keep path+search so /media/... always hits the current host
    if (parsed.pathname.startsWith('/media/') || parsed.pathname.startsWith('/images/')) {
      return `${parsed.pathname}${parsed.search}`;
    }
    return url;
  } catch {
    return url;
  }
}

/** Public static magazine cover: /images/magazine/<slug>.(png|jpg|...) */
export function magazinePublicCover(slug?: string): string {
  if (!slug) return '/images/tstnasim.jpg';
  // Seeded defaults use .png; keep a stable default path
  return `/images/magazine/${slug}.png`;
}

export function withMagazineImageFallback(
  featuredImage: string | null | undefined,
  slug: string
): string {
  return toSameOriginMediaUrl(featuredImage) || magazinePublicCover(slug);
}
