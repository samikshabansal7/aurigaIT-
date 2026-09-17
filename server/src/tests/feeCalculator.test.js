import { calculateParkingFee } from '../utils/feeCalculator.js';
import assert from 'assert';

console.log('--- Running Fee Calculator Unit Tests ---');

const baseRates = { hourlyFirstRate: 10, hourlyNextRate: 5, dailyCapRate: 40 };

// Test 1: Under 1 hour (e.g. 15 mins -> rounds up to 1 hour = $10)
{
  const now = new Date();
  const checkIn = new Date(now.getTime() - 15 * 60 * 1000);
  const res = calculateParkingFee(checkIn, now, baseRates);
  assert.strictEqual(res.billedHours, 1);
  assert.strictEqual(res.totalFee, 10);
  console.log('✓ Test 1 Passed: 15 mins stay charged 1st hour rate ($10)');
}

// Test 2: Exactly 1 hour -> $10
{
  const now = new Date();
  const checkIn = new Date(now.getTime() - 60 * 60 * 1000);
  const res = calculateParkingFee(checkIn, now, baseRates);
  assert.strictEqual(res.billedHours, 1);
  assert.strictEqual(res.totalFee, 10);
  console.log('✓ Test 2 Passed: Exactly 1 hour stay ($10)');
}

// Test 3: 1 hour 5 minutes -> rounds up to 2 hours ($10 + $5 = $15)
{
  const now = new Date();
  const checkIn = new Date(now.getTime() - 65 * 60 * 1000);
  const res = calculateParkingFee(checkIn, now, baseRates);
  assert.strictEqual(res.billedHours, 2);
  assert.strictEqual(res.totalFee, 15);
  console.log('✓ Test 3 Passed: 1h 5m stay charged 2 hours ($15)');
}

// Test 4: 7 hours -> $10 + 6*$5 = $40 (reaches daily cap)
{
  const now = new Date();
  const checkIn = new Date(now.getTime() - 7 * 60 * 60 * 1000);
  const res = calculateParkingFee(checkIn, now, baseRates);
  assert.strictEqual(res.billedHours, 7);
  assert.strictEqual(res.totalFee, 40); // 10 + 30 = 40
  console.log('✓ Test 4 Passed: 7 hours capped at daily max ($40)');
}

// Test 5: 12 hours -> uncapped would be 10 + 11*5 = $65, but capped at $40
{
  const now = new Date();
  const checkIn = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  const res = calculateParkingFee(checkIn, now, baseRates);
  assert.strictEqual(res.billedHours, 12);
  assert.strictEqual(res.totalFee, 40);
  console.log('✓ Test 5 Passed: 12 hours capped at daily max ($40)');
}

// Test 6: 25 hours (1 full day + 1 hour) -> $40 + $10 = $50
{
  const now = new Date();
  const checkIn = new Date(now.getTime() - 25 * 60 * 60 * 1000);
  const res = calculateParkingFee(checkIn, now, baseRates);
  assert.strictEqual(res.fullDays, 1);
  assert.strictEqual(res.remainingHours, 1);
  assert.strictEqual(res.totalFee, 50);
  console.log('✓ Test 6 Passed: 25 hours stay ($40 day + $10 first hour = $50)');
}

console.log('--- All Fee Calculator Tests Passed Successfully! ---');
