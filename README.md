# ParkPulse — Smart Multi-Level Garage Management System

> **Campus Recruitment Round 2 — "Builder" Submission (With Contest Twists)**

ParkPulse is a high-performance, full-stack web application designed for city-centre parking garage attendants. It streamlines vehicle check-ins/check-outs, automates spot-type tiered fee calculations with daily caps, enforces EV charging spot constraints, provides instant license plate search, records paginated transaction logs, and handles all contest twist requirements.

---

## ⚡ Contest Twists Implemented

### 1. Level 1 — T4 (Messy Data Import)
- **Feature**: Import messy, unstructured rate cards with junk text, symbols, and irregular formatting.
- **Endpoint**: `POST /api/rates/import-messy`
- **Logic**: Automatically extracts, cleans, and sanitizes rates per spot type (`compact`, `standard`, `ev`) and persists sanitized rates into SQLite `spot_rates`.

### 2. Level 2 — T2 (Automation Nightly Clock Job)
- **Feature**: Auto-closes and bills any session parked for 24 hours or longer.
- **Endpoint**: **`POST /clock`** (also available at `POST /api/clock`)
- **Logic**: Evaluates all active tickets against current/simulated time, auto-completes sessions reaching $\ge 24$ hours, applies the daily cap rate, vacates spots, and logs auto-billing audits.

### 3. Level 3 — T6 (Lifecycle Valet Session Transfer)
- **Feature**: Valet hand-off session transfer to a different license plate.
- **Endpoint**: `POST /api/tickets/:id/transfer`
- **Logic**: Transferred session updates `license_plate` while preserving original `spot_id`, `vehicle_type`, and `check_in_time`.

---

## 🚀 Quick Start & How to Run

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Database**: SQLite3 (automatically initialized into `garage.db`)

### Step 1: Install Dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### Step 2: Run Development Servers
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

### Step 3: Run Unit Test Suite
```bash
cd server
npm test
```

---

## 🔑 Demo Credentials
- **Attendant Email**: `attendant@garage.com`
- **Password**: `password123`

---

## 📡 Complete REST API Endpoint Documentation

### 1. Contest Twist Endpoints
- **`POST /clock`** — Nightly job that auto-closes and bills any session parked $\ge 24$ hours (Graded endpoint)
- **`POST /api/rates/import-messy`** — Import and sanitize messy rate cards for compact, standard, and EV spots
- **`POST /api/tickets/:id/transfer`** — Transfer active session to a new plate (valet hand-off)

### 2. Authentication APIs
- `POST /api/auth/register` — Register new attendant
- `POST /api/auth/login` — Attendant login (returns JWT token)
- `GET /api/auth/me` — Get current profile

### 3. Garage & Spot Status APIs
- `GET /api/garage/overview` — Get total capacity, occupancy, EV spot availability indicator ("Is EV spot free right now?"), and rates
- `GET /api/garage/floors` — Get multi-level floor layout and live spot statuses
- `GET /api/garage/spots` — Filter spots by spot type (`compact`, `standard`, `ev`) or availability

### 4. Parking Ticket & Transaction APIs
- `POST /api/tickets/check-in` — Check in car (Enforces EV spot constraint: EV vehicle MUST get EV spot)
- `POST /api/tickets/:id/check-out` — Calculate tiered fee ($10 1st hr, $5 extra hr, $40 daily cap, ceiling rounding), vacate spot, complete ticket
- `GET /api/tickets/search?plate=PLATE` — Instant license plate hunt with live accrued fee estimate
- `GET /api/tickets` — Paginated, searchable, and sortable evening audit log
