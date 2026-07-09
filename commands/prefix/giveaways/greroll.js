import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';
import { canModerate } from '../../../util/permissions.js';

export const name = 'greroll';
export const description = 'Reroll a giveaway by message ID';
export const usage = 'greroll <message_id>';

export async function execute(message, args) {
  if (!canModerate(message.member)) {
    await reply(message, `${emojis.error} You don't have permission.`);
    return;
  }

  const msgId = args[0];
  if (!msgId) {
    await reply(message, `${emojis.warning} Usage: \`greroll <message_id>\``);
    return;
  }

  const db = getDb('giveaways');
  const giveaway = db.query(
    'SELECT * FROM giveaways WHERE message_id = ? AND guild_id = ?'
  ).get(msgId, message.guild.id);

  if (!giveaway) {
    await reply(message, `${emojis.error} No giveaway found with that message ID.`);
    return;
  }

   let msg;
   try {
     msg = await message.channel.messages.fetch(msgId);
   } catch {
     await reply(message, `${emojis.error} Could not fetch the giveaway message.`);
     return;
   }

   // Get button entries from database instead of reactions
   const db2 = getDb('giveaways');
   const buttonEntries = db2.query('SELECT user_id FROM giveaway_entries WHERE message_id = ?').all(msgId);
   let rawEntries = buttonEntries.map(e => e.user_id);

   let entries = rawEntries;
   if (giveaway.required_role) {
     await message.guild.members.fetch();
     entries = rawEntries.filter(id => {
       const m = message.guild.members.cache.get(id);
       // Include members with required role OR members with bypass role
       if (!m) return false;
       const hasRequired = m.roles.cache.has(giveaway.required_role);
       const hasBypass = giveaway.bypass_role ? m.roles.cache.has(giveaway.bypass_role) : false;
       return hasRequired || hasBypass;
     });
   } else if (giveaway.bypass_role) {
     // If only bypass role is set (no required role), bypass role holders can enter
     await message.guild.members.fetch();
     entries = rawEntries.filter(id => {
       const m = message.guild.members.cache.get(id);
       return m && m.roles.cache.has(giveaway.bypass_role);
     });
   }

  const winnerCount = Math.min(giveaway.winners, entries.length);
  const picked = [];

  if (winnerCount > 0) {
    const shuffled = [...entries].sort(() => Math.random() - 0.5);
    for (let i = 0; i < winnerCount; i++) {
      picked.push(shuffled[i]);
    }
  }

  if (!picked.length) {
    await message.channel.send(`**Giveaway Reroll — ${giveaway.prize}**\nNo valid entries.`);
    return;
  }

  const winnerMentions = picked.map(id => `<@${id}>`).join(' ');
  await message.channel.send(
    `${winnerMentions}\n**Giveaway Reroll!** You won **${giveaway.prize}**! (<@${giveaway.host_id}>)`
  );
}
