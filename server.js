'use strict';
const path = require('path');
const express = require('express');
const { ProductStore } = require('./src/productStore');
const { createApiRouter } = require('./src/api');

const PORT = Number(process.env.PORT) || 3000;
const CATEGORIES = ['games', 'applications'];

const store = new ProductStore({
  baseDir: path.join(__dirname, 'database'),
  categories: CATEGORIES,
  rescanIntervalMs: 15000
});
store.start();

const app = express();
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy':
      "default-src 'self'; img-src 'self' https: http: data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'"
  });
  next();
});

// Future extension points (not implemented): src/auth (Telegram), src/payments.
app.use('/api', createApiRouter(store, CATEGORIES));

// Only /public is served. /database is NEVER exposed.
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'not_found' });
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[PlayBox] Running at http://localhost:${PORT}`);
});

process.on('SIGINT', () => { store.stop(); process.exit(0); });
