import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownRight, ArrowUpRight, Bell, ChevronDown, CircleHelp, Compass, Crown,
  Gamepad2, Home, Menu, Search, ShieldCheck, Swords, Trophy, UserRound, Wallet, X,
} from 'lucide-react';
import AgeGate from './components/AgeGate.jsx';
import AuthModal from './components/AuthModal.jsx';
import ProfileModal, { ProfileControl as AccountMenu } from './components/ProfileControl.jsx';
import Countdown from './components/Countdown.jsx';
import FlowModal from './components/FlowModal.jsx';
import GamePicker from './components/GamePicker.jsx';
import WinnersCorner from './components/WinnersCorner.jsx';
import TournamentCard from './components/TournamentCard.jsx';
import TournamentInfo from './components/TournamentInfo.jsx';
import { seedPlayers, tournaments } from './data/demo.js';
import { formatINR } from './lib/format.js';

const navItems = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'entries', label: 'My entries', icon: Swords },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
];

function loadSession() {
  try { return JSON.parse(localStorage.getItem('arenax.session.demo') || 'null'); } catch { return null; }
}
function loadRegistrations() {
  try { return JSON.parse(localStorage.getItem('arenax.registrations.demo') || '[]'); } catch { return []; }
}

function Brand() {
  return <div className="brand-lockup"><img className="brand-logo" src="/assets/arenax-ud-mark.png" alt="ArenaX-UD" /></div>;
}

function Sidebar({ active, onNavigate, user, onAuth, onEditProfile, onChangePassword, onLogout, onMobileClose }) {
  return <aside className="sidebar">
    <div className="sidebar-brand"><Brand /><button className="mobile-close icon-button" onClick={onMobileClose}><X size={18} /></button></div>
    <div className="sidebar-live"><span className="live-dot" /><span>ARENA IS LIVE</span><b>03</b></div>
    <nav className="side-nav" aria-label="Main navigation">
      <span className="nav-group-label">PLAYER HUB</span>
      {navItems.map((item) => {
        const Icon = item.icon;
        return <button key={item.id} className={'nav-item ' + (active === item.id ? 'active' : '')} onClick={() => { onNavigate(item.id); onMobileClose(); }}><Icon size={17} /><span>{item.label}</span>{item.id === 'entries' && user?.hasEntry && <i className="nav-pill">1</i>}</button>;
      })}
    </nav>
    <div className="sidebar-feature">
      <div className="feature-icon"><Crown size={16} /></div><span className="eyebrow">ARENA PASS</span><strong>Play more.<br /><em>Rise faster.</em></strong><small>Unlock member-only drops and bonus rewards.</small><button onClick={onAuth}>Explore pass <ArrowUpRight size={13} /></button>
    </div>
    <div className="sidebar-bottom"><div className="support-link"><CircleHelp size={15} /><span>Help &amp; support</span><ArrowUpRight size={13} /></div>
      {user ? <AccountMenu user={user} onEdit={onEditProfile} onPassword={onChangePassword} onLogout={onLogout} /> : <button className="profile-mini guest-profile" onClick={onAuth}><div className="avatar guest-avatar"><UserRound size={16} /></div><span><strong>Guest player</strong><small>SIGN IN TO COMPETE</small></span><ArrowUpRight size={15} /></button>}
    </div>
  </aside>;
}

function Topbar({ user, onAuth, onEditProfile, onChangePassword, onLogout, onMobileMenu, activeLabel }) {
  return <header className="topbar"><button className="mobile-menu icon-button" aria-label="Open menu" onClick={onMobileMenu}><Menu size={19} /></button><div className="breadcrumb"><span>ArenaX-UD</span><i>/</i><strong>{activeLabel}</strong></div><div className="topbar-actions"><div className="search-box"><Search size={15} /><input placeholder="Search tournaments..." aria-label="Search tournaments" /><kbd>⌘ K</kbd></div><button className="icon-button notification-button" aria-label="Notifications"><Bell size={17} /><i /></button>{user ? <AccountMenu user={user} compact onEdit={onEditProfile} onPassword={onChangePassword} onLogout={onLogout} /> : <button className="button button-outline top-signin" onClick={onAuth}>Sign in <ArrowUpRight size={14} /></button>}</div></header>;
}

