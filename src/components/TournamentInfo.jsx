import { CalendarDays, Clock3, Crosshair, Map, ShieldCheck, Trophy, Users } from 'lucide-react';
import { formatDate, formatINR, formatTime } from '../lib/format';
import RoomReveal from './RoomReveal.jsx';

export default function TournamentInfo({ tournament, registration, user }) {
  if (!tournament) return null;
  return (
    <section className="detail-layout">
      <article className="detail-card tournament-info-card">
        <div className="detail-card-heading"><div><p className="eyebrow"><Crosshair size={13} /> MATCH INTEL</p><h2>Tournament <span>brief.</span></h2></div><span className="verified-chip"><ShieldCheck size={13} /> OFFICIAL EVENT</span></div>
        <div className={'event-banner ' + tournament.accent}><div className="event-banner-orbit" /><span className="event-banner-kicker">{tournament.game} / {tournament.map.toUpperCase()}</span><h3>{tournament.title}</h3><span className="event-banner-mode">{tournament.mode} <span>·</span> {tournament.teamSize} player{tournament.teamSize > 1 ? 's' : ''}</span></div>
        <div className="info-grid">
          <div className="info-cell"><span><CalendarDays size={14} /> DATE</span><strong>{formatDate(tournament.date)}</strong></div>
          <div className="info-cell"><span><Clock3 size={14} /> START TIME</span><strong>{formatTime(tournament.date)} IST</strong></div>
          <div className="info-cell"><span><Map size={14} /> GAME MODE</span><strong>{tournament.mode}</strong></div>
          <div className="info-cell"><span><Users size={14} /> TEAM SIZE</span><strong>{tournament.teamSize} player{tournament.teamSize > 1 ? 's' : ''}</strong></div>
        </div>
        <div className="prize-breakdown"><div className="prize-title"><Trophy size={15} /> <span>PRIZE DISTRIBUTION</span><b>{formatINR(tournament.prizePool)}</b></div><div className="prize-places">{tournament.prizes.map((prize, index) => <div key={prize.place} className={'prize-place place-' + (index + 1)}><span>{String(index + 1).padStart(2, '0')}</span><small>{prize.place}</small><strong>{formatINR(prize.amount)}</strong></div>)}</div></div>
      </article>
      <RoomReveal tournament={tournament} registration={registration} user={user} />
    </section>
  );
}
