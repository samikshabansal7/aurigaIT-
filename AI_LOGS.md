# AI_LOGS.md — Developer Raw AI Interaction & Prompt Logs

This document records the prompt conversation log between the candidate and the AI assistant during the Round 2 Builder challenge session.

---

### Raw Interaction Transcript

#### Step 1: Initial Problem Statement & Requirements Brief
> **Candidate**: "hey here are the rules for round 2 builder challenge. i need to build a fullstack app for a parking garage attendant. cars enter and exit, rates are tiered ($10 first hour, $5 next hours, daily cap $40, part hours round up). spots are compact, standard, EV. ev cars MUST get ev spots. need to answer 'is EV spot free right now' and search car by plate. evening log needs pagination and sorting. also need user login, REST APIs, database, 1-page landing page with 3 features to build next, README.md, REASONING.md, and AI_LOGS.md. help me structure this step by step"

#### Step 2: Full-Stack Execution Command
> **Candidate**: "so guide me step by step and make the project"

#### Step 3: Billing & Rounding Logic
> **Candidate**: "make sure fee calculation rounds up 1h 5m to 2 hours and caps at $40 for a 24h stay. also add unit tests to verify the math"

#### Step 4: EV Charging Constraint Enforcement
> **Candidate**: "check if an EV car tries to park in a non-EV spot, throw error rule violation EV vehicles MUST be parked in EV spot with charger"

#### Step 5: Attendant Dashboard & Landing Page
> **Candidate**: "add landing page with overview, ROI calculator, and 3 future roadmap features (ALPR cameras, dynamic surge pricing, mobile app reservation). add floor map dashboard with EV free count indicator"

#### Step 6: License Plate Search & Evening Audit Log
> **Candidate**: "add instant license plate search for attendant and transaction audit log with pagination and sorting"

#### Step 7: Repository Push & Submission
> **Candidate**: "help me push all files to my repo https://github.com/samikshabansal7/aurigaIT-.git"
