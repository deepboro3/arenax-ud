import { useState } from 'react';
import { ArrowUpRight, CalendarDays, Clock3, Link2, Users } from 'lucide-react';
import { formatDate, formatINR, formatTime } from '../lib/format';

export default function TournamentCard({ tournament, onRegister, registered = false, compact = false }) {
  const [linkCopied, setLinkCopied] = useState(false);
  const copyTournamentLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('tournament', tournament.id);
    try { await navigator.clipboard.writeText(url.toString()); setLinkCopied(true); window.setTimeout(() => setLinkCopied(false), 1600); } catch { setLinkCopied(false); }
  };
  return (
    <article className={'tournament-card ' + tournament.accent + (compact ? ' compact' : '')}>
      <div className="tournament-art"><div className="art-halo" /><div className="art-crosshair" /><span className="art-game-label">{tournament.game}</span><span className="art-map">{tournament.map}</span><span className="art-coordinate">20°35′N<br />78°57′E</span><span className="art-scanline" /></div>
      <div className="tournament-body">
        <div className="tournament-tags"><span className="event-tag">{tournament.tag}</span><span className="mode-tag">{tournament.mode}</span><button type="button" className="tournament-link-button" onClick={copyTournamentLink} aria-label="Copy tournament link"><Link2 size={12} /> {linkCopied ? 'COPIED' : 'LINK'}</button></div>
        <h3>{tournament.title}</h3><p className="tournament-game-name">{tournament.gameName}</p>
        <div className="tournament-facts"><span><CalendarDays size={13} /> {formatDate(tournament.date)}</span><span><Clock3 size={13} /> {formatTime(tournament.date)} IST</span><span><Users size={13} /> {tournament.slotsFilled}/{tournament.slotsTotal} slots</span></div>
        <div className="tournament-progress"><span style={{ width: Math.min(100, (tournament.slotsFilled / tournament.slotsTotal) * 100) + '%' }} /></div>
        <div className="tournament-footer"><div><small>ENTRY FEE</small><strong>{formatINR(tournament.entryFee)}</strong></div><div className="prize-stat"><small>PRIZE POOL</small><strong>{formatINR(tournament.prizePool)}</strong></div><button className={'button ' + (registered ? 'button-success' : 'button-primary') + ' card-join'} onClick={() => onRegister(tournament)}>{registered ? 'View entry' : 'Join event'} <ArrowUpRight size={15} /></button></div>
      </div>
    </article>
  );
}
