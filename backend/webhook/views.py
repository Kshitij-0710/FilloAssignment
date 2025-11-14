from django.shortcuts import render
from rest_framework import viewsets , status
from .models import Webhook
from .serializers import WebhookSerializer
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
import requests
class WebhookViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Webhook CRUD. (Covers Story 4)
    """
    queryset = Webhook.objects.all()
    serializer_class = WebhookSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['event_type', 'is_active']

    @action(detail=True, methods=['post'])
    def test(self, request, pk=None):
        """
        Sends a simple test payload to the webhook.
        """
        try:
            webhook = self.get_object()
            if not webhook.is_active:
                return Response({"error": "Webhook is disabled."}, status=status.HTTP_400_BAD_REQUEST)

            test_payload = {
                "event_type": "test.event",
                "data": {
                    "message": "This is a test payload from Product Importer.",
                    "sku": "SKU-TEST",
                    "name": "Test Product"
                }
            }
            
            response = requests.post(webhook.url, json=test_payload, timeout=5)
            
            return Response({
                "message": f"Test payload sent. Endpoint responded with status {response.status_code}.",
                "status_code": response.status_code
            }, status=status.HTTP_200_OK)

        except requests.exceptions.Timeout:
            return Response({"error": "Test failed: Connection timed out."}, status=status.HTTP_408_REQUEST_TIMEOUT)
        except requests.exceptions.RequestException as e:
            return Response({"error": f"Test failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)