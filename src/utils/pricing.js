// Formats a number as ₹xxx.xx — the single source of truth
// for price display across the app.
export function formatPrice(value) {
  return `₹${parseFloat(value || 0).toFixed(2)}`;
}

// Returns the integer discount percentage, or null if there's no discount.
// Returning null instead of 0 lets callers use it directly as a truthy check:
//   const pct = getDiscountPercent(...);
//   {pct && <Badge>{pct}% OFF</Badge>}
export function getDiscountPercent(price, mrp) {
  const p = parseFloat(price);
  const m = parseFloat(mrp);
  if (!m || m <= p) return null;
  return Math.round(((m - p) / m) * 100);
}
