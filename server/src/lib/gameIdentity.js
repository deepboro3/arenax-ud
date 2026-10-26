const sampleNames = {
  BGMI: ['NEØN•RIDER', 'HΛVØCツ', 'CLUTCH.exe', 'V1PER•X', 'RUSH々KING'],
  'FREE FIRE': ['DARK•SOUL', '亗FALCON亗', 'FIRE•NOVA', 'ONE•TAP', '亗ACE亗'],
};

// Replace this adapter with an authorized game identity provider when one is available.
export const lookupGameIdentity = async (game, gameId) => {
  const cleanId = String(gameId || '').trim();
  if (!/^[a-zA-Z0-9_-]{5,30}$/.test(cleanId)) return null;
  await new Promise((resolve) => setTimeout(resolve, 250));
  const names = sampleNames[game];
  if (!names) return null;
  const checksum = [...cleanId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return { game, gameId: cleanId, playerName: names[checksum % names.length], verifiedAt: new Date() };
};