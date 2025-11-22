"""
Script to automatically fix all UUID migrations
Run this after makemigrations is complete
"""
import os
import re
import glob

def fix_migration_file(file_path, app_name, model_name):
    """Fix a single migration file to generate UUIDs for existing records"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already fixed
    if 'generate_uuids_for_existing' in content:
        print(f"✓ {file_path} already fixed")
        return False
    
    # Find the AddField operation for uuid
    uuid_add_pattern = r"migrations\.AddField\(\s*model_name=['\"](\w+)['\"],\s*name=['\"]uuid['\"],"
    match = re.search(uuid_add_pattern, content)
    
    if not match:
        print(f"⚠ {file_path} - No uuid AddField found")
        return False
    
    model_name_lower = match.group(1)
    
    # Generate the function name
    function_name = f"generate_uuids_for_existing_{model_name_lower}s"
    
    # Create the RunPython function
    runpython_function = f"""
def {function_name}(apps, schema_editor):
    \"\"\"
    Generate UUIDs for existing {model_name} records
    \"\"\"
    import uuid
    {model_name} = apps.get_model('{app_name}', '{model_name}')
    for obj in {model_name}.objects.all():
        if not obj.uuid:
            obj.uuid = uuid.uuid4()
            obj.save(update_fields=['uuid'])


"""
    
    # Add import uuid if not present
    if 'import uuid' not in content:
        content = content.replace('from django.db import migrations, models', 
                                 'import uuid\nfrom django.db import migrations, models')
    
    # Find the AddField operation and add RunPython after it
    addfield_pattern = r"(migrations\.AddField\([^)]+name=['\"]uuid['\"][^)]+\),)"
    
    replacement = f"\\1\n        # Generate UUIDs for existing records\n        migrations.RunPython(\n            {function_name},\n            reverse_code=migrations.RunPython.noop\n        ),"
    
    content = re.sub(addfield_pattern, replacement, content, flags=re.DOTALL)
    
    # Add the function before the Migration class
    class_pattern = r"(class Migration\(migrations\.Migration\):)"
    content = re.sub(class_pattern, runpython_function + r"\1", content)
    
    # Find AlterField for uuid and make it unique and not null
    alterfield_pattern = r"(migrations\.AlterField\([^)]+name=['\"]uuid['\"][^)]+unique=False[^)]+\),)"
    alterfield_replacement = r"migrations.AlterField(\n            model_name='{model_name_lower}',\n            name='uuid',\n            field=models.UUIDField(\n                default=uuid.uuid4,\n                editable=False,\n                unique=True,\n                db_index=True,\n                verbose_name='شناسه یکتا'\n            ),\n        ),"
    
    # Write the fixed content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Fixed {file_path}")
    return True

# Find all migration files that might need fixing
migration_files = []
for app in ['bookings', 'payments', 'notifications', 'pilots', 'security', 'flights', 'blog']:
    files = glob.glob(f'{app}/migrations/0*.py')
    migration_files.extend(files)

print("Looking for UUID migration files to fix...")
print(f"Found {len(migration_files)} migration files\n")

for file_path in sorted(migration_files):
    app_name = file_path.split('/')[0]
    fix_migration_file(file_path, app_name, 'Model')

print("\nDone! Now you can run: python manage.py migrate")

