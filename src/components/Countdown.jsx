import { useEffect, useState } from 'react';
import { getCountdown, pad } from '../lib/format';

export default function Countdown({ target, compact = false }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  const time = getCountdown(target, now);
  if (compact) return <div className="countdown-compact"><span>{time.days ? time.days + 'd ' : ''}{pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}</span><small>UNTIL DROP</small></div>;
  return <div className="countdown-units"><div><strong>{pad(time.days)}</strong><small>DAYS</small></div><i>:</i><div><strong>{pad(time.hours)}</strong><small>HRS</small></div><i>:</i><div><strong>{pad(time.minutes)}</strong><small>MIN</small></div><i>:</i><div><strong>{pad(time.seconds)}</strong><small>SEC</small></div></div>;
}