function LandingHero({ user, onJoin, onDiscover, firstTournament }) {
  return <section className="landing-hero">
    <div className="hero-bg-grid" /><div className="hero-corner corner-a" /><div className="hero-corner corner-b" /><div className="hero-radial" />
    <div className="hero-copy"><div className="hero-overline"><span className="live-dot" /> INDIA’S NEXT-GEN ESPORTS ARENA <span className="overline-line" /></div>
      <h1>{user ? <>WELCOME BACK,<br /><span className="hero-player">{user.name.split(' ')[0]}.</span></> : <>THE NEXT DROP<br />IS <span className="hero-outline">YOURS.</span></>}</h1>
      <p className="hero-description">Your aim. Your squad. Your moment. Enter the arena and make every match count.</p>
      <div className="hero-cta-row"><button className="button button-primary hero-cta" onClick={onJoin}>{user ? 'Find your next match' : 'Join the arena'} <ArrowUpRight size={16} /></button><button className="button button-text" onClick={onDiscover}>Explore tournaments <ArrowDownRight size={15} /></button></div>
      <div className="hero-trust"><div className="trust-avatars"><span>R</span><span>K</span><span>N</span><span>+4K</span></div><span><strong>4,200+</strong> players dropped in this week</span></div>
    </div>
    <div className="hero-art" aria-hidden="true"><div className="hero-radar radar-outer" /><div className="hero-radar radar-inner" /><div className="hero-slash slash-one" /><div className="hero-slash slash-two" /><div className="hero-orb"><div className="orb-core" /><div className="orb-ring" /></div><div className="hero-art-coordinate">19°04′ N<br />72°52′ E</div><div className="hero-art-vertical">READY PLAYER ONE</div><div className="hero-event-float"><div className="float-top"><span className="live-dot" /> FEATURED DROP</div><strong>{firstTournament.title}</strong><div className="float-meta"><span>{firstTournament.game}</span><span>·</span><span>{firstTournament.mode}</span></div><div className="float-bottom"><span>₹{firstTournament.prizePool.toLocaleString('en-IN')} PRIZE POOL</span><Countdown target={firstTournament.date} compact /></div></div><div className="hero-index">01 <span>/</span> 02</div></div>
    <div className="hero-bottom-line"><span>BGMI <i /> FREE FIRE</span><span>BUILT FOR THE BOLD <b>✳</b></span></div>
  </section>;
}

function SectionTitle({ eyebrow, title, accent, right }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title} <span>{accent}</span></h2></div>{right}</div>;
}

function EventStats({ registeredCount }) {
  return <div className="stat-strip"><div className="stat-item"><span>LIVE TOURNAMENTS</span><strong>03 <i>open</i></strong><small><span className="live-dot" /> Open for registration</small></div><div className="stat-item"><span>PLAYERS IN ARENA</span><strong>4,284 <i>+</i></strong><small><span className="stat-trend">↗ 18%</span> vs. last week</small></div><div className="stat-item"><span>PRIZES DISTRIBUTED</span><strong>₹2.4L</strong><small>Across 126 matches</small></div><div className="stat-item"><span>YOUR ENTRIES</span><strong>{String(registeredCount).padStart(2, '0')} <i>active</i></strong><small>Verified tournament slots</small></div></div>;
}

