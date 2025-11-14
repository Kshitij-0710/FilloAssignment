from rest_framework.routers import DefaultRouter
from prodhub.views import ProductViewSet
from webhook.views import WebhookViewSet


router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'webhooks', WebhookViewSet, basename='webhook')