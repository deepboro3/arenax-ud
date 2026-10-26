import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import path from 'node:path';
import { existsSync } from 'node:fs';
import rateLimit from 'express-rate-limit';
import { ZodError } from 'zod';
import authRoutes from './routes/auth.js';
import tournamentRoutes from './routes/tournaments.js';
import registrationRoutes from './routes/registrations.js';
import paymentRoutes from './routes/payments.js';
import Registration from './models/Registration.js';
import Tournament from './models/Tournament.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((item) => item.trim());

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: false }));
app.use(express.json({ limit: '256kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'arenax-ud-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/payments', paymentRoutes);

const clientDist = path.resolve(process.cwd(), 'dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: '1h' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}
app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use((error, _req, res, _next) => {
  if (error instanceof ZodError) return res.status(400).json({ error: 'Request validation failed.', issues: error.issues });
  if (error?.code === 11000) return res.status(409).json({ error: 'That value is already in use.' });
  if (error?.name === 'CastError') return res.status(400).json({ error: 'Invalid resource ID.' });
  if (Number.isInteger(error?.status) && error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error(error);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

async function expireUnpaidReservations() {
  const now = new Date();
  const expired = await Registration.find({ status: 'pending_payment', paymentDeadline: { $lte: now } })
    .select('_id tournament')
    .lean();

  for (const registration of expired) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const result = await Registration.updateOne(
          { _id: registration._id, status: 'pending_payment', paymentDeadline: { $lte: now } },
          { $set: { status: 'cancelled' } },
          { session },
        );
        if (!result.modifiedCount) return;
        await Tournament.updateOne(
          { _id: registration.tournament, reservedSlots: { $gt: 0 } },
          { $inc: { reservedSlots: -1 } },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
  }
}

async function start() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) throw new Error('MONGODB_URI and JWT_SECRET are required.');
  await mongoose.connect(process.env.MONGODB_URI);
  await expireUnpaidReservations();
  setInterval(() => expireUnpaidReservations().catch((error) => console.error('Reservation cleanup failed:', error)), 60_000).unref();
  app.listen(port, '0.0.0.0', () => console.log('ArenaX-UD listening on port ' + port));
}
start().catch((error) => {
  console.error('API startup failed:', error);
  process.exit(1);
});