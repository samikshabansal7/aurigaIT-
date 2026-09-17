/**
 * Rate Card Sanitizer for Level 1 Twist (Messy Rate Card Data Import)
 * Cleans messy, noisy, unstructured rate inputs into sanitized numeric rates per spot type.
 */

export function sanitizeMessyRateCard(inputData) {
  const defaultRates = {
    compact: { hourlyFirstRate: 8, hourlyNextRate: 4, dailyCapRate: 35 },
    standard: { hourlyFirstRate: 10, hourlyNextRate: 5, dailyCapRate: 40 },
    ev: { hourlyFirstRate: 12, hourlyNextRate: 6, dailyCapRate: 45 }
  };

  if (!inputData) return defaultRates;

  const result = { ...defaultRates };

  // Helper to extract sanitized numbers from messy strings
  const parseNumbersFromString = (str) => {
    if (typeof str === 'number') return [str];
    if (!str || typeof str !== 'string') return [];
    
    // Remove ordinal indicators like 1st, 2nd, 3rd, 4th
    const cleanedStr = str.replace(/\b\d+(st|nd|rd|th)\b/gi, '');
    
    // Match positive decimal/integer numbers
    const matches = cleanedStr.match(/\d+(\.\d+)?/g);
    return matches ? matches.map(Number) : [];
  };

  // If input is an array of messy objects or strings
  const items = Array.isArray(inputData) ? inputData : [inputData];

  for (const item of items) {
    let spotType = 'standard';
    let textStr = '';

    if (typeof item === 'string') {
      textStr = item.toLowerCase();
    } else if (typeof item === 'object' && item !== null) {
      spotType = (item.spot_type || item.type || 'standard').toLowerCase();
      textStr = JSON.stringify(item).toLowerCase();
    }

    if (textStr.includes('compact') || textStr.includes('small')) spotType = 'compact';
    else if (textStr.includes('ev') || textStr.includes('electric') || textStr.includes('charger')) spotType = 'ev';
    else if (textStr.includes('standard') || textStr.includes('regular')) spotType = 'standard';

    const numbers = parseNumbersFromString(textStr);

    if (numbers.length >= 3) {
      result[spotType] = {
        hourlyFirstRate: numbers[0],
        hourlyNextRate: numbers[1],
        dailyCapRate: numbers[2]
      };
    } else if (typeof item === 'object' && item !== null) {
      // Direct property cleaning if structured object with messy values
      const firstNum = parseNumbersFromString(String(item.hourly_first_rate || item.first_rate || item.firstHour || ''))[0];
      const nextNum = parseNumbersFromString(String(item.hourly_next_rate || item.next_rate || item.extraHour || ''))[0];
      const capNum = parseNumbersFromString(String(item.daily_cap_rate || item.daily_cap || item.cap || ''))[0];

      result[spotType] = {
        hourlyFirstRate: firstNum ?? result[spotType].hourlyFirstRate,
        hourlyNextRate: nextNum ?? result[spotType].hourlyNextRate,
        dailyCapRate: capNum ?? result[spotType].dailyCapRate
      };
    }
  }

  return result;
}
