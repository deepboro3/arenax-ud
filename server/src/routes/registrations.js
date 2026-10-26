import { Router } from 'express';
import { z } from 'zod';
import Registration from '../models/Registration.js';
import Payment from '../models/Payment.js';
import Tournament from '../models/Tournament.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/:id/payments', requireAuth, asyncHandler(async (req, res) => {
  const input = z.object({ utr: z.string().trim().min(8).max(40) }).parse(req.body);
  const registration = await Registration.findOne({ _id: req.params.id, captain: req.user._id });
  if (!registration || !['pending_payment', 'payment_submitted'].includes(registration.status)) {
    return res.status(404).json({ error: 'An open registration was not found.' });
  }
  const tournament = await Tournament.findById(registration.tournament);
  if (!tournament || Date.now() >= registration.paymentDeadline.getTime()) {
    return res.status(409).json({ error: 'Payment must be received at least 12 hours before the event.' });
  }
  const payment = await Payment.findOneAndUpdate(
    { registration: registration._id },
    { $set: { utr: input.utr, amountMinor: tournament.entryFeeMinor, currency: tournament.currency, status: 'submitted', submittedAt: new Date() } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
  registration.status = 'payment_submitted';
  await registration.save();
  res.status(202).json({ payment: { id: payment.id, status: payment.status, submittedAt: payment.submittedAt } });
}));

router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ captain: req.user._id })
    .populate('tournament', 'slug game title map mode perspective teamSize startAt entryFeeMinor currency prizes')
    .sort({ createdAt: -1 });
  res.json({ registrations });
}));

export default router;