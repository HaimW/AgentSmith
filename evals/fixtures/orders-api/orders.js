// Order routes for the storefront API.
// NOTE: this file is an eval fixture and contains DELIBERATE defects.
const express = require('express');
const router = express.Router();
const db = require('./db');

// SEEDED DEFECT 1 (IDOR): fetches by id without checking the order belongs to
// the authenticated user, so any logged-in user can read anyone's order.
router.get('/orders/:id', async (req, res) => {
  const order = await db.query(`SELECT * FROM orders WHERE id = ${req.params.id}`);
  // SEEDED DEFECT 2 (SQL injection): params interpolated straight into SQL.
  if (!order) return res.status(404).json({ error: 'not found' });
  res.json(order);
});

// SEEDED DEFECT 3 (offset pagination + uncapped limit): a client can request
// limit=1000000, and rows shift between pages as orders are created.
router.get('/orders', async (req, res) => {
  const limit = req.query.limit || 20;
  const offset = req.query.offset || 0;
  const rows = await db.query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [req.user.id, limit, offset],
  );
  res.json(rows);
});

// SEEDED DEFECT 4 (mass assignment): the whole body is written to the record,
// so a caller can set status, total, or user_id directly.
router.post('/orders', async (req, res) => {
  const order = await db.insert('orders', { ...req.body, user_id: req.user.id });
  res.json(order);
});

// SEEDED DEFECT 5 (no idempotency): a retried request charges the card twice.
router.post('/orders/:id/pay', async (req, res) => {
  const order = await db.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  await paymentGateway.charge(order.total, req.body.cardToken);
  await db.update('orders', order.id, { status: 'paid' });
  res.json({ ok: true });
});

// SEEDED DEFECT 6 (secret in source + leaked internals in the error path).
// Deliberately fake: shaped like a live key so a reviewer flags it, but obviously
// a placeholder so real secret scanners and push protection are not confused.
const STRIPE_KEY = 'sk_live_000000000000000000000000EXAMPLE';

router.use((err, req, res, next) => {
  res.status(500).json({ error: err.stack });
});

module.exports = router;
