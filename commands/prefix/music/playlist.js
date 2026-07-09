import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';

export const name = 'playlist';
export const aliases = ['pl'];
export const description = 'Manage your personal playlists.';
export const usage = 'playlist <create/add/remove/list/view/play/delete> [args]';

export async function execute(message, args) {
  const sub = args[0]?.toLowerCase();

  if (sub === 'create') {
    const { execute: create } = await import('./playlist-create.js');
    await create(message, args.slice(1));
    return;
  }

  if (sub === 'add') {
    const { execute: add } = await import('./playlist-add.js');
    await add(message, args.slice(1));
    return;
  }

  if (sub === 'remove') {
    const { execute: remove } = await import('./playlist-remove.js');
    await remove(message, args.slice(1));
    return;
  }

  if (sub === 'list') {
    const { execute: list } = await import('./playlist-list.js');
    await list(message, args.slice(1));
    return;
  }

  if (sub === 'view') {
    const { execute: view } = await import('./playlist-view.js');
    await view(message, args.slice(1));
    return;
  }

  if (sub === 'play') {
    const { execute: playCmd } = await import('./playlist-play.js');
    await playCmd(message, args.slice(1));
    return;
  }

  if (sub === 'delete') {
    const { execute: del } = await import('./playlist-delete.js');
    await del(message, args.slice(1));
    return;
  }

  await reply(message,
    `${emojis.music} **Playlist Commands**\n` +
    `\`playlist create <name>\` — Create a playlist\n` +
    `\`playlist add <name> [url]\` — Add a track to a playlist\n` +
    `\`playlist remove <name> <#>\` — Remove a track by number\n` +
    `\`playlist list\` — Show your playlists\n` +
    `\`playlist view <name>\` — View tracks in a playlist\n` +
    `\`playlist play <name>\` — Play all tracks from a playlist\n` +
    `\`playlist delete <name>\` — Delete a playlist`
  );
}
