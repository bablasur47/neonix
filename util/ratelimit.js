const cooldowns = new Map();
const DEFAULT_COOLDOWN = 2000;

export function checkRatelimit(userId, commandName, cooldownMs = DEFAULT_COOLDOWN) {
  const key = `${userId}:${commandName}`;
  const now = Date.now();
  const last = cooldowns.get(key);

  if (last && now - last < cooldownMs) {
    return Math.ceil((cooldownMs - (now - last)) / 1000);
  }

  cooldowns.set(key, now);
  return 0;
}

export function clearRatelimit(userId) {
  for (const [key] of cooldowns) {
    if (key.startsWith(`${userId}:`)) cooldowns.delete(key);
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [key, time] of cooldowns) {
    if (now - time > 60000) cooldowns.delete(key);
  }
}, 60000);
