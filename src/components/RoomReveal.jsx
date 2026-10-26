import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, KeyRound, LockKeyhole, ShieldAlert, UnlockKeyhole } from 'lucide-react';
import Countdown from './Countdown.jsx';
import { getCountdown } from '../lib/format';

const revealAt = (date) => new Date(new Date(date).getTime() - 5 * 60 * 1000);

export default function RoomReveal({ tournament, registration, user }) {
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState('');
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  const hasEntry = Boolean(registration && registration.status === 'confirmed' && registration.userId === user?.email);
  const opensAt = revealAt(tournament.date);
  const isUnlocked = hasEntry && now >= opensAt.getTime();
  const credentials = registration?.roomCredentials || (isUnlocked ? { id: 'DEMO-AX204861', password: 'DEMO-DROPX29' } : null);

  const copy = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(''), 1600);
    } catch {
      setCopied('unavailable');
    }
  };

  return (
    <article className={'detail-card room-card ' + (isUnlocked ? 'unlocked' : '')}>
      <div className="detail-card-heading"><div><p className="eyebrow"><KeyRound size={13} /> CUSTOM ROOM</p><h2>Drop <span>protocol.</span></h2></div><span className={'room-status ' + (isUnlocked ? 'open' : '')}><span className="status-dot" /> {isUnlocked ? 'ROOM OPEN' : 'LOCKED'}</span></div>
      {!hasEntry ? <div className="room-empty"><div className="room-lock-icon"><LockKeyhole size={21} /></div><h3>Your entry unlocks<br />the drop.</h3><p>Join this tournament and verify your entry to receive room access.</p><span className="room-rule"><ShieldAlert size={13} /> Private to registered players</span></div>
        : isUnlocked && credentials ? <motion.div className="room-credentials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><div className="room-open-banner"><UnlockKeyhole size={16} /> DEMO ROOM IS LIVE · JOIN NOW</div><div className="credential-row"><span>ROOM ID</span><strong>{credentials.id}</strong><button aria-label="Copy room ID" onClick={() => copy('id', credentials.id)}>{copied === 'id' ? <Check size={15} /> : <Copy size={15} />}</button></div><div className="credential-row"><span>PASSWORD</span><strong>{credentials.password}</strong><button aria-label="Copy room password" onClick={() => copy('password', credentials.password)}>{copied === 'password' ? <Check size={15} /> : <Copy size={15} />}</button></div><p className="room-private-note"><ShieldAlert size={13} /> Do not share room credentials. Players may be removed if shared.</p></motion.div>
        : <div className="room-countdown"><div className="room-lock-icon"><LockKeyhole size={21} /></div><p className="room-count-label">CREDENTIALS DEPLOY IN</p><Countdown target={opensAt.toISOString()} /><p className="room-count-note">Room ID &amp; password unlock automatically <strong>5 minutes before</strong> start.</p><div className="room-registration-chip"><span className="live-dot" /> ENTRY VERIFIED <b>·</b> {registration.playerName || user?.name}</div></div>}
    </article>
  );
}
