import emojis from '../../../util/emoji.js';
import { isOwner } from '../../../util/guildMember.js';
import { addRapeTarget, removeRapeTarget, getRapeTargets } from '../../../events/guild/messageCreate.js';

export const name = 'rape';
export const description = 'Delete all messages from a target user. Owner only.';
export const usage = 'rape <@user|remove @user|list|off @user>';

export async function execute(message, args) {
  if (!isOwner(message.author.id)) return;

  const sub = args[0]?.toLowerCase();
  const target = message.mentions.users.first() || message.mentions.members.first()?.user;

  if (sub === 'list') {
    const targets = getRapeTargets();
    if (!targets.size) {
      await message.reply(`${emojis.info} No active rape targets.`);
      return;
    }
    const list = [...targets].map(id => `<@${id}>`).join('\n');
    await message.reply(`${emojis.info} **Rape Targets:**\n${list}`);
    return;
  }

  if (sub === 'remove' || sub === 'off') {
    if (!target) {
      await message.reply(`${emojis.warning} Usage: \`rape remove @user\``);
      return;
    }
    removeRapeTarget(target.id);
    await message.reply(`${emojis.success} <@${target.id}> removed from rape list.`);
    return;
  }

  if (!target) {
    await message.reply(`${emojis.warning} Usage: \`rape @user\` to start, \`rape remove @user\` to stop, \`rape list\` to show targets.`);
    return;
  }

  if (target.id === message.author.id) {
    await message.reply(`${emojis.warning} You cannot target yourself.`);
    return;
  }

  addRapeTarget(target.id);
  await message.reply(`${emojis.success} Now deleting all messages from <@${target.id}>. Use \`rape remove @user\` to stop.`);
}
