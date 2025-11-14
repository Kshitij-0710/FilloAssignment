# Product Importer - Full Stack Application

A high-performance full-stack application for managing large product catalogs (500,000+ records) with asynchronous processing capabilities.

---

## 📁 Project Structure

This project consists of two main components:

### 🔧 Backend - Django REST API
**Location**: `/backend`  
**Documentation**: [Readme.Backend.md](./Readme.Backend.md)

A Django-based REST API with Celery for asynchronous task processing, handling large-scale CSV imports and product management.

**Key Technologies**:
- Django & Django REST Framework
- Celery (async task queue)
- Redis (message broker)
- PostgreSQL (database)
- Docker (infrastructure)

**Features**:
- Async CSV upload (500k+ records)
- Full CRUD product management
- Bulk delete operations
- Webhook management
- ReDoc API documentation

---

### 🎨 Frontend - React Application
**Location**: `/frontend`  
**Documentation**: [Readme.Frontend.md](./Readme.Frontend.md)

A modern React frontend built with Vite, providing an intuitive UI for product and webhook management.

**Key Technologies**:
- React 19.2.0
- Vite 7.2.2
- Axios
- Modern CSS

**Features**:
- Drag-and-drop CSV upload
- Real-time job status tracking
- Product search & filtering
- Webhook testing interface
- Responsive design

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker Desktop

---

### 1. Start Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Redis & PostgreSQL (Docker)
docker run -d --name prodhub-redis -p 6379:6379 redis
docker run -d --name prodhub-postgres \
  -e POSTGRES_DB=prodhub_db \
  -e POSTGRES_USER=prodhub_user \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -p 5433:5432 postgres:15

# Run migrations
python manage.py migrate

# Start Django server
python manage.py runserver
```

In a separate terminal, start Celery worker:
```bash
cd backend
source venv/bin/activate
celery -A product_importer worker --loglevel=info
```

Backend will run at: `http://localhost:8000`

---

### 2. Start Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## 📚 Documentation

For detailed setup, configuration, and usage instructions:

- **Backend Documentation**: [Readme.Backend.md](./Readme.Backend.md)
  - API endpoints
  - Database configuration
  - Celery task management
  - Troubleshooting

- **Frontend Documentation**: [Readme.Frontend.md](./Readme.Frontend.md)
  - Component overview
  - Build and deployment
  - Environment configuration
  - Styling guide

---

## 🔗 Key URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React application |
| Backend API | http://localhost:8000/api/ | REST API endpoints |
| API Docs (ReDoc) | http://localhost:8000/redoc/ | Interactive API documentation |
| Django Admin | http://localhost:8000/admin/ | Django admin panel |

---

## 📦 Features Overview

### Story 1 & 1A: CSV Upload with Progress Tracking
- Upload large CSV files (500k+ records)
- Real-time job status updates
- Asynchronous processing with Celery

### Story 2: Product Management
- Full CRUD operations
- Search and filtering
- Pagination support

### Story 3: Bulk Operations
- Bulk delete all products
- Background task processing

### Story 4: Webhook Management
- Create and manage webhooks
- Test webhook endpoints
- Event-based notifications

---

## 🛠️ Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React + Vite | Fast, modern UI |
| Backend | Django + DRF | RESTful API |
| Task Queue | Celery | Async processing |
| Message Broker | Redis | Task distribution |
| Database | PostgreSQL | Data persistence |
| Infrastructure | Docker | Service orchestration |

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

1. Read the backend documentation in [Readme.Backend.md](./Readme.Backend.md)
2. Read the frontend documentation in [Readme.Frontend.md](./Readme.Frontend.md)
3. Follow the setup instructions for both components
4. Submit pull requests with clear descriptions

---

## 📞 Support

For issues or questions:
- Check the troubleshooting sections in backend/frontend docs
- Review API documentation at `/redoc/`
- Inspect browser console for frontend errors
- Check Django logs for backend errors
