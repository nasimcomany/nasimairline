"""
Seed homepage defaults (Special Services + one-time Experience/FAQ brand images) + magazine.

  python manage.py populate_site_defaults
  python manage.py populate_site_defaults --force
  python manage.py populate_site_defaults --force-experience-faq

Experience/FAQ brand images are applied once (marker file) so production gets the new
assets, then admin can replace them freely without later deploys overwriting.
"""
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files import File
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_datetime

from blog.constants import ARTICLE_STATUS_PUBLISHED
from blog.models import Article, Category
from gallery.models import HomePageSectionItem

User = get_user_model()
ROOT = Path(__file__).resolve().parents[3]
HOME_DIR = ROOT / "defaults" / "homepage"
MAG_DIR = ROOT / "defaults" / "magazine"
MAG_FIXTURE = ROOT / "blog" / "fixtures" / "magazine_defaults.json"

# Same images as localhost Special Services (section 1)
SPECIAL_IMAGES = {
    1: "44.png",
    2: "33.png",
    3: "22.png",
    4: "11.png",
}

# Homepage experience grid (order matches HomePage.tsx)
EXPERIENCE_BRAND = {
    1: {
        "file": "exp-complaints.jpg",
        "title_fa": "ثبت شکایات",
        "title_ar": "تسجيل الشكاوى",
        "title_en": "Complaints",
        "link_url": "/survey",
    },
    2: {
        "file": "exp-feedback.jpg",
        "title_fa": "انتقادات و پیشنهادات",
        "title_ar": "انتقادات واقتراحات",
        "title_en": "Feedback",
        "link_url": "/tickets",
    },
    3: {
        "file": "exp-mehrabad.jpg",
        "title_fa": "پروازهای فرودگاه مهرآباد",
        "title_ar": "رحلات مطار مهرآباد",
        "title_en": "Mehrabad Airport Flights",
        "link_url": "https://fids.airport.ir/",
    },
    4: {
        "file": "exp-ikia.jpg",
        "title_fa": "پروازهای فرودگاه امام خمینی (ره)",
        "title_ar": "رحلات مطار الإمام الخميني",
        "title_en": "Imam Khomeini Airport Flights",
        "link_url": "https://ikac.ir/",
    },
    5: {
        "file": "exp-iranology.jpg",
        "title_fa": "ایران شناسی",
        "title_ar": "إيرانولوجيا",
        "title_en": "Iranology",
        "link_url": "/iranology",
    },
}

FAQ_BRAND = {
    1: "faq-booking.jpg",
    2: "faq-amenities.jpg",
    3: "faq-status.jpg",
    4: "faq-support.jpg",
}

BRAND_SEED_MARKER = "homepage_brand_assets_v1.done"


