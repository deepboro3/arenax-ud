import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, Gamepad2, ShieldCheck, X } from 'lucide-react';
import { getAge } from '../lib/format';
import { verifyOrCreateDemoPassword } from '../lib/demoCredentials.js';

export default function AuthModal({ open, onClose, onSuccess }) {
  const [mode, setMode] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const data = new FormData(event.currentTarget);
    if (mode === 'signup') {
      if (getAge(data.get('birthDate')) < 18) {
        setError('You must be at least 18 years old to create an account.');
        return;
      }
      if (!data.get('ageConfirm')) {
        setError('Confirm that you are 18 or older to continue.');
        return;
      }
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 550));
    const email = data.get('email').trim().toLowerCase();
    let savedProfile = {};
    try { savedProfile = JSON.parse(localStorage.getItem('arenax.profiles.demo') || '{}')[email] || {}; } catch { savedProfile = {}; }
    const user = {
      name: mode === 'signup' ? data.get('name').trim() : savedProfile.name || (email.split('@')[0] || 'Player').replace(/[._-]/g, ' '),
      email,
      phone: mode === 'signup' ? data.get('phone').replace(/\D/g, '') : savedProfile.phone || '',
      avatarData: mode === 'signup' ? '' : savedProfile.avatarData || '',
      verifiedAt: savedProfile.verifiedAt || null,
    };
    const passwordAccepted = await verifyOrCreateDemoPassword(user.email, String(data.get('password')));
    if (!passwordAccepted) {
      setError('That email and password do not match.');
      setLoading(false);
      return;
    }
    onSuccess(user);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {open && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
        <motion.section className="auth-modal modal-panel" initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.22 }}>
          <button className="icon-button modal-close" aria-label="Close" onClick={onClose}><X size={18} /></button>
          <div className="auth-side-art"><div className="auth-art-orbit orbit-one" /><div className="auth-art-orbit orbit-two" /><div className="auth-art-cross">X</div><div className="auth-art-copy"><span className="eyebrow">YOUR NEXT DROP STARTS HERE</span><h2>Play sharp.<br /><span className="gradient-text">Rise higher.</span></h2><p>One account. Every arena.</p></div><div className="auth-art-badge"><Gamepad2 size={15} /> BGMI + FREE FIRE</div></div>
          <div className="auth-form-side">
            <button className="back-link" onClick={onClose}><ArrowLeft size={15} /> Back to arena</button>
            <div className="auth-heading"><div className="form-icon"><Gamepad2 size={19} /></div><p className="eyebrow">PLAYER ID</p><h2>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2><p>{mode === 'signin' ? 'Your next match is waiting.' : 'Join the arena. Make every drop count.'}</p></div>
            <div className="auth-tabs"><button className={mode === 'signin' ? 'active' : ''} onClick={() => { setMode('signin'); setError(''); }}>Sign in</button><button className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(''); }}>Create account</button></div>
            <form onSubmit={handleSubmit} className="auth-form">
              {mode === 'signup' && <div className="form-field"><label htmlFor="signup-name">PLAYER NAME</label><input id="signup-name" name="name" placeholder="Your full name" autoComplete="name" required minLength={2} /></div>}
              <div className="form-field"><label htmlFor="auth-email">EMAIL ADDRESS</label><input id="auth-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></div>
              {mode === 'signup' && <>
                <div className="form-field"><label htmlFor="signup-phone">PHONE NUMBER</label><div className="phone-input"><span>+91</span><input id="signup-phone" name="phone" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" placeholder="98765 43210" autoComplete="tel-national" required /></div></div>
                <div className="form-field"><label htmlFor="signup-dob">DATE OF BIRTH</label><input id="signup-dob" name="birthDate" type="date" max={new Date().toISOString().slice(0, 10)} required /></div>
              </>}
              <div className="form-field"><label htmlFor="auth-password">PASSWORD</label><div className="password-input"><input id="auth-password" name="password" type={showPassword ? 'text' : 'password'} placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
              {mode === 'signup' && <label className="terms-check"><input type="checkbox" name="ageConfirm" required /><span>I confirm I’m 18+ and agree to the <a href="#terms" onClick={(event) => event.preventDefault()}>terms of play</a>.</span></label>}
              {error && <div className="form-error">{error}</div>}
              <button className="button button-primary full-width auth-submit" disabled={loading}>{loading ? <span className="spinner" /> : mode === 'signin' ? 'Sign in to ArenaX-UD' : 'Create player account'} {!loading && <ArrowUpRight size={16} />}</button>
            </form>
            <div className="secure-note"><ShieldCheck size={13} /> Your account is protected with secure sign-in.</div>
          </div>
        </motion.section>
      </motion.div>}
    </AnimatePresence>
  );
}
