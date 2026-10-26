import mongoose from 'mongoose';

const gameProfileSchema = new mongoose.Schema({
  game: { type: String, enum: ['BGMI', 'FREE FIRE'], required: true },
  gameId: { type: String, required: true },
  displayName: { type: String, required: true },
  verifiedAt: { type: Date, required: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, required: true, unique: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  dateOfBirth: { type: Date, required: true },
  ageVerifiedAt: { type: Date, required: true },
  avatarData: { type: String, select: false, default: '' },
  verifiedAt: { type: Date, default: null },
  role: { type: String, enum: ['player', 'admin'], default: 'player' },
  gameProfiles: { type: [gameProfileSchema], default: [] },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
