# ⚡ PrepMetrics – Analytics-Driven Interview Preparation Platform

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Configure environment
Edit `backend/.env` and set your `MONGO_URI`.

### 2. Seed database
```bash
cd backend && npm run seed
```

### 3. Start backend
```bash
cd backend && npm run dev      # http://localhost:5000
```

### 4. Start frontend
```bash
cd frontend && npm start       # http://localhost:3000
```

## Default Credentials
| Role  | Email                      | Password  |
|-------|----------------------------|-----------|
| Admin | admin@prepmetrics.io       | admin123  |
| User  | demo@prepmetrics.io        | demo1234  |

## Architecture

```
PrepMetrics/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Business logic
│   ├── middleware/       # Auth, RBAC
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── seeds/           # Database seeder
│   └── utils/           # Analytics engine, helpers
└── frontend/
    └── src/
        ├── api/          # Axios instance
        ├── components/   # Reusable components
        ├── context/      # Auth + Theme context
        └── pages/        # Route-based pages
```

## API Reference

| Method | Endpoint                        | Auth     | Description               |
|--------|---------------------------------|----------|---------------------------|
| POST   | /api/auth/register              | Public   | Register user             |
| POST   | /api/auth/login                 | Public   | Login                     |
| GET    | /api/subjects                   | User     | List subjects             |
| GET    | /api/quizzes                    | User     | List quizzes              |
| POST   | /api/quizzes/generate           | User     | Dynamic quiz              |
| POST   | /api/attempts                   | User     | Submit attempt            |
| GET    | /api/analytics/dashboard        | User     | User analytics            |
| GET    | /api/analytics/platform         | Admin    | Platform analytics        |
| GET    | /api/leaderboard/global         | User     | Global leaderboard        |
| POST   | /api/certificates/check/:id     | User     | Issue certificate         |
| POST   | /api/admin/questions            | Admin    | Create question           |

## Features
- ✅ JWT Authentication + RBAC
- ✅ Dynamic Quiz Generation
- ✅ Timed & Untimed Modes
- ✅ Detailed Attempt Analytics
- ✅ Interview Readiness Scoring
- ✅ Streak Tracking
- ✅ Global & Subject Leaderboards
- ✅ Certificate System
- ✅ Admin CMS (Questions, Subjects, Users)
- ✅ Light/Dark Mode
- ✅ Fully Responsive UI
