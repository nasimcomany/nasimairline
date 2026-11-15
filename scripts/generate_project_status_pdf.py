# -*- coding: utf-8 -*-
"""Generate concise Persian PDF: project components and status."""
from pathlib import Path
from datetime import date
import subprocess
import sys

try:
    import arabic_reshaper
    from bidi.algorithm import get_display
except ImportError:
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "-q", "arabic-reshaper", "python-bidi"]
    )
    import arabic_reshaper
    from bidi.algorithm import get_display

from fpdf import FPDF

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "PROJECT_STATUS_BASELINE_FA.pdf"
FONT = Path(r"C:\Windows\Fonts\tahoma.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\tahomabd.ttf")


def rtl(text: str) -> str:
    if not text:
        return ""
    return get_display(arabic_reshaper.reshape(text))


class StatusPDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_auto_page_break(auto=True, margin=16)
        self.set_margins(14, 14, 14)
        self.add_font("Tahoma", "", str(FONT))
        self.add_font("Tahoma", "B", str(FONT_BOLD if FONT_BOLD.exists() else FONT))

    def body(self, size=10, bold=False):
        self.set_font("Tahoma", "B" if bold else "", size=size)

    def right_cell(self, w, h, txt, border=0, fill=False, header=False):
        if header:
            self.set_fill_color(30, 58, 138)
            self.set_text_color(255, 255, 255)
        else:
            self.set_text_color(0, 0, 0)
        self.cell(w, h, rtl(txt), border=border, align="R", fill=fill)
        if header:
            self.set_text_color(0, 0, 0)

    def section(self, title: str):
        self.set_x(self.l_margin)
        self.ln(4)
        self.body(12, bold=True)
        self.cell(0, 8, rtl(title), new_x="LMARGIN", new_y="NEXT", align="R")
        self.ln(1)

    def row3(self, c1, c2, c3, widths, header=False, fill=False):
        self.body(9)
        if fill and not header:
            self.set_fill_color(248, 250, 252)
        self.right_cell(widths[0], 7, c1, 1, fill or header, header)
        self.right_cell(widths[1], 7, c2, 1, fill or header, header)
        self.right_cell(widths[2], 7, c3, 1, fill or header, header)
        self.ln()


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    w = [42, 78, 70]
    pdf = StatusPDF()
    pdf.add_page()

    pdf.body(16, bold=True)
    pdf.cell(0, 10, rtl("گزارش وضعیت پروژه — هواپیمایی نسیم ایر"), new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.body(9)
    pdf.cell(
        0,
        6,
        rtl(f"تاریخ: {date.today().isoformat()}  |  React + Django  |  سند خط مبنای تحویل"),
        new_x="LMARGIN",
        new_y="NEXT",
        align="C",
    )
    pdf.ln(3)
    pdf.body(10)
    pdf.multi_cell(
        0,
        5,
        rtl(
            "خلاصه: فرانت و APIهای محتوا/پشتیبانی در سطح خوب؛ "
            "فروش بلیت به Nira و env وابسته است؛ پرداخت ملی و پیگیری رزرو ناقص."
        ),
        align="R",
    )

    pdf.section("۱. پشته فنی")
    pdf.row3("بخش", "تکنولوژی", "وضعیت", w, header=True)
    rows = [
        ("Frontend", "React 19, TS, Redux, Tailwind", "UI ~۹۰٪"),
        ("Backend", "Django 5.2, DRF, JWT", "نیاز .env"),
        ("Database", "PostgreSQL", "migrate لازم"),
        ("Cache/Queue", "Redis, Celery", "اختیاری محلی"),
        ("Deploy", "Docker, Railway, Gunicorn", "آماده پیکربندی"),
    ]
    for i, r in enumerate(rows):
        pdf.row3(*r, w, fill=i % 2 == 1)

    pdf.section("۲. ماژول‌های بک‌اند")
    pdf.row3("ماژول", "کاربرد", "وضعیت", w, header=True)
    apps = [
        ("authenticate", "ورود، JWT، فراموشی رمز", "~۸۰٪"),
        ("accounts", "پروفایل، کیف پول", "wallet ناقص"),
        ("flights", "پرواز + Nira", "Availability OK"),
        ("bookings", "رزرو، hold", "~۶۵٪"),
        ("payments", "تراکنش، Nira bridge", "درگاه ملی ناقص"),
        ("blog / gallery", "مجله، SEO، home", "~۸۵٪"),
        ("support", "تیکت، چت، فرم‌ها", "~۷۵٪"),
        ("customer_service", "tier، meal", "~۷۰٪"),
        ("sms", "ملی پیامک", "نیاز credential"),
        ("cart", "—", "غیرفعال"),
    ]
    for i, r in enumerate(apps):
        pdf.row3(*r, w, fill=i % 2 == 1)

    pdf.add_page()
    pdf.section("۳. بخش‌های فرانت")
    pdf.row3("بخش", "مسیر", "وضعیت", w, header=True)
    pages = [
        ("جستجو و Home", "/", "عملیاتی"),
        ("نتایج پرواز", "/flights/results", "Nira API"),
        ("رزرو", "/booking/details", "hold + login"),
        ("پرداخت", "/payment", "Nira/mock"),
        ("وضعیت پرواز", "/flight/status", "نیاز keys"),
        ("داشبورد/کیف", "/dashboard", "wallet ناقص"),
        ("پشتیبانی/فرم‌ها", "tickets, survey", "API"),
        ("محتوا", "magazine, gallery", "API"),
        ("پیگیری رزرو", "/booking/manage", "Mock"),
    ]
    for i, r in enumerate(pages):
        pdf.row3(*r, w, fill=i % 2 == 1)

    pdf.section("۴. جریان فروش")
    w2 = [55, 135]
    pdf.row3("مرحله", "وضعیت", "", [w2[0], w2[1], 0], header=True)
    flow = [
        ("جستجو Nira", "فعال در UI"),
        ("initiate-payment", "soft-hold در DB"),
        ("پرداخت Nira", "وابسته airline env"),
        ("۶ درگاه UI", "mock؛ API قدیمی ندارد"),
        ("PNR واقعی", "محدود"),
        ("کد تخفیف", "فقط UI"),
    ]
    for i, (a, b) in enumerate(flow):
        pdf.body(9)
        if i % 2 == 1:
            pdf.set_fill_color(248, 250, 252)
        pdf.right_cell(w2[0], 7, a, 1, True)
        pdf.right_cell(w2[1], 7, b, 1, True)
        pdf.ln()

    pdf.section("۵. env ضروری")
    for line in [
        "NIRA_* — جستجو و پرداخت",
        "DB_* / DATABASE_URL",
        "EMAIL_*, MELLIPAYAMAK_*",
        "REDIS_URL (production)",
        "WEATHER_API_KEY",
    ]:
        pdf.body(9)
        pdf.cell(0, 6, rtl("- " + line), new_x="LMARGIN", new_y="NEXT", align="R")

    pdf.section("۶. ریسک‌های تحویل")
    risks = [
        "PROJECT_STATUS.md قدیمی است.",
        "بدون build فرانت، Django SPA خالی است.",
        "process_payment بدون verify درگاه.",
        "تست خودکار تقریباً خالی.",
        "تاریخچه رزرو در localStorage.",
    ]
    for r in risks:
        pdf.set_x(pdf.l_margin)
        pdf.body(9)
        pdf.cell(0, 6, rtl("- " + r), new_x="LMARGIN", new_y="NEXT", align="R")

    pdf.output(str(OUT))
    print(f"Written: {OUT}")


if __name__ == "__main__":
    main()
