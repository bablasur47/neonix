import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('Clear/purge messages in the channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addSubcommand(sub =>
    sub.setName('amount').setDescription('Delete a specific number of messages')
      .addIntegerOption(opt => opt.setName('count').setDescription('Number of messages (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)))
  .addSubcommand(sub =>
    sub.setName('all').setDescription('Delete last 100 messages'))
  .addSubcommand(sub =>
    sub.setName('bot').setDescription('Delete messages from bots'))
  .addSubcommand(sub =>
    sub.setName('user').setDescription('Delete messages from a specific user')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('embeds').setDescription('Delete messages with embeds'))
  .addSubcommand(sub =>
    sub.setName('emoji').setDescription('Delete messages containing emoji'))
  .addSubcommand(sub =>
    sub.setName('files').setDescription('Delete messages with attachments'))
  .addSubcommand(sub =>
    sub.setName('images').setDescription('Delete messages with images'))
  .addSubcommand(sub =>
    sub.setName('contains').setDescription('Delete messages containing specific text')
      .addStringOption(opt => opt.setName('text').setDescription('Text to search for').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('reactions').setDescription('Clear reactions from messages')
      .addUserOption(opt => opt.setName('user').setDescription('User to clear reactions from').setRequired(false)));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const fetchAndDelete = async (filter) => {
    const fetched = await interaction.channel.messages.fetch({ limit: 100 });
    const toDelete = fetched.filter(filter).first(100);
    if (!toDelete.length) return 0;
    const deleted = await interaction.channel.bulkDelete(toDelete, true).catch(() => null);
    return deleted?.size || 0;
  };

  try {
    let count = 0;

    if (sub === 'amount') {
      const amount = interaction.options.getInteger('count', true);
      const deleted = await interaction.channel.bulkDelete(amount, true).catch(() => null);
      count = deleted?.size || 0;
    } else if (sub === 'all') {
      count = await fetchAndDelete(() => true);
    } else if (sub === 'bot') {
      count = await fetchAndDelete(m => m.author.bot);
    } else if (sub === 'user') {
      const user = interaction.options.getUser('user', true);
      count = await fetchAndDelete(m => m.author.id === user.id);
    } else if (sub === 'embeds') {
      count = await fetchAndDelete(m => m.embeds.length > 0);
    } else if (sub === 'emoji') {
      count = await fetchAndDelete(m => /\p{Extended_Pictographic}/u.test(m.content));
    } else if (sub === 'files') {
      count = await fetchAndDelete(m => m.attachments.size > 0);
    } else if (sub === 'images') {
      count = await fetchAndDelete(m => m.attachments.size > 0 && m.attachments.some(a => a.contentType?.startsWith('image/')));
    } else if (sub === 'contains') {
      const text = interaction.options.getString('text', true).toLowerCase();
      count = await fetchAndDelete(m => m.content.toLowerCase().includes(text));
    } else if (sub === 'reactions') {
      const target = interaction.options.getUser('user');
      const fetched = await interaction.channel.messages.fetch({ limit: 50 });
      for (const msg of fetched.values()) {
        if (target) {
          for (const reaction of msg.reactions.cache.values()) {
            const users = await reaction.users.fetch();
            if (users.has(target.id)) {
              await reaction.users.remove(target.id).catch(() => {});
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
      await interaction.editReply(`${emojis.success} Cleared reactions from ${count} messages.`);
      return;
    }

    await interaction.editReply(`${emojis.success} Deleted ${count} messages.`);
    setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
  } catch (err) {
    await interaction.editReply(`${emojis.error} Failed to delete messages.`);
  }
}
