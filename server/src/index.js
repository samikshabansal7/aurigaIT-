import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDb } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import garageRoutes from './routes/garageRoutes.js';
import ticketRoutes, { handleNightlyClockJob } from './routes/ticketRoutes.js';
import rateRoutes from './routes/rateRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/garage', garageRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/rates', rateRoutes);

// Level 2 Twist Root Endpoint: Graded via POST /clock
app.post('/clock', async (req, res) => {
  try {
    const result = await handleNightlyClockJob(req.body?.simulatedTime || req.body?.currentTime);
    res.json(result);
  } catch (error) {
    console.error('Clock endpoint error:', error);
    res.status(500).json({ error: 'Failed to execute nightly clock job' });
  }
});

app.post('/api/clock', async (req, res) => {
  try {
    const result = await handleNightlyClockJob(req.body?.simulatedTime || req.body?.currentTime);
    res.json(result);
  } catch (error) {
    console.error('Clock endpoint error:', error);
    res.status(500).json({ error: 'Failed to execute nightly clock job' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ParkPulse Backend API', timestamp: new Date().toISOString() });
});

// Serve static frontend in production build if present
const clientBuildPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
      if (err) {
        res.status(404).json({ error: 'Frontend build not found. Run Vite dev server or npm run build in client.' });
      }
    });
  }
});

// Initialize DB and launch server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 ParkPulse REST API Server running on port ${PORT}`);
    console.log(`👉 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('Fatal error initializing database:', err);
});
