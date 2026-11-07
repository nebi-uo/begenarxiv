import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db';
import { runMigrations } from './db/migrate';
import mezmurRoutes from './routes/mezmurRoutes';
import artistRoutes from './routes/artistRoutes';
import tuneRoutes from './routes/tuneRoutes';
import tuningRoutes from './routes/tuningRoutes';
import requestRoutes from './routes/requestRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/+$/, '') : null;
app.use(
  cors({
    origin: clientUrl
      ? [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000']
      : true,
    credentials: true,
  })
);
app.use(express.json());

// Run safe DB migrations on boot
runMigrations().catch((err) => console.warn('Migrations warning:', err));

app.use('/api/mezmurs', mezmurRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/tunes', tuneRoutes);
app.use('/api/tuning-profiles', tuningRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', authRoutes);

// Health check route: confirms Express is running AND can reach Postgres
app.get('/health', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({ status: 'ok', dbTime: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
