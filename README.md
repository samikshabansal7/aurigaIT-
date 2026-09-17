# ParkPulse – Smart Multi-Level Garage Management System

ParkPulse is a full-stack parking management application made for a multi-level parking garage. It helps the attendant manage vehicle entry and exit, parking spots, parking charges and parking records.

The application also includes the three contest twists: messy rate card import, automatic billing for sessions over 24 hours, and transfer of an active parking session to another vehicle plate.

---

## Contest Twists

### 1. Level 1 – T4: Messy Rate Data

The system can take a rate card that may contain extra text, symbols or different formatting.

**API:**

```text
POST /api/rates/import-messy
```

The application reads the rate information, cleans the values and stores the final rates in the `spot_rates` table.

Rates can be maintained separately for:

* Compact
* Standard
* EV

---

### 2. Level 2 – T2: Automatic 24-Hour Billing

The application can automatically close a parking session when it has been active for 24 hours or more.

**API:**

```text
POST /clock
```

It is also available through:

```text
POST /api/clock
```

When the clock endpoint is called, the system checks the active parking sessions. Sessions that have reached 24 hours are automatically completed, the parking fee is calculated, the parking spot is made available again and the automatic billing action is recorded.

---

### 3. Level 3 – T6: Valet Session Transfer

The system supports transferring an active parking session to another license plate.

**API:**

```text
POST /api/tickets/:id/transfer
```

During the transfer, the new license plate is stored while the original:

* Parking spot
* Vehicle type
* Check-in time

remain unchanged.

This represents a valet hand-off where the same parking session continues with another vehicle plate.

---

# Main Features

* Vehicle check-in and check-out
* Compact, standard and EV parking spots
* EV vehicles can only use EV spots
* EV spot availability check
* Parking fee calculation
* Daily parking fee cap
* Part-hour rounding
* License plate search
* Multiple parking floors
* Transaction history
* Pagination and sorting
* Messy rate card import
* Automatic 24-hour billing
* Valet session transfer
* User login and authentication

---

# Technology Used

### Frontend

* React
* Vite
* JavaScript
* CSS
* Lucide React

### Backend

* Node.js
* Express.js
* REST APIs

### Database

* SQLite
* SQLite3

### Authentication

* JWT
* bcryptjs

---

# How the System Works

The basic flow of the application is:

```text
Vehicle Arrives
      ↓
Check-In
      ↓
Find Suitable Parking Spot
      ↓
Create Parking Ticket
      ↓
Vehicle Remains Parked
      ↓
Check-Out / Automatic 24h Closure
      ↓
Calculate Fee
      ↓
Complete Ticket
      ↓
Free Parking Spot
```

For an EV vehicle, the allocation step only considers EV parking spots.

---

# Parking Fee Rules

The basic parking rates are:

```text
First hour        = $10
Each extra hour   = $5
Daily maximum     = $40
```

Part-hours are rounded up.

For example:

```text
Parking time = 1 hour 5 minutes
Billable time = 2 hours

Fee = $10 + $5
Fee = $15
```

The daily cap is applied so that the parking charge does not exceed the maximum daily amount.

The rate information can also be updated through the messy rate-card import feature.

---

# Parking Spot Types

The garage contains three types of parking spots:

```text
Compact
Standard
EV
```

Each spot has its own availability status.

An EV vehicle must be assigned an EV spot. A normal parking spot cannot be used for an EV vehicle.

The system also prevents an occupied spot from being assigned to another vehicle.

---

# License Plate Search

The attendant can search for a vehicle by entering its license plate.

Example:

```text
GET /api/tickets/search?plate=PLATE
```

The result can contain information such as:

* License plate
* Vehicle type
* Parking spot
* Floor
* Check-in time
* Ticket status
* Current parking fee

This makes it easier to find a vehicle without checking the complete parking log.

---

# Multi-Level Garage

The garage is divided into different floors.

Each floor contains its own parking spots and each spot has:

* Spot number
* Spot type
* Floor
* Occupied/free status

The dashboard can show the current parking status of each floor.

---

# Transaction Log

The application stores parking transactions including check-in, check-out and fee information.

Since the number of records can become large, the transaction API supports pagination, searching and sorting.

Example:

```text
GET /api/tickets
```

This avoids loading the complete transaction history at once.

---

# API Endpoints

## Contest Twist APIs

```text
POST /clock
```

Automatically closes and bills parking sessions that have reached 24 hours.

```text
POST /api/rates/import-messy
```

Imports and cleans messy parking rate information.

```text
POST /api/tickets/:id/transfer
```

Transfers an active parking session to another license plate.

---

## Authentication APIs

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

These APIs are used for user registration, login and checking the logged-in user.

---

## Garage APIs

```text
GET /api/garage/overview
GET /api/garage/floors
GET /api/garage/spots
```

These APIs provide garage information, floor layouts, parking spot status and EV availability.

---

## Parking APIs

```text
POST /api/tickets/check-in
POST /api/tickets/:id/check-out
GET  /api/tickets/search?plate=PLATE
GET  /api/tickets
```

These APIs handle vehicle check-in, check-out, license plate search and parking transaction records.

---

# Database

The main database tables are:

### `users`

Stores login and user information.

### `garages`

Stores garage information and parking rates.

### `floors`

Stores the different floors of the garage.

### `spots`

Stores parking spot details such as type, floor and availability.

### `spot_rates`

Stores the cleaned parking rates for different spot types.

### `tickets`

Stores vehicle parking sessions, check-in/check-out information and calculated fees.

---

# Project Goal

The goal of ParkPulse is to make parking management easier for the attendant and handle the important parking rules automatically.

The system focuses on correct parking allocation, accurate fee calculation, EV spot restrictions, quick vehicle searching and r
