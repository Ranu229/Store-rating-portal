# 🏬 Store Rating Web Portal - FullStack Coding Challenge

> **GitHub Repository**: [https://github.com/Ranu229/Store-rating-portal](https://github.com/Ranu229/Store-rating-portal)  
> **Candidate Submission**: Roxiler Systems - FullStack Intern Coding Challenge  
> **Instant Evaluator Access**: 1-Click Demo buttons are provided directly on the Login page for Admin, Store Owner, and Normal User.

---

## 📋 Challenge Requirements Checklist

| Requirement | Status | Implementation Details |
|---|---|---|
| **Tech Stack: ExpressJs, ReactJs, PostgreSQL/MySQL** | ✅ Complete | Express.js REST API with Prisma ORM, React (Vite) + Tailwind CSS, compatible with PostgreSQL and SQLite |
| **Ratings range from 1 to 5** | ✅ Complete | Interactive Star Rating component (1-5) + strict backend integer validation |
| **Single login system for all users** | ✅ Complete | Unified `/login` entrypoint with JWT auth and automatic role redirection |
| **Normal users registration page** | ✅ Complete | Public `/register` with live real-time validation checklist |
| **Admin: Add stores, normal users, admin users** | ✅ Complete | Interactive modal forms in Admin dashboard with full validation |
| **Admin Dashboard metrics** | ✅ Complete | Stat cards displaying Total Users, Total Stores, and Total Submitted Ratings |
| **Admin Store & User listings** | ✅ Complete | Full tables displaying Name, Email, Address, Role, and Store Owner ratings |
| **Admin filters & search** | ✅ Complete | Live search by Name, Email, Address + Role filter dropdown |
| **Admin: Store Owner rating display** | ✅ Complete | User table & detail modal dynamically calculates and shows Store Owner's store rating |
| **Normal User: View registered stores** | ✅ Complete | Responsive directory displaying Name, Address, Overall Rating, and User's Rating |
| **Normal User: Search by Name & Address** | ✅ Complete | Real-time debounced search bar filtering across name and address |
| **Normal User: Submit & modify ratings** | ✅ Complete | Click to submit (1-5) or modify previously submitted ratings |
| **Store Owner: Dashboard** | ✅ Complete | Displays average store rating, rating breakdown, and list of users who rated their store |
| **Update password after logging in** | ✅ Complete | Dedicated `/update-password` flow with old password verification and complexity rules |
| **Sorting on key fields for all tables** | ✅ Complete | Clickable table headers with ascending/descending indicators (▲ / ▼) on all tables |
| **Strict Form Validations** | ✅ Complete | Name: 20-60 chars; Address: max 400; Password: 8-16 chars + uppercase + special char; RFC Email |

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Node.js & Express.js
- **ORM & Database**: Prisma ORM, SQLite (instant local zero-setup review) & PostgreSQL (Docker Compose ready)
- **Authentication**: Stateless JSON Web Tokens (JWT) + `bcryptjs` password hashing (salt rounds: 10)
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router v6
- **Validation**: Enforced at both frontend (live user hints & character counters) and backend layers

---

## 👥 Pre-Configured Test Credentials

For effortless testing, the application includes a **1-Click Demo Login bar** on the `/login` page, or you can log in with any of these pre-seeded accounts:

| Role | Email | Password | Full Name (20–60 chars) | Notes |
|---|---|---|---|---|
| **System Administrator** | `admin@example.com` | `Admin@123#` | System Administrator Officer | Full access to users, stores, metrics |
| **Store Owner 1** | `owner1@example.com` | `Owner@123#` | Alexander Benjamin Montgomery | Owns *Apex Electronics & Gadgets Hub* |
| **Store Owner 2** | `owner2@example.com` | `Owner@456#` | Victoria Charlotte Kensington | Owns *The Artisan Organic Bakehouse* |
| **Normal User 1** | `user1@example.com` | `User@123#` | Jonathan Edward Bartholomew | Has submitted ratings |
| **Normal User 2** | `user2@example.com` | `User@456#` | Eleanor Beatrice Fitzpatrick | Has submitted ratings |
| **Normal User 3** | `user3@example.com` | `User@789#` | Dominic Augustine Richardson | Has submitted ratings |

---

## 🚀 Quick Start Guide

### Option A: Windows 1-Click Launch (Easiest)

Simply double-click the included `start-app.bat` script in the `store-rating-portal/` folder. It will launch both backend and frontend servers and open your browser automatically!

### Option B: Manual Command Line Launch

#### 1. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```
Backend runs at: **`http://localhost:5000`**

#### 2. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: **`http://localhost:5173`**

---

## 🐘 Running with PostgreSQL (Production / Docker)

The application supports PostgreSQL natively:

1. Start the PostgreSQL container:
   ```bash
   docker compose up -d
   ```
2. In `backend/.env`, set the PostgreSQL connection URL:
   ```env
   DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/store_rating_db?schema=public"
   ```
3. Update `backend/prisma/schema.prisma` datasource provider to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run migrations and seed:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

---

## 🔒 Form Validation Rules Summary

All form fields strictly enforce the challenge specifications:

- **Full Name**: Minimum 20 characters, Maximum 60 characters.
- **Address**: Maximum 400 characters.
- **Password**: 8 to 16 characters, must include at least one uppercase letter (`[A-Z]`) and at least one special character (`[!@#$%^&*...]`).
- **Email**: Standard RFC email format.
- **Ratings**: Integer values from 1 to 5.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Normal user signup
- `POST /api/auth/login` - Single login for all roles
- `GET /api/auth/me` - Current authenticated user profile
- `PATCH /api/auth/update-password` - Change password (verifies current password)

### Administrator (`/api/admin`)
- `GET /api/admin/dashboard` - Total Users, Stores, and Ratings
- `GET /api/admin/stores?search=&sortBy=&sortOrder=` - List stores with ratings
- `POST /api/admin/stores` - Create new store & assign owner
- `GET /api/admin/users?search=&role=&sortBy=&sortOrder=` - List users with store owner ratings
- `GET /api/admin/users/:id` - View single user details
- `POST /api/admin/users` - Create admin, normal user, or store owner

### Stores & Ratings (`/api/stores` & `/api/ratings`)
- `GET /api/stores?search=&sortBy=&sortOrder=` - Stores directory with overall & user ratings
- `POST /api/ratings` - Submit rating (1 to 5) for a store
- `PUT /api/ratings/:storeId` - Modify existing rating for a store

### Store Owner (`/api/owner`)
- `GET /api/owner/dashboard?sortBy=&sortOrder=` - Store average rating, breakdown, and list of customers who submitted reviews
