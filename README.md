# EduFlow - Intelligent Study Platform

EduFlow is a production-ready, comprehensive study platform designed to empower students and educators. It combines a modern, fluid frontend with a robust Django-based backend to provide a seamless learning experience, featuring personalized dashboards, real-time analytics, collaborative study circles, and sophisticated mock test simulations.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion (Animations)
- **Data Fetching**: Axios
- **Icons & UI**: Lucide React, Radix UI, React Hot Toast (Notifications)
- **Charts**: Recharts

### Backend
- **Framework**: Django 6.0 (REST Framework)
- **Authentication**: JWT (SimpleJWT)
- **Database**: MySQL
- **Middleware**: Custom Maintenance Middleware, CORS Headers
- **API**: RESTful Architecture

---

## 🏗️ Detailed Architecture

The project follows a decoupled architecture with a clear separation between the frontend client and the backend API server.

### Directory Structure

```text
eduproject/
├── app/                        # Next.js Frontend (App Router)
│   ├── admin/                 # Admin management dashboard
│   ├── analytics/             # Performance tracking & visualizations
│   ├── auth/                  # Authentication (Login/Register)
│   ├── components/            # Reusable UI components
│   ├── dashboard/             # Student personalized dashboard
│   ├── mock-tests/            # Test simulation environment
│   ├── study-circles/         # Collaborative learning spaces
│   ├── study-materials/       # Resource management
│   ├── globals.css            # Design system & global styles
│   └── layout.tsx             # Root layout with providers
├── EduFlow_Backend/           # Django REST API
│   ├── accounts/              # Custom User model & JWT Auth
│   ├── admin_module/          # Admin-specific logic & middleware
│   ├── mock_tests/            # Test creation & evaluation
│   ├── study_circles/         # Group management & communication
│   ├── study_tracker/         # Progress tracking logic
│   ├── eduflow_backend/       # Core settings & URL routing
│   └── manage.py              # Django CLI
├── public/                    # Static assets (images, icons)
├── tailwind.config.js         # Design system configuration
└── README.md                  # Project documentation
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MySQL Server

### 1. Backend Setup
```bash
# Navigate to backend directory
cd EduFlow_Backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure Database
# Create a MySQL database named 'eduflow_db'

# Run migrations
python manage.py migrate

# Create a superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### 2. Frontend Setup
```bash
# Navigate to root directory
npm install

# Start development server
npm run dev
```

---

## 🔐 Environment Variables

### Frontend (`.env.local`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://127.0.0.1:8000` |

### Backend (`EduFlow_Backend/.env`)
*Note: Create a `.env` file in the backend root based on `settings.py`.*

| Variable | Description |
| :--- | :--- |
| `SECRET_KEY` | Django secret key for security |
| `DB_NAME` | MySQL database name (`eduflow_db`) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_HOST` | Database host (`localhost`) |
| `DB_PORT` | Database port (`3306`) |

---

## 🔌 API Documentation

The backend exposes a RESTful API. Key endpoints include:

- **Auth**:
  - `POST /api/accounts/register/` - Register new student
  - `POST /api/accounts/token/` - Login & receive JWT
- **Dashboard**:
  - `GET /api/dashboard/overview/` - Fetch student summary stats
- **Mock Tests**:
  - `GET /api/mock_tests/list/` - List available simulations
  - `POST /api/mock_tests/submit/` - Submit test results
- **Admin**:
  - `POST /api/admin_module/upload-csv/` - Bulk user/data import

*For full API documentation, visit `/api/docs/` (Swagger/Redoc) when running the server.*

---

## 🧪 Testing Guides

### Backend Testing
Run the Django test suite to ensure API integrity:
```bash
cd EduFlow_Backend
python manage.py test
```

### Frontend Testing
Run linting and type checks:
```bash
npm run lint
# or
npx tsc --noEmit
```

### Manual Verification
- **Auth Flow**: Verify login redirects to dashboard.
- **Data Sync**: Ensure CSV uploads in Admin reflect in Student views.
- **Responsiveness**: Test on mobile, tablet, and desktop breakpoints.

---

Built with ❤️ for learners worldwide.
