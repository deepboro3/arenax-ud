import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import Payment from '../models/Payment.js';
import Registration from '../models/Registration.js';
import Tournament from '../models/Tournament.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
const fail = (status, message) => Object.assign(new Error(message), { status });

router.get('/instructions', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ upiId: process.env.UPI_ID || null, currency: 'INR' });
});

router.get('/pending', requireAuth, requireAdmin, asyncHandler(async (_req, res) => {
  const payments = await Payment.find({ status: 'submitted' })
    .populate({ path: 'registration', populate: [{ path: 'captain', select: 'name email' }, { path: 'tournament', select: 'title game startAt entryFeeMinor' }] })
    .sort({ submittedAt: 1 });
  res.json({ payments });
}));

router.post('/:id/review', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const input = z.object({ decision: z.enum(['verify', 'reject']), note: z.string().trim().max(500).optional() }).parse(req.body);
  const session = await mongoose.startSession();
  let response;
  try {
    await session.withTransaction(async () => {
      const payment = await Payment.findOne({ _id: req.params.id, status: 'submitted' }).session(session);
      if (!payment) throw fail(409, 'This payment is missing or has already been reviewed.');
      const registration = await Registration.findOne({ _id: payment.registration, status: 'payment_submitted' }).session(session);
      if (!registration) throw fail(409, 'The registration is no longer awaiting payment review.');

      const reviewedAt = new Date();
      const paymentSet = {
        status: input.decision === 'verify' ? 'verified' : 'rejected',
        reviewNote: input.note,
        reviewedAt,
        reviewedBy: req.user._id,
      };
      if (input.decision === 'verify') paymentSet.verifiedAt = reviewedAt;
      const paymentUpdate = await Payment.updateOne(
        { _id: payment._id, status: 'submitted' },
        { $set: paymentSet },
        { session },
      );
      if (!paymentUpdate.modifiedCount) throw fail(409, 'This payment has already been reviewed.');

      const nextRegistrationStatus = input.decision === 'verify' ? 'confirmed' : 'cancelled';
      const registrationSet = { status: nextRegistrationStatus };
      if (input.decision === 'verify') registrationSet.confirmedAt = reviewedAt;
      const registrationUpdate = await Registration.updateOne(
        { _id: registration._id, status: 'payment_submitted' },
        { $set: registrationSet },
        { session },
      );
      if (!registrationUpdate.modifiedCount) throw fail(409, 'The registration state changed during review.');

      if (input.decision === 'reject') {
        await Tournament.updateOne(
          { _id: registration.tournament, reservedSlots: { $gt: 0 } },
          { $inc: { reservedSlots: -1 } },
          { session },
        );
      }
      response = {
        payment: { id: payment.id, status: paymentSet.status },
        registration: { id: registration.id, status: nextRegistrationStatus },
      };
    });
  } finally {
    await session.endSession();
  }
  res.json(response);
}));

export default router;
