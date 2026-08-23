# HeritEdge — Local Language & Culture Preservation Hub

> A mobile application connecting Elders and Youth to preserve local languages, cultural knowledge, and community traditions.

---

## Project Overview

HeritEdge is a university Software Engineering project (Sprint 1) that implements complete User Management and Authentication for a cultural heritage preservation platform. It connects **Elder Knowledge Keepers** (who share cultural wisdom) with **Youth Cultural Learners** (who discover and contribute to that knowledge).

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo (SDK 54), Expo Router (file-based navigation) |
| Language | TypeScript |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) + AsyncStorage |
| Password | bcryptjs (hashed, never stored plain-text) |
| Image Upload | Multer |
| HTTP Client | Axios |

---

## Project Structure

```
HeritEdge/
├── Backend/
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── controllers/    # authController.js, userController.js
│   │   ├── middleware/     # auth.js (JWT protect), upload.js (Multer)
│   │   ├── models/         # User.js (Mongoose schema)
│   │   ├── routes/         # auth.js, users.js
│   │   └── index.js        # Express app entry point
│   ├── uploads/            # Uploaded profile pictures (gitignored)
│   ├── .env                # Environment variables (gitignored)
│   └── package.json
│
└── MobileApp/
    ├── app/
    │   ├── index.tsx              # Splash screen (auth-aware routing)
    │   ├── _layout.tsx            # Root layout + AuthProvider
    │   ├── (auth)/
    │   │   ├── welcome.tsx        # Onboarding / Welcome slides
    │   │   ├── login.tsx          # Login screen
    │   │   ├── register.tsx       # Registration screen
    │   │   └── role-select.tsx    # Elder / Youth role selection
    │   └── (app)/
    │       ├── elder-home.tsx     # Elder (Knowledge Keeper) home
    │       ├── youth-home.tsx     # Youth (Cultural Learner) home
    │       ├── profile.tsx        # Profile setup + edit
    │       └── interests.tsx      # Cultural interests chip selector
    └── src/
        ├── components/ui/   # Button, Input, Avatar, Card
        ├── constants/       # colors.ts (design tokens)
        ├── context/         # AuthContext.tsx (React Context auth state)
        └── services/        # api.ts, authService.ts, userService.ts
```

---

## Sprint 1 — User Stories Implemented

| Story | Title | Status |
|-------|-------|--------|
| HE-16 | User Registration | ✅ Complete |
| HE-17 | Select User Role | ✅ Complete |
| HE-18 | Login and Logout | ✅ Complete |
| HE-19 | Manage Profile | ✅ Complete |
| HE-20 | Cultural Interests | ✅ Complete |

---

## New User Journey

```
Splash → Welcome/Onboarding → Register → Role Selection
       → Profile Setup → Cultural Interests → Elder Home / Youth Home
```

## Returning User Journey

```
Splash → (authenticated) → Elder Home / Youth Home
```

---

## Installation & Setup

### Prerequisites
- Node.js v18+
- npm
- Expo CLI (`npm install -g expo`)
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the Repository

```bash
git clone <repo-url>
cd HeritEdge
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_strong_jwt_secret_here
JWT_EXPIRE=7d
```

> ⚠️ **Never commit your `.env` file. It is gitignored.**

### 3. Mobile App Setup

```bash
cd MobileApp
npm install
```

Create a `.env` file in the `MobileApp/` directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

> For physical device testing, replace `localhost` with your machine's local IP (e.g. `192.168.1.5`).

---

## Running the Application

### Start the Backend

```bash
cd Backend
npm run dev
```

Expected output:
```
HeritEdge API running on http://localhost:5000
MongoDB Connected: <cluster-host>
```

### Start the Mobile App (Web Browser)

```bash
cd MobileApp
npx expo start --web
```

Then press `w` to open in your browser at `http://localhost:8081`.

### Start the Mobile App (Expo Go on Phone)

```bash
cd MobileApp
npx expo start
```

Scan the QR code with the **Expo Go** app (SDK 54). Ensure your phone and PC are on the same Wi-Fi network.

---

## Environment Variables

### Backend — `Backend/.env`

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `MONGODB_URI` | MongoDB Atlas connection string | **Yes** |
| `JWT_SECRET` | Secret key for signing JWT tokens | **Yes** |
| `JWT_EXPIRE` | JWT expiry duration (e.g. `7d`) | No |

### Mobile — `MobileApp/.env`

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_API_URL` | Backend API base URL | **Yes** |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login with email + password | Public |
| GET | `/api/auth/me` | Get current user | Bearer JWT |

### User Profile

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| PUT | `/api/users/profile` | Update profile (name, bio, location, language, community, photo) | Bearer JWT |
| PUT | `/api/users/interests` | Update languages + cultural interests | Bearer JWT |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API status check |

---

## User Data Model

```
User {
  name          String (required)
  email         String (required, unique)
  passwordHash  String (bcrypt, never returned in API)
  role          "elder" | "youth"
  profilePicture String (file path, optional)
  bio           String (optional)
  location      String (optional)
  language      String (primary language, optional)
  community     String (community/region, optional)
  languages     [String] (languages of interest)
  culturalInterests [String] (selected interest categories)
  isActive      Boolean (default: true)
  createdAt     Date
  updatedAt     Date
}
```

---

## Security Notes

- Passwords are hashed with **bcryptjs** (salt rounds: 12) before storage
- **No plain-text passwords** are stored or returned
- JWT tokens are stored in **AsyncStorage** (not exposed in URL or logs)
- Protected API endpoints require a valid `Authorization: Bearer <token>` header
- CORS is configured to allow only localhost origins in development
- All secrets are stored in `.env` files — **never committed to Git**
- `.gitignore` excludes `.env`, `node_modules/`, and `uploads/`

---

## Future Sprints

Sprint 1 implements User Management only. Future sprints will add:

- **Cultural Content** — Elders upload stories, songs, recipes, proverbs
- **Discovery** — Youth browse and search cultural content
- **Elder–Youth Collaboration** — Mentorship, Q&A, co-creation
- **Notifications** — Activity alerts
- **Administration** — Admin panel for content moderation
