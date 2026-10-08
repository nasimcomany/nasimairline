"""Export local homepage images + magazine articles into repo defaults/fixtures."""
import json
import os
import shutil
from pathlib import Path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "nasim.settings")

import django

django.setup()

from blog.models import Article, Category  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_IMAGES = ROOT / "frontend" / "public" / "images"
HOME_DEST = ROOT / "defaults" / "homepage"
MAG_DEST = ROOT / "defaults" / "magazine"
FIXTURE = ROOT / "blog" / "fixtures" / "magazine_defaults.json"

HOME_DEST.mkdir(parents=True, exist_ok=True)
MAG_DEST.mkdir(parents=True, exist_ok=True)
FIXTURE.parent.mkdir(parents=True, exist_ok=True)

HOME_FILES = [
    "44.png",
    "33.png",
    "22.png",
    "11.png",
    "chair.jpeg",
    "overload.jpeg",
    "TravelingWithPets.jpg",
    "travelwheelchair.jpeg",
    "two.png",
    "three.png",
    "4reza.jpeg",
    "5reza.jpeg",
    "6reza.jpeg",
    "tstnasim.jpg",
    "tstnasim2.jpg",
    "tstnasim3.jpg",
    "tstnasim4.jpg",
    "tstnasim5.jpg",
    "airport-crew.jpg",
]

for name in HOME_FILES:
    src = PUBLIC_IMAGES / name
    if src.exists():
        shutil.copy2(src, HOME_DEST / name)
        print("copied", name)
    else:
        print("missing", name)

cats = []
for c in Category.objects.all().order_by("order", "id"):
    cats.append(
        {
            "name": c.name,
            "slug": c.slug,
            "description": c.description or "",
            "order": c.order,
            "is_active": c.is_active,
        }
    )

arts = []
for a in Article.objects.all().order_by("id"):
    img_name = None
    if a.featured_image:
        src = Path(a.featured_image.path)
        if src.exists():
            img_name = f"{a.slug}{src.suffix.lower()}"
            shutil.copy2(src, MAG_DEST / img_name)
    arts.append(
        {
            "title": a.title,
            "slug": a.slug,
            "excerpt": a.excerpt or "",
            "content": a.content or "",
            "status": a.status,
            "is_featured": a.is_featured,
            "reading_time": a.reading_time or 3,
            "view_count": a.view_count or 0,
            "published_at": a.published_at.isoformat() if a.published_at else None,
            "category_slug": a.category.slug if a.category_id else None,
            "meta_title": a.meta_title or "",
            "meta_description": a.meta_description or "",
            "image_alt": getattr(a, "image_alt", "") or "",
            "featured_image": img_name,
        }
    )

payload = {"categories": cats, "articles": arts}
FIXTURE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
print("cats", len(cats), "arts", len(arts), "images", len(list(MAG_DEST.glob("*"))))
print("json_kb", FIXTURE.stat().st_size // 1024)
