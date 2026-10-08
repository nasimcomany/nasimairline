"""
Seed homepage hero/sections (with images) + magazine articles from repo defaults.
Safe for production: only fills missing images / missing articles unless --force.

  python manage.py populate_site_defaults
  python manage.py populate_site_defaults --force
"""
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.files import File
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_datetime

from blog.constants import ARTICLE_STATUS_PUBLISHED
from blog.models import Article, Category
from gallery.models import HeroSlider, HomePageSectionItem

User = get_user_model()
ROOT = Path(__file__).resolve().parents[3]
HOME_DIR = ROOT / "defaults" / "homepage"
MAG_DIR = ROOT / "defaults" / "magazine"
MAG_FIXTURE = ROOT / "blog" / "fixtures" / "magazine_defaults.json"

SPECIAL_IMAGES = {
    1: "44.png",
    2: "33.png",
    3: "22.png",
    4: "11.png",
}
EXPERIENCE_IMAGES = {
    1: "two.png",
    2: "three.png",
    3: "4reza.jpeg",
    4: "5reza.jpeg",
    5: "6reza.jpeg",
}
HERO_DEFAULTS = [
    (1, "tstnasim.jpg", "اسلاید ۱"),
    (2, "tstnasim2.jpg", "اسلاید ۲"),
    (3, "tstnasim3.jpg", "اسلاید ۳"),
    (4, "tstnasim4.jpg", "اسلاید ۴"),
    (5, "tstnasim5.jpg", "اسلاید ۵"),
]


