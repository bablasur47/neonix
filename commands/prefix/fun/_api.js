import { EmbedBuilder } from 'discord.js';

const FETCH_TIMEOUT_MS = 10_000;
const EMBED_COLOR = 0x2B2D31;
// nekos.best returns 403 for generic UAs like "Mozilla/5.0" — use a descriptive bot UA
const USER_AGENT = 'DiscordBot (music-bot, 1.0)';

const extract = {
  otaku: d => d.url,
  purrbot: d => d.link,
  dog: d => d.message,
  cat: d => d[0]?.url,
  fox: d => d.image,
  duck: d => d.url,
  nekoslife: d => d.url,
  nekosbest: d => d.results?.[0]?.url,
  waifupics: d => d.url,
  meme: d => d.image,
  popfact: d => d.fact,
  popjoke: d => d.joke,
  eightball: d => d.answer,
  kanye: d => d.quote,
  advice: d => d.slip?.advice,
  catfact: d => d.fact,
  uselessfact: d => d.text,
  geekjoke: d => d.joke,
  zen: d => d,
  nekobot: d => d.message,
};

const FALLBACKS = {
  hug: ['nekosbest', 'https://nekos.best/api/v2/hug'],
  kiss: ['nekosbest', 'https://nekos.best/api/v2/kiss'],
  slap: ['nekosbest', 'https://nekos.best/api/v2/slap'],
  poke: ['nekosbest', 'https://nekos.best/api/v2/poke'],
  pat: ['nekosbest', 'https://nekos.best/api/v2/pat'],
  tickle: ['nekosbest', 'https://nekos.best/api/v2/tickle'],
  cuddle: ['nekosbest', 'https://nekos.best/api/v2/cuddle'],
  kill: ['otaku', 'https://api.otakugifs.xyz/gif?reaction=slap'],
  fuck: ['otaku', 'https://api.otakugifs.xyz/gif?reaction=punch'],
  bite: ['nekosbest', 'https://nekos.best/api/v2/bite'],
  blush: ['nekosbest', 'https://nekos.best/api/v2/blush'],
  cry: ['nekosbest', 'https://nekos.best/api/v2/cry'],
  dance: ['nekosbest', 'https://nekos.best/api/v2/dance'],
  feed: ['nekosbest', 'https://nekos.best/api/v2/feed'],
  handhold: ['nekosbest', 'https://nekos.best/api/v2/handhold'],
  happy: ['nekosbest', 'https://nekos.best/api/v2/happy'],
  laugh: ['nekosbest', 'https://nekos.best/api/v2/laugh'],
  lick: ['purrbot', 'https://purrbot.site/api/img/sfw/lick/gif'],
  smug: ['nekosbest', 'https://nekos.best/api/v2/smug'],
  stare: ['nekosbest', 'https://nekos.best/api/v2/stare'],
  wave: ['nekosbest', 'https://nekos.best/api/v2/wave'],
  wink: ['nekosbest', 'https://nekos.best/api/v2/wink'],
  cat: ['fox', 'https://some-random-api.com/animal/cat'],
  angry: ['otaku', 'https://api.otakugifs.xyz/gif?reaction=mad'],
  nope: ['otaku', 'https://api.otakugifs.xyz/gif?reaction=no'],
  clap: ['nekosbest', 'https://nekos.best/api/v2/clap'],
  confused: ['nekosbest', 'https://nekos.best/api/v2/confused'],
  sip: ['nekosbest', 'https://nekos.best/api/v2/sip'],
  yawn: ['nekosbest', 'https://nekos.best/api/v2/yawn'],
  mad: ['nekosbest', 'https://nekos.best/api/v2/angry'],
  surprised: ['nekosbest', 'https://nekos.best/api/v2/shocked'],
};

const title = type => type.charAt(0).toUpperCase() + type.slice(1);

function baseEmbed(message, embedTitle) {
  return new EmbedBuilder()
    .setTitle(embedTitle)
    .setColor(EMBED_COLOR)
    .setFooter({ text: `Requested by ${message.author.username}` })
    .setTimestamp();
}

async function fetchOne(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  return ct.includes('json') ? res.json() : res.text();
}

async function tryFetch(urls, sources) {
  for (let i = 0; i < urls.length; i++) {
    try {
      return { data: await fetchOne(urls[i]), source: sources[i] };
    } catch (err) {
      console.error(`[fun] ${sources[i]} (${urls[i]}) failed:`, err.message);
    }
  }
  return null;
}

async function replyError(message) {
  await message.reply('Failed to fetch. Try again later.').catch(() => {});
}

export function imageCmd(type, source, url) {
  const urls = [url];
  const sources = [source];
  const fallback = FALLBACKS[type];
  if (fallback) {
    sources.push(fallback[0]);
    urls.push(fallback[1]);
  }
  return async (message) => {
    try {
      const result = await tryFetch(urls, sources);
      if (!result) throw new Error('all sources failed');
      const image = extract[result.source]?.(result.data);
      if (!image) throw new Error(`no image in ${result.source} response`);
      const embed = baseEmbed(message, title(type)).setImage(image);
      await message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(`[fun] ${type} command failed:`, err.message);
      await replyError(message);
    }
  };
}

