# داده‌ای: کاربران عادی (غیر superuser) که is_staff=True دارند، به False تغییر می‌یابد
# superuserها دست نخورده می‌مانند (برای دسترسی به پنل ادمین)

from django.db import migrations


def set_is_staff_false_for_non_superusers(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.filter(is_superuser=False, is_staff=True).update(is_staff=False)


def reverse_noop(apps, schema_editor):
    # برگرداندن امکان‌پذیر نیست - نمی‌دانیم کدام کاربران قبلاً is_staff=True بودند
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_alter_user_is_staff'),
    ]

    operations = [
        migrations.RunPython(set_is_staff_false_for_non_superusers, reverse_noop),
    ]