class Command(BaseCommand):
    help = "Populate homepage images + magazine defaults (admin remains editable)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Overwrite existing section/hero images and republish missing article fields",
        )
        parser.add_argument(
            "--skip-magazine",
            action="store_true",
            help="Skip magazine article seeding",
        )

    def handle(self, *args, **options):
        force = options["force"]
        call_command("populate_homepage_sections")
        self._seed_section_images("SPECIAL_SERVICE", SPECIAL_IMAGES, force)
        self._seed_section_images("EXPERIENCE", EXPERIENCE_IMAGES, force)
        self._seed_survey_image(force)
        self._seed_hero(force)
        if not options["skip_magazine"]:
            self._seed_magazine(force)
        self.stdout.write(self.style.SUCCESS("Site defaults ready. Admin can still edit all content/images/links."))

    def _open_home(self, name: str):
        path = HOME_DIR / name
        if not path.exists():
            alt = ROOT / "frontend" / "public" / "images" / name
            path = alt if alt.exists() else path
        if not path.exists():
            self.stdout.write(self.style.WARNING(f"Missing image: {name}"))
            return None
        return path

    def _attach_image(self, obj, field_name: str, path: Path, force: bool) -> bool:
        current = getattr(obj, field_name)
        if current and not force:
            return False
        with path.open("rb") as fh:
            getattr(obj, field_name).save(path.name, File(fh), save=False)
        obj.save()
        return True

    def _seed_section_images(self, section_type: str, mapping: dict, force: bool):
        for order, filename in mapping.items():
            path = self._open_home(filename)
            if not path:
                continue
            item = HomePageSectionItem.objects.filter(
                section_type=section_type, order=order
            ).first()
            if not item:
                continue
            if self._attach_image(item, "image", path, force):
                self.stdout.write(self.style.SUCCESS(f"{section_type}#{order} <- {filename}"))

    def _seed_survey_image(self, force: bool):
        path = self._open_home("airport-crew.jpg")
        if not path:
            return
        item = HomePageSectionItem.objects.filter(section_type="SURVEY", order=1).first()
        if not item:
            return
        if self._attach_image(item, "image", path, force):
            self.stdout.write(self.style.SUCCESS("SURVEY#1 <- airport-crew.jpg"))

    def _seed_hero(self, force: bool):
        existing = HeroSlider.objects.count()
        for order, filename, title in HERO_DEFAULTS:
            path = self._open_home(filename)
            if not path:
                continue
            slider = HeroSlider.objects.filter(order=order).first()
            if slider is None:
                if existing > 0 and not force:
                    continue
                slider = HeroSlider(order=order, title=title, is_active=True, alt_text=title)
                with path.open("rb") as fh:
                    slider.image.save(path.name, File(fh), save=False)
                slider.save()
                self.stdout.write(self.style.SUCCESS(f"Created hero #{order}"))
                continue
            if (not slider.image) or force:
                if self._attach_image(slider, "image", path, force=True):
                    self.stdout.write(self.style.SUCCESS(f"Hero #{order} image set"))

        if HeroSlider.objects.filter(is_active=True).count() == 0:
            for order, filename, title in HERO_DEFAULTS:
                path = self._open_home(filename)
                if not path:
                    continue
                slider = HeroSlider(order=order, title=title, is_active=True, alt_text=title)
                with path.open("rb") as fh:
                    slider.image.save(path.name, File(fh), save=False)
                slider.save()
                self.stdout.write(self.style.SUCCESS(f"Bootstrapped hero #{order}"))

    def _seed_magazine(self, force: bool):
        if not MAG_FIXTURE.exists():
            self.stdout.write(self.style.WARNING(f"Missing fixture: {MAG_FIXTURE}"))
            return
        import json

        data = json.loads(MAG_FIXTURE.read_text(encoding="utf-8"))
        for cat in data.get("categories", []):
            Category.objects.update_or_create(
                slug=cat["slug"],
                defaults={
                    "name": cat["name"],
                    "description": cat.get("description") or "",
                    "order": cat.get("order") or 0,
                    "is_active": cat.get("is_active", True),
                },
            )
        author = (
            User.objects.filter(is_superuser=True).order_by("id").first()
            or User.objects.order_by("id").first()
        )
        if author is None:
            author = User.objects.create_superuser(
                username="nasim_seed",
                email="seed@nasim.local",
                password="ChangeMeNow!123",
            )
            self.stdout.write(self.style.WARNING("Created seed superuser nasim_seed"))

        created = 0
        updated = 0
        for art in data.get("articles", []):
            category = None
            if art.get("category_slug"):
                category = Category.objects.filter(slug=art["category_slug"]).first()
            excerpt = (art.get("excerpt") or "")[:500]
            obj = Article.objects.filter(slug=art["slug"]).first()
            was_created = False
            if obj is None:
                obj = Article(
                    slug=art["slug"],
                    title=art["title"],
                    excerpt=excerpt,
                    content=art.get("content") or "",
                    status=art.get("status") or ARTICLE_STATUS_PUBLISHED,
                    is_featured=bool(art.get("is_featured")),
                    reading_time=art.get("reading_time") or 3,
                    view_count=art.get("view_count") or 0,
                    meta_title=art.get("meta_title") or "",
                    meta_description=art.get("meta_description") or "",
                    image_alt=art.get("image_alt") or "",
                    author=author,
                    category=category,
                )
                if art.get("published_at"):
                    dt = parse_datetime(art["published_at"])
                    if dt:
                        obj.published_at = dt
                obj.save()
                was_created = True
                created += 1
            elif force:
                obj.title = art["title"]
                obj.excerpt = excerpt
                obj.content = art.get("content") or ""
                obj.status = art.get("status") or ARTICLE_STATUS_PUBLISHED
                obj.is_featured = bool(art.get("is_featured"))
                obj.meta_title = art.get("meta_title") or ""
                obj.meta_description = art.get("meta_description") or ""
                obj.image_alt = art.get("image_alt") or ""
                obj.category = category
                obj.save()
                updated += 1
            img_name = art.get("featured_image")
            if img_name:
                path = MAG_DIR / img_name
                if path.exists() and (was_created or force or not obj.featured_image):
                    with path.open("rb") as fh:
                        obj.featured_image.save(path.name, File(fh), save=True)
        self.stdout.write(
            self.style.SUCCESS(f"Magazine: created={created} updated={updated} total={Article.objects.count()}")
        )
