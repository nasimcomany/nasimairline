"""
Management command to populate default HomePageSectionItem and HomePageSectionConfig.
Run: python manage.py populate_homepage_sections
"""
from django.core.management.base import BaseCommand
from gallery.models import HomePageSectionItem, HomePageSectionConfig


class Command(BaseCommand):
    help = 'Populate default homepage section items and configs'

    def handle(self, *args, **options):
        # Section configs
        configs_data = [
            {
                'section_type': 'SPECIAL_SERVICE',
                'title1_fa': 'خدمات ویژه هواپیمایی نسیم',
                'title1_ar': 'خدمات نسيم إير الخاصة',
                'title1_en': 'Nasim Air Special Services',
            },
            {
                'section_type': 'EXPERIENCE',
                'title1_fa': 'پرواز با هواپیمایی نسیم',
                'title1_ar': 'الطيران مع نسيم إير',
                'title1_en': 'Fly with Nasim Air',
                'title2_fa': 'هواپیمایی نسیم را تجربه کنید',
                'title2_ar': 'استكشف نسيم إير',
                'title2_en': 'Explore Nasim Air',
                'title3_fa': 'سفری فراموش‌نشدنی فراتر از پرواز خود برنامه‌ریزی کنید',
                'title3_ar': 'خطط لرحلة لا تُنسى تتجاوز رحلتك',
                'title3_en': 'Plan an unforgettable journey beyond your flight',
            },
        ]
        for data in configs_data:
            _, created = HomePageSectionConfig.objects.update_or_create(
                section_type=data['section_type'],
                defaults=data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created config: {data['section_type']}"))

        # Special Service items (4 items - use default images path, admin can upload later)
        special_services = [
            {'order': 1, 'title_fa': 'شبکه پروازی', 'title_ar': 'شبكة الطيران', 'title_en': 'Flight Network', 'link_url': '#search-form'},
            {'order': 2, 'title_fa': 'آب و هوا', 'title_ar': 'الطقس', 'title_en': 'Weather', 'link_url': 'chat:luggage_tracking'},
            {'order': 3, 'title_fa': 'پروازهای فرودگاه مهرآباد', 'title_ar': 'رحلات مطار مهرآباد', 'title_en': 'Mehrabad Airport Flights', 'link_url': '/meal-feedback'},
            {'order': 4, 'title_fa': 'پروازهای فرودگاه امام', 'title_ar': 'رحلات مطار الإمام', 'title_en': 'Imam Airport Flights', 'link_url': '/flights/map'},
        ]
        for item_data in special_services:
            obj, created = HomePageSectionItem.objects.update_or_create(
                section_type='SPECIAL_SERVICE',
                order=item_data['order'],
                defaults={
                    'title_fa': item_data['title_fa'],
                    'title_ar': item_data['title_ar'],
                    'title_en': item_data['title_en'],
                    'link_url': item_data['link_url'],
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created item order {item_data['order']}"))

        # Experience items (5 items)
        experience_items = [
            {'order': 1, 'title_fa': 'تصویر ۱', 'title_ar': 'صورة ١', 'title_en': 'Image 1', 'link_url': '/tickets'},
            {'order': 2, 'title_fa': 'تصویر ۲', 'title_ar': 'صورة ٢', 'title_en': 'Image 2', 'link_url': '/tickets'},
            {'order': 3, 'title_fa': 'فرودگاه مهرآباد', 'title_ar': 'مطار مهرآباد', 'title_en': 'Mehrabad Airport', 'link_url': 'https://fids.airport.ir/'},
            {'order': 4, 'title_fa': 'تصویر ۴', 'title_ar': 'صورة ٤', 'title_en': 'Image 4', 'link_url': 'https://ikac.ir/'},
            {'order': 5, 'title_fa': 'ایرانولوژی', 'title_ar': 'إيرانولوجيا', 'title_en': 'Iranology', 'link_url': '/iranology'},
        ]
        for item_data in experience_items:
            obj, created = HomePageSectionItem.objects.update_or_create(
                section_type='EXPERIENCE',
                order=item_data['order'],
                defaults={
                    'title_fa': item_data['title_fa'],
                    'title_ar': item_data['title_ar'],
                    'title_en': item_data['title_en'],
                    'link_url': item_data['link_url'],
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created item order {item_data['order']}"))

        self.stdout.write(self.style.SUCCESS('Done. Upload images via admin panel.'))
