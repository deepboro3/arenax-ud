import { Crown, Trophy } from 'lucide-react';
import { demoWinners } from '../data/demo.js';
import { formatINR } from '../lib/format.js';

export default function WinnersCorner({ game }) {
  const winners = demoWinners.filter((winner) => !game || winner.game === game);
  return (
    <aside className="winners-corner" aria-label="Recent tournament winners">
      <div className="winners-corner-head">
        <div><p className="eyebrow"><Trophy size={12} /> WINNERS CORNER</p><h3>Recent <span>champions.</span></h3></div>
        <span className="winner-filter">{game || 'BOTH GAMES'}</span>
      </div>
      <div className="winner-announcements">
        {winners.map((winner) => (
          <article className="winner-announcement" key={winner.game}>
            <span className={'winner-game-mark ' + (winner.game === 'BGMI' ? 'winner-bgmi' : 'winner-freefire')}>
              {winner.game === 'BGMI' ? 'B' : 'FF'}
            </span>
            <span className="winner-copy"><small>{winner.game} · {winner.event}</small><strong><Crown size={13} /> {winner.playerName}</strong></span>
            <span className="winner-prize">{formatINR(winner.prize)}</span>
          </article>
        ))}
      </div>
      <small className="winner-preview-note">Preview announcements — replace with verified results after each match.</small>
    </aside>
  );
}
