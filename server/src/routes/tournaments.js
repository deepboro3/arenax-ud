import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import Tournament from '../models/Tournament.js';
import Registration from '../models/Registration.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { decryptSecret, encryptSecret } from '../lib/secrets.js';
import { lookupGameIdentity } from '../lib/gameIdentity.js';

const router = Router();
const gameSchema = z.enum(['BGMI', 'FREE FIRE']);
const findTournament = (key, filter = {}) => Tournament.findOne({ ...(mongoose.isValidObjectId(key) ? { _id: key } : { slug: key }), ...filter });
const registrationSchema = z.object({
  gameId: z.string().trim().min(5).max(30),
  playerName: z.string().trim().min(1).max(48),
  prizePhone: z.string().regex(/^[6-9][0-9]{9}$/),
  roster: z.array(z.object({
    gameId: z.string().trim().min(5).max(30),
    playerName: z.string().trim().min(1).max(48),
  })).max(4).optional(),
});

const serializeTournament = (item, registeredCount = 0) => ({
  id: item.id,
  slug: item.slug,
  game: item.game,
  title: item.title,
  map: item.map,
  mode: item.mode,
  perspective: item.perspective,
  teamSize: item.teamSize,
  startAt: item.startAt,
  registrationClosesAt: item.registrationClosesAt,
  entryFeeMinor: item.entryFeeMinor,
  currency: item.currency,
  capacity: item.capacity,
  registeredCount,
  prizes: item.prizes,
  winners: (item.winners || []).map(({ place, playerName, prizeMinor, announcedAt }) => ({ place, playerName, prizeMinor, announcedAt })),
  status: item.status,
});


router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const input = z.object({
    slug: z.string().trim().regex(/^[a-z0-9-]{3,80}$/),
    game: gameSchema,
    title: z.string().trim().min(3).max(100),
    map: z.string().trim().min(2).max(60),
    mode: z.enum(['solo', 'duo', 'squad']),
    perspective: z.enum(['TPP', 'FPP']),
    teamSize: z.number().int().min(1).max(4),
    startAt: z.string().datetime({ offset: true }),
    registrationClosesAt: z.string().datetime({ offset: true }),
    entryFeeMinor: z.number().int().min(0),
    capacity: z.number().int().min(1).max(10000),
    prizes: z.array(z.object({ place: z.string().min(1).max(40), amountMinor: z.number().int().min(0) })).max(10),
    status: z.enum(['draft', 'published']).default('published'),
  }).parse(req.body);
  const startAt = new Date(input.startAt);
  const registrationClosesAt = new Date(input.registrationClosesAt);
  if (startAt <= new Date()) return res.status(400).json({ error: 'Tournament start time must be in the future.' });
  if (registrationClosesAt > new Date(startAt.getTime() - 12 * 60 * 60 * 1000)) {
    return res.status(400).json({ error: 'Registration must close at least 12 hours before the start.' });
  }
  const expectedTeamSize = { solo: 1, duo: 2, squad: 4 }[input.mode];
  if (input.teamSize !== expectedTeamSize) return res.status(400).json({ error: 'Team size must match the selected game mode.' });
  const tournament = await Tournament.create({ ...input, startAt, registrationClosesAt });
  res.status(201).json({ tournament: serializeTournament(tournament) });
}));

router.put('/:id/room-credentials', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const input = z.object({ roomId: z.string().trim().min(4).max(40), password: z.string().trim().min(4).max(40) }).parse(req.body);
  const tournament = await findTournament(req.params.id).select('+roomCredentials');
  if (!tournament) return res.status(404).json({ error: 'Tournament not found.' });
  if (tournament.startAt.getTime() <= Date.now()) return res.status(409).json({ error: 'Room details cannot be changed after the tournament starts.' });
  tournament.roomCredentials = {
    roomId: encryptSecret(input.roomId),
    password: encryptSecret(input.password),
    revealAt: new Date(tournament.startAt.getTime() - 5 * 60 * 1000),
  };
  await tournament.save();
  res.json({ saved: true, revealAt: tournament.roomCredentials.revealAt });
}));


