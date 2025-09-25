// src/utils.js
// Formats values as Sri Lankan Rupees, e.g. "Rs 1,234.50" or "-Rs 250.00"
export function formatCurrency(value, opts = {}) {
  const { decimals = 2, withSymbol = true } = opts;
  const num = Number(value ?? 0);
  const sign = num < 0 ? "-" : "";
  const abs = Math.abs(num);
  const formatted = abs.toLocaleString("en-LK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return withSymbol ? `${sign}Rs ${formatted}` : `${sign}${formatted}`;
}
