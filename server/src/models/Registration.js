import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gameId: { type: String, required: true },
  playerName: { type: String, required: true },
}, { _id: false });

const registrationSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true, index: true },
  captain: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  game: { type: String, enum: ['BGMI', 'FREE FIRE'], required: true },
  prizePhone: { type: String, required: true, match: /^[6-9][0-9]{9}$/ },
  roster: { type: [playerSchema], required: true, validate: (value) => value.length > 0 && value.length <= 4 },
  status: { type: String, enum: ['pending_payment', 'payment_submitted', 'confirmed', 'cancelled'], default: 'pending_payment', index: true },
  paymentDeadline: { type: Date, required: true },
  confirmedAt: Date,
}, { timestamps: true });

registrationSchema.index({ tournament: 1, captain: 1 }, { unique: true });
registrationSchema.index({ tournament: 1, status: 1, confirmedAt: -1 });
export default mongoose.model('Registration', registrationSchema);