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
    StaffLoginView,
    user_profile,
    logout,
    verify_captcha,
    request_password_reset,
    verify_reset_code_and_set_password,
)

app_name = 'authenticate'

urlpatterns = [
    # Registration and Login
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('staff-login/', StaffLoginView.as_view(), name='staff_login'),
    path('logout/', logout, name='logout'),
    
    # Token Management
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # User Profile
    path('profile/', user_profile, name='profile'),
    
    # Captcha Verification
    path('verify-captcha/', verify_captcha, name='verify_captcha'),
    
    # Forgot Password
    path('forgot-password/', request_password_reset, name='request_password_reset'),
    path('verify-reset/', verify_reset_code_and_set_password, name='verify_reset_code_and_set_password'),
]

