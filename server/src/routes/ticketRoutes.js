import express from 'express';
import { query, getOne, run } from '../config/db.js';
import { calculateParkingFee } from '../utils/feeCalculator.js';

const router = express.Router();

// Helper to get garage pricing rules
async function getGarageRates() {
  const garage = await getOne(`SELECT hourly_first_rate, hourly_next_rate, daily_cap_rate FROM garages LIMIT 1`);
  return {
    hourlyFirstRate: garage?.hourly_first_rate || 10,
    hourlyNextRate: garage?.hourly_next_rate || 5,
    dailyCapRate: garage?.daily_cap_rate || 40
  };
}

// 1. CHECK-IN CAR
router.post('/check-in', async (req, res) => {
  try {
    const { license_plate, vehicle_type, preferred_spot_id } = req.body;

    if (!license_plate || !vehicle_type) {
      return res.status(400).json({ error: 'License plate and vehicle type are required' });
    }

    const normalizedPlate = license_plate.trim().toUpperCase();
    const validVehicleTypes = ['compact', 'standard', 'ev'];
    if (!validVehicleTypes.includes(vehicle_type.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid vehicle type. Must be compact, standard, or ev' });
    }

    const type = vehicle_type.toLowerCase();

    // Check if vehicle is already parked in garage
    const existingTicket = await getOne(
      `SELECT * FROM tickets WHERE license_plate = ? AND status = 'active'`,
      [normalizedPlate]
    );
    if (existingTicket) {
      return res.status(409).json({
        error: `Vehicle with plate ${normalizedPlate} is already parked in spot ID ${existingTicket.spot_id}`
      });
    }

    let targetSpot = null;

    // If attendant manually selected a preferred spot
    if (preferred_spot_id) {
      targetSpot = await getOne(`SELECT * FROM spots WHERE id = ?`, [preferred_spot_id]);

      if (!targetSpot) {
        return res.status(404).json({ error: 'Selected spot does not exist' });
      }
      if (targetSpot.is_occupied === 1) {
        return res.status(409).json({ error: `Spot ${targetSpot.spot_number} is already occupied!` });
      }

      // STRICT EV RULE CHECK: EV vehicle MUST get an EV spot!
      if (type === 'ev' && targetSpot.spot_type !== 'ev') {
        return res.status(400).json({
          error: `Rule Violation: EV vehicles MUST be parked in an EV spot with a charger. Spot ${targetSpot.spot_number} is a ${targetSpot.spot_type} spot.`
        });
      }
    } else {
      // Automatic Spot Assignment Strategy based on vehicle type rules
      if (type === 'ev') {
        // Must get EV spot
        targetSpot = await getOne(`SELECT * FROM spots WHERE spot_type = 'ev' AND is_occupied = 0 LIMIT 1`);
        if (!targetSpot) {
          return res.status(400).json({ error: 'No free EV spots available at this moment' });
        }
      } else if (type === 'compact') {
        // Try compact spot first, fallback to standard spot
        targetSpot = await getOne(`SELECT * FROM spots WHERE spot_type = 'compact' AND is_occupied = 0 LIMIT 1`);
        if (!targetSpot) {
          targetSpot = await getOne(`SELECT * FROM spots WHERE spot_type = 'standard' AND is_occupied = 0 LIMIT 1`);
        }
      } else if (type === 'standard') {
        // Must get standard spot (or fallback to empty compact if allowed)
        targetSpot = await getOne(`SELECT * FROM spots WHERE spot_type = 'standard' AND is_occupied = 0 LIMIT 1`);
      }

      if (!targetSpot) {
        return res.status(400).json({ error: `No suitable free parking spot available for ${type} vehicle` });
      }
    }

    // Atomic update: Mark spot as occupied & create ticket
    const checkInTime = new Date().toISOString();
    
    // Set occupied flag
    await run(`UPDATE spots SET is_occupied = 1 WHERE id = ?`, [targetSpot.id]);

    const ticketRes = await run(
      `INSERT INTO tickets (spot_id, license_plate, vehicle_type, check_in_time, status) 
       VALUES (?, ?, ?, ?, 'active')`,
      [targetSpot.id, normalizedPlate, type, checkInTime]
    );

    const createdTicket = await getOne(
      `SELECT t.*, s.spot_number, s.spot_type, f.name as floor_name 
       FROM tickets t 
       JOIN spots s ON t.spot_id = s.id 
       JOIN floors f ON s.floor_id = f.id 
       WHERE t.id = ?`,
      [ticketRes.id]
    );

    res.status(201).json({
      message: 'Check-in successful',
      ticket: createdTicket
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error during check-in' });
  }
});

// 2. CHECK-OUT CAR & CALCULATE TIERED FEE
router.post('/:id/check-out', async (req, res) => {
  try {
    const ticketId = req.params.id;

    const ticket = await getOne(`SELECT * FROM tickets WHERE id = ?`, [ticketId]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.status === 'completed') {
      return res.status(400).json({ error: 'Ticket is already checked out and completed' });
    }

    const checkOutTime = new Date().toISOString();
    const rates = await getGarageRates();

    const calculation = calculateParkingFee(ticket.check_in_time, checkOutTime, rates);

    // Update ticket status
    await run(
      `UPDATE tickets 
       SET check_out_time = ?, hours_billed = ?, total_fee = ?, status = 'completed' 
       WHERE id = ?`,
      [checkOutTime, calculation.billedHours, calculation.totalFee, ticketId]
    );

    // Release parking spot
    await run(`UPDATE spots SET is_occupied = 0 WHERE id = ?`, [ticket.spot_id]);

    const completedTicket = await getOne(
      `SELECT t.*, s.spot_number, s.spot_type, f.name as floor_name 
       FROM tickets t 
       JOIN spots s ON t.spot_id = s.id 
       JOIN floors f ON s.floor_id = f.id 
       WHERE t.id = ?`,
      [ticketId]
    );

    res.json({
      message: 'Check-out successful',
      feeBreakdown: calculation,
      ticket: completedTicket
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Internal server error during check-out' });
  }
});

// 3. SEARCH TICKETS BY LICENSE PLATE (Quick Hunt Lookup)
router.get('/search', async (req, res) => {
  try {
    const { plate } = req.query;
    if (!plate || plate.trim() === '') {
      return res.status(400).json({ error: 'License plate query parameter required' });
    }

    const searchTerm = `%${plate.trim().toUpperCase()}%`;
    const tickets = await query(
      `SELECT t.*, s.spot_number, s.spot_type, f.name as floor_name, f.floor_number
       FROM tickets t
       JOIN spots s ON t.spot_id = s.id
       JOIN floors f ON s.floor_id = f.id
       WHERE t.license_plate LIKE ?
       ORDER BY t.status ASC, t.check_in_time DESC`,
      [searchTerm]
    );

    const rates = await getGarageRates();

    // Attach real-time accrued fee preview for active tickets
    const ticketsWithFeePreview = tickets.map(t => {
      if (t.status === 'active') {
        const liveFee = calculateParkingFee(t.check_in_time, new Date().toISOString(), rates);
        return {
          ...t,
          currentBilledHours: liveFee.billedHours,
          currentAccruedFee: liveFee.totalFee
        };
      }
      return t;
    });

    res.json({
      query: plate,
      count: ticketsWithFeePreview.length,
      tickets: ticketsWithFeePreview
    });
  } catch (error) {
    console.error('Plate search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. GET PAGINATED & SORTABLE TRANSACTION LOG
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { search, status, vehicle_type, sortBy = 'check_in_time', sortOrder = 'DESC' } = req.query;

    let whereClause = ' WHERE 1=1';
    const params = [];

    if (search && search.trim() !== '') {
      whereClause += ` AND (t.license_plate LIKE ? OR s.spot_number LIKE ?)`;
      params.push(`%${search.trim().toUpperCase()}%`, `%${search.trim().toUpperCase()}%`);
    }

    if (status && status !== 'all') {
      whereClause += ` AND t.status = ?`;
      params.push(status);
    }

    if (vehicle_type && vehicle_type !== 'all') {
      whereClause += ` AND t.vehicle_type = ?`;
      params.push(vehicle_type);
    }

    // Allowed sort columns for SQL injection protection
    const validSortColumns = {
      check_in_time: 't.check_in_time',
      check_out_time: 't.check_out_time',
      total_fee: 't.total_fee',
      license_plate: 't.license_plate',
      spot_number: 's.spot_number'
    };

    const sortColumn = validSortColumns[sortBy] || 't.check_in_time';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total matches for pagination
    const countSql = `
      SELECT COUNT(*) as count 
      FROM tickets t 
      JOIN spots s ON t.spot_id = s.id 
      ${whereClause}
    `;
    const totalResult = await getOne(countSql, params);
    const total = totalResult ? totalResult.count : 0;

    // Fetch page data
    const dataSql = `
      SELECT t.*, s.spot_number, s.spot_type, f.name as floor_name
      FROM tickets t
      JOIN spots s ON t.spot_id = s.id
      JOIN floors f ON s.floor_id = f.id
      ${whereClause}
      ORDER BY ${sortColumn} ${orderDirection}
      LIMIT ? OFFSET ?
    `;

    const tickets = await query(dataSql, [...params, limit, offset]);

    const rates = await getGarageRates();
    const ticketsFormatted = tickets.map(t => {
      if (t.status === 'active') {
        const liveFee = calculateParkingFee(t.check_in_time, new Date().toISOString(), rates);
        return {
          ...t,
          currentBilledHours: liveFee.billedHours,
          currentAccruedFee: liveFee.totalFee
        };
      }
      return t;
    });

    res.json({
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      tickets: ticketsFormatted
    });
  } catch (error) {
    console.error('Fetch tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
