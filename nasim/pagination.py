"""Shared DRF pagination helpers."""
from rest_framework.pagination import PageNumberPagination


class FlexiblePageNumberPagination(PageNumberPagination):
    """Default 9 items; clients may request page_size up to 50."""
    page_size = 9
    page_size_query_param = 'page_size'
    max_page_size = 50
