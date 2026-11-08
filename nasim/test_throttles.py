from django.core.cache import cache
from django.test import RequestFactory, SimpleTestCase

from nasim.throttles import AuthIpThrottle, client_ip


class ClientIpTests(SimpleTestCase):
    def test_prefers_cloudflare_address(self):
        request = RequestFactory().get('/')
        request.META['HTTP_CF_CONNECTING_IP'] = '203.0.113.9'
        request.META['HTTP_X_FORWARDED_FOR'] = '1.2.3.4, 198.51.100.20'
        request.META['REMOTE_ADDR'] = '10.0.0.1'
        self.assertEqual(client_ip(request), '203.0.113.9')

    def test_uses_address_appended_by_proxy(self):
        request = RequestFactory().get('/')
        request.META['HTTP_X_FORWARDED_FOR'] = '1.2.3.4, 198.51.100.20'
        request.META['REMOTE_ADDR'] = '10.0.0.1'
        self.assertEqual(client_ip(request), '198.51.100.20')

    def test_falls_back_to_remote_addr(self):
        request = RequestFactory().get('/')
        request.META['REMOTE_ADDR'] = '192.0.2.10'
        self.assertEqual(client_ip(request), '192.0.2.10')


class AuthThrottleTests(SimpleTestCase):
    def setUp(self):
        cache.clear()

    def test_blocks_after_six_attempts_in_a_minute(self):
        throttle = AuthIpThrottle()
        factory = RequestFactory()
        allowed = 0
        for _ in range(8):
            request = factory.post('/api/auth/login/')
            request.META['REMOTE_ADDR'] = '203.0.113.50'
            if throttle.allow_request(request, None):
                allowed += 1
        self.assertEqual(allowed, 6)
