from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient


class JWTAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="test-user",
            password="strong-test-password",
            email="test@example.com",
        )

    def test_login_returns_access_and_refresh_tokens(self):
        response = self.client.post(
            "/api/token/",
            {"username": "test-user", "password": "strong-test-password"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["username"], "test-user")

    def test_protected_me_endpoint_requires_authentication(self):
        response = self.client.get("/api/me/")
        self.assertEqual(response.status_code, 401)

    def test_access_token_can_call_me_endpoint(self):
        login = self.client.post(
            "/api/token/",
            {"username": "test-user", "password": "strong-test-password"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

        response = self.client.get("/api/me/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], "test-user")

    def test_logout_blacklists_refresh_token(self):
        login = self.client.post(
            "/api/token/",
            {"username": "test-user", "password": "strong-test-password"},
            format="json",
        )
        refresh = login.data["refresh"]

        logout = self.client.post(
            "/api/token/logout/", {"refresh": refresh}, format="json"
        )
        self.assertEqual(logout.status_code, 205)

        refresh_response = self.client.post(
            "/api/token/refresh/", {"refresh": refresh}, format="json"
        )
        self.assertEqual(refresh_response.status_code, 401)
