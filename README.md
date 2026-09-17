# ParkPulse — Smart Multi-Level Garage Management System

> **Campus Recruitment Round 2 — "Builder" Submission**

ParkPulse is a high-performance, full-stack web application designed for city-centre parking garage attendants. It streamlines vehicle check-ins/check-outs, automates tiered fee calculations with daily caps, enforces EV charging spot constraints, provides instant license plate search, and records paginated transaction logs.

---

## 🚀 Quick Start & How to Run

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Database**: SQLite3 (automatically initialized into `garage.db` with zero extra server installation required)

### Step 1: Install Dependencies & Setup
From the project root folder `parkpulse`:

```bash
# 1. Setup Backend Dependencies
cd server
npm install

# 2. Setup Frontend Dependencies
cd ../client
npm install
```

### Step 2: Run in Development Mode
Run the backend REST API server and Vite React frontend concurrently:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Express server starts on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Vite UI starts on http://localhost:3000
```

### Step 3: Run Unit Tests
To execute the automated fee calculator test suite:
```bash
cd server
npm test
```

---

## 🔑 Demo Credentials

- **Default Attendant User**: `attendant@garage.com`
- **Default Password**: `password123`

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Node.js, Express.js REST API, SQLite (`sqlite3` database engine)
- **Security & Authentication**: JSON Web Tokens (JWT), `bcryptjs` password hashing
- **Frontend**: React 18, Vite 5, Custom Glassmorphism CSS Design Tokens, Lucide Icons
- **Database Persistence**: SQLite database `garage.db` with automatic schema creation and relational seeding.

---

## 📡 Complete REST API Endpoint Documentation

### 1. Authentication APIs

#### `POST /api/auth/register`
Registers a new garage attendant or administrator.
- **Request Body**:
  ```json
  {
    "username": "Attendant Sam",
    "email": "sam@garage.com",
    "password": "password123",
    "role": "attendant"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Registration successful",
    "user": { "id": 1, "username": "Attendant Sam", "email": "sam@garage.com", "role": "attendant" },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

#### `POST /api/auth/login`
Authenticates attendant and returns JWT access token.
- **Request Body**:
  ```json
  {
    "email": "attendant@garage.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Login successful",
    "user": { "id": 1, "username": "Attendant Sam", "email": "attendant@garage.com", "role": "attendant" },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

#### `GET /api/auth/me`
Retrieves currently logged-in user profile (Requires `Authorization: Bearer <token>` header).

---

### 2. Garage & Floor Map APIs

#### `GET /api/garage/overview`
Retrieves total garage capacity, occupancy count, EV availability counter ("Is EV spot free right now?"), and active rate structure.
- **Response (200 OK)**:
  ```json
  {
    "garage": {
      "id": 1,
      "name": "Metropolis City Garage",
      "rates": { "hourlyFirstRate": 10, "hourlyNextRate": 5, "dailyCapRate": 40 }
    },
    "stats": {
      "totalCapacity": 36,
      "totalOccupied": 3,
      "totalFree": 33,
      "ev": { "total": 6, "occupied": 1, "free": 5, "isEvFree": true }
    }
  }
  ```

#### `GET /api/garage/floors`
Returns all garage levels and floor plans with embedded real-time spot occupancy statuses.

#### `GET /api/garage/spots?spot_type=ev&is_occupied=false`
Filters parking spots by type (`compact`, `standard`, `ev`) or availability status.

---

### 3. Parking Ticket & Check-In / Check-Out APIs

#### `POST /api/tickets/check-in`
Checks in a new vehicle into the garage. Enforces strict EV spot constraint.
- **Request Body**:
  ```json
  {
    "license_plate": "TESLA-EV9",
    "vehicle_type": "ev",
    "preferred_spot_id": 1
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Check-in successful",
    "ticket": {
      "id": 4,
      "spot_id": 1,
      "license_plate": "TESLA-EV9",
      "vehicle_type": "ev",
      "check_in_time": "2026-09-17T14:55:00.000Z",
      "status": "active"
    }
  }
  ```

#### `POST /api/tickets/:id/check-out`
Calculates tiered fee (1st hr, extra hrs, daily cap, ceiling rounding), marks ticket completed, and frees spot.
- **Response (200 OK)**:
  ```json
  {
    "message": "Check-out successful",
    "feeBreakdown": {
      "durationMinutes": 65,
      "billedHours": 2,
      "fullDays": 0,
      "remainingHours": 2,
      "totalFee": 15.00
    },
    "ticket": { "id": 4, "status": "completed", "total_fee": 15.00 }
  }
  ```

#### `GET /api/tickets/search?plate=TESLA`
Instant license plate hunt lookup. Returns active and completed tickets matching the search string with real-time accrued fee estimates.

#### `GET /api/tickets?page=1&limit=10&status=active&sortBy=check_in_time&sortOrder=DESC`
Returns paginated, searchable, and sortable transaction log for evening audit.

---

## 🗄️ Database Schema & Rules

- **`users`**: User accounts (attendants/admins), bcrypt hashes, roles.
- **`garages`**: Garage profiles and tiered pricing rules ($10 1st hr, $5 extra hrs, $40 cap).
- **`floors`**: Multi-level floor definitions.
- **`spots`**: Parking spots with spot types (`compact`, `standard`, `ev`) and occupancy flags.
- **`tickets`**: Check-in/out records, timestamps, billed hours, and fees.
