import { EmbedBuilder } from 'discord.js';

const extract = {
  otaku: d => d.url,
  purrbot: d => d.link,
  dog: d => d.message,
  cat: d => d[0].url,
  fox: d => d.image,
  duck: d => d.url,
  nekoslife: d => d.url,
  nekosbest: d => d.results[0].url,
  waifupics: d => d.url,
  meme: d => d.image,
  popfact: d => d.fact,
  popjoke: d => d.joke,
  eightball: d => d.answer,
  kanye: d => d.quote,
  advice: d => d.slip.advice,
  catfact: d => d.fact,
  uselessfact: d => d.text,
  geekjoke: d => d.joke,
  zen: d => d,
};

const FALLBACKS = {
  hug: ['nekosbest', 'https://nekos.best/api/v2/hug'],
  kiss: ['nekosbest', 'https://nekos.best/api/v2/kiss'],
  slap: ['nekosbest', 'https://nekos.best/api/v2/slap'],
  poke: ['nekosbest', 'https://nekos.best/api/v2/poke'],
  pat: ['nekosbest', 'https://nekos.best/api/v2/pat'],
  tickle: ['nekosbest', 'https://nekos.best/api/v2/tickle'],
  cuddle: ['nekosbest', 'https://nekos.best/api/v2/cuddle'],
  kill: ['nekobot', 'https://nekobot.xyz/api/image?type=hentai'],
  bite: ['nekosbest', 'https://nekos.best/api/v2/bite'],
  blush: ['nekosbest', 'https://nekos.best/api/v2/blush'],
  cry: ['nekosbest', 'https://nekos.best/api/v2/cry'],
  dance: ['nekosbest', 'https://nekos.best/api/v2/dance'],
  feed: ['nekosbest', 'https://nekos.best/api/v2/feed'],
  handhold: ['nekosbest', 'https://nekos.best/api/v2/handhold'],
  happy: ['nekosbest', 'https://nekos.best/api/v2/happy'],
  laugh: ['nekosbest', 'https://nekos.best/api/v2/laugh'],
  lick: ['nekosbest', 'https://nekos.best/api/v2/lick'],
  smug: ['nekosbest', 'https://nekos.best/api/v2/smug'],
  stare: ['nekosbest', 'https://nekos.best/api/v2/stare'],
  wave: ['nekosbest', 'https://nekos.best/api/v2/wave'],
  wink: ['nekosbest', 'https://nekos.best/api/v2/wink'],
};

async function tryFetch(urls, sources) {
  for (let i = 0; i < urls.length; i++) {
    try {
      const res = await fetch(urls[i], { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = res.headers.get('content-type') || '';
      return ct.includes('json') ? { data: await res.json(), source: sources[i] } : { data: await res.text(), source: sources[i] };
    } catch {}
  }
  return null;
}

export function imageCmd(type, source, url) {
  const fallback = FALLBACKS[type];
  const urls = [url];
  const sources = [source];
  if (fallback) { urls.push(fallback[1]); sources.push(fallback[0]); }
  return async (message) => {
    try {
      const result = await tryFetch(urls, sources);
      if (!result) throw new Error('all sources failed');
      const embed = new EmbedBuilder()
        .setTitle(type.charAt(0).toUpperCase() + type.slice(1))
        .setImage(extract[result.source](result.data))
        .setColor(0x2B2D31)
        .setFooter({ text: `Requested by ${message.author.username}` })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
    } catch {
      await message.reply('Failed to fetch. Try again later.');
    }
  };
}

export function textCmd(type, source, url, title) {
  return async (message) => {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      const embed = new EmbedBuilder()
        .setTitle(title || type.charAt(0).toUpperCase() + type.slice(1))
        .setDescription(extract[source](data))
        .setColor(0x2B2D31)
        .setFooter({ text: `Requested by ${message.author.username}` })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
    } catch {
      await message.reply('Failed to fetch. Try again later.');
    }
  };
}

export function textRaw(type, url, title) {
  return async (message) => {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const embed = new EmbedBuilder()
        .setTitle(title || type.charAt(0).toUpperCase() + type.slice(1))
        .setDescription(await res.text())
        .setColor(0x2B2D31)
        .setFooter({ text: `Requested by ${message.author.username}` })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
    } catch {
      await message.reply('Failed to fetch. Try again later.');
    }
  };
}
