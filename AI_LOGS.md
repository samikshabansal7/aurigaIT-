# AI_LOGS.md — Developer Raw AI Interaction & Prompt Logs

This document records the prompt conversation log between the candidate and the AI assistant during the Round 2 Builder challenge session, including the three contest twists.

---

### Raw Interaction Transcript

#### Step 1: Initial Problem Statement & Requirements Brief
> **Candidate**: "hey here are the rules for round 2 builder challenge. i need to build a fullstack app for a parking garage attendant. cars enter and exit, rates are tiered ($10 first hour, $5 next hours, daily cap $40, part hours round up). spots are compact, standard, EV. ev cars MUST get ev spots. need to answer 'is EV spot free right now' and search car by plate. evening log needs pagination and sorting. also need user login, REST APIs, database, 1-page landing page with 3 features to build next, README.md, REASONING.md, and AI_LOGS.md. help me structure this step by step"

#### Step 2: Full-Stack Execution Command
> **Candidate**: "so guide me step by step and make the project"

#### Step 3: Base Implementation & Verification
> **Candidate**: "make sure fee calculation rounds up 1h 5m to 2 hours and caps at $40 for a 24h stay. also add unit tests to verify the math and push to my repo https://github.com/samikshabansal7/aurigaIT-.git"

#### Step 4: Contest Twists Implementation (Levels 1, 2, and 3)
> **Candidate**: "Twists for this problem:
> Level 1 — T4 (messy data): import a messy rate card (per spot type) with the junk below and price correctly from the cleaned rates.
> Level 2 — T2 (automation): 'A nightly job auto-closes and bills any session parked over 24 h.' Graded via POST /clock.
> Level 3 — T6 (lifecycle): 'Transfer an open session to a different plate (valet hand-off); spot and entry time carry over.'
> these are the changes change and commit this too"
