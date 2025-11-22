"""
Script to create UUID migrations for all models
Run this script to generate UUID migrations for existing records
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nasim.settings')
django.setup()

from django.db import migrations
import uuid

# List of models that need UUID migration
MODELS_TO_MIGRATE = [
    ('bookings', 'Booking'),
    ('payments', 'Payment'),
    ('payments', 'Transaction'),
    ('notifications', 'Notification'),
    ('pilots', 'Pilot'),
    ('pilots', 'PilotRequest'),
    ('security', 'SecurityInfo'),
    ('security', 'SecurityAlert'),
    ('flights', 'Airport'),
    ('flights', 'Aircraft'),
    ('flights', 'Flight'),
    ('blog', 'Article'),
    ('blog', 'Comment'),
]

def generate_uuid_migration_content(app_name, model_name):
    """Generate migration content for UUID field"""
    
    function_name = f"generate_uuids_for_existing_{model_name.lower()}s"
    
    content = f"""# Generated migration for {model_name}.uuid

import uuid
from django.db import migrations, models


def {function_name}(apps, schema_editor):
    \"\"\"
    Generate UUIDs for existing {model_name} records
    \"\"\"
    {model_name} = apps.get_model('{app_name}', '{model_name}')
    for obj in {model_name}.objects.all():
        if not obj.uuid:
            obj.uuid = uuid.uuid4()
            obj.save(update_fields=['uuid'])


class Migration(migrations.Migration):

    dependencies = [
        ('{app_name}', '0001_initial'),
    ]

    operations = [
        # Step 1: Add uuid field with null=True
        migrations.AddField(
            model_name='{model_name.lower()}',
            name='uuid',
            field=models.UUIDField(
                default=None,
                editable=False,
                null=True,
                unique=False,
                db_index=True,
                verbose_name='شناسه یکتا'
            ),
        ),
        # Step 2: Generate UUIDs for existing records
        migrations.RunPython(
            {function_name},
            reverse_code=migrations.RunPython.noop
        ),
        # Step 3: Make uuid field NOT NULL and UNIQUE
        migrations.AlterField(
            model_name='{model_name.lower()}',
            name='uuid',
            field=models.UUIDField(
                default=uuid.uuid4,
                editable=False,
                unique=True,
                db_index=True,
                verbose_name='شناسه یکتا'
            ),
        ),
    ]
"""
    return content

if __name__ == '__main__':
    print("This script shows the migration template.")
    print("Please run: python manage.py makemigrations")
    print("Then select option 1 for each model.")
    print("\nAfter that, I will help you edit the migrations.")

