# Product Importer - Frontend

A modern React frontend for the Product Importer API, built with Vite for fast development and optimized builds.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework with modern hooks |
| Vite | 7.2.2 | Lightning-fast build tool and dev server |
| Axios | 1.13.2 | HTTP client for API communication |
| ESLint | 9.39.1 | Code quality and consistency |

---

## Features

### 📤 CSV Upload (Story 1 & 1A)
- **Drag & Drop** interface for CSV file upload
- **File validation** with size display
- **Real-time job status polling** (PENDING → PROCESSING → COMPLETED/FAILED)
- **Visual feedback** with progress states
- **Error handling** with detailed messages
- Auto-refresh product list on successful upload

### 📦 Product Management (Story 2)
- **Full CRUD operations**:
  - Create new products
  - View product details in modal
  - Edit existing products
  - Delete individual products
- **Search functionality** across product fields
- **Filtering** by active/inactive status
- **Pagination** with page navigation
- **Responsive table** with sortable columns

### 🗑️ Bulk Operations (Story 3)
- **Bulk delete** all products with confirmation
- **Warning modals** to prevent accidental deletions
- Background processing via Celery

### 🔗 Webhook Management (Story 4)
- **CRUD operations** for webhooks
- **Test webhook** functionality with live requests
- **Event type selection** dropdown
- **URL validation**
- Success/error notifications

---

## Local Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend server running on `http://localhost:8000`

---

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure API Base URL

The API base URL is configured in `src/api.jsx`:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});
```

Update this if your backend runs on a different URL.

---

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production-ready bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |

---

## Project Structure

```
frontend/
├── public/                # Static assets
├── src/
│   ├── main.jsx          # App entry point
│   ├── App.jsx           # Main app component
│   ├── api.jsx           # Axios instance configuration
│   ├── index.css         # Global styles
│   ├── App.css           # Component-specific styles
│   ├── components/
│   │   ├── Uploader.jsx       # CSV upload with drag-drop
│   │   ├── ProductList.jsx    # Product CRUD & pagination
│   │   └── WebhookManager.jsx # Webhook management
│   └── assets/           # Images, icons, etc.
├── vite.config.js        # Vite configuration
├── package.json          # Dependencies and scripts
└── eslint.config.js      # ESLint rules
```

---

## Component Overview

### 🎯 Uploader Component
- Handles CSV file selection (click or drag-drop)
- Validates file type and displays file info
- Uploads file to `/api/products/upload/`
- Polls `/api/job/{jobId}/status/` every 2 seconds
- Shows job status: PENDING, PROCESSING, COMPLETED, FAILED
- Triggers product list refresh on success

### 📋 ProductList Component
- Fetches products from `/api/products/`
- Implements search with debouncing
- Active/inactive filtering
- Pagination controls (Previous/Next)
- Create, Edit, Delete operations
- Bulk delete all products
- Modal for detailed product view
- Modal for create/edit forms

### 🔗 WebhookManager Component
- Lists all webhooks from `/api/webhooks/`
- Create new webhook with URL and event type
- Edit existing webhooks
- Delete webhooks
- Test webhook functionality sends POST request
- Form validation and error handling

---

## API Integration

The frontend communicates with the backend via these endpoints:

### Products
- `GET /api/products/` - Fetch products (with pagination, search, filters)
- `POST /api/products/` - Create product
- `GET /api/products/{id}/` - Get product details
- `PUT /api/products/{id}/` - Update product
- `DELETE /api/products/{id}/` - Delete product
- `POST /api/products/upload/` - Upload CSV
- `POST /api/products/bulk_delete/` - Delete all products
- `GET /api/job/{jobId}/status/` - Check upload job status

### Webhooks
- `GET /api/webhooks/` - List webhooks
- `POST /api/webhooks/` - Create webhook
- `PUT /api/webhooks/{id}/` - Update webhook
- `DELETE /api/webhooks/{id}/` - Delete webhook
- `POST /api/webhooks/{id}/test/` - Test webhook

---

## Building for Production

### 1. Create Production Build

```bash
npm run build
```

This creates an optimized bundle in the `dist/` directory.

---

### 2. Preview Production Build

```bash
npm run preview
```

---

### 3. Deploy

The `dist/` folder can be deployed to any static hosting service:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop `dist/` folder
- **AWS S3**: Upload `dist/` contents
- **GitHub Pages**: Push `dist/` to gh-pages branch
- **Nginx/Apache**: Copy `dist/` to web root

---

## Environment Variables

For different backend URLs in production, create a `.env` file:

```bash
VITE_API_BASE_URL=https://api.yourproduction.com/api/
```

Update `src/api.jsx`:

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/',
});
```

---

## Styling

- Uses vanilla CSS with modern features
- Responsive design with flexbox/grid
- Color scheme: Blue accents on white/light gray
- Modals with backdrop blur
- Hover effects and transitions
- Mobile-friendly tables

---

## Troubleshooting

### CORS Errors
Ensure backend has CORS configured in `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

### API Connection Failed
- Verify backend is running on `http://localhost:8000`
- Check `src/api.jsx` for correct `baseURL`
- Look for errors in browser console (F12)

### Vite Port Already in Use
Change port in `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 3000,
  },
});
```

### Hot Reload Not Working
- Clear browser cache
- Delete `node_modules` and reinstall: `npm install`
- Restart dev server

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## License

This project is licensed under the MIT License.
