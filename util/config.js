function parseNodes() {
  const raw = process.env.LAVALINK_NODES;
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw.split(';').map(s => {
        const [host, port, password, secure] = s.trim().split(',');
        return { host, port: parseInt(port, 10) || 13592, password: password || 'youshallnotpass', secure: secure === 'true' };
      });
    }
  }
  return [
    {
      host: process.env.LAVALINK_HOST || 'lavalinkv4.serenetia.com',
      password: process.env.LAVALINK_PASSWORD || 'https://dsc.gg/ajidevserver'
      port: parseInt(process.env.LAVALINK_PORT || '443', 10),
      secure: process.env.LAVALINK_SECURE === 'true',
    },
  ];
}

const config = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  ownerId: process.env.OWNER_ID,
  initialPrefix: process.env.INITIAL_PREFIX || ';',
  webhookUrl: process.env.WEBHOOK_URL,
  dashboardUrl: process.env.DASHBOARD_URL || 'https://dude-q8n7.onrender.com',
  defaultVolume: parseInt(process.env.DEFAULT_VOLUME || '60', 10),
  lavalink: parseNodes(),
};

export default config;
