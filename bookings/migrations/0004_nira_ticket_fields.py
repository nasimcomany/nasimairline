# Generated manually for Nira PNR / e-ticket fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0003_soft_hold_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='nira_pnr',
            field=models.CharField(
                blank=True,
                db_index=True,
                max_length=32,
                null=True,
                verbose_name='PNR نیرا',
            ),
        ),
        migrations.AddField(
            model_name='booking',
            name='nira_ticket_numbers',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='لیست شماره بلیط الکترونیک پس از صدور',
                verbose_name='شماره بلیط\u200cهای نیرا',
            ),
        ),
        migrations.AddField(
            model_name='booking',
            name='nira_session_id',
            field=models.CharField(
                blank=True,
                db_index=True,
                max_length=128,
                null=True,
                verbose_name='Session نیرا',
            ),
        ),
        migrations.AddField(
            model_name='booking',
            name='ticket_issued_at',
            field=models.DateTimeField(
                blank=True,
                db_index=True,
                null=True,
                verbose_name='زمان صدور بلیط',
            ),
        ),
    ]