router.put('/:id/winners', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const input = z.object({
    winners: z.array(z.object({
      place: z.enum(['1st', '2nd', '3rd']),
      playerName: z.string().trim().min(1).max(48),
      prizeMinor: z.number().int().min(0),
    })).min(1).max(3),
  }).parse(req.body);
  if (new Set(input.winners.map((winner) => winner.place)).size !== input.winners.length) {
    return res.status(400).json({ error: 'Winner places must be unique.' });
  }
  const tournament = await findTournament(req.params.id);
  if (!tournament) return res.status(404).json({ error: 'Tournament not found.' });
  if (tournament.startAt.getTime() > Date.now()) return res.status(409).json({ error: 'Publish winners after the tournament has started.' });
  tournament.winners = input.winners.map((winner) => ({ ...winner, announcedAt: new Date() }));
  await tournament.save();
  res.json({ tournament: serializeTournament(tournament) });
}));

router.get('/', asyncHandler(async (req, res) => {
  const filter = { status: 'published', startAt: { $gt: new Date() } };
  if (req.query.game) filter.game = gameSchema.parse(req.query.game);
  const items = await Tournament.find(filter).sort({ startAt: 1 });
  const output = await Promise.all(items.map(async (item) => {
    const registeredCount = await Registration.countDocuments({ tournament: item._id, status: 'confirmed' });
    return serializeTournament(item, registeredCount);
  }));
  res.json({ tournaments: output });
}));

router.get('/winners', asyncHandler(async (req, res) => {
  const filter = { 'winners.0': { $exists: true } };
  if (req.query.game) filter.game = gameSchema.parse(req.query.game);
  const events = await Tournament.find(filter).select('slug game title startAt winners').sort({ startAt: -1 }).limit(20);
  const announcements = events.flatMap((event) => event.winners.map((winner) => ({
    tournamentSlug: event.slug,
    tournamentTitle: event.title,
    game: event.game,
    startAt: event.startAt,
    ...winner.toObject(),
  })));
  res.json({ announcements });
}));

router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ captain: req.user._id })
    .populate('tournament', 'slug game title map mode perspective teamSize startAt entryFeeMinor currency prizes status')
    .sort({ createdAt: -1 });
  res.json({ registrations });
}));

router.get('/:id/roster', asyncHandler(async (req, res) => {
  const tournament = await findTournament(req.params.id);
  if (!tournament) return res.status(404).json({ error: 'Tournament not found.' });
  const registrations = await Registration.find({ tournament: tournament._id, status: 'confirmed' })
    .select('roster confirmedAt')
    .sort({ confirmedAt: -1 })
    .limit(100);
  const roster = registrations.flatMap((entry) => entry.roster.map((player) => ({
    playerName: player.playerName,
    gameId: String(player.gameId).replace(/^(.{3}).*(.{3})$/, '$1•••$2'),
    registeredAt: entry.confirmedAt,
  })));
  res.json({ roster });
}));

router.post('/:id/verify-player', requireAuth, asyncHandler(async (req, res) => {
  const tournament = await findTournament(req.params.id);
  if (!tournament || tournament.status !== 'published') return res.status(404).json({ error: 'Tournament not found.' });
  const input = z.object({ gameId: z.string().trim().min(5).max(30) }).parse(req.body);
  const identity = await lookupGameIdentity(tournament.game, input.gameId);
  if (!identity) return res.status(422).json({ error: 'That player ID could not be verified.' });
  res.json({ player: identity, verificationMode: 'mock' });
}));

