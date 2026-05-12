import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import adminRoutes from './routes/admin.js';
import dramaRoutes from './routes/dramas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Parse JSON bodies (10MB limit for large translations)
app.use(express.json({ limit: '10mb' }));

// Serve static media files from the public directory
app.use('/media', express.static(path.join(__dirname, '../public/media')));

// Admin API routes
app.use('/api/admin', adminRoutes);

// Public drama API routes
app.use('/api/dramas', dramaRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Media files served from: /media`);
  console.log(`Admin API: /api/admin`);
});
