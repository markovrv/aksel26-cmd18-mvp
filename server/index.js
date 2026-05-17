// === Server Entry Point ===
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import logger from './utils/logger.js';
import db from './db/index.js';

// Route imports
import authRoutes from './routes/auth.js';
import professionsRoutes from './routes/professions.js';
import enterprisesRoutes from './routes/enterprises.js';
import slotsRoutes from './routes/slots.js';
import bookingsRoutes from './routes/bookings.js';
import qrRoutes from './routes/qr.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/ai.js';
import widgetRoutes from './routes/widget.js';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

// === Middleware ===
app.use(helmet({
  contentSecurityPolicy: false,  // CSP отключён полностью
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('combined'));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// === Serve Static Client Build ===
const clientDistPath = path.resolve(__dirname, '../server/public');
app.use(express.static(clientDistPath));

// === Rate Limiting ===
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Слишком много запросов. Попробуйте позже.' }
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { message: 'Лимит сообщений в чате. Попробуйте позже.' }
});

app.use('/api', generalLimiter);
app.use('/api/ai/chat', aiLimiter);

// === Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/professions', professionsRoutes);
app.use('/api/enterprises', enterprisesRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/widget', widgetRoutes);

// === SPA Fallback: serve index.html for non-API routes ===
app.get('*', (req, res) => {
  res.sendFile(path.resolve(clientDistPath, 'index.html'));
});

// === Error Handler ===
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;