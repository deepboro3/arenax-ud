import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, ChevronDown, ImagePlus, LockKeyhole, LogOut, ShieldCheck, UserRound, X } from 'lucide-react';
import { changeDemoPassword } from '../lib/demoCredentials.js';

function Avatar({ user, size = '' }) {
  return <span className={'avatar ' + size}>{user.avatarData
    ? <img src={user.avatarData} alt="" />
    : user.name.slice(0, 1).toUpperCase()}</span>;
}

export function ProfileControl({ user, onEdit, onPassword, onLogout, compact = false }) {
  const [open, setOpen] = useState(false);
  return <div className={'profile-control ' + (compact ? 'profile-control-compact' : '')}>
    <button className={compact ? 'top-user' : 'profile-mini'} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((value) => !value)}>
      <Avatar user={user} />
      {compact ? <><span>{user.name.split(' ')[0]}{(user.verifiedAt || user.verified) && <BadgeCheck size={13} className="verified-icon" aria-label="Admin verified" />}</span><ChevronDown size={14} /></> : <><span className="profile-mini-copy"><strong className="profile-name-line">{user.name}{(user.verifiedAt || user.verified) && <BadgeCheck size={13} className="verified-icon" aria-label="Admin verified" />}</strong><small>PLAYER ACCOUNT</small></span><ChevronDown size={15} /></>}
    </button>
    <AnimatePresence>{open && <>
      <button className="profile-menu-dismiss" aria-label="Close account menu" onClick={() => setOpen(false)} />
      <motion.div className="profile-dropdown" role="menu" initial={{ opacity: 0, y: 8, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5 }}>
        <div className="profile-dropdown-heading"><Avatar user={user} /><span><strong>{user.name}</strong><small>{user.email}</small></span>{(user.verifiedAt || user.verified) && <BadgeCheck size={17} className="verified-icon" aria-label="Admin verified" />}</div>
        <button role="menuitem" onClick={() => { setOpen(false); onEdit(); }}><UserRound size={16} /> Edit profile</button>
        <button role="menuitem" onClick={() => { setOpen(false); onPassword(); }}><LockKeyhole size={16} /> Change password</button>
        <div className="profile-dropdown-divider" />
        <button role="menuitem" className="profile-logout" onClick={() => { setOpen(false); onLogout(); }}><LogOut size={16} /> Log out</button>
      </motion.div>
    </>}</AnimatePresence>
  </div>;
}

