# REASONING.md — Technical Thought Process & Contest Twist Implementation

## 1. Core Problem & Twist Architectural Solutions

### Level 1 Twist — T4 (Messy Data Import & Cleaning)
- **Challenge**: Rate cards received from external sources often contain unstructured text, noise symbols, irregular casing, and extra formatting characters.
- **Solution**: Implemented `rateSanitizer.js` regular expression cleaner. It strips ordinal noise (e.g. `1st`, `2nd`), extracts sanitized rate values (`hourlyFirstRate`, `hourlyNextRate`, `dailyCapRate`), categorizes by spot type (`compact`, `standard`, `ev`), and persists sanitized rates into the database `spot_rates` table.

### Level 2 Twist — T2 (Automation Nightly Job / Graded via `POST /clock`)
- **Challenge**: Sessions parked over 24 hours must be automatically billed and closed by a scheduled nightly clock job.
- **Solution**: Implemented `POST /clock` (and `POST /api/clock`). When triggered, the handler queries all active tickets, checks if `(simulatedTime - check_in_time) >= 24h`, computes the 24-hour daily cap fee, sets `status = 'completed'`, frees the spot, and returns a detailed summary payload.

### Level 3 Twist — T6 (Lifecycle Valet Hand-Off Transfer)
- **Challenge**: Transferring an open session to a different plate during a valet hand-off while maintaining original spot assignment and check-in time.
- **Solution**: Implemented `POST /api/tickets/:id/transfer`. It updates `license_plate` while preserving `spot_id`, `check_in_time`, and `created_at` timestamp without altering duration or accrued fee logic.

---

## 2. Mathematical Derivation of Tiered Pricing Algorithm

Duration in milliseconds: $\Delta M = \max(0, T_{\text{out}} - T_{\text{in}})$

1. **Ceiling Hour Rounding**:
   $$H_{\text{total}} = \left\lceil \frac{\Delta M}{1000 \times 3600} \right\rceil$$

2. **24-Hour Cycle Decomposition**:
   $$\text{Days} = \lfloor H_{\text{total}} / 24 \rfloor, \quad H_{\text{rem}} = H_{\text{total}} \bmod 24$$

3. **Sub-Day Tiered Fee**:
   $$\text{Fee}_{\text{rem}} = \begin{cases} 
   0 & \text{if } H_{\text{rem}} = 0 \\
   R_1 & \text{if } H_{\text{rem}} = 1 \\
   R_1 + (H_{\text{rem}} - 1) \times R_2 & \text{if } H_{\text{rem}} > 1 
   \end{cases}$$

4. **Daily Cap Application**:
   $$\text{Fee}_{\text{rem\_capped}} = \min(\text{Fee}_{\text{rem}}, C)$$
   $$\text{Total Fee} = (\text{Days} \times C) + \text{Fee}_{\text{rem\_capped}}$$

---

## 3. Concurrency Safeguards & Constraint Enforcement

- **Double-Parking Prevention**: `spots.is_occupied` updated via atomic queries (`UPDATE spots SET is_occupied = 1 WHERE id = ? AND is_occupied = 0`).
- **EV Spot Constraint**: If `vehicle_type === 'ev'`, backend verifies `targetSpot.spot_type === 'ev'`. Otherwise rejects with `400 Bad Request`.
