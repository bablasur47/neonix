import { EmbedBuilder } from 'discord.js';

const extract = {
  otaku: d => d.url,
  purrbot: d => d.link,
  dog: d => d.message,
  cat: d => d[0].url,
  fox: d => d.image,
  duck: d => d.url,
  nekoslife: d => d.url,
  nekobot: d => d.message,
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
  hug: ['purrbot', 'https://purrbot.site/api/img/sfw/hug/gif'],
  kiss: ['purrbot', 'https://purrbot.site/api/img/sfw/kiss/gif'],
  slap: ['purrbot', 'https://purrbot.site/api/img/sfw/slap/gif'],
  poke: ['purrbot', 'https://purrbot.site/api/img/sfw/poke/gif'],
  pat: ['purrbot', 'https://purrbot.site/api/img/sfw/pat/gif'],
  tickle: ['purrbot', 'https://purrbot.site/api/img/sfw/tickle/gif'],
  cuddle: ['purrbot', 'https://purrbot.site/api/img/sfw/cuddle/gif'],
  kill: ['nekoslife', 'https://nekos.life/api/v2/img/slap'],
  bite: ['nekoslife', 'https://nekos.life/api/v2/img/bite'],
  blush: ['nekoslife', 'https://nekos.life/api/v2/img/blush'],
  cry: ['nekoslife', 'https://nekos.life/api/v2/img/cry'],
  dance: ['nekoslife', 'https://nekos.life/api/v2/img/dance'],
  feed: ['nekoslife', 'https://nekos.life/api/v2/img/feed'],
  handhold: ['nekoslife', 'https://nekos.life/api/v2/img/handhold'],
  happy: ['nekoslife', 'https://nekos.life/api/v2/img/happy'],
  laugh: ['nekoslife', 'https://nekos.life/api/v2/img/laugh'],
  lick: ['nekoslife', 'https://nekos.life/api/v2/img/lick'],
  smug: ['nekoslife', 'https://nekos.life/api/v2/img/smug'],
  stare: ['nekoslife', 'https://nekos.life/api/v2/img/stare'],
  wave: ['nekoslife', 'https://nekos.life/api/v2/img/wave'],
  wink: ['nekoslife', 'https://nekos.life/api/v2/img/wink'],
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