export function textCmd(type, source, url, embedTitle) {
  return async (message) => {
    try {
      const data = await fetchOne(url);
      const text = extract[source]?.(data);
      if (!text) throw new Error(`no text in ${source} response`);
      const embed = baseEmbed(message, embedTitle || title(type)).setDescription(String(text));
      await message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(`[fun] ${type} command failed:`, err.message);
      await replyError(message);
    }
  };
}

export function textRaw(type, url, embedTitle) {
  return async (message) => {
    try {
      const data = await fetchOne(url);
      const text = String(data).trim();
      if (!text) throw new Error('empty response');
      const embed = baseEmbed(message, embedTitle || title(type)).setDescription(text);
      await message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(`[fun] ${type} command failed:`, err.message);
      await replyError(message);
    }
  };
}

async function resolveTarget(message, args, client) {
  const mentioned = message.mentions.users.first();
  if (mentioned) return mentioned;
  if (args?.[0] && /^\d{17,20}$/.test(args[0])) {
    try { return await client.users.fetch(args[0]); } catch {}
  }
  return message.author;
}

const avatarOf = user => user.displayAvatarURL({ extension: 'png', forceStatic: true, size: 512 });

const MAX_MEME_TEXT = 100;

// memegen.link encodes text in the URL path with special escapes
function memegenEscape(text) {
  return encodeURIComponent(
    text
      .replaceAll('_', '__')
      .replaceAll('-', '--')
      .replaceAll(' ', '_')
      .replaceAll('?', '~q')
      .replaceAll('&', '~a')
      .replaceAll('%', '~p')
      .replaceAll('#', '~h')
      .replaceAll('/', '~s')
      .replaceAll('"', "''")
  );
}

// Fetches a generated meme: image responses are returned as a buffer to
// attach; JSON responses (nekobot) carry the hosted result URL instead.
async function fetchGenerated(apiUrl) {
  const res = await fetch(apiUrl, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('json')) {
    const data = await res.json();
    const url = data.message;
    if (typeof url !== 'string' || !url.startsWith('http')) throw new Error('no image url in response');
    return { url };
  }
  if (!ct.startsWith('image/')) throw new Error(`unexpected content-type ${ct}`);
  return { buffer: Buffer.from(await res.arrayBuffer()) };
}

// Generic meme generator. The urlTemplate may contain placeholders:
//   {avatar}   target user's avatar (mention > user ID arg > author)
//   {avatar2}  second user for duo memes (one mention = author vs mention)
//   {username} target user's name
//   {text}     joined args; {text1}/{text2} split args on "|"
export function memeCmd(type, urlTemplate, opts = {}) {
  const escapeText = opts.memegen ? memegenEscape : encodeURIComponent;
  return async (message, args, client) => {
    try {
      let url = urlTemplate;
      let target = null;

      if (url.includes('{avatar2}')) {
        const mentions = [...message.mentions.users.values()];
        if (mentions.length === 0) {
          await message.reply(`Usage: \`${opts.usage || `${type} @user [@user]`}\``).catch(() => {});
          return;
        }
        const first = mentions.length > 1 ? mentions[0] : message.author;
        const second = mentions.length > 1 ? mentions[1] : mentions[0];
        url = url
          .replace('{avatar}', encodeURIComponent(avatarOf(first)))
          .replace('{avatar2}', encodeURIComponent(avatarOf(second)));
      } else if (url.includes('{avatar}')) {
        target = await resolveTarget(message, args, client);
        url = url.replace('{avatar}', encodeURIComponent(avatarOf(target)));
      }
      if (url.includes('{username}')) {
        url = url.replace('{username}', encodeURIComponent((target || message.author).username));
      }

      if (url.includes('{text')) {
        const raw = args.filter(a => !/^<@!?\d+>$/.test(a)).join(' ').trim().slice(0, MAX_MEME_TEXT * 2);
        if (!raw) {
          await message.reply(`Usage: \`${opts.usage || `${type} <text>`}\``).catch(() => {});
          return;
        }
        if (url.includes('{text1}')) {
          const [t1, t2] = raw.split('|').map(s => s.trim());
          if (!t1 || !t2) {
            await message.reply(`Usage: \`${opts.usage || `${type} <text 1> | <text 2>`}\``).catch(() => {});
            return;
          }
          url = url
            .replace('{text1}', escapeText(t1.slice(0, MAX_MEME_TEXT)))
            .replace('{text2}', escapeText(t2.slice(0, MAX_MEME_TEXT)));
        } else {
          url = url.replace('{text}', escapeText(raw.slice(0, MAX_MEME_TEXT)));
        }
      }

      const result = await fetchGenerated(url);
      const embed = baseEmbed(message, opts.title || title(type));
      const payload = { embeds: [embed] };
      if (result.buffer) {
        const fileName = `${type}.png`;
        embed.setImage(`attachment://${fileName}`);
        payload.files = [{ attachment: result.buffer, name: fileName }];
      } else {
        embed.setImage(result.url);
      }
      await message.reply(payload);
    } catch (err) {
      console.error(`[fun] ${type} command failed:`, err.message);
      await replyError(message);
    }
  };
}
