from django.db import models


class Webhook(models.Model):
    """
    Stores webhook configurations.
    """
    EVENT_CHOICES = [
        ("product.created", "Product Created"),
        ("product.updated", "Product Updated"),
        ("product.deleted", "Product Deleted"),
    ]
    url = models.URLField(max_length=500)
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.event_type} -> {self.url} (Active: {self.is_active})"