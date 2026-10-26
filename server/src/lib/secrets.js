import crypto from 'node:crypto';

const getKey = () => {
  const raw = process.env.ROOM_CREDENTIALS_KEY || '';
  if (!/^[a-fA-F0-9]{64}$/.test(raw)) throw new Error('ROOM_CREDENTIALS_KEY must be 64 hex characters.');
  return Buffer.from(raw, 'hex');
};

export const encryptSecret = (plainText) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  return [iv.toString('hex'), cipher.getAuthTag().toString('hex'), encrypted.toString('hex')].join('.');
};

export const decryptSecret = (value) => {
  const [ivHex, tagHex, dataHex] = value.split('.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
};
