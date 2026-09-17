/**
 * Tiered Fee Calculation Engine for ParkPulse
 * 
 * Rules:
 * - Part-hours round up to the next full hour.
 * - 1st hour rate (default $10).
 * - Extra hours rate (default $5/hr).
 * - Daily cap per 24-hour period (default $40 max per 24h).
 */

export function calculateParkingFee(checkInTime, checkOutTime, options = {}) {
  const {
    hourlyFirstRate = 10,
    hourlyNextRate = 5,
    dailyCapRate = 40
  } = options;

  const start = new Date(checkInTime).getTime();
  const end = new Date(checkOutTime).getTime();

  if (isNaN(start) || isNaN(end)) {
    throw new Error('Invalid check-in or check-out date format');
  }

  // Calculate duration in milliseconds
  const diffMs = Math.max(0, end - start);
  
  // Calculate total minutes
  const totalMinutes = Math.max(1, Math.ceil(diffMs / (1000 * 60)));

  // Part-hours round up to full hours
  const totalHours = Math.ceil(totalMinutes / 60);

  // Daily cycle decomposition (24 hours per day)
  const fullDays = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;

  // Calculate fee for full 24-hr days (each day is capped at dailyCapRate)
  const fullDaysFee = fullDays * dailyCapRate;

  // Calculate fee for remaining hours within current day
  let remainingHoursFee = 0;
  if (remainingHours > 0) {
    if (remainingHours === 1) {
      remainingHoursFee = hourlyFirstRate;
    } else {
      remainingHoursFee = hourlyFirstRate + (remainingHours - 1) * hourlyNextRate;
    }
    // Apply daily cap to the remaining hours if it exceeds dailyCapRate
    remainingHoursFee = Math.min(remainingHoursFee, dailyCapRate);
  }

  const totalFee = fullDaysFee + remainingHoursFee;

  return {
    checkInTime: new Date(start).toISOString(),
    checkOutTime: new Date(end).toISOString(),
    durationMinutes: totalMinutes,
    billedHours: totalHours,
    fullDays,
    remainingHours,
    rates: {
      hourlyFirstRate,
      hourlyNextRate,
      dailyCapRate
    },
    totalFee: parseFloat(totalFee.toFixed(2))
  };
}
