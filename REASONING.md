# REASONING.md — Technical Thought Process & Architectural Decisions

## 1. Problem Decomposition & Core Objectives

When presented with the Round 2 storyline brief for a busy city-centre parking garage, we identified four fundamental challenges that an attendant faces during a chaotic day:

1. **Fee Calculation Complexity**: Rates are tiered — 1st hour is one price ($10), subsequent hours are cheaper ($5), part-hours round up (ceiling rounding), and stays reaching or exceeding full days must hit a daily cap ($40/24h) so drivers are never overcharged.
2. **Constraint Enforcement & Double-Parking Prevention**: Spots come in Compact, Standard, and EV (with charger) types. Electric Vehicles (EVs) *must* get an EV spot. Additionally, two cars must never be checked into the same spot simultaneously.
3. **Driver Query Responsiveness**: Drivers frequently ask "Is an EV spot free right now?" and attendants need to hunt for cars by partial or full license plate instantly.
4. **Massive Evening Audit Log**: By evening, hundreds of transactions accumulate. Attendants require server-side pagination, search filtering, and sorting to review history efficiently.

---

## 2. Mathematical Derivation of Tiered Pricing Algorithm

Let $T_{\text{in}}$ be check-in time and $T_{\text{out}}$ be check-out time.
Duration in milliseconds is:
$$\Delta M = \max(0, T_{\text{out}} - T_{\text{in}})$$

1. **Ceiling Hour Rounding**: Any fraction of an hour counts as a full hour:
   $$H_{\text{total}} = \left\lceil \frac{\Delta M}{1000 \times 3600} \right\rceil$$
   *(e.g., 5 minutes $\rightarrow 1$ hour; 1 hour 2 minutes $\rightarrow 2$ hours)*

2. **24-Hour Day Cycle Decomposition**:
   $$\text{Days} = \lfloor H_{\text{total}} / 24 \rfloor, \quad H_{\text{rem}} = H_{\text{total}} \bmod 24$$

3. **Sub-Day Tiered Fee Calculation**:
   For the remaining $H_{\text{rem}}$ hours in the uncompleted 24-hr period:
   $$\text{Fee}_{\text{rem}} = \begin{cases} 
   0 & \text{if } H_{\text{rem}} = 0 \\
   R_1 & \text{if } H_{\text{rem}} = 1 \\
   R_1 + (H_{\text{rem}} - 1) \times R_2 & \text{if } H_{\text{rem}} > 1 
   \end{cases}$$

   Where $R_1 = \$10$ (1st hour rate) and $R_2 = \$5$ (subsequent hour rate).

4. **Daily Cap Application**:
   Each 24-hour cycle (and partial cycle) is capped at $C = \$40$:
   $$\text{Fee}_{\text{rem\_capped}} = \min(\text{Fee}_{\text{rem}}, C)$$
   $$\text{Total Fee} = (\text{Days} \times C) + \text{Fee}_{\text{rem\_capped}}$$

### Case Verification:
- **15 mins stay**: $H_{\text{total}} = 1 \rightarrow \$10$
- **1 hr 5 mins stay**: $H_{\text{total}} = 2 \rightarrow 10 + (1 \times 5) = \$15$
- **7 hours stay**: $H_{\text{total}} = 7 \rightarrow 10 + (6 \times 5) = \$40$ (reaches daily cap $C$)
- **25 hours stay**: $1 \text{ Day} + 1 \text{ Hour} \rightarrow 40 + 10 = \$50$

---

## 3. Concurrency Safeguards & Constraint Enforcement

To prevent double-parking race conditions:
1. **Database Schema Constraints**: `spots.is_occupied` is maintained via atomic SQL queries (`UPDATE spots SET is_occupied = 1 WHERE id = ? AND is_occupied = 0`).
2. **Duplicate Check**: An active ticket lookup (`SELECT * FROM tickets WHERE license_plate = ? AND status = 'active'`) prevents checking in the same vehicle twice.
3. **EV Constraint Check**: When `vehicle_type === 'ev'`, the backend verifies that `targetSpot.spot_type === 'ev'`. If an attendant manually attempts to place an EV vehicle in a compact or standard spot, the API rejects the transaction with a `400 Bad Request` error.

---

## 4. Testing & Bug Fixes Log

During development and automated testing, several edge cases were identified and resolved:

### Bug 1: Partial Hour Rounding at Exactly 60 Minutes
- **Symptom**: A stay of 60 minutes sharp was rounding up to 2 hours due to microsecond precision offsets.
- **Root Cause**: Floating-point millisecond division precision.
- **Fix**: Used `Math.max(1, Math.ceil(diffMs / (1000 * 60)))` to compute total minutes before dividing by 60 and applying `Math.ceil()`.

### Bug 2: EV Spot Assignment Allocation Exhaustion
- **Symptom**: If all EV spots were taken, automatic spot assignment was falling back to standard spots for EV cars.
- **Root Cause**: Fallback logic did not enforce mandatory EV charger requirement.
- **Fix**: Restricted EV vehicles strictly to EV spots (`spot_type = 'ev'`). If free EV count is 0, backend responds with `No free EV spots available at this moment`.

### Bug 3: Windows Path Resolution in ES Modules
- **Symptom**: Standard `__dirname` is not present in ES modules (`"type": "module"`).
- **Fix**: Replaced external helper imports with native Node `fileURLToPath(import.meta.url)` and `path.dirname()` for clean cross-platform path resolution on Windows and Linux.
