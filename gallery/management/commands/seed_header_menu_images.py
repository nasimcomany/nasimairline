"""
Seed HeaderMenuImage rows for every header menu option / nested child / destination cell.
Does not overwrite existing rows (admin-owned images stay intact).

  python manage.py seed_header_menu_images
"""
from django.core.management.base import BaseCommand

from gallery.models import HeaderMenuImage

# (menu_key, item_key, label_fa, label_en, order)
SLOTS = [
    # رزرو
    ('flyWithNasim', '0', 'زمان مراجعه و پذیرش', 'Check-in time', 10),
    ('flyWithNasim', '1', 'مسافرین غیر قابل پذیرش', 'Unacceptable passengers', 20),
    ('flyWithNasim', '2', 'مسافرین ویژه', 'Special passengers', 30),
    ('flyWithNasim', '2.0', 'انتخاب صندلی', 'Seat selection', 31),
    ('flyWithNasim', '2.1', 'درخواست ولیچر', 'Wheelchair request', 32),
    ('flyWithNasim', '3', 'استرداد', 'Refund', 40),
    ('flyWithNasim', '4', 'جامه دان', 'Baggage', 50),
    ('flyWithNasim', '4.0', 'بار همراه مسافر', 'Passenger baggage', 51),
    ('flyWithNasim', '4.1', 'پذیرش بار همراه', 'Carry-on acceptance', 52),
    ('flyWithNasim', '4.2', 'اقلام ممنوعه', 'Prohibited items', 53),
    ('flyWithNasim', '4.3', 'اضافه بار', 'Excess baggage', 54),
    # مقاصد (گزینه‌ها)
    ('wherewefly', '0', 'مقاصد داخلی', 'Domestic destinations', 10),
    ('wherewefly', '1', 'مقاصد خارجی', 'International destinations', 20),
    ('wherewefly', '2', 'همه مقاصد', 'All destinations', 30),
    # ارتباط با ما
    ('about', '0', 'تاریخچه نسیم', 'Nasim history', 10),
    ('about', '1', 'ناوگان هوایی', 'Airline fleet', 20),
    ('about', '2', 'تماس با ما', 'Contact us', 30),
    ('about', '3', 'درخواست همکاری', 'Cooperation request', 40),
    ('about', '4', 'آموزش نسیم', 'Nasim training', 50),
    ('about', '5', 'مجله نسیم', 'Nasim magazine', 60),
    ('about', '6', 'گزارش مخاطرات ایمنی', 'Safety hazard report', 70),
]

# Destination grid cells: dest.<category>.<cell>
DEST_LABELS = {
    0: ['تهران', 'مشهد', 'کیش', 'آبادان', 'تبریز', 'اصفهان'],
    1: ['دبی', 'استانبول', 'پاریس', 'لندن', 'نیویورک', 'توکیو'],
    2: ['تهران', 'مشهد', 'دبی', 'کیش', 'استانبول', 'اصفهان'],
}
DEST_LABELS_EN = {
    0: ['Tehran', 'Mashhad', 'Kish', 'Abadan', 'Tabriz', 'Isfahan'],
    1: ['Dubai', 'Istanbul', 'Paris', 'London', 'New York', 'Tokyo'],
    2: ['Tehran', 'Mashhad', 'Dubai', 'Kish', 'Istanbul', 'Isfahan'],
}


class Command(BaseCommand):
    help = 'Seed header menu image slots (create missing only)'

    def handle(self, *args, **options):
        created = 0
        for menu_key, item_key, label_fa, label_en, order in SLOTS:
            _, was_created = HeaderMenuImage.objects.get_or_create(
                menu_key=menu_key,
                item_key=item_key,
                defaults={
                    'label_fa': label_fa,
                    'label_en': label_en,
                    'order': order,
                    'is_active': True,
                },
            )
            if was_created:
                created += 1

        order_base = 100
        for cat in range(3):
            for cell in range(6):
                item_key = f'dest.{cat}.{cell}'
                _, was_created = HeaderMenuImage.objects.get_or_create(
                    menu_key='wherewefly',
                    item_key=item_key,
                    defaults={
                        'label_fa': f'مقاصد — {DEST_LABELS[cat][cell]}',
                        'label_en': f'Destinations — {DEST_LABELS_EN[cat][cell]}',
                        'order': order_base + cat * 10 + cell,
                        'is_active': True,
                    },
                )
                if was_created:
                    created += 1

        total = HeaderMenuImage.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f'Header menu image slots ready. created={created} total={total}'
        ))
