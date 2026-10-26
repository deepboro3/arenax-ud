import { motion } from 'framer-motion';
import { ArrowUpRight, Crosshair, Flame, Gamepad2, Zap } from 'lucide-react';

const games = [
  { id: 'BGMI', title: 'BATTLEGROUNDS', subtitle: 'MOBILE INDIA', label: 'TACTICAL · ROYALE', icon: Crosshair, variant: 'bgmi', image: '/assets/bgmi-arena.jpg', players: '2.4K players', next: 'Next drop tomorrow' },
  { id: 'FREE FIRE', title: 'FREE FIRE', subtitle: 'MAX', label: 'FAST · FIERCE · FREE', icon: Flame, variant: 'freefire', image: '/assets/freefire-arena.jpg', players: '1.8K players', next: 'Next drop in 2 days' },
];

export default function GamePicker({ selected, onSelect }) {
  return (
    <section className="game-picker-section">
      <div className="section-heading"><div><p className="eyebrow"><Gamepad2 size={13} /> CHOOSE YOUR ARENA</p><h2>Pick your <span>game.</span></h2></div><span className="required-tag"><Zap size={12} /> SELECT ONE TO CONTINUE</span></div>
      <div className="game-picker-grid">
        {games.map((game, index) => {
          const Icon = game.icon;
          return <motion.button key={game.id} className={'game-picker-card ' + game.variant + (selected === game.id ? ' selected' : '')} onClick={() => onSelect(game.id)} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} whileHover={{ y: -4 }}>
            <div className="game-card-graphic" style={{ '--game-wallpaper': 'url(' + game.image + ')' }}><div className="game-graphic-grid" /><div className="game-graphic-ring" /><div className="game-graphic-icon"><Icon size={32} strokeWidth={1.4} /></div><span className="game-card-number">0{index + 1}</span></div>
            <div className="game-card-content"><div><span className="game-kicker">{game.label}</span><h3>{game.title}<br /><small>{game.subtitle}</small></h3></div><span className="game-select-arrow"><ArrowUpRight size={18} /></span></div>
            <div className="game-card-foot"><span><span className="live-dot" /> {game.players}</span><span>{game.next}</span></div>
          </motion.button>;
        })}
      </div>
      {selected && <p className="game-selected-note"><span className="live-dot" /> {selected} selected — tournament slots are live below.</p>}
    </section>
  );
}