function LiveRoster({ tournament, players }) {
  return <article className="roster-card"><div className="roster-heading"><div><p className="eyebrow"><span className="live-dot" /> LIVE ROSTER</p><h3>Latest <span>drop-ins.</span></h3></div><button className="text-button">Full roster <ArrowUpRight size={14} /></button></div><div className="roster-event">{tournament.game} <i>·</i> {tournament.title}</div><div className="roster-list">{players.slice(0, 5).map((player, index) => <div className="roster-player" key={player.name}><span className={'roster-rank rank-' + index}>{String(index + 1).padStart(2, '0')}</span><span className={'roster-avatar roster-avatar-' + index}>{player.initials}</span><strong>{player.name}</strong><small>{player.id}</small><span className="roster-time">{player.time}</span></div>)}</div><div className="roster-footer"><span><span className="live-dot" /> {players.length + 308} VERIFIED PLAYERS</span><span>Payments verified before roster entry</span></div></article>;
}

function Leaderboard({ tournament, players }) {
  const names = [
    { name: 'NØVA•OP', points: '284 pts', wins: '12 W', change: '+2' },
    { name: 'RAVEN.exe', points: '271 pts', wins: '10 W', change: '—' },
    { name: 'KRYPTICツ', points: '258 pts', wins: '09 W', change: '+5' },
    { name: 'VOIDWALKER', points: '244 pts', wins: '08 W', change: '-1' },
  ];
  return <section className="leaderboard-card"><div className="roster-heading"><div><p className="eyebrow"><Trophy size={13} /> SEASON 06 · WEEK 04</p><h3>Elite <span>rankings.</span></h3></div><span className="mode-tag">{tournament.game} · ALL-TIME</span></div><div className="leaderboard-table"><div className="leaderboard-th"><span>RANK</span><span>PLAYER</span><span>POINTS</span><span>WINS</span><span>CHANGE</span></div>{names.map((player, index) => <div className="leaderboard-row" key={player.name}><span className={'leader-rank rank-' + index}>{String(index + 1).padStart(2, '0')}</span><div className="leader-player"><span className="roster-avatar">{player.name.slice(0, 1)}</span><strong>{player.name}</strong></div><strong>{player.points}</strong><span>{player.wins}</span><span className="leader-change">{player.change}</span></div>)}</div><p className="leaderboard-note"><ShieldCheck size={13} /> Ranked from verified tournament results. Updates after every match.</p></section>;
}

function EntriesView({ registrations, user, onDiscover }) {
  if (!registrations.length) return <div className="empty-state"><div className="empty-icon"><Swords size={24} /></div><p className="eyebrow">NO ACTIVE ENTRIES</p><h2>Your next match<br />starts here.</h2><p>Pick a game, find your tournament and lock in your spot.</p><button className="button button-primary" onClick={onDiscover}>Discover tournaments <ArrowUpRight size={15} /></button></div>;
  const entries = registrations.map((entry) => ({ entry, tournament: tournaments.find((item) => item.id === entry.tournamentId) })).filter((item) => item.tournament);
  return <div className="entries-view"><SectionTitle eyebrow="PLAYER HUB / YOUR LINEUP" title="My active" accent="entries." right={<span className="verified-chip"><ShieldCheck size={13} /> {entries.length} VERIFIED</span>} />{entries.map(({ entry, tournament }) => <div className="entry-wrapper" key={entry.tournamentId}><div className="entry-status-banner"><span className="status-dot" /><strong>ENTRY CONFIRMED</strong><span>Payment verified · {entry.playerName}</span></div><TournamentInfo tournament={tournament} registration={entry} user={user} /></div>)}</div>;
}