router.post('/:id/registrations', requireAuth, asyncHandler(async (req, res) => {
  const input = registrationSchema.parse(req.body);
  const now = new Date();
  const tournament = await findTournament(req.params.id);
  if (!tournament || tournament.status !== 'published') return res.status(404).json({ error: 'Tournament not found.' });
  if (tournament.startAt.getTime() - now.getTime() < 12 * 60 * 60 * 1000 || now >= tournament.registrationClosesAt) {
    return res.status(409).json({ error: 'Registration and payment closed 12 hours before the tournament.' });
  }
  if (await Registration.exists({ tournament: tournament._id, captain: req.user._id })) {
    return res.status(409).json({ error: 'You already have a registration for this tournament.' });
  }
  const identity = await lookupGameIdentity(tournament.game, input.gameId);
  if (!identity || identity.playerName !== input.playerName) return res.status(422).json({ error: 'Confirm the verified in-game name before joining.' });

  const rosterInput = input.roster?.length ? input.roster : [{ gameId: identity.gameId, playerName: identity.playerName }];
  if (rosterInput.length !== tournament.teamSize) return res.status(422).json({ error: 'The roster must match the tournament team size.' });
  const verifiedRoster = [];
  for (const member of rosterInput) {
    const verified = await lookupGameIdentity(tournament.game, member.gameId);
    if (!verified || verified.playerName !== member.playerName) return res.status(422).json({ error: 'Every roster member must have a verified game ID and name.' });
    verifiedRoster.push({ gameId: verified.gameId, playerName: verified.playerName, ...(verified.gameId === identity.gameId ? { user: req.user._id } : {}) });
  }
  if (!verifiedRoster.some((member) => member.gameId === identity.gameId)) {
    return res.status(422).json({ error: 'The account holder must be part of the roster.' });
  }

  const session = await mongoose.startSession();
  let registration;
  try {
    await session.withTransaction(async () => {
      const slot = await Tournament.findOneAndUpdate({
        _id: tournament._id,
        status: 'published',
        registrationClosesAt: { $gt: now },
        startAt: { $gt: new Date(now.getTime() + 12 * 60 * 60 * 1000) },
        $expr: { $lt: [{ $ifNull: ['$reservedSlots', 0] }, '$capacity'] },
      }, { $inc: { reservedSlots: 1 } }, { new: true, session });
      if (!slot) {
        const error = new Error('This tournament is full or registration has closed.');
        error.status = 409;
        throw error;
      }
      [registration] = await Registration.create([{
        tournament: tournament._id,
        captain: req.user._id,
        game: tournament.game,
        prizePhone: input.prizePhone,
        roster: verifiedRoster,
        paymentDeadline: tournament.registrationClosesAt,
        status: 'pending_payment',
      }], { session });
    });
  } finally {
    await session.endSession();
  }
  res.status(201).json({ registration });
}));

router.get('/:id/room', requireAuth, asyncHandler(async (req, res) => {
  const tournament = await findTournament(req.params.id).select('+roomCredentials');
  if (!tournament) return res.status(404).json({ error: 'Tournament not found.' });
  const registration = await Registration.exists({ tournament: tournament._id, captain: req.user._id, status: 'confirmed' });
  if (!registration) return res.status(403).json({ error: 'Room details are only available to confirmed players.' });
  const revealAt = tournament.roomCredentials?.revealAt || new Date(tournament.startAt.getTime() - 5 * 60 * 1000);
  if (Date.now() < revealAt.getTime()) return res.status(423).json({ error: 'Room credentials are still locked.', unlockAt: revealAt });
  if (!tournament.roomCredentials) return res.status(404).json({ error: 'Room details have not been published yet.' });
  res.set('Cache-Control', 'no-store');
  res.json({
    roomId: decryptSecret(tournament.roomCredentials.roomId),
    password: decryptSecret(tournament.roomCredentials.password),
    unlockedAt: revealAt,
  });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const item = await findTournament(req.params.id, { status: 'published' });
  if (!item) return res.status(404).json({ error: 'Tournament not found.' });
  const registeredCount = await Registration.countDocuments({ tournament: item._id, status: 'confirmed' });
  res.json({ tournament: serializeTournament(item, registeredCount) });
}));

export default router;