# -*- coding: utf-8 -*-
"""Persian PDF: Django structure & run guide for Nasim Airline (for .NET devs)."""
from pathlib import Path
from datetime import date
import subprocess
import sys

try:
    import arabic_reshaper
    from bidi.algorithm import get_display
except ImportError:
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "-q", "arabic-reshaper", "python-bidi", "fpdf2"]
    )
    import arabic_reshaper
    from bidi.algorithm import get_display

from fpdf import FPDF

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "DJANGO_PROJECT_GUIDE_FA.pdf"
FONT = Path(r"C:\Windows\Fonts\tahoma.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\tahomabd.ttf")


def rtl(text: str) -> str:
    if not text:
        return ""
    return get_display(arabic_reshaper.reshape(text))


class GuidePDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_auto_page_break(auto=True, margin=14)
        self.set_margins(12, 12, 12)
        self.add_font("Tahoma", "", str(FONT))
        self.add_font("Tahoma", "B", str(FONT_BOLD if FONT_BOLD.exists() else FONT))

    def body(self, size=10, bold=False):
        self.set_font("Tahoma", "B" if bold else "", size=size)

    def title_page(self):
        self.add_page()
        self.body(17, bold=True)
        self.cell(0, 12, rtl("راهنمای ساختار پروژه نسیم ایر"), new_x="LMARGIN", new_y="NEXT", align="C")
        self.body(12)
        self.cell(
            0,
            8,
            rtl("Django + React — برای توسعه‌دهنده .NET"),
            new_x="LMARGIN",
            new_y="NEXT",
            align="C",
        )
        self.ln(4)
        self.body(9)
        self.cell(
            0,
            6,
            rtl(f"تاریخ: {date.today().isoformat()}  |  مسیر پروژه: nasimairline"),
            new_x="LMARGIN",
            new_y="NEXT",
            align="C",
        )
        self.ln(6)
        self.body(10)
        txt = (
            "این سند نقشه ذهنی پروژه است: کنترلرها، سرویس‌ها، دیتابیس، "
            "جریان درخواست API، seed داده، و مراحل اجرای محلی روی ویندوز."
        )
        self.multi_cell(0, 6, rtl(txt), align="R")

    def h1(self, text: str):
        self.ln(3)
        self.set_x(self.l_margin)
        self.body(12, bold=True)
        self.cell(0, 8, rtl(text), new_x="LMARGIN", new_y="NEXT", align="R")
        self.ln(1)

    def h2(self, text: str):
        self.set_x(self.l_margin)
        self.body(11, bold=True)
        self.cell(0, 7, rtl(text), new_x="LMARGIN", new_y="NEXT", align="R")

    def p(self, text: str, size=10):
        self.set_x(self.l_margin)
        self.body(size)
        self.multi_cell(0, 5.5, rtl(text), align="R")
        self.ln(1)

    def bullet(self, text: str):
        self.set_x(self.l_margin)
        self.body(9.5)
        self.multi_cell(0, 5.5, rtl("- " + text), align="R")

    def row3(self, c1, c2, c3, widths, header=False, fill=False):
        self.body(9)
        if fill and not header:
            self.set_fill_color(248, 250, 252)
        if header:
            self.set_fill_color(30, 58, 138)
            self.set_text_color(255, 255, 255)
        for i, t in enumerate([c1, c2, c3]):
            self.cell(
                widths[i],
                7,
                rtl(t),
                border=1,
                align="R",
                fill=header or fill,
            )
        self.ln()
        self.set_text_color(0, 0, 0)

    def code_block(self, lines: list[str]):
        self.set_x(self.l_margin)
        self.set_fill_color(243, 244, 246)
        self.body(8)
        for line in lines:
            self.cell(0, 5, line, new_x="LMARGIN", new_y="NEXT", fill=True)
        self.ln(2)


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    w = [40, 55, 95]
    pdf = GuidePDF()
    pdf.title_page()

    # --- 1 .NET mapping ---
    pdf.h1("۱. معادل مفاهیم .NET در Django")
    pdf.row3(".NET", "Django / این پروژه", "توضیح", w, header=True)
    rows = [
        ("Solution", "ریشه + اپ‌ها", "flights, bookings, ..."),
        ("Controller", "views.py", "ViewSet در DRF"),
        ("Model", "models.py", "ORM = جدول DB"),
        ("DbContext", "settings DATABASES", "PostgreSQL"),
        ("Migrations", "migrations/", "makemigrate + migrate"),
        ("DTO", "serializers.py", "ورودی/خروجی JSON"),
        ("Routing", "urls.py", "nasim + هر اپ"),
        ("appsettings", "settings.py + .env", "Nira, JWT, ..."),
        ("Service", "utils, *client", "لایه جدا اجباری نیست"),
    ]
    for i, r in enumerate(rows):
        pdf.row3(*r, w, fill=i % 2 == 1)

    pdf.h1("۲. نقشه پوشه‌های اصلی")
    pdf.p(
        "manage.py = CLI پروژه (runserver, migrate). "
        "nasim/ = تنظیمات و مسیرهای سراسری. "
        "هر اپ (مثلاً flights/) یک ماژول دامنه با models, views, serializers, urls, migrations."
    )
    pdf.code_block([
        "nasimairline/",
        "  manage.py",
        "  nasim/settings.py, nasim/urls.py",
        "  flights/, bookings/, payments/, authenticate/, blog/, ...",
        "  frontend/  (React)",
        "  defaults/  (تصاویر seed)",
    ])

    pdf.add_page()
    pdf.h1("۳. کنترلرها کجاست؟ (views.py)")
    pdf.p(
        "در Django REST Framework عملاً Controller همان View یا ViewSet است. "
        "مسیر HTTP از nasim/urls.py به flights/urls.py و سپس کلاس ViewSet هدایت می‌شود."
    )
    pdf.row3("فایل", "کلاس / عمل", "نمونه URL", [50, 55, 95], header=True)
    ctrl = [
        ("flights/views.py", "FlightViewSet, NiraAPIViewSet", "/api/flights/..."),
        ("bookings/views.py", "BookingViewSet", "initiate-payment"),
        ("authenticate/views.py", "ورود، ثبت‌نام", "/api/auth/..."),
        ("nasim/views.py", "ReactAppView, health", "/ , healthz"),
    ]
    for i, r in enumerate(ctrl):
        pdf.row3(*r, [50, 55, 95], fill=i % 2 == 1)
    pdf.p(
        "مثال: POST /api/flights/nira/availability/ "
        "→ flights/urls.py → NiraAPIViewSet در views.py. "
        "فرانت: frontend/src/services/niraApi.ts"
    )

    pdf.h1("۴. سرویس‌ها و منطق کجاست؟")
    pdf.p("لایه Service مثل .NET به‌صورت یک پوشه واحد نیست؛ منطق پراکنده ولی قابل ردیابی است:")
    for item in [
        "flights/nira_client.py — ارتباط با API نیرا (مشابه HttpClient)",
        "flights/flight_status_service.py — وضعیت لحظه‌ای پرواز",
        "payments/nira_bridge.py — callback پرداخت",
        "bookings/inventory.py — hold موقت و revalidate",
        "flights/managers.py — کوئری‌های سفارشی روی Model",
        "flights/tasks.py + Celery — کار پس‌زمینه",
        "frontend/src/services/ — axios به /api",
    ]:
        pdf.bullet(item)
    pdf.p("برای دیباگ API: از views.py همان اپ شروع کنید و importها را دنبال کنید.")

    pdf.h1("۵. دیتابیس")
    pdf.h2("کانفیگ")
    pdf.p(
        "فایل nasim/settings.py بخش DATABASES. "
        "اگر DATABASE_URL در env باشد (Railway) از آن استفاده می‌شود. "
        "محلی: DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT در فایل .env در ریشه پروژه. "
        "تنظیم فعلی PostgreSQL است؛ db.sqlite3 در ریشه احتمالاً artifact قدیمی است."
    )
    pdf.h2("مدل و کوئری")
    pdf.p(
        "models.py = جدول (Entity). کوئری با ORM: Flight.objects.filter(...), "
        "Booking.objects.create(...), Airport.objects.get(code='THR'). "
        "معمولاً در views.py، managers.py، signals.py دیده می‌شود؛ نه SQL خام."
    )
    pdf.code_block([
        "python manage.py makemigrations",
        "python manage.py migrate",
    ])

    pdf.add_page()
    pdf.h1("۶. جریان یک درخواست API")
    pdf.code_block([
        "React (axios) -> /api/...",
        "  -> nasim/urls.py",
        "  -> flights/urls.py",
        "  -> views.py (ViewSet)",
        "  -> serializers.py (validate)",
        "  -> models / nira_client (DB یا خارجی)",
        "  -> JSON Response",
    ])

    pdf.h1("۷. اتصال فرانت")
    pdf.bullet("توسعه: npm start روی :3000 — proxy به :8000 در package.json")
    pdf.bullet("یک سرور: npm run build + build_frontend.py + collectstatic + runserver")
    pdf.bullet("تنظیم API: frontend/src/utils/apiBase.ts و REACT_APP_API_URL")

    pdf.h1("۸. اجرای پروژه — مرحله‌به‌مرحله (ویندوز)")
    pdf.h2("یک‌بار آماده‌سازی")
    pdf.bullet("python -m venv venv && .\\venv\\Scripts\\Activate.ps1")
    pdf.bullet("pip install -r requirements.txt")
    pdf.bullet("PostgreSQL + فایل .env (DB_*, SECRET_KEY, DEBUG=True)")
    pdf.bullet("python manage.py migrate")
    pdf.bullet("python manage.py createsuperuser  (پنل /admin)")
    pdf.bullet("cd frontend && npm install")
    pdf.p("متغیرهای Nira (اختیاری ولی برای جستجوی واقعی لازم): NIRA_BASE_URL, NIRA_OFFICE_USER, NIRA_OFFICE_PASS")

    pdf.h2("هر بار توسعه")
    pdf.p("روش ساده: .\\start-dev.ps1")
    pdf.bullet("بک‌اند: http://127.0.0.1:8000")
    pdf.bullet("فرانت زنده: http://localhost:3000")
    pdf.p("دستی: ترمینال۱ runserver 8000 — ترمینال۲ در frontend: npm start")

    pdf.h1("۹. Seed / داده اولیه")
    pdf.row3("دستور", "کار", "یادداشت", [62, 58, 80], header=True)
    seed = [
        ("populate_homepage_sections", "سکشن صفحه اصلی", "management command"),
        ("populate_site_defaults", "خدمات ویژه + مجله", "defaults/, fixtures"),
        ("populate_site_defaults --force", "بازنویسی", "اختیاری"),
        ("createsuperuser", "ادمین", "دستی"),
    ]
    for i, r in enumerate(seed):
        pdf.row3(*r, [62, 58, 80], fill=i % 2 == 1)
    pdf.p(
        "پرواز و رزرو واقعی عمدتاً از Nira یا پنل admin می‌آید؛ "
        "fixture مجله: blog/fixtures/magazine_defaults.json"
    )

    pdf.add_page()
    pdf.h1("۱۰. اپ‌های Django فعال")
    for item in [
        "authenticate — ورود، JWT، فراموشی رمز",
        "accounts — پروفایل، کیف پول، عضویت",
        "flights — پرواز + Nira",
        "bookings — رزرو، hold، initiate-payment",
        "payments — تراکنش، پل Nira",
        "blog / gallery — مجله، SEO، اسلایدر",
        "support — تیکت، چت، فرم‌ها",
        "customer_service, sms, notifications, pilots, security, main",
    ]:
        pdf.bullet(item)
    pdf.p("cart در settings ثبت نشده — کد legacy.")

    pdf.h1("۱۱. مسیر مطالعه پیشنهادی")
    for n, item in enumerate(
        [
            "nasim/urls.py — نقشه API",
            "nasim/settings.py — DB و Nira",
            "authenticate/views.py + authService.ts",
            "flights/views.py + nira_client.py",
            "bookings/views.py — initiate-payment",
            "frontend/src/App.tsx — مسیرهای UI",
        ],
        1,
    ):
        pdf.bullet(f"{n}. {item}")

    pdf.h1("۱۲. جمع‌بندی")
    pdf.p(
        "Controller ≈ views.py | Entity ≈ models.py | DTO ≈ serializers.py | "
        "Routing ≈ urls.py | DB ≈ settings + .env | Query ≈ Model.objects. "
        "Run: venv + migrate + runserver + npm start. "
        "Seed: populate_homepage_sections و populate_site_defaults."
    )
    pdf.ln(3)
    pdf.body(8)
    pdf.cell(
        0,
        5,
        rtl("تولید مجدد: python scripts/generate_django_guide_pdf.py"),
        new_x="LMARGIN",
        new_y="NEXT",
        align="R",
    )

    pdf.output(str(OUT))
    print(f"Written: {OUT}")


if __name__ == "__main__":
    main()
