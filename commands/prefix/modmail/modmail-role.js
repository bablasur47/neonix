import { reply } from '../../../util/components.js';
import emojis from '../../../util/emoji.js';
import { getDb } from '../../../database/index.js';

export const name = 'modmail-role';
export const description = 'Manage staff roles for modmail.';
export const usage = 'modmail-role <add/remove/list> [@role]';
export const aliases = ['mm-role'];

export async function execute(message, args) {
  if (!message.member.permissions.has('Administrator')) {
    await reply(message, `${emojis.error} You need Administrator permission.`);
    return;
  }

  const sub = args[0]?.toLowerCase();
  const db = getDb('modmail');
  const config = db.query('SELECT * FROM modmail_config WHERE guild_id = ?').get(message.guild.id);
  if (!config && sub !== 'list') {
    await reply(message, `${emojis.warning} Modmail is not setup. Use \`modmail-setup\` first.`);
    return;
  }

  if (sub === 'list') {
    const roles = db.query('SELECT role_id FROM modmail_roles WHERE guild_id = ?').all(message.guild.id);
    if (!roles.length) {
      await reply(message, `${emojis.info} No staff roles configured. Use \`modmail-role add @role\` to add one.`);
      return;
    }
    const lines = roles.map(r => `<@&${r.role_id}>`);
    await reply(message, `${emojis.modmail} **Modmail Staff Roles:**\n${lines.join('\n')}`);
    return;
  }

  if (sub === 'add' || sub === 'remove') {
    const role = message.mentions.roles.first();
    if (!role) {
      await reply(message, `${emojis.warning} Usage: \`modmail-role ${sub} @role\``);
      return;
    }

    if (sub === 'add') {
      try {
        db.run('INSERT INTO modmail_roles (guild_id, role_id) VALUES (?, ?)', [message.guild.id, role.id]);
        await reply(message, `${emojis.success} Staff role ${role.toString()} added to modmail.`);
      } catch {
        await reply(message, `${emojis.warning} Role ${role.toString()} is already a staff role.`);
      }
    } else {
      const result = db.run('DELETE FROM modmail_roles WHERE guild_id = ? AND role_id = ?', [message.guild.id, role.id]);
      if (result.changes > 0) {
        await reply(message, `${emojis.success} Staff role ${role.toString()} removed from modmail.`);
      } else {
        await reply(message, `${emojis.info} Role ${role.toString()} is not a modmail staff role.`);
      }
    }
    return;
  }

  await reply(message,
    `${emojis.warning} Usage:\n` +
    `\`modmail-role add @role\` — Add a staff role\n` +
    `\`modmail-role remove @role\` — Remove a staff role\n` +
    `\`modmail-role list\` — List all staff roles`
  );
}