export default function App() {
  const [ageStatus, setAgeStatus] = useState(() => localStorage.getItem('arenax.ageGate.v1') === 'accepted' ? 'accepted' : 'pending');
  const [user, setUser] = useState(loadSession);
  const [registrations, setRegistrations] = useState(loadRegistrations);
  const [selectedGame, setSelectedGame] = useState(() => { const requested = new URLSearchParams(window.location.search).get('tournament'); return tournaments.find((item) => item.id === requested)?.game || ''; });
  const [activeNav, setActiveNav] = useState('overview');
  const [authOpen, setAuthOpen] = useState(false);
  const [profileMode, setProfileMode] = useState('');
  const [flowTournament, setFlowTournament] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState('');
  const firstTournament = tournaments[0];
  const activeTournament = tournaments.find((item) => item.game === selectedGame) || null;
  const activeRegistration = registrations.find((entry) => entry.tournamentId === activeTournament?.id && entry.userId === user?.email);
  const verifiedPlayers = useMemo(() => {
    const seeded = [...(seedPlayers[activeTournament?.id] || [])];
    const entry = activeTournament && registrations.find((item) => item.tournamentId === activeTournament.id);
    if (entry && !seeded.some((player) => player.name === entry.playerName)) seeded.unshift({ name: entry.playerName, initials: entry.playerName.slice(0, 1), id: entry.gameId.slice(0, 4) + '•••' + entry.gameId.slice(-3), time: 'just now' });
    return seeded;
  }, [activeTournament, registrations]);
  const activeLabel = navItems.find((item) => item.id === activeNav)?.label || 'Overview';

  const acceptAge = () => {
    localStorage.setItem('arenax.ageGate.v1', 'accepted');
    setAgeStatus('accepted');
  };
  const login = (nextUser) => {
    localStorage.setItem('arenax.session.demo', JSON.stringify(nextUser));
    const profiles = JSON.parse(localStorage.getItem('arenax.profiles.demo') || '{}');
    profiles[nextUser.email.toLowerCase()] = nextUser;
    localStorage.setItem('arenax.profiles.demo', JSON.stringify(profiles));
    setUser(nextUser);
    setAuthOpen(false);
    setActiveNav('overview');
  };
  const logout = () => {
    localStorage.removeItem('arenax.session.demo');
    setUser(null);
    setSelectedGame('');
    setActiveNav('overview');
  };
  const saveProfile = (nextUser) => {
    localStorage.setItem('arenax.session.demo', JSON.stringify(nextUser));
    const profiles = JSON.parse(localStorage.getItem('arenax.profiles.demo') || '{}');
    profiles[nextUser.email.toLowerCase()] = nextUser;
    localStorage.setItem('arenax.profiles.demo', JSON.stringify(profiles));
    setUser(nextUser);
  };
  const openRegister = (tournament) => {
    if (!user) { setAuthOpen(true); return; }
    if (!selectedGame) {
      setSelectedGame(tournament.game);
      setToast('Game selected. Confirm your player ID to join.');
      window.setTimeout(() => setToast(''), 3200);
    }
    const already = registrations.some((entry) => entry.tournamentId === tournament.id && entry.userId === user.email);
    if (already) { setActiveNav('entries'); return; }
    setFlowTournament(tournament);
  };
  const finishRegistration = (registration) => {
    const next = [registration, ...registrations.filter((entry) => entry.tournamentId !== registration.tournamentId)];
    setRegistrations(next);
    localStorage.setItem('arenax.registrations.demo', JSON.stringify(next));
    setToast('Entry verified. You’re on the live roster.');
    window.setTimeout(() => setToast(''), 3800);
    setActiveNav('entries');
  };
  const chooseGame = (game) => {
    setSelectedGame(game);
    setActiveNav('overview');
  };
  const goDiscover = () => {
    setActiveNav('discover');
    window.setTimeout(() => document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };
  const promptJoin = () => {
    if (!user) setAuthOpen(true);
    else if (!selectedGame) document.getElementById('game-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else setActiveNav('discover');
  };

  if (ageStatus !== 'accepted') return <AgeGate onAccept={acceptAge} onDeny={() => {}} />;

  const visibleTournaments = selectedGame ? tournaments.filter((item) => item.game === selectedGame) : tournaments;
  const showCards = activeNav === 'discover' || (activeNav === 'overview' && Boolean(selectedGame));

  return <div className={"app-shell " + (mobileNavOpen ? "mobile-nav-open" : "")}>
    <Sidebar active={activeNav} onNavigate={setActiveNav} user={user ? { ...user, hasEntry: registrations.some((entry) => entry.userId === user.email) } : null} onAuth={() => setAuthOpen(true)} onEditProfile={() => setProfileMode('profile')} onChangePassword={() => setProfileMode('password')} onLogout={logout} onMobileClose={() => setMobileNavOpen(false)} />
    {mobileNavOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
    <div className="app-main"><Topbar user={user} onAuth={() => setAuthOpen(true)} onEditProfile={() => setProfileMode('profile')} onChangePassword={() => setProfileMode('password')} onLogout={logout} onMobileMenu={() => setMobileNavOpen(true)} activeLabel={activeLabel} />
      <main id="main-content" className="content-scroll">
        {activeNav === 'entries' ? <EntriesView registrations={registrations.filter((entry) => entry.userId === user?.email)} user={user} onDiscover={goDiscover} /> : activeNav === 'leaderboard' ? <div className="content-inner"><Leaderboard tournament={activeTournament || firstTournament} players={verifiedPlayers} /></div> : <>
          {(activeNav === 'overview' || activeNav === 'discover') && <div className="content-inner">
            {activeNav === 'overview' && <LandingHero user={user} onJoin={promptJoin} onDiscover={goDiscover} firstTournament={firstTournament} />}
            {activeNav === 'overview' && <EventStats registeredCount={registrations.filter((entry) => entry.userId === user?.email).length} />}
            <div id="game-selector"><GamePicker selected={selectedGame} onSelect={chooseGame} /></div>
            <WinnersCorner game={selectedGame} />
            {showCards && <section className="tournaments-section"><SectionTitle eyebrow={selectedGame ? 'LIVE NOW / ' + selectedGame : 'LIVE NOW / ALL GAMES'} title="Choose your" accent="next drop." right={<button className="text-button" onClick={() => setActiveNav('discover')}>View all events <ArrowUpRight size={14} /></button>} /><div className="tournament-grid">{visibleTournaments.map((tournament) => <TournamentCard key={tournament.id} tournament={tournament} onRegister={openRegister} registered={registrations.some((entry) => entry.tournamentId === tournament.id && entry.userId === user?.email)} />)}</div></section>}
            {!showCards && <div className="choose-game-nudge"><div className="nudge-cross"><Gamepad2 size={18} /></div><span><strong>Choose your game to reveal the live drops.</strong><small>Every tournament has verified rosters, transparent prizes and a fair-play policy.</small></span><ArrowUpRight size={17} /></div>}
            {selectedGame && activeTournament && <div className="roster-section"><LiveRoster tournament={activeTournament} players={verifiedPlayers} /><div className="side-tip-card"><p className="eyebrow"><ShieldCheck size={13} /> PLAYER CHECKLIST</p><h3>Ready when<br /><span>you are.</span></h3><div className="checklist-line"><span>01</span> Verify your game ID</div><div className="checklist-line"><span>02</span> Confirm your player name</div><div className="checklist-line"><span>03</span> Pay before the deadline</div><button onClick={() => openRegister(activeTournament)}>Register now <ArrowUpRight size={14} /></button></div></div>}
            {activeNav === 'discover' && <Leaderboard tournament={activeTournament || firstTournament} players={verifiedPlayers} />}
          </div>}
        </>}
      </main>
      <footer className="app-footer"><span>© 2026 ARENAX-UD ESPORTS</span><span><i /> FAIR PLAY · VERIFIED ENTRY · 18+ ONLY</span><span>BUILT FOR INDIA <b>✳</b></span></footer>
    </div>
    <AnimatePresence>{toast && <motion.div className="toast-message" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><ShieldCheck size={16} /> {toast}</motion.div>}</AnimatePresence>
    <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={login} />
    {user && <ProfileModal open={Boolean(profileMode)} mode={profileMode || 'profile'} user={user} onClose={() => setProfileMode('')} onSave={saveProfile} />}
    {flowTournament && <FlowModal open tournament={flowTournament} game={flowTournament.game} user={user} onClose={() => setFlowTournament(null)} onComplete={finishRegistration} />}
  </div>;
}
