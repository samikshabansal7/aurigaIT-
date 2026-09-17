import { sanitizeMessyRateCard } from '../utils/rateSanitizer.js';
import assert from 'assert';

console.log('--- Running Contest Twists Unit Test Suite ---');

// Test Level 1 Twist (T4: Messy Rate Card Sanitization)
{
  const messyInput = [
    "Compact spots: $8.00 / 1st hr (extra: $4/hr) MAX_DAY = $35usd!!!",
    "Standard: $10 (1st hour), $5 per hour extra, Capped at $40 dollars",
    "EV Charger Bay: $12.00 1st hour, $6/hr, max = $45"
  ];

  const cleaned = sanitizeMessyRateCard(messyInput);

  assert.strictEqual(cleaned.compact.hourlyFirstRate, 8);
  assert.strictEqual(cleaned.compact.hourlyNextRate, 4);
  assert.strictEqual(cleaned.compact.dailyCapRate, 35);

  assert.strictEqual(cleaned.standard.hourlyFirstRate, 10);
  assert.strictEqual(cleaned.standard.hourlyNextRate, 5);
  assert.strictEqual(cleaned.standard.dailyCapRate, 40);

  assert.strictEqual(cleaned.ev.hourlyFirstRate, 12);
  assert.strictEqual(cleaned.ev.hourlyNextRate, 6);
  assert.strictEqual(cleaned.ev.dailyCapRate, 45);

  console.log('✓ Level 1 (T4) Passed: Messy rate card successfully sanitized and cleaned!');
}

console.log('--- All Contest Twist Tests Passed Successfully! ---');
