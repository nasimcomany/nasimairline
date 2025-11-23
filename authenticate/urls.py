"""
URLs for authentication app
"""
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    UserRegistrationView,
    UserLoginView,
    user_profile,
    logout,
)

app_name = 'authenticate'

urlpatterns = [
    # Registration and Login
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', logout, name='logout'),
    
    # Token Management
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # User Profile
    path('profile/', user_profile, name='profile'),
]

