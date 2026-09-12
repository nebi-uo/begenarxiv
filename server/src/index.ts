import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db';
import mezmurRoutes from './routes/mezmurRoutes';
import artistRoutes from './routes/artistRoutes';
import tuneRoutes from './routes/tuneRoutes';
import tuningRoutes from './routes/tuningRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/mezmurs', mezmurRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/tunes', tuneRoutes);
app.use('/api/tuning-profiles', tuningRoutes);

// Health check route: confirms Express is running AND can reach Postgres
app.get('/health', async (req, res) => {
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