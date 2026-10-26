import 'dotenv/config';
import mongoose from 'mongoose';
import Tournament from './models/Tournament.js';
import { encryptSecret } from './lib/secrets.js';

const now = Date.now();
const firstStart = new Date(now + 26 * 60 * 60 * 1000);
const secondStart = new Date(now + 50 * 60 * 60 * 1000);
const fixture = (data) => ({
  ...data,
  registrationClosesAt: new Date(data.startAt.getTime() - 12 * 60 * 60 * 1000),
  roomCredentials: {
    roomId: encryptSecret(data.game === 'BGMI' ? 'AX204861' : 'FF731920'),
    password: encryptSecret(data.game === 'BGMI' ? 'DROPX29' : 'FIREX65'),
    revealAt: new Date(data.startAt.getTime() - 5 * 60 * 1000),
  },
  status: 'published',
});

try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
  await mongoose.connect(process.env.MONGODB_URI);
  await Tournament.findOneAndUpdate({ slug: 'bgmi-erangel-solo' }, { $set: fixture({
    slug: 'bgmi-erangel-solo', game: 'BGMI', title: 'Erangel Night Ops', map: 'Erangel',
    mode: 'solo', perspective: 'TPP', teamSize: 1, startAt: firstStart,
    entryFeeMinor: 4900, currency: 'INR', capacity: 500, reservedSlots: 0,
    prizes: [{ place: '1st place', amountMinor: 600000 }, { place: '2nd place', amountMinor: 350000 }, { place: '3rd place', amountMinor: 250000 }],
  }) }, { upsert: true, new: true, setDefaultsOnInsert: true });
  await Tournament.findOneAndUpdate({ slug: 'freefire-bermuda-solo' }, { $set: fixture({
    slug: 'freefire-bermuda-solo', game: 'FREE FIRE', title: 'Bermuda Blitz', map: 'Bermuda',
    mode: 'solo', perspective: 'TPP', teamSize: 1, startAt: secondStart,
    entryFeeMinor: 2900, currency: 'INR', capacity: 400, reservedSlots: 0,
    prizes: [{ place: '1st place', amountMinor: 400000 }, { place: '2nd place', amountMinor: 250000 }, { place: '3rd place', amountMinor: 150000 }],
  }) }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('Seeded ArenaX-UD BGMI and Free Fire tournaments.');
} finally {
  await mongoose.disconnect();
}