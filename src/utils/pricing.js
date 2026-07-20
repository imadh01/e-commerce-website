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
