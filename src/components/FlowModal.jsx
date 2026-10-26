import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, CheckCircle2, Clock3, Copy, Gamepad2, LockKeyhole, ShieldCheck, Sparkles, X } from 'lucide-react';
import { demoNameForId } from '../data/demo';
import { formatDate, formatINR, formatTime } from '../lib/format';

function DemoQR() {
  const [failed, setFailed] = useState(false);
  const qrUrl = import.meta.env.VITE_PAYMENT_QR_URL;
  if (!qrUrl || failed) return <div className="qr-empty" role="status"><LockKeyhole size={19} /><strong>QR not configured</strong><small>Admin: add public/payment-qr.png</small></div>;
  return <img className="qr-live" src={qrUrl} alt="ArenaX-UD tournament payment QR" onError={() => setFailed(true)} />;
}

export default function FlowModal({ open, tournament, game, user, onClose, onComplete }) {
  const [step, setStep] = useState('verify');
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [utr, setUtr] = useState('');
  const [copied, setCopied] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [prizePhone, setPrizePhone] = useState(user?.phone || '');
  const upiId = import.meta.env.VITE_UPI_ID || '';

  const resetAndClose = () => {
    setStep('verify'); setGameId(''); setPlayerName(''); setError(''); setUtr(''); setPaymentDone(false); setPrizePhone(user?.phone || ''); onClose();
  };

  const verifyId = async (event) => {
    event.preventDefault();
    setError('');
    if (gameId.trim().length < 5) { setError('Enter a valid in-game ID with at least 5 characters.'); return; }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 850));
    setPlayerName(demoNameForId(game, gameId.trim()));
    setStep('confirm');
    setLoading(false);
  };

  const finishPayment = () => {
    if (!/^[6-9][0-9]{9}$/.test(prizePhone.trim())) { setError('Enter a valid 10-digit Indian phone number for prize and payment contact.'); return; }
    if (!utr.trim()) { setError('Enter the UPI transaction reference to continue.'); return; }
    setLoading(true);
    setError('');
    window.setTimeout(() => {
      setPaymentDone(true);
      setLoading(false);
    }, 700);
  };

  const completed = () => {
    onComplete({
      tournamentId: tournament.id,
      game,
      gameId: gameId.trim(),
      playerName,
      status: 'confirmed',
      paymentStatus: 'verified',
      userId: user.email,
      prizePhone: prizePhone.trim(),
      paidAt: new Date().toISOString(),
      roomCredentials: null,
    });
    setStep('success');
  };

  return <AnimatePresence>{open && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && resetAndClose()}>
    <motion.section className="flow-modal modal-panel" initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.22 }}>
      <div className="flow-modal-header"><div><p className="eyebrow"><span className="live-dot" /> {step === 'success' ? 'ENTRY CONFIRMED' : 'TOURNAMENT REGISTRATION'}</p><h2>{step === 'verify' ? 'Verify your player ID.' : step === 'confirm' ? 'Is this your name?' : step === 'payment' ? 'Lock your slot.' : 'You’re in the arena.'}</h2></div><button className="icon-button" aria-label="Close" onClick={resetAndClose}><X size={18} /></button></div>
      {step !== 'success' && <div className="flow-steps"><span className="active"><i>01</i> PLAYER ID</span><b /><span className={['confirm', 'payment'].includes(step) ? 'active' : ''}><i>02</i> CONFIRM</span><b /><span className={step === 'payment' ? 'active' : ''}><i>03</i> PAYMENT</span></div>}
      {step === 'verify' && <form className="flow-content" onSubmit={verifyId}><div className="selected-event-strip"><span className={'mini-game-icon ' + (game === 'BGMI' ? 'cyan-bg' : 'pink-bg')}><Gamepad2 size={17} /></span><div><strong>{tournament.title}</strong><small>{game} · {tournament.mode} · {formatDate(tournament.date)} at {formatTime(tournament.date)} IST</small></div><b>{formatINR(tournament.entryFee)}</b></div><div className="form-field id-field"><label htmlFor="game-id">{game} PLAYER ID</label><div className="id-input-wrap"><span>UID</span><input id="game-id" autoFocus inputMode="numeric" value={gameId} onChange={(event) => setGameId(event.target.value)} placeholder="Enter your in-game ID" required minLength={5} /><ShieldCheck size={17} /></div><small className="field-hint">Find your UID in your in-game profile. We’ll look up the matching player name.</small></div>{error && <div className="form-error">{error}</div>}<button className="button button-primary full-width" disabled={loading}>{loading ? <><span className="spinner" /> Checking game profile…</> : <>Verify player ID <ArrowUpRight size={16} /></>}</button><div className="mock-note"><Sparkles size={13} /> Demo lookup — game server connection will be configured for launch.</div></form>}
      {step === 'confirm' && <div className="flow-content"><div className="player-identity"><div className="identity-glow"><Gamepad2 size={22} /></div><span className="eyebrow">MATCH FOUND · {game} PLAYER</span><h3>{playerName}</h3><p>UID {gameId.replace(/.(?=.{3})/g, '•')}</p><span className="identity-verified"><CheckCircle2 size={14} /> ID lookup complete</span></div><div className="confirm-question"><strong>Does this match your in-game name?</strong><span>Confirm to continue to payment, or retry with another ID.</span></div>{error && <div className="form-error">{error}</div>}<div className="confirm-actions"><button className="button button-secondary" onClick={() => { setStep('verify'); setError(''); setPlayerName(''); }}>Cancel / retry</button><button className="button button-primary" onClick={() => setStep('payment')}>Confirm name <Check size={16} /></button></div></div>}
      {step === 'payment' && <div className="flow-content payment-content"><div className="payment-summary"><div><span>ENTRY FEE · {tournament.game}</span><strong>{formatINR(tournament.entryFee)}</strong></div><span className="payment-secure"><ShieldCheck size={14} /> SECURE CHECKOUT</span></div><div className="payment-layout"><div className="qr-frame"><DemoQR /><span>SCAN WITH ANY UPI APP</span></div><div className="payment-details"><p>Pay to <strong>{upiId || 'UPI ID not configured'}</strong>{upiId && <button className="text-icon-button" onClick={async () => { try { await navigator.clipboard.writeText(upiId); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); } }}>{copied ? <Check size={14} /> : <Copy size={14} />}</button>}</p><div className="payment-instructions"><span>01 <small>Scan the QR or use the UPI ID</small></span><span>02 <small>Pay exactly {formatINR(tournament.entryFee)}</small></span><span>03 <small>Enter your UPI reference below</small></span></div></div></div><div className="payment-deadline"><Clock3 size={15} /><span><strong>12-hour payment deadline</strong><small>Entry fee must be paid at least 12 hours before the tournament starts.</small></span></div><div className="form-field contact-field"><label htmlFor="prize-phone">PRIZE MONEY / PAYMENT CONTACT · +91</label><div className="phone-input"><span>+91</span><input id="prize-phone" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} value={prizePhone} onChange={(event) => setPrizePhone(event.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98765 43210" required /></div><small className="field-hint">Used privately for prize payout or payment follow-up. Not shown in the public roster.</small></div><div className="form-field utr-field"><label htmlFor="utr">UPI TRANSACTION REFERENCE</label><input id="utr" value={utr} onChange={(event) => setUtr(event.target.value)} placeholder="e.g. 423816750291" maxLength={24} required /></div>{error && <div className="form-error">{error}</div>}{paymentDone ? <div className="payment-submitted"><CheckCircle2 size={17} /><span><strong>Payment submitted for verification</strong><small>In production, your entry is added to the live roster after admin verification.</small></span></div> : <button className="button button-primary full-width" disabled={loading} onClick={finishPayment}>{loading ? <><span className="spinner" /> Submitting payment…</> : <>I’ve paid · submit for verification <ArrowUpRight size={16} /></>}</button>}{paymentDone && <button className="button button-success full-width" onClick={completed}>Complete demo verification <Check size={15} /></button>}<div className="mock-note"><LockKeyhole size={13} /> Demo only — no money is collected. A real payment provider is required before launch.</div></div>}
      {step === 'success' && <div className="flow-content success-content"><motion.div className="success-emblem" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Check size={34} /></motion.div><span className="eyebrow"><Sparkles size={13} /> DROP CONFIRMED</span><h3>You’re on the<br /><span className="gradient-text">roster, {playerName}.</span></h3><p>Your demo entry is confirmed. Your room credentials will unlock on your dashboard five minutes before start.</p><div className="success-event-row"><div><small>NEXT MATCH</small><strong>{tournament.title}</strong><span>{formatDate(tournament.date)} · {formatTime(tournament.date)} IST</span></div><span className="confirmed-badge"><CheckCircle2 size={13} /> CONFIRMED</span></div><button className="button button-primary full-width" onClick={resetAndClose}>View my entry <ArrowUpRight size={16} /></button><small className="success-demo-label">Demo payment verification completed for preview only.</small></div>}
    </motion.section>
  </motion.div>}</AnimatePresence>;
}
