import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  registration: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true, unique: true, index: true },
  amountMinor: { type: Number, required: true, min: 0 },
  currency: { type: String, enum: ['INR'], default: 'INR' },
  provider: { type: String, enum: ['upi_manual'], default: 'upi_manual' },
  utr: { type: String, required: true, unique: true, trim: true, maxlength: 40 },
  status: { type: String, enum: ['submitted', 'verified', 'rejected'], default: 'submitted', index: true },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  reviewNote: { type: String, maxlength: 500 },
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
