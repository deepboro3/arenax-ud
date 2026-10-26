import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowUpRight, ShieldCheck, Trophy } from 'lucide-react';

export default function AgeGate({ onAccept, onDeny }) {
  const [confirmed, setConfirmed] = useState(false);
  const [denied, setDenied] = useState(false);

  return (
    <div className="age-gate">
      <div className="age-gate-glow" />
      <motion.section className="age-card" initial={{ opacity: 0, y: 22, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45 }}>
        <div className="age-card-topline"><span className="eyebrow"><ShieldCheck size={13} /> PLAYER ACCESS CONTROL</span><span className="age-step">01 / 01</span></div>
        <div className="age-emblem"><span>18</span><small>+</small></div>
        {denied ? (
          <>
            <p className="eyebrow pink-text">ACCESS RESTRICTED</p>
            <h1>See you when<br />you’re <span className="gradient-text">of age.</span></h1>
            <p className="age-copy">ArenaX-UD tournaments are available to players aged 18 and over. You can’t enter the platform yet.</p>
            <button className="button button-quiet full-width" onClick={() => { setDenied(false); setConfirmed(false); }}>I entered the wrong option <ArrowUpRight size={15} /></button>
          </>
        ) : (
          <>
            <p className="eyebrow">BEFORE YOU DROP IN</p>
            <h1>Are you ready<br />to <span className="gradient-text">compete?</span></h1>
            <p className="age-copy">ArenaX-UD is an 18+ tournament platform. Confirm your age to view events, join matches and compete for prizes.</p>
            <label className="age-check"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span className="custom-check"><ShieldCheck size={13} /></span><span>I confirm that I am <strong>18 years of age or older</strong>.</span></label>
            <button className="button button-primary full-width" disabled={!confirmed} onClick={onAccept}>Enter ArenaX-UD <ArrowUpRight size={16} /></button>
            <button className="age-deny" onClick={() => { setDenied(true); onDeny(); }}><AlertTriangle size={13} /> I am under 18</button>
            <div className="age-foot"><Trophy size={13} /> Fair play. Real skill. Respect the arena.</div>
          </>
        )}
      </motion.section>
      <div className="age-wordmark"><img src="/assets/arenax-ud-mark.png" alt="ArenaX-UD" /></div>
    </div>
  );
}
