"""
XML sitemap + robots.txt for Google / crawlers.
Public SPA paths: /magazine, /magazine/<slug>, /magazine/category/<slug>,
/iranology, /iranology/<city>, /iranology/<city>/<slug>
"""
from django.http import HttpResponse
from django.utils import timezone
from .models import Article, Category, IranCity, IranologyArticle, SEOData
from .constants import ARTICLE_STATUS_PUBLISHED
from .url_helpers import get_public_site_url, absolute_public_url


def _xml_escape(value: str) -> str:
    return (
        (value or '')
        .replace('&', '&amp;')
        .replace('<', '&lt;')
        .replace('>', '&gt;')
        .replace('"', '&quot;')
        .replace("'", '&apos;')
    )


def _url_entry(loc, lastmod=None, changefreq='weekly', priority='0.5'):
    parts = [f'  <url>\n    <loc>{_xml_escape(loc)}</loc>']
    if lastmod:
        if hasattr(lastmod, 'date'):
            lastmod = lastmod.date().isoformat()
        parts.append(f'    <lastmod>{_xml_escape(str(lastmod)[:10])}</lastmod>')
    if changefreq:
        parts.append(f'    <changefreq>{_xml_escape(changefreq)}</changefreq>')
    if priority is not None:
        parts.append(f'    <priority>{_xml_escape(str(priority))}</priority>')
    parts.append('  </url>')
    return '\n'.join(parts)


def sitemap_xml(request):
    """Serve /sitemap.xml with published content URLs."""
    now = timezone.now()
    entries = []

    entries.append(_url_entry(absolute_public_url('/magazine', request), now, 'daily', '0.8'))
    entries.append(_url_entry(absolute_public_url('/iranology', request), now, 'weekly', '0.7'))

    for cat in Category.objects.filter(is_active=True):
        entries.append(
            _url_entry(
                absolute_public_url(cat.get_absolute_url(), request),
                cat.updated_at or cat.created_at or now,
                'weekly',
                '0.6',
            )
        )

    articles = (
        Article.objects.filter(
            status=ARTICLE_STATUS_PUBLISHED,
            published_at__lte=now,
        )
        .select_related('seo_data')
        .order_by('-published_at')
    )
    for article in articles:
        try:
            seo = article.seo_data
            if seo and seo.robots_index is False:
                continue
            changefreq = seo.sitemap_changefreq or 'weekly'
            priority = seo.sitemap_priority or '0.7'
        except SEOData.DoesNotExist:
            changefreq = 'weekly'
            priority = '0.7'
        entries.append(
            _url_entry(
                absolute_public_url(article.get_absolute_url(), request),
                article.updated_at or article.published_at or now,
                changefreq,
                priority,
            )
        )

    for city in IranCity.objects.filter(is_active=True):
        entries.append(
            _url_entry(
                absolute_public_url(city.get_absolute_url(), request),
                city.updated_at or now,
                'weekly',
                '0.6',
            )
        )

    for article in IranologyArticle.objects.filter(
        status=ARTICLE_STATUS_PUBLISHED,
        published_at__lte=now,
    ).select_related('city'):
        entries.append(
            _url_entry(
                absolute_public_url(article.get_absolute_url(), request),
                article.updated_at or article.published_at or now,
                'weekly',
                '0.65',
            )
        )

    body = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + '\n'.join(entries)
        + '\n</urlset>\n'
    )
    return HttpResponse(body, content_type='application/xml; charset=utf-8')


def robots_txt(request):
    """Serve /robots.txt with Sitemap pointer and admin disallow."""
    base = get_public_site_url(request)
    content = (
        'User-agent: *\n'
        'Allow: /\n'
        'Disallow: /admin/\n'
        'Disallow: /limited-admin/\n'
        'Disallow: /api/\n'
        '\n'
        f'Sitemap: {base}/sitemap.xml\n'
    )
    return HttpResponse(content, content_type='text/plain; charset=utf-8')
