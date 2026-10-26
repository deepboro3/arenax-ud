import mongoose from 'mongoose';

const prizeSchema = new mongoose.Schema({
  place: { type: String, required: true },
  amountMinor: { type: Number, required: true, min: 0 },
}, { _id: false });

const winnerSchema = new mongoose.Schema({
  place: { type: String, enum: ['1st', '2nd', '3rd'], required: true },
  playerName: { type: String, required: true, trim: true, maxlength: 48 },
  prizeMinor: { type: Number, required: true, min: 0 },
  announcedAt: { type: Date, required: true },
}, { _id: false });

const roomSecretSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  password: { type: String, required: true },
  revealAt: { type: Date, required: true },
}, { _id: false });

const tournamentSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  game: { type: String, enum: ['BGMI', 'FREE FIRE'], required: true, index: true },
  title: { type: String, required: true, trim: true },
  map: { type: String, required: true },
  mode: { type: String, enum: ['solo', 'duo', 'squad'], required: true },
  perspective: { type: String, enum: ['TPP', 'FPP'], required: true },
  teamSize: { type: Number, required: true, min: 1, max: 4 },
  startAt: { type: Date, required: true, index: true },
  registrationClosesAt: { type: Date, required: true },
  entryFeeMinor: { type: Number, required: true, min: 0 },
  currency: { type: String, enum: ['INR'], default: 'INR' },
  capacity: { type: Number, required: true, min: 1 },
  reservedSlots: { type: Number, default: 0, min: 0 },
  prizes: { type: [prizeSchema], default: [] },
  winners: { type: [winnerSchema], default: [] },
  status: { type: String, enum: ['draft', 'published', 'full', 'completed', 'cancelled'], default: 'draft', index: true },
  roomCredentials: { type: roomSecretSchema, select: false },
}, { timestamps: true });

tournamentSchema.index({ status: 1, startAt: 1 });
export default mongoose.model('Tournament', tournamentSchema);