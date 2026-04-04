const express = require('express');
const { getDb } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const db = getDb();
  const { filter, date } = req.query;
  let query = 'SELECT * FROM expenses WHERE user_id = ?';
  const params = [req.userId];

  if (filter === 'day' && date) {
    query += ' AND date = ?';
    params.push(date);
  } else if (filter === 'month' && date) {
    query += " AND strftime('%Y-%m', date) = ?";
    params.push(date);
  }

  query += ' ORDER BY date DESC, created_at DESC';

  if (!filter) {
    query += ' LIMIT 5';
  }

  try {
    const expenses = db.prepare(query).all(...params);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

router.get('/summary', (req, res) => {
  const db = getDb();
  try {
    const summary = db.prepare(
      'SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? GROUP BY category'
    ).all(req.userId);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

router.get('/:id', (req, res) => {
  const db = getDb();
  try {
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

router.post('/', (req, res) => {
  const db = getDb();
  const { title, category, amount, date } = req.body;
  if (!title || !category || !amount || !date) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = db.prepare(
      'INSERT INTO expenses (user_id, title, category, amount, date) VALUES (?, ?, ?, ?, ?)'
    ).run(req.userId, title, category, parseFloat(amount), date);
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const { title, category, amount, date } = req.body;

  try {
    const existing = db.prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ error: 'Expense not found' });

    db.prepare(
      'UPDATE expenses SET title = ?, category = ?, amount = ?, date = ? WHERE id = ? AND user_id = ?'
    ).run(
      title || existing.title,
      category || existing.category,
      amount ? parseFloat(amount) : existing.amount,
      date || existing.date,
      req.params.id,
      req.userId
    );
    const updated = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  try {
    const existing = db.prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ error: 'Expense not found' });

    db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
