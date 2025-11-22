"""
Utility functions for gallery app
"""
from django.utils.text import slugify
from django.utils.html import strip_tags
from PIL import Image
import os


def generate_slug(title):
    """
    Generate a unique slug from title
    """
    return slugify(title)


def optimize_image(image_path, max_width=1920, max_height=1080, quality=85):
    """
    Optimize image for web
    """
    try:
        img = Image.open(image_path)
        
        # Calculate new dimensions
        width, height = img.size
        if width > max_width or height > max_height:
            img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            img.save(image_path, optimize=True, quality=quality)
    except Exception as e:
        print(f"Error optimizing image: {e}")


def generate_thumbnail(image_path, thumbnail_path, size=(300, 300)):
    """
    Generate thumbnail from image
    """
    try:
        img = Image.open(image_path)
        img.thumbnail(size, Image.Resampling.LANCZOS)
        img.save(thumbnail_path, optimize=True, quality=85)
    except Exception as e:
        print(f"Error generating thumbnail: {e}")


def get_image_dimensions(image):
    """
    Get image width and height
    """
    try:
        img = Image.open(image)
        return img.size
    except Exception:
        return (0, 0)


def calculate_file_size(file):
    """
    Calculate file size in bytes
    """
    if hasattr(file, 'size'):
        return file.size
    if hasattr(file, 'file'):
        return file.file.size
    return 0

