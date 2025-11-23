"""
Script to build React frontend and collect static files
"""
import os
import subprocess
import sys
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / 'frontend'
BUILD_DIR = FRONTEND_DIR / 'build'
STATIC_ROOT = BASE_DIR / 'staticfiles'

def run_command(command, cwd=None):
    """Run a shell command"""
    print(f"Running: {' '.join(command)}")
    result = subprocess.run(command, cwd=cwd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return False
    print(result.stdout)
    return True

def main():
    print("=" * 60)
    print("Building React Frontend and Collecting Static Files")
    print("=" * 60)
    
    # Step 1: Build React
    print("\n[1/3] Building React frontend...")
    if not run_command(['npm', 'run', 'build'], cwd=str(FRONTEND_DIR)):
        print("❌ Failed to build React frontend")
        sys.exit(1)
    print("✅ React frontend built successfully")
    
    # Step 2: Copy index.html to static root
    print("\n[2/3] Copying index.html to static root...")
    index_html_src = BUILD_DIR / 'index.html'
    index_html_dst = STATIC_ROOT / 'index.html'
    
    if not index_html_src.exists():
        print(f"❌ index.html not found at {index_html_src}")
        sys.exit(1)
    
    os.makedirs(STATIC_ROOT, exist_ok=True)
    shutil.copy2(index_html_src, index_html_dst)
    print(f"✅ Copied index.html to {index_html_dst}")
    
    # Step 3: Collect static files
    print("\n[3/3] Collecting static files...")
    if not run_command([sys.executable, 'manage.py', 'collectstatic', '--noinput'], cwd=str(BASE_DIR)):
        print("❌ Failed to collect static files")
        sys.exit(1)
    print("✅ Static files collected successfully")
    
    print("\n" + "=" * 60)
    print("✅ All done! You can now run: python manage.py runserver")
    print("=" * 60)

if __name__ == '__main__':
    main()

