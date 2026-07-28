// Shopping cart totals.
// NOTE: this file is an eval fixture and contains DELIBERATE defects.

/**
 * Apply a tiered discount to the cart subtotal.
 * Tiers: 0-99 -> 0%, 100-499 -> 5%, 500+ -> 10%
 */
function discountFor(subtotal) {
  // SEEDED DEFECT (off-by-one): at exactly 100 this returns 0, and at exactly
  // 500 it returns 0.05 — both boundaries land in the wrong tier.
  if (subtotal > 100 && subtotal < 500) return 0.05;
  if (subtotal > 500) return 0.10;
  return 0;
}

/**
 * Total the cart. Amounts are in dollars.
 */
function cartTotal(items) {
  // SEEDED DEFECT (floating point money): accumulating dollars as floats gives
  // 0.1 + 0.2 = 0.30000000000000004 and rounds wrong at the cent.
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.quantity;
  }

  const discount = discountFor(subtotal);
  const afterDiscount = subtotal * (1 - discount);

  // SEEDED DEFECT (no empty-cart handling): items=[] yields 0, but items=null
  // or undefined throws instead of returning 0 or a clear error.
  return Math.round(afterDiscount * 100) / 100;
}

module.exports = { cartTotal, discountFor };
