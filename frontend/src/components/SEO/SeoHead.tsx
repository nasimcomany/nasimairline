import React, { useEffect } from 'react';

export interface SeoHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[] | null;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Sets document title + meta/OG/Twitter/canonical/JSON-LD for SEO.
 * Works for SPA routes; crawlers that execute JS will see these tags.
 */
const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  keywords,
  canonical,
  image,
  type = 'website',
  noindex = false,
  jsonLd = null,
}) => {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
      upsertMeta('name', 'twitter:description', description);
    }
    if (keywords) upsertMeta('name', 'keywords', keywords);
    if (title) {
      upsertMeta('property', 'og:title', title);
      upsertMeta('name', 'twitter:title', title);
    }
    upsertMeta('property', 'og:type', type);
    upsertMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    if (image) {
      upsertMeta('property', 'og:image', image);
      upsertMeta('name', 'twitter:image', image);
    }
    const pageUrl = canonical || window.location.href;
    upsertMeta('property', 'og:url', pageUrl);
    upsertLink('canonical', pageUrl);

    const robots = noindex ? 'noindex,nofollow' : 'index,follow';
    upsertMeta('name', 'robots', robots);

    const scriptId = 'nasim-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, keywords, canonical, image, type, noindex, jsonLd]);

  return null;
};

export default SeoHead;
