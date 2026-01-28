# Unolo Field Force Tracker

A web application for tracking field employee check-ins at client locations with real-time distance calculation and comprehensive reporting.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express.js, SQLite
- **Authentication:** JWT

## Features

- ✅ Employee check-in/check-out at client locations
- ✅ Real-time distance calculation from client location
- ✅ Manager dashboard with team analytics
- ✅ Daily summary reports for managers
- ✅ Attendance history with distance tracking
- ✅ Role-based access control
- ✅ Responsive design

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm run setup    # Installs dependencies and initializes database
cp .env.example .env
npm run dev
```

Backend runs on: `http://localhost:3001`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Test Credentials

| Role     | Email              | Password    |
|----------|-------------------|-------------|
| Manager  | manager@unolo.com | password123 |
| Employee | rahul@unolo.com   | password123 |
| Employee | priya@unolo.com   | password123 |

## Project Structure

```
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API routes
│   ├── scripts/         # Database init scripts
│   ├── utils/           # Utility functions (distance calculation)
│   └── server.js        # Express app entry
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   └── utils/       # API helpers
│   └── index.html
└── database/            # SQL schemas (reference only)
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Check-ins
- `GET /api/checkin/clients` - Get assigned clients
- `POST /api/checkin` - Create check-in (with distance calculation)
- `PUT /api/checkin/checkout` - Checkout
- `GET /api/checkin/history` - Get check-in history
- `GET /api/checkin/active` - Get active check-in

### Dashboard
- `GET /api/dashboard/stats` - Manager stats
- `GET /api/dashboard/employee` - Employee stats

### Reports (Manager Only)
- `GET /api/reports/daily-summary` - Daily team summary report

#### Daily Summary API

**Endpoint:** `GET /api/reports/daily-summary`

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `employee_id` (optional): Filter by specific employee

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-25",
    "team_summary": {
      "total_employees": 3,
      "total_checkins": 8,
      "total_clients_visited": 5,
      "total_hours": 24.5
    },
    "employee_breakdown": [
      {
        "employee_id": 2,
        "employee_name": "Rahul Kumar",
        "checkins": 3,
        "clients_visited": 2,
        "working_hours": 8.5
      }
    ]
  }
}
```

## Distance Calculation

The application calculates the distance between employee location and client location using the Haversine formula:

- **Distance stored** in database with each check-in
- **Warning displayed** if distance > 500 meters from client location
- **Distance shown** in attendance history with visual indicators
- **Real-time calculation** when submitting check-in

## Notes

- The database uses SQLite - no external database setup required
- Run `npm run init-db` to reset the database to initial state
- Distance calculations are accurate to within ~10 meters using GPS coordinates
