const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function fetchMeta(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, redirect: 'follow', signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const html = await res.text();
    return {
      title: og(html, 'og:title') || og(html, 'twitter:title') || title(html),
      description: og(html, 'og:description') || og(html, 'twitter:description') || '',
      image: og(html, 'og:image') || og(html, 'twitter:image') || '',
      url: og(html, 'og:url') || url,
      siteName: og(html, 'og:site_name') || '',
    };
  } catch {
    return null;
  }
}

function og(html, prop) {
  const match = html.match(new RegExp(`<meta\\s+(?:property|name)=["']${prop}["']\\s+content=["']([^"']+)["']`, 'i'));
  return match ? decode(match[1]) : null;
}

function title(html) {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return match ? decode(match[1]).trim() : null;
}

function decode(str) {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
}