class Command(BaseCommand):
    help = "Seed Special Services + one-time Experience/FAQ brand images (+ magazine)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Overwrite Special Services images / force magazine content refresh",
        )
        parser.add_argument(
            "--force-experience-faq",
            action="store_true",
            help="Force-refresh Experience/FAQ brand images even if already seeded",
        )
        parser.add_argument(
            "--skip-magazine",
            action="store_true",
            help="Skip magazine article seeding",
        )

    def handle(self, *args, **options):
        force = options["force"]
        call_command("populate_homepage_sections")
        self._seed_special_services(force)
        self._seed_experience_faq(force=options["force_experience_faq"])
        if not options["skip_magazine"]:
            self._seed_magazine(force)
        self.stdout.write(
            self.style.SUCCESS(
                "Done: defaults seeded. Admin can still edit all CMS fields/images anytime."
            )
        )

    def _open_home(self, name: str):
        path = HOME_DIR / name
        if not path.exists():
            alt = ROOT / "frontend" / "public" / "images" / name
            path = alt if alt.exists() else path
        if not path.exists():
            self.stdout.write(self.style.WARNING(f"Missing image: {name}"))
            return None
        return path

    def _seed_special_services(self, force: bool):
        for order, filename in SPECIAL_IMAGES.items():
            path = self._open_home(filename)
            if not path:
                continue
            item = HomePageSectionItem.objects.filter(
                section_type="SPECIAL_SERVICE", order=order
            ).first()
            if not item:
                continue
            file_ok = False
            if item.image and not force:
                try:
                    file_ok = item.image.storage.exists(item.image.name)
                except Exception:
                    file_ok = False
                if file_ok:
                    continue
            with path.open("rb") as fh:
                item.image.save(path.name, File(fh), save=True)
            self.stdout.write(self.style.SUCCESS(f"SPECIAL_SERVICE#{order} <- {filename}"))

    def _brand_marker_path(self) -> Path:
        media_root = Path(getattr(settings, "MEDIA_ROOT", ROOT / "media"))
        media_root.mkdir(parents=True, exist_ok=True)
        return media_root / BRAND_SEED_MARKER

    def _seed_experience_faq(self, force: bool = False):
        marker = self._brand_marker_path()
        if marker.exists() and not force:
            self.stdout.write("Experience/FAQ brand assets already seeded; leave CMS as-is for admin edits.")
            return

        for order, meta in EXPERIENCE_BRAND.items():
            path = self._open_home(meta["file"])
            item = HomePageSectionItem.objects.filter(section_type="EXPERIENCE", order=order).first()
            if not item or not path:
                continue
            item.title_fa = meta["title_fa"]
            item.title_ar = meta["title_ar"]
            item.title_en = meta["title_en"]
            item.link_url = meta["link_url"]
            item.is_active = True
            with path.open("rb") as fh:
                item.image.save(path.name, File(fh), save=False)
            item.save()
            self.stdout.write(self.style.SUCCESS(f"EXPERIENCE#{order} <- {meta['file']}"))

        for order, filename in FAQ_BRAND.items():
            path = self._open_home(filename)
            item = HomePageSectionItem.objects.filter(section_type="FAQ", order=order).first()
            if not item or not path:
                continue
            with path.open("rb") as fh:
                item.image.save(path.name, File(fh), save=True)
            self.stdout.write(self.style.SUCCESS(f"FAQ#{order} <- {filename}"))

        try:
            marker.write_text("seeded\n", encoding="utf-8")
        except Exception as exc:
            self.stdout.write(self.style.WARNING(f"Could not write seed marker: {exc}"))

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
            self.stdout.write(self.style.WARNING("No user for magazine author; skip articles"))
            return

        created = 0
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
                obj.category = category
                obj.save()
            img_name = art.get("featured_image")
            if img_name:
                path = MAG_DIR / img_name
                file_ok = False
                if obj.featured_image and not force:
                    try:
                        file_ok = obj.featured_image.storage.exists(obj.featured_image.name)
                    except Exception:
                        file_ok = False
                if path.exists() and (was_created or force or not file_ok):
                    with path.open("rb") as fh:
                        obj.featured_image.save(path.name, File(fh), save=True)
                    self.stdout.write(self.style.SUCCESS(f"Article image <- {img_name}"))
        # Survey banner image (homepage) — only fill when missing/broken; admin can replace
        survey_src = HOME_DIR / "airport-crew.jpg"
        if not survey_src.exists():
            survey_src = ROOT / "frontend" / "public" / "images" / "airport-crew.jpg"
        if survey_src.exists():
            survey = HomePageSectionItem.objects.filter(section_type="SURVEY", order=1).first()
            if survey:
                ok = False
                if survey.image and not force:
                    try:
                        ok = survey.image.storage.exists(survey.image.name)
                    except Exception:
                        ok = False
                if not ok:
                    with survey_src.open("rb") as fh:
                        survey.image.save(survey_src.name, File(fh), save=True)
                    self.stdout.write(self.style.SUCCESS("SURVEY#1 <- airport-crew.jpg"))
        self.stdout.write(
            self.style.SUCCESS(f"Magazine: created={created} total={Article.objects.count()}")
        )
