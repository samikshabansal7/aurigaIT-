

## 1. Overall Approach

The main requirement was to build a system that can manage vehicles, parking spots, parking fees and parking records for a multi-level garage.

I divided the application into three main parts:

* **Frontend** – React and Vite for the user interface.
* **Backend** – Node.js and Express for APIs and application logic.
* **Database** – SQLite for storing users, parking spots, tickets and rate information.

The important parking operations are handled on the backend so that rules such as EV-only parking and fee calculation cannot be bypassed from the frontend.

---

# 2. Contest Twist Implementations

## Level 1 – T4: Messy Rate Card

### Problem

The rate information may not always come in a clean format. It can contain extra words, symbols, different spacing or other unwanted characters.

For example, the input may contain something like:

```text
Compact - $10 / 1st hour
Standard : $12 first hr
EV $$$ 15 / first hour
```

So I needed to clean the data before saving and using it.

### My Approach

I created a `rateSanitizer.js` module to process the rate card.

The sanitizer:

1. Reads the incoming rate information.
2. Removes unwanted characters and formatting.
3. Identifies the parking spot type.
4. Extracts the actual numeric rate.
5. Stores the cleaned values in the `spot_rates` table.

The three parking types handled are:

```text
compact
standard
ev
```

Keeping this logic in a separate file makes the rate cleaning easier to test and modify later.

---

# 3. Level 2 – T2: Automatic 24-Hour Billing

### Problem

A vehicle might remain in the garage for more than 24 hours without a normal checkout.

The challenge requires these sessions to be automatically closed and billed through:

```text
POST /clock
```

### My Approach

When `/clock` is called, the backend checks all currently active tickets.

For every active ticket, it compares the current/simulated time with the vehicle's check-in time.

If:

```text
current time - check-in time >= 24 hours
```

then the system:

1. Calculates the parking fee.
2. Completes the ticket.
3. Stores the final fee.
4. Frees the parking spot.
5. Records the automatic billing action.

This keeps the parking records consistent even if the attendant does not manually check out the vehicle.

---

# 4. Level 3 – T6: Valet Session Transfer

### Problem

During a valet hand-off, an active parking session may need to be transferred to another license plate.

The important thing here is that the parking session itself should continue. The parking spot and original entry time should not change.

### My Approach

I added:

```text
POST /api/tickets/:id/transfer
```

The transfer changes only the license plate.

These values remain unchanged:

```text
spot_id
vehicle_type
check_in_time
created_at
```

For example:

```text
Before:
Plate: ABC123
Spot: EV-05
Entry: 10:00 AM

After:
Plate: XYZ789
Spot: EV-05
Entry: 10:00 AM
```

So the session is transferred without starting a completely new parking session.

---

# 5. Parking Fee Calculation

The fee calculation was one of the main parts of the application because the parking time needs to be rounded up and the daily maximum also needs to be considered.

The basic rates are:

```text
First hour = $10
Additional hour = $5
Daily maximum = $40
```

## Step 1 – Calculate Parking Duration

First, I calculate the difference between checkout time and check-in time.

```text
duration = checkout time - check-in time
```

The duration is converted into hours.

For part-hours, I use ceiling rounding.

For example:

```text
1 hour 5 minutes → 2 hours
2 hours 20 minutes → 3 hours
```

Mathematically:

$$
H = \left\lceil \frac{\Delta t}{3600000} \right\rceil
$$

where `Δt` is the parking duration in milliseconds.

---

## Step 2 – Calculate the Hourly Fee

For one hour:

```text
$10
```

For more than one hour:

```text
First hour = $10
Remaining hours = $5 each
```

For example, 3 billable hours:

```text
First hour = $10
2 additional hours = $10

Total = $20
```

---

## Step 3 – Apply the Daily Cap

The maximum charge for a 24-hour period is:

```text
$40
```

So if the normal hourly calculation becomes more than $40 for a day, the amount is limited to $40.

For example:

```text
Normal calculation = $55
Daily cap = $40

Final amount = $40
```

For longer stays, the duration is separated into 24-hour periods and the daily cap is applied to each complete day.

---

# 6. Preventing Double Parking

One important requirement was that the same parking spot must never be assigned to two vehicles at the same time.

For this reason, I did not rely only on the frontend to check whether a spot is free.

The backend checks the spot before assigning it.

The database update is performed using a condition like:

```sql
UPDATE spots
SET is_occupied = 1
WHERE id = ? AND is_occupied = 0;
```

The important part is:

```text
is_occupied = 0
```

This means the spot is changed to occupied only when it is still free.

If another vehicle has already taken the spot, the update will not succeed.

This gives an extra layer of protection against duplicate spot assignments.

---

# 7. EV Parking Rule

EV vehicles have a separate parking requirement.

If:

```text
vehicle_type = ev
```

then the selected parking spot must also have:

```text
spot_type = ev
```

The backend checks this before creating the parking ticket.

If someone tries to assign an EV vehicle to a compact or standard spot, the request is rejected.

This rule is handled on the backend instead of trusting the frontend selection.

---

# 8. EV Availability

The attendant needs to quickly know whether an EV parking space is available.

For this, the system checks the parking spots where:

```text
spot_type = ev
```

and:

```text
is_occupied = false
```

The dashboard can then show the number of available EV spots and whether at least one EV spot is currently free.

---

# 9. Searching by License Plate

The attendant may need to find a vehicle quickly without checking the whole transaction history.

So the license plate is used as the search field.

The backend searches the ticket records using the plate number and returns the matching parking information.

The result can include:

* License plate
* Vehicle type
* Floor
* Parking spot
* Entry time
* Ticket status
* Current fee

This makes finding a particular vehicle easier when there are many records.

---

# 10. Handling Large Transaction Logs

The number of parking records can become very large during the day.

Loading every record at once would not be efficient.

So I used pagination for the transaction API.

For example:

```text
page = 1
limit = 10
```

This means the frontend only receives the required number of records instead of the complete database table.

Sorting and filtering are also handled through the API so the system can work better with a large transaction history.

---

# 11. Multi-Level Parking

The garage has multiple floors, so parking spots are connected to their respective floors.

The basic relationship is:

```text
Garage
   ↓
Floors
   ↓
Parking Spots
   ↓
Parking Tickets
```

Each spot stores its floor information along with its spot type and current status.

This allows the application to display the parking situation floor by floor.

---

# 12. Keeping Business Logic in the Backend

I kept important rules inside the backend instead of implementing them only in React.

The backend is responsible for:

* Parking spot allocation
* EV restrictions
* Fee calculation
* Check-in
* Check-out
* 24-hour automatic billing
* Session transfer
* Spot availability
* Database updates

This is important because frontend validation alone can be bypassed. The backend should always perform the final validation before changing the database.

---

# 13. Testing

The fee calculation logic was separated into its own module so that it could be tested independently.

Some cases that need to be tested are:

```text
15 minutes
1 hour
1 hour 5 minutes
2 hours
7 hours
12 hours
24 hours
25 hours
```

The tests are mainly used to verify ceiling rounding, tiered pricing and the daily cap.

This approach keeps the vehicle, parking spot and ticket information connected and makes sure the main parking rules are checked before the database is changed.
