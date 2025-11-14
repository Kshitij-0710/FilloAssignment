Product Importer API

This is a high-performance Django backend designed to import and manage a large product catalog (500,000+ records) asynchronously.

It provides a full-featured REST API for product and webhook management, built to handle large-scale data operations without request timeouts.

Tech Stack

Area

Technology

Reason

Backend

Django & Django Rest Framework

For rapid, "sexy simple" & powerful ModelViewSet APIs.

Async Tasks

Celery

To handle the 500,000-record import (Story 1) and bulk delete (Story 3) without hitting 30s timeouts.

Message Broker

Redis

To queue asynchronous tasks for Celery.

Database

PostgreSQL

To handle concurrent connections from the web server & Celery workers (solves SQLite's database is locked error).

Dev Infra

Docker

The simplest way to run production-grade Postgres & Redis locally.

Features

This API successfully implements all backend requirements for all 4 user stories.

Story 1 & 1A: Async CSV Upload & Progress

Async Endpoint: A POST to /api/products/upload/ accepts a .csv file, creates an UploadJob entry, and immediately queues a Celery task, returning a job_id to the client.

High Performance Task: The process_csv_upload Celery task de-duplicates the 500k+ records in-memory using a Python dictionary (to fix ON CONFLICT errors) and then uses Django's bulk_create with update_conflicts=True to perform a single, high-speed "UPSERT" database operation.

Real-time Polling: A GET to /api/job/<uuid:job_id>/status/ allows a client to poll for the job's status (PENDING, PROCESSING, COMPLETED, FAILED).

Detailed Error Logging: If the Celery task fails, the Exception is caught and its message is saved to the UploadJob's error_message field, making it available to the client via the status endpoint.

Story 2: Full Product Management

Full CRUD: The ProductViewSet (/api/products/) provides a complete, ModelViewSet-powered API for GET, POST, PUT, PATCH, and DELETE operations on single products.

Filtering & Search: The endpoint supports database-level filtering (?sku=..., ?active=true) and full-text search (?search=...) out of the box.

Pagination: All responses are automatically paginated (default 25 per page) to handle the large dataset efficiently.

Story 3: Bulk Delete

Async Endpoint: A POST to /api/products/bulk_delete/ (implemented as a custom @action) queues a bulk_delete_products Celery task.

No Timeouts: This runs in the background, allowing the API to respond immediately (HTTP 202) while the database deletion happens asynchronously.

Story 4: Webhook Manager

Full Webhook CRUD: The WebhookViewSet (/api/webhooks/) provides a full API for creating, listing, updating (e.g., enable/disable), and deleting webhooks.

Test Endpoint: A custom @action provides a POST endpoint at /api/webhooks/<id>/test/. This action sends a real test payload (using requests) to the webhook's URL and returns the external service's response code or any timeout/connection errors.

Local Setup & Installation

You need Docker and Python installed.

1. Prerequisites (Tools)

Python 3.10+ & pip

Docker Desktop: Make sure it's running.

2. Backend Setup (Terminals 1, 2, 3)

Clone the repo:

git clone <your-repo-url>
cd <your-project-folder>




2. **Install Dependencies:**
*In your backend `venv`, create one if you haven't:*
```bash
python -m venv venv
source venv/bin/activate


Then, install the requirements:

pip install -r requirements.txt



(This installs django, djangorestframework, celery, redis, psycopg2-binary, django-filter, django-cors-headers, dj-database-url, requests, and gunicorn.)

Terminal 1: Start Docker Services
docker run -d --name prodhub-redis -p 6379:6379 redis




Terminal 2: Run the Django Server
Make sure your product_importer/settings.py is pointed to the Docker DB (using port 5433):

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'prodhub_db',
        'USER': 'prodhub_user',
        'PASSWORD': 'mysecretpassword',
        'HOST': 'localhost',
        'PORT': '5433', # <-- Use the new port
    }
}


Now, run the server:

cd <your-django-project-folder> # e.g., product_importer


python -m venv venv
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver