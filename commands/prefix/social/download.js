import { reply } from '../../../util/components.js';

export const name = 'download';
export const description = 'Download an image or video from a URL.';
export const usage = 'download <url>';
export const aliases = ['dl'];

export async function execute(message, args) {
  if (!args.length) return reply(message, 'Please provide a URL to download.\nUsage: `download <url>`');

  const url = args[0];
  if (!url.startsWith('http://') && !url.startsWith('https://'))
    return reply(message, 'Please provide a valid URL starting with http:// or https://');

  const status = await reply(message, 'Downloading...');

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      await status.edit('Failed to fetch the URL. Make sure it is accessible.');
      return;
    }

    const contentLength = res.headers.get('content-length');
    const size = contentLength ? parseInt(contentLength, 10) : null;
    const maxSize = Math.min(10 * 1024 * 1024, message.guild.maxUploadSize || 25 * 1024 * 1024);

    if (size && size > maxSize) {
      await status.edit(`File is larger than ${Math.round(maxSize / 1024 / 1024)}MB. Download a smaller file.`);
      return;
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    if (buffer.length > maxSize) {
      await status.edit(`File is larger than ${Math.round(maxSize / 1024 / 1024)}MB. Download a smaller file.`);
      return;
    }

    const disposition = res.headers.get('content-disposition') || '';
    const nameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    const fileName = nameMatch ? nameMatch[1].replace(/['"]/g, '') : url.split('/').pop()?.split('?')[0] || 'download';

    await message.reply({ files: [{ attachment: buffer, name: fileName }] });
    await status.delete().catch(() => {});
  } catch (error) {
    await status.edit(`Download failed: ${error.message}`);
  }
}
