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
      host: process.env.LAVALINK_HOST || '',
      password: process.env.LAVALINK_PASSWORD || 'D',
      port: parseInt(process.env.LAVALINK_PORT || '', 10),
      secure: process.env.LAVALINK_SECURE === '',
    },
    {
      host: process.env.LAVALINK_HOST_2 || '',
      password: process.env.LAVALINK_PASSWORD_2 || '',
      port: parseInt(process.env.LAVALINK_PORT_2 || '', 10),
      secure: process.env.LAVALINK_SECURE_2 === '',
    },
    {
      host: process.env.LAVALINK_HOST_3 || '',
      password: process.env.LAVALINK_PASSWORD_3 || '',
      port: parseInt(process.env.LAVALINK_PORT_3 || '', 10),
      secure: process.env.LAVALINK_SECURE_3 === '',
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
  dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000',
  defaultVolume: parseInt(process.env.DEFAULT_VOLUME || '60', 10),
  lavalink: parseNodes(),
};

export default config;
