import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  phone: z.string().regex(/^[6-9][0-9]{9}$/),
  password: z.string().min(8).max(128),
  dateOfBirth: z.string().datetime({ offset: true }),
  ageConfirmed: z.literal(true),
});
const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(8).max(128) });
const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().regex(/^[6-9][0-9]{9}$/).optional(),
  avatarData: z.string().max(200_000).refine((value) => value === '' || new RegExp('^data:image/(webp|png|jpeg);base64,[A-Za-z0-9+/]+=*$').test(value)).nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, 'At least one profile field is required.');
const passwordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128),
});
const verificationSchema = z.object({ verified: z.boolean() });

const ageOn = (birthDate, now = new Date()) => {
  const birth = new Date(birthDate);
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const birthdayPending = now.getUTCMonth() < birth.getUTCMonth()
    || (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate());
  if (birthdayPending) age -= 1;
  return age;
};

const issueToken = (user) => jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '8h' });
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  verifiedAt: user.verifiedAt || null,
});

router.post('/register', asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  if (ageOn(input.dateOfBirth) < 18) return res.status(403).json({ error: 'You must be 18 or older to register.' });
  const email = input.email.toLowerCase();
  const phone = input.phone.replace(/\D/g, '');
  const existing = await User.exists({ $or: [{ email }, { phone }] });
  if (existing) return res.status(409).json({ error: 'An account already uses that email or phone number.' });
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({
    name: input.name, email, phone, passwordHash,
    dateOfBirth: new Date(input.dateOfBirth), ageVerifiedAt: new Date(),
  });
  res.status(201).json({ user: publicUser(user), token: issueToken(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = await User.findOne({ email: input.email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
  res.json({ user: publicUser(user), token: issueToken(user) });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+avatarData');
  res.json({ user: { ...publicUser(user), avatarData: user.avatarData || '' } });
}));

router.patch('/me', requireAuth, asyncHandler(async (req, res) => {
  const input = profileSchema.parse(req.body);
  const user = await User.findById(req.user.id);
  if (input.name !== undefined) user.name = input.name;
  if (input.phone !== undefined) user.phone = input.phone;
  if (input.avatarData !== undefined) user.avatarData = input.avatarData || '';
  await user.save();
  res.json({ user: { ...publicUser(user), avatarData: user.avatarData || '' } });
}));

router.patch('/me/password', requireAuth, asyncHandler(async (req, res) => {
  const input = passwordSchema.parse(req.body);
  if (input.currentPassword === input.newPassword) {
    return res.status(400).json({ error: 'Choose a new password different from your current one.' });
  }
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!await bcrypt.compare(input.currentPassword, user.passwordHash)) {
    return res.status(401).json({ error: 'Your current password is incorrect.' });
  }
  user.passwordHash = await bcrypt.hash(input.newPassword, 12);
  await user.save();
  res.json({ ok: true });
}));

router.patch('/users/:id/verification', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const input = verificationSchema.parse(req.body);
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Player account not found.' });
  user.verifiedAt = input.verified ? new Date() : null;
  await user.save();
  res.json({ user: publicUser(user) });
}));

export default router;
