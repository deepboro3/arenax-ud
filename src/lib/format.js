export const formatINR = (amount) => '₹' + Number(amount).toLocaleString('en-IN');

export const formatDate = (value) => {
  const date = new Date(value);
  const day = new Intl.DateTimeFormat('en-IN', { day: '2-digit', timeZone: 'Asia/Kolkata' }).format(date);
  const month = new Intl.DateTimeFormat('en-IN', { month: '2-digit', timeZone: 'Asia/Kolkata' }).format(date);
  const year = new Intl.DateTimeFormat('en-IN', { year: 'numeric', timeZone: 'Asia/Kolkata' }).format(date);
  return day + '/' + month + '/' + year;
};

export const formatTime = (date) => new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
}).format(new Date(date)).replace(' am', ' AM').replace(' pm', ' PM');

export const getAge = (birthDate) => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate + 'T00:00:00');
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday = now.getMonth() < birth.getMonth()
    || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  return beforeBirthday ? age - 1 : age;
};

export const getCountdown = (target, now = Date.now()) => {
  const delta = Math.max(0, new Date(target).getTime() - now);
  return {
    days: Math.floor(delta / 86400000),
    hours: Math.floor((delta % 86400000) / 3600000),
    minutes: Math.floor((delta % 3600000) / 60000),
    seconds: Math.floor((delta % 60000) / 1000),
    total: delta,
  };
};

export const pad = (number) => String(number).padStart(2, '0');
