from django.db import migrations, models


ARABIC_LABELS = {
    ('flyWithNasim', '0'): 'وقت المراجعة والاستقبال',
    ('flyWithNasim', '1'): 'الركاب غير المقبولين',
    ('flyWithNasim', '2'): 'الركاب الخاصون',
    ('flyWithNasim', '2.0'): 'اختيار المقعد',
    ('flyWithNasim', '2.1'): 'طلب كرسي متحرك',
    ('flyWithNasim', '3'): 'الاسترداد',
    ('flyWithNasim', '4'): 'الأمتعة',
    ('flyWithNasim', '4.0'): 'أمتعة المسافر المرافقة',
    ('flyWithNasim', '4.1'): 'قبول الأمتعة المرافقة',
    ('flyWithNasim', '4.2'): 'العناصر المحظورة',
    ('flyWithNasim', '4.3'): 'الأمتعة الزائدة',
    ('wherewefly', '0'): 'داخلي',
    ('wherewefly', '1'): 'دولي',
    ('wherewefly', '2'): 'جميع الوجهات',
    ('about', '0'): 'تاريخ نسيم',
    ('about', '1'): 'أسطول الطائرات',
    ('about', '2'): 'اتصل بنا',
    ('about', '3'): 'طلب التعاون',
    ('about', '4'): 'تدريب نسيم',
    ('about', '5'): 'مجلة نسيم',
    ('about', '6'): 'تقرير المخاطر (SHOR)',
    ('wherewefly', 'dest.0.0'): 'طهران',
    ('wherewefly', 'dest.0.1'): 'مشهد',
    ('wherewefly', 'dest.0.2'): 'كيش',
    ('wherewefly', 'dest.0.3'): 'عبادان',
    ('wherewefly', 'dest.0.4'): 'تبريز',
    ('wherewefly', 'dest.0.5'): 'أصفهان',
    ('wherewefly', 'dest.1.0'): 'دبي',
    ('wherewefly', 'dest.1.1'): 'إسطنبول',
    ('wherewefly', 'dest.1.2'): 'باريس',
    ('wherewefly', 'dest.1.3'): 'لندن',
    ('wherewefly', 'dest.1.4'): 'نيويورك',
    ('wherewefly', 'dest.1.5'): 'طوكيو',
    ('wherewefly', 'dest.2.0'): 'طهران',
    ('wherewefly', 'dest.2.1'): 'مشهد',
    ('wherewefly', 'dest.2.2'): 'دبي',
    ('wherewefly', 'dest.2.3'): 'كيش',
    ('wherewefly', 'dest.2.4'): 'إسطنبول',
    ('wherewefly', 'dest.2.5'): 'أصفهان',
}


def fill_empty_arabic_labels(apps, schema_editor):
    HeaderMenuImage = apps.get_model('gallery', 'HeaderMenuImage')
    for row in HeaderMenuImage.objects.all():
        if (row.label_ar or '').strip():
            continue
        label = ARABIC_LABELS.get((row.menu_key, row.item_key))
        if label:
            row.label_ar = label
            row.save(update_fields=['label_ar'])


class Migration(migrations.Migration):

    dependencies = [
        ('gallery', '0006_header_menu_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='headermenuimage',
            name='label_ar',
            field=models.CharField(blank=True, max_length=200, verbose_name='عنوان عربی (ادمین)'),
        ),
        migrations.RunPython(fill_empty_arabic_labels, migrations.RunPython.noop),
    ]
