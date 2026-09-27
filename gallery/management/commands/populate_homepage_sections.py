"""
Management command to populate default HomePageSectionItem and HomePageSectionConfig.
Run: python manage.py populate_homepage_sections
"""
from django.core.management.base import BaseCommand
from gallery.models import HomePageSectionItem, HomePageSectionConfig


class Command(BaseCommand):
    help = 'Populate default homepage section items and configs'

    def handle(self, *args, **options):
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
            {
                'section_type': 'HERO',
                'title1_fa': 'با نسیم پرواز کنید',
                'title1_ar': 'حلّق مع نسيم',
                'title1_en': 'Fly with Nasim',
                'title2_fa': 'سفری امن و راحت در انتظار شماست',
                'title2_ar': 'رحلة آمنة ومريحة بانتظارك',
                'title2_en': 'A safe and comfortable journey awaits you',
            },
            {
                'section_type': 'QUOTE',
                'title1_fa': 'سفری امن، راحت و به یادماندنی',
                'title1_ar': 'رحلة آمنة، مريحة لا تُنسى',
                'title1_en': 'A safe, comfortable and memorable journey',
                'title2_fa': 'A safe, comfortable and memorable trip',
                'title2_ar': 'A safe, comfortable and memorable trip',
                'title2_en': 'A safe, comfortable and memorable trip',
            },
            {
                'section_type': 'MEMBERSHIP',
                'title1_fa': 'به باشگاه مشتریان بپیوندید',
                'title1_ar': 'انضم إلى نادي العملاء',
                'title1_en': 'Join our loyalty club',
                'title2_fa': 'از مزایای عضویت برنزی، نقره‌ای و طلایی بهره‌مند شوید',
                'title2_ar': 'استفد من مزايا العضوية البرونزية والفضية والذهبية',
                'title2_en': 'Enjoy bronze, silver and gold membership benefits',
                'title3_fa': 'عضویت',
                'title3_ar': 'انضم الآن',
                'title3_en': 'Join now',
            },
            {
                'section_type': 'SURVEY',
                'title1_fa': 'تجربه پرواز خود را بهتر کنید',
                'title1_ar': 'حسّن تجربة رحلتك',
                'title1_en': 'Enhance your flight experience',
                'title2_fa': 'با شرکت در نظرسنجی یا عضویت در باشگاه مشتریان، خدمات بهتری دریافت کنید',
                'title2_ar': 'شارك في الاستبيان أو انضم لنادي العملاء للحصول على خدمات أفضل',
                'title2_en': 'Take our survey or join membership for a better experience',
                'title3_fa': 'لینک نظرسنجی',
                'title3_ar': 'رابط الاستبيان',
                'title3_en': 'Survey Link',
            },
            {
                'section_type': 'FAQ',
                'title1_fa': 'سوالات متداول',
                'title1_ar': 'الأسئلة الشائعة',
                'title1_en': 'Frequently Asked Questions',
                'title2_fa': 'پاسخ سوالات رایج خود را در مورد رزرو، پرواز، خدمات و پشتیبانی پیدا کنید',
                'title2_ar': 'ابحث عن إجابات لأسئلتك الشائعة حول الحجز والرحلات والخدمات والدعم',
                'title2_en': 'Find answers to your common questions about booking, flights, services and support',
            },
            {
                'section_type': 'POPULAR_ROUTES',
                'title1_fa': 'مسیرهای پرطرفدار',
                'title1_ar': 'المسارات الشائعة',
                'title1_en': 'Popular Routes',
            },
        ]
        for data in configs_data:
            obj, created = HomePageSectionConfig.objects.update_or_create(
                section_type=data['section_type'],
                defaults={k: v for k, v in data.items() if k != 'section_type'}
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f"{action} config: {data['section_type']}"))

        special_services = [
            {'order': 1, 'title_fa': 'شبکه پروازی', 'title_ar': 'شبكة الطيران', 'title_en': 'Flight Network', 'link_url': '/flights/map'},
            {'order': 2, 'title_fa': 'آب و هوا', 'title_ar': 'الطقس', 'title_en': 'Weather', 'link_url': 'weather'},
            {'order': 3, 'title_fa': 'پروازهای فرودگاه مهرآباد', 'title_ar': 'رحلات مطار مهرآباد', 'title_en': 'Mehrabad Airport Flights', 'link_url': 'https://fids.airport.ir/'},
            {'order': 4, 'title_fa': 'پروازهای فرودگاه امام', 'title_ar': 'رحلات مطار الإمام', 'title_en': 'Imam Airport Flights', 'link_url': 'https://ikac.ir/'},
        ]
        for item_data in special_services:
            _, created = HomePageSectionItem.objects.update_or_create(
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
                self.stdout.write(self.style.SUCCESS(f"Created SPECIAL_SERVICE order {item_data['order']}"))

        experience_items = [
            {'order': 1, 'title_fa': 'تصویر ۱', 'title_ar': 'صورة ١', 'title_en': 'Image 1', 'link_url': '/tickets'},
            {'order': 2, 'title_fa': 'تصویر ۲', 'title_ar': 'صورة ٢', 'title_en': 'Image 2', 'link_url': '/tickets'},
            {'order': 3, 'title_fa': 'فرودگاه مهرآباد', 'title_ar': 'مطار مهرآباد', 'title_en': 'Mehrabad Airport', 'link_url': 'https://fids.airport.ir/'},
            {'order': 4, 'title_fa': 'تصویر ۴', 'title_ar': 'صورة ٤', 'title_en': 'Image 4', 'link_url': 'https://ikac.ir/'},
            {'order': 5, 'title_fa': 'ایرانولوژی', 'title_ar': 'إيرانولوجيا', 'title_en': 'Iranology', 'link_url': '/iranology'},
        ]
        for item_data in experience_items:
            _, created = HomePageSectionItem.objects.update_or_create(
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
                self.stdout.write(self.style.SUCCESS(f"Created EXPERIENCE order {item_data['order']}"))

        # Survey banner: one item for background image + button link
        _, created = HomePageSectionItem.objects.update_or_create(
            section_type='SURVEY',
            order=1,
            defaults={
                'title_fa': 'بنر نظرسنجی',
                'title_ar': 'بانر الاستبيان',
                'title_en': 'Survey banner',
                'link_url': '/membership',
                'is_active': True,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created SURVEY item'))

        faq_items = [
            {
                'order': 1,
                'title_fa': 'راهنمای رزرو و خرید بلیط',
                'title_ar': 'دليل الحجز وشراء التذاكر',
                'title_en': 'Booking guide',
                'description_fa': (
                    'چگونه می‌توانم پرواز خود را رزرو کنم؟\n'
                    'شما می‌توانید از طریق وب‌سایت، اپلیکیشن یا تماس با مرکز رزرواسیون پرواز خود را رزرو کنید.\n\n'
                    'آیا امکان تغییر یا لغو رزرو وجود دارد؟\n'
                    'بله، با توجه به قوانین بلیط از طریق پنل کاربری یا پشتیبانی می‌توانید تغییر یا لغو کنید.'
                ),
                'description_ar': 'محتوى الأسئلة الشائعة للحجز',
                'description_en': 'FAQ content for booking',
            },
            {
                'order': 2,
                'title_fa': 'امکانات و خدمات در پرواز',
                'title_ar': 'المرافق والخدمات',
                'title_en': 'Flight amenities',
                'description_fa': (
                    'چه خدماتی در طول پرواز ارائه می‌شود؟\n'
                    'پذیرایی، وای‌فای، سرگرمی پرواز و خدمات ویژه مسافران VIP.\n\n'
                    'آیا امکان حمل بار اضافی وجود دارد؟\n'
                    'بله، با پرداخت هزینه اضافی مطابق قوانین بار.'
                ),
                'description_ar': 'محتوى الأسئلة الشائعة للخدمات',
                'description_en': 'FAQ content for services',
            },
            {
                'order': 3,
                'title_fa': 'وضعیت پرواز و جزئیات',
                'title_ar': 'حالة الرحلة والتفاصيل',
                'title_en': 'Flight status',
                'description_fa': (
                    'چگونه وضعیت پرواز را بررسی کنم؟\n'
                    'از بخش وضعیت پرواز در سایت یا اپلیکیشن.\n\n'
                    'چه زمانی در فرودگاه حاضر شوم؟\n'
                    'پرواز داخلی حداقل ۹۰ دقیقه و بین‌المللی حداقل ۳ ساعت قبل.'
                ),
                'description_ar': 'محتوى الأسئلة الشائعة لمعلومات الرحلة',
                'description_en': 'FAQ content for flight info',
            },
            {
                'order': 4,
                'title_fa': 'راه‌های ارتباط با پشتیبانی',
                'title_ar': 'طرق الاتصال بالدعم',
                'title_en': 'Contact support',
                'description_fa': (
                    'چگونه با پشتیبانی تماس بگیرم؟\n'
                    'از چت آنلاین سایت، فرم تماس یا مرکز تماس هواپیمایی نسیم.'
                ),
                'description_ar': 'محتوى الأسئلة الشائعة للدعم',
                'description_en': 'FAQ content for support',
            },
        ]
        for item_data in faq_items:
            _, created = HomePageSectionItem.objects.update_or_create(
                section_type='FAQ',
                order=item_data['order'],
                defaults={
                    'title_fa': item_data['title_fa'],
                    'title_ar': item_data['title_ar'],
                    'title_en': item_data['title_en'],
                    'description_fa': item_data['description_fa'],
                    'description_ar': item_data['description_ar'],
                    'description_en': item_data['description_en'],
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created FAQ order {item_data['order']}"))

        popular_routes = [
            {
                'order': 1,
                'title_fa': 'تهران - مشهد',
                'title_ar': 'طهران - مشهد',
                'title_en': 'Tehran - Mashhad',
                'description_fa': 'از ۸,۵۰۰,۰۰۰ تومان',
                'description_ar': 'من ۸,۵۰۰,۰۰۰ تومان',
                'description_en': 'From 8,500,000 Toman',
                'link_url': '/tickets',
            },
            {
                'order': 2,
                'title_fa': 'تهران - کیش',
                'title_ar': 'طهران - كيش',
                'title_en': 'Tehran - Kish',
                'description_fa': 'از ۷,۲۰۰,۰۰۰ تومان',
                'description_ar': 'من ۷,۲۰۰,۰۰۰ تومان',
                'description_en': 'From 7,200,000 Toman',
                'link_url': '/tickets',
            },
            {
                'order': 3,
                'title_fa': 'مشهد - شیراز',
                'title_ar': 'مشهد - شيراز',
                'title_en': 'Mashhad - Shiraz',
                'description_fa': 'از ۶,۹۰۰,۰۰۰ تومان',
                'description_ar': 'من ۶,۹۰۰,۰۰۰ تومان',
                'description_en': 'From 6,900,000 Toman',
                'link_url': '/tickets',
            },
            {
                'order': 4,
                'title_fa': 'تهران - اصفهان',
                'title_ar': 'طهران - أصفهان',
                'title_en': 'Tehran - Isfahan',
                'description_fa': 'از ۵,۸۰۰,۰۰۰ تومان',
                'description_ar': 'من ۵,۸۰۰,۰۰۰ تومان',
                'description_en': 'From 5,800,000 Toman',
                'link_url': '/tickets',
            },
        ]
        for item_data in popular_routes:
            _, created = HomePageSectionItem.objects.update_or_create(
                section_type='POPULAR_ROUTES',
                order=item_data['order'],
                defaults={
                    'title_fa': item_data['title_fa'],
                    'title_ar': item_data['title_ar'],
                    'title_en': item_data['title_en'],
                    'description_fa': item_data['description_fa'],
                    'description_ar': item_data['description_ar'],
                    'description_en': item_data['description_en'],
                    'link_url': item_data['link_url'],
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created POPULAR_ROUTES order {item_data['order']}"))

        self.stdout.write(self.style.SUCCESS(
            'Done. Upload images via admin (Hero Slider, section items, survey banner).'
        ))
