from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import LogoutView, MeView, MyTokenObtainPairView

urlpatterns = [
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/logout/", LogoutView.as_view(), name="token_logout"),
    path("me/", MeView.as_view(), name="me"),
]
