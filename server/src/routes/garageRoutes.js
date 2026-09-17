import express from 'express';
import { query, getOne } from '../config/db.js';

const router = express.Router();

// Get Garage Overview Statistics (Capacity, Occupancy, EV Free Counter, Rates)
router.get('/overview', async (req, res) => {
  try {
    const garage = await getOne(`SELECT * FROM garages LIMIT 1`);
    if (!garage) {
      return res.status(404).json({ error: 'Garage config not found' });
    }

    const totalSpotsRes = await getOne(`SELECT COUNT(*) as count FROM spots`);
    const occupiedSpotsRes = await getOne(`SELECT COUNT(*) as count FROM spots WHERE is_occupied = 1`);
    
    // EV Spots breakdown
    const totalEvSpotsRes = await getOne(`SELECT COUNT(*) as count FROM spots WHERE spot_type = 'ev'`);
    const occupiedEvSpotsRes = await getOne(`SELECT COUNT(*) as count FROM spots WHERE spot_type = 'ev' AND is_occupied = 1`);

    // Compact Spots breakdown
    const totalCompactSpotsRes = await getOne(`SELECT COUNT(*) as count FROM spots WHERE spot_type = 'compact'`);
    const occupiedCompactSpotsRes = await getOne(`SELECT COUNT(*) as count FROM spots WHERE spot_type = 'compact' AND is_occupied = 1`);

    // Standard Spots breakdown
    const totalStandardSpotsRes = await getOne(`SELECT COUNT(*) as count FROM spots WHERE spot_type = 'standard'`);
    const occupiedStandardSpotsRes = await getOne(`SELECT COUNT(*) as count FROM spots WHERE spot_type = 'standard' AND is_occupied = 1`);

    const totalCapacity = totalSpotsRes.count;
    const totalOccupied = occupiedSpotsRes.count;
    const totalFree = totalCapacity - totalOccupied;

    const totalEv = totalEvSpotsRes.count;
    const occupiedEv = occupiedEvSpotsRes.count;
    const freeEv = totalEv - occupiedEv;

    res.json({
      garage: {
        id: garage.id,
        name: garage.name,
        rates: {
          hourlyFirstRate: garage.hourly_first_rate,
          hourlyNextRate: garage.hourly_next_rate,
          dailyCapRate: garage.daily_cap_rate
        }
      },
      stats: {
        totalCapacity,
        totalOccupied,
        totalFree,
        ev: {
          total: totalEv,
          occupied: occupiedEv,
          free: freeEv,
          isEvFree: freeEv > 0
        },
        compact: {
          total: totalCompactSpotsRes.count,
          occupied: occupiedCompactSpotsRes.count,
          free: totalCompactSpotsRes.count - occupiedCompactSpotsRes.count
        },
        standard: {
          total: totalStandardSpotsRes.count,
          occupied: occupiedStandardSpotsRes.count,
          free: totalStandardSpotsRes.count - occupiedStandardSpotsRes.count
        }
      }
    });
  } catch (error) {
    console.error('Error fetching garage overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Floors with spot status layout
router.get('/floors', async (req, res) => {
  try {
    const floors = await query(`SELECT * FROM floors ORDER BY floor_number ASC`);
    const result = [];

    for (const floor of floors) {
      const spots = await query(`
        SELECT s.*, t.license_plate, t.vehicle_type, t.check_in_time, t.id as ticket_id
        FROM spots s
        LEFT JOIN tickets t ON s.id = t.spot_id AND t.status = 'active'
        WHERE s.floor_id = ?
        ORDER BY s.spot_number ASC
      `, [floor.id]);

      result.push({
        ...floor,
        spots
      });
    }

    res.json({ floors: result });
  } catch (error) {
    console.error('Error fetching floors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get All Spots (with optional spot_type or is_occupied filter)
router.get('/spots', async (req, res) => {
  try {
    const { spot_type, is_occupied } = req.query;
    let sql = `
      SELECT s.*, f.name as floor_name, f.floor_number, t.license_plate, t.vehicle_type, t.check_in_time, t.id as ticket_id
      FROM spots s
      JOIN floors f ON s.floor_id = f.id
      LEFT JOIN tickets t ON s.id = t.spot_id AND t.status = 'active'
      WHERE 1=1
    `;
    const params = [];

    if (spot_type) {
      sql += ` AND s.spot_type = ?`;
      params.push(spot_type);
    }
    if (is_occupied !== undefined) {
      sql += ` AND s.is_occupied = ?`;
      params.push(is_occupied === 'true' || is_occupied === '1' ? 1 : 0);
    }

    sql += ` ORDER BY f.floor_number ASC, s.spot_number ASC`;

    const spots = await query(sql, params);
    res.json({ spots });
  } catch (error) {
    console.error('Error fetching spots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
