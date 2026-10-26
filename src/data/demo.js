const tomorrowAtEight = new Date('2026-10-27T20:30:00+05:30').toISOString();
const nextDayAtNine = new Date('2026-10-28T21:00:00+05:30').toISOString();

export const tournaments = [
  {
    id: 'bgmi-erangel-solo',
    game: 'BGMI',
    gameName: 'Battlegrounds Mobile India',
    title: 'Erangel Night Ops',
    map: 'Erangel',
    mode: 'Solo · TPP',
    teamSize: 1,
    date: tomorrowAtEight,
    entryFee: 49,
    prizePool: 1200,
    slotsFilled: 0,
    slotsTotal: 500,
    tag: 'Featured',
    accent: 'cyan',
    prizes: [{ place: '1st place', amount: 800 }, { place: '2nd place', amount: 500 }, { place: '3rd place', amount: 300 }],
  },
  {
    id: 'freefire-bermuda-solo',
    game: 'FREE FIRE',
    gameName: 'Free Fire MAX',
    title: 'Bermuda Blitz',
    map: 'Bermuda',
    mode: 'Solo · TPP',
    teamSize: 1,
    date: nextDayAtNine,
    entryFee: 29,
    prizePool: 8000,
    slotsFilled: 184,
    slotsTotal: 400,
    tag: 'Slots filling',
    accent: 'pink',
    prizes: [{ place: '1st place', amount: 4000 }, { place: '2nd place', amount: 2500 }, { place: '3rd place', amount: 1500 }],
  },
];

export const seedPlayers = {
  'bgmi-erangel-solo': [
    { name: 'RAVEN.exe', initials: 'R', id: '7654•••201', time: '2 min ago' },
    { name: 'KRYPTICツ', initials: 'K', id: '9321•••870', time: '8 min ago' },
    { name: 'NØVA•OP', initials: 'N', id: '2087•••445', time: '13 min ago' },
    { name: 'VOIDWALKER', initials: 'V', id: '6190•••733', time: '19 min ago' },
  ],
  'freefire-bermuda-solo': [
    { name: 'SH4DOW', initials: 'S', id: '8820•••144', time: '4 min ago' },
    { name: 'BLITZ✓', initials: 'B', id: '1209•••610', time: '11 min ago' },
    { name: 'PHANTOM', initials: 'P', id: '5430•••908', time: '16 min ago' },
  ],
};

export const demoWinners = [
  { game: 'BGMI', event: 'Erangel Night Ops', playerName: 'NEØN•RIDER', prize: 6000, announced: '25 OCT 2026' },
  { game: 'FREE FIRE', event: 'Bermuda Blitz', playerName: 'SH4DOW', prize: 4000, announced: '24 OCT 2026' },
];

export const demoNameForId = (game, id) => {
  const presets = game === 'BGMI'
    ? ['NEØN•RIDER', 'HΛVØCツ', 'CLUTCH.exe', 'V1PER•X', 'RUSH々KING']
    : ['DARK•SOUL', '亗FALCON亗', 'FIRE•NOVA', 'ONE•TAP', '亗ACE亗'];
  const checksum = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return presets[checksum % presets.length];
};