function resizeAvatar(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Choose a valid image file.'));
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const context = canvas.getContext('2d');
        const crop = Math.min(image.width, image.height);
        context.drawImage(image, (image.width - crop) / 2, (image.height - crop) / 2, crop, crop, 0, 0, 256, 256);
        resolve(canvas.toDataURL('image/webp', .82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfileModal({ open, mode = 'profile', user, onClose, onSave, onPasswordChanged }) {
  const [tab, setTab] = useState(mode);
  const [avatarData, setAvatarData] = useState(user.avatarData || '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    setTab(mode);
    setAvatarData(user.avatarData || '');
    setError('');
    setSaved(false);
  }, [open, mode, user]);

  const handlePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Choose a valid image file such as JPG, PNG or WebP.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Choose an image smaller than 5 MB.'); return; }
    try { setError(''); setAvatarData(await resizeAvatar(file)); } catch (problem) { setError(problem.message); }
  };

  const saveProfile = (event) => {
    event.preventDefault(); setError('');
    const data = new FormData(event.currentTarget);
    const nextUser = { ...user, name: String(data.get('name')).trim(), phone: String(data.get('phone')).replace(/\D/g, ''), avatarData };
    if (nextUser.name.length < 2) { setError('Enter your full name (at least 2 characters).'); return; }
    if (!/^[6-9]\d{9}$/.test(nextUser.phone)) { setError('Enter a valid 10-digit Indian phone number.'); return; }
    try { onSave(nextUser); setSaved(true); window.setTimeout(() => setSaved(false), 2200); } catch { setError('Could not save your profile. Try a smaller image.'); }
  };

  const updatePassword = async (event) => {
    event.preventDefault(); setError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const current = String(data.get('currentPassword'));
    const next = String(data.get('newPassword'));
    if (next.length < 8) { setError('Your new password must have at least 8 characters.'); return; }
    if (next !== data.get('confirmPassword')) { setError('The new passwords do not match.'); return; }
    setBusy(true);
    try {
      const changed = await changeDemoPassword(user.email, current, next);
      if (!changed) { setError('That current password does not match.'); return; }
      onPasswordChanged?.(); setSaved(true); form.reset(); window.setTimeout(() => setSaved(false), 2200);
    } catch { setError('Password update failed. Please try again.'); }
    finally { setBusy(false); }
  };

  return <AnimatePresence>{open && <motion.div className="modal-backdrop profile-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <motion.section className="profile-modal modal-panel" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title" initial={{ opacity: 0, y: 16, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: .98 }}>
      <button className="icon-button modal-close" aria-label="Close profile" onClick={onClose}><X size={18} /></button>
      <div className="profile-modal-top"><span className="form-icon"><UserRound size={19} /></span><p className="eyebrow">PLAYER ACCOUNT</p><h2 id="profile-modal-title">{tab === 'password' ? 'Update password' : 'Your profile'}</h2><p>Keep your player and prize contact details current.</p></div>
      <div className="profile-modal-tabs"><button className={tab === 'profile' ? 'active' : ''} onClick={() => { setTab('profile'); setError(''); }}>Profile details</button><button className={tab === 'password' ? 'active' : ''} onClick={() => { setTab('password'); setError(''); }}>Password</button></div>
      {tab === 'profile' ? <form className="profile-edit-form" onSubmit={saveProfile}>
        <div className="profile-photo-row"><button type="button" className="profile-photo-button" onClick={() => fileRef.current?.click()}><Avatar user={{ ...user, avatarData }} size="profile-photo-avatar" /><span className="photo-edit-bubble"><ImagePlus size={14} /></span></button><span><strong>Profile image</strong><small>Square image · up to 5 MB</small><button type="button" className="text-button profile-upload-link" onClick={() => fileRef.current?.click()}>Upload photo</button></span><input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} /></div>
        <div className="form-field"><label htmlFor="profile-name">FULL NAME</label><input id="profile-name" name="name" defaultValue={user.name} autoComplete="name" maxLength={80} required /></div>
        <div className="form-field"><label htmlFor="profile-email">EMAIL ADDRESS</label><input id="profile-email" value={user.email} readOnly /><small className="field-hint">Email is linked to sign-in and can’t be changed here.</small></div>
        <div className="form-field"><label htmlFor="profile-phone">PRIZE &amp; PAYMENT CONTACT</label><div className="phone-input"><span>+91</span><input id="profile-phone" name="phone" type="tel" inputMode="numeric" defaultValue={user.phone || ''} placeholder="98765 43210" pattern="[6-9][0-9]{9}" required /></div></div>
        <div className="verified-profile-note">{(user.verifiedAt || user.verified) ? <><BadgeCheck size={16} /> <span><strong>Verified player</strong><small>Your account was verified by an ArenaX-UD admin.</small></span></> : <><ShieldCheck size={16} /> <span><strong>Verification status</strong><small>Only an ArenaX-UD admin can add the verified badge.</small></span></>}</div>
        {error && <div className="form-error">{error}</div>}
        <button className="button button-primary full-width" type="submit">{saved ? 'Profile saved ✓' : 'Save profile'}</button>
      </form> : <form className="profile-edit-form" onSubmit={updatePassword}>
        <div className="password-update-note"><LockKeyhole size={16} /><span>Use at least 8 characters. Your password stays private.</span></div>
        <div className="form-field"><label htmlFor="current-password">CURRENT PASSWORD</label><input id="current-password" name="currentPassword" type="password" autoComplete="current-password" minLength={8} required /></div>
        <div className="form-field"><label htmlFor="new-password">NEW PASSWORD</label><input id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={8} required /></div>
        <div className="form-field"><label htmlFor="confirm-password">CONFIRM NEW PASSWORD</label><input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required /></div>
        {error && <div className="form-error">{error}</div>}
        <button className="button button-primary full-width" disabled={busy}>{busy ? 'Updating…' : saved ? 'Password updated ✓' : 'Update password'}</button>
        <small className="demo-password-note">Demo account: password is stored only in this browser. Production accounts use the secure API.</small>
      </form>}
    </motion.section>
  </motion.div>}</AnimatePresence>;
}
