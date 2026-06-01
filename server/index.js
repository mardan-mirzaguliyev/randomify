import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import listRoutes from './routes/lists.js';
import blogPostRoutes from './routes/blogPosts.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';

const app = express();
const PORT = process.env.PORT || 5000;

const clientUrl = process.env.CLIENT_URL;

app.use(helmet());

// In production the React app is served from the same Express process (same
// origin), so CORS is not needed. In development the Vite dev server runs on
// a different port, so we allow it explicitly.
if (!isProd) {
  app.use(
    cors({
      origin: clientUrl || true,
      credentials: true,
    })
  );
}
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/blog-posts', blogPostRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

if (isProd) {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

app.use((err, _req, res, _next) => {
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    return res.status(400).json({ message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate entry' });
  }

  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }
  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(
        isProd
          ? `Randomify running on port ${PORT} (production)`
          : `Server running on http://localhost:${PORT}`
      );
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
