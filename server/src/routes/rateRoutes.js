import express from 'express';
import { query, getOne, run } from '../config/db.js';
import { sanitizeMessyRateCard } from '../utils/rateSanitizer.js';

const router = express.Router();

// Level 1 Twist (T4 - Messy Data Import & Rate Cleaning)
router.post('/import-messy', async (req, res) => {
  try {
    const { messy_rates, raw_text } = req.body;
    const rawPayload = messy_rates || raw_text || req.body;

    const cleanedRates = sanitizeMessyRateCard(rawPayload);

    // Save cleaned rates into DB per spot_type
    for (const [spotType, rates] of Object.entries(cleanedRates)) {
      await run(`
        INSERT INTO spot_rates (spot_type, hourly_first_rate, hourly_next_rate, daily_cap_rate)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(spot_type) DO UPDATE SET
          hourly_first_rate = excluded.hourly_first_rate,
          hourly_next_rate = excluded.hourly_next_rate,
          daily_cap_rate = excluded.daily_cap_rate
      `, [spotType, rates.hourlyFirstRate, rates.hourlyNextRate, rates.dailyCapRate]);
    }

    res.json({
      message: 'Messy rate card imported, sanitized, and stored successfully',
      sanitizedRates: cleanedRates
    });
  } catch (error) {
    console.error('Error importing messy rate card:', error);
    res.status(500).json({ error: 'Failed to parse and sanitize rate card' });
  }
});

// GET Cleaned Rates per Spot Type
router.get('/', async (req, res) => {
  try {
    const rates = await query(`SELECT * FROM spot_rates`);
    res.json({ rates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch spot rates' });
  }
});

export default router;
