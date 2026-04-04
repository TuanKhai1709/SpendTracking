require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { init: initDb } = require('./db');

async function start() {
  await initDb();

  const authRoutes = require('./routes/auth');
  const expenseRoutes = require('./routes/expenses');
  const incomeRoutes = require('./routes/income');

  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/income', incomeRoutes);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`SpendTracker server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
