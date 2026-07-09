import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'clear';
export const aliases = ['purge'];
export const description = 'Clear/purge messages in the channel.';
export const usage = 'clear <1-100|all|bot|user|embeds|emoji|files|images|contains|reactions> [@user] [text]';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission to clear messages.`);
    return;
  }

  const sub = args[0]?.toLowerCase();

  if (sub === 'all' || sub === 'everything') {
    await bulkDelete(message, 100, () => true);
    return;
  }

  if (sub === 'bot') {
    await bulkDelete(message, 100, m => m.author.bot);
    return;
  }

  if (sub === 'embeds') {
    await bulkDelete(message, 100, m => m.embeds.length > 0);
    return;
  }

  if (sub === 'emoji' || sub === 'emojis') {
    await bulkDelete(message, 100, m => /\p{Extended_Pictographic}/u.test(m.content));
    return;
  }

  if (sub === 'files' || sub === 'file') {
    await bulkDelete(message, 100, m => m.attachments.size > 0);
    return;
  }

  if (sub === 'images' || sub === 'image') {
    await bulkDelete(message, 100, m =>
      m.attachments.size > 0 && m.attachments.some(a => a.contentType?.startsWith('image/'))
    );
    return;
  }

  if (sub === 'contains' || sub === 'text') {
    const text = args.slice(1).join(' ').toLowerCase();
    if (!text) {
      await reply(message, `${emojis.warning} Usage: \`clear contains <text>\``);
      return;
    }
    await bulkDelete(message, 100, m => m.content.toLowerCase().includes(text));
    return;
  }

  if (sub === 'reactions') {
    const target = message.mentions.members.first();
    const targetId = target?.id || (args[1] ? args[1] : null);
    const fetched = await message.channel.messages.fetch({ limit: 50 });

    let count = 0;
    for (const msg of fetched.values()) {
      if (targetId) {
        for (const reaction of msg.reactions.cache.values()) {
          const users = await reaction.users.fetch();
          if (users.has(targetId)) {
            await reaction.users.remove(targetId).catch(() => {});
            count++;
          }
        }
      } else {
        for (const reaction of msg.reactions.cache.values()) {
          await reaction.remove().catch(() => {});
          count++;
        }
      }
    }

    await reply(message, `${emojis.success} Cleared reactions from ${count} messages.`);
    return;
  }

  if (sub === 'user' || sub === 'member' || sub === 'from') {
    const target = message.mentions.members.first();
    if (!target) {
      await reply(message, `${emojis.warning} Usage: \`clear user @user\``);
      return;
    }
    await bulkDelete(message, 100, m => m.author.id === target.id);
    return;
  }

  const amount = parseInt(args[0]);
  if (!isNaN(amount) && amount > 0 && amount <= 100) {
    await bulkDelete(message, amount, () => true);
    return;
  }

  await reply(message,
    `${emojis.warning} Usage:\n` +
    `\`clear <1-100>\` \`clear all\` \`clear bot\` \`clear user @user\`\n` +
    `\`clear embeds\` \`clear emoji\` \`clear files\` \`clear images\`\n` +
    `\`clear contains <text>\` \`clear reactions [@user]\``
  );
}

async function bulkDelete(message, limit, filter) {
  const fetched = await message.channel.messages.fetch({ limit });
  const toDelete = fetched.filter(filter).first(100);

  if (!toDelete.length) {
    await reply(message, `${emojis.info} No messages to delete.`);
    return;
  }

  const deleted = await message.channel.bulkDelete(toDelete, true).catch(() => null);
  if (!deleted) {
    await message.channel.send(`${emojis.error} Failed to delete messages.`).then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
    return;
  }

  await message.channel.send(`${emojis.success} Deleted ${deleted.size} messages.`).then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
}
