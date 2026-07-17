import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } from 'discord.js';
import emojis from '../../../util/emoji.js';

export const name = 'help';
export const description = 'Show all commands.';
export const aliases = ['h', 'commands'];

const CATEGORY_EMOJI = {
  general: emojis.info,
  moderation: emojis.warning,
  automod: emojis.search,
  music: emojis.music,
  voice: emojis.volume,
  giveaways: emojis.gift,
  extra: emojis.queue,
  fun: emojis.info,
  memes: '😂',
  social: emojis.info,
  starboard: emojis.star,
  modmail: emojis.modmail,
  owner: emojis.join,
  voicemaster: emojis.voicemaster,
};

const CATEGORY_LABELS = {
  general: 'General',
  moderation: 'Moderation',
  automod: 'AutoMod',
  music: 'Music',
  voice: 'Voice',
  giveaways: 'Giveaways',
  extra: 'Extra',
  fun: 'Fun',
  memes: 'Memes',
  social: 'Social',
  starboard: 'Starboard',
  modmail: 'Modmail',
  owner: 'Owner',
  voicemaster: 'VoiceMaster',
};

const USAGE_NOTE = '```r\n<> = required\n[ ] = optional\n```';

const CATEGORY_ORDER = ['general', 'moderation', 'automod', 'music', 'voice', 'voicemaster', 'giveaways', 'extra', 'fun', 'memes', 'social', 'starboard', 'modmail', 'owner'];

export async function execute(message, args) {
  const cmds = message.client.prefixCommands;
  const slashCmds = message.client.slashCommands;
  const catMap = message.client.commandCategories || new Map();
  const prefix = await getPrefix(message);
  const arg = args[0]?.toLowerCase();

  const categories = new Map();
  const seen = new Set();

  for (const [name, cmd] of cmds) {
    if (name === 'help' || seen.has(cmd)) continue;
    seen.add(cmd);
    const cat = (message.client.prefixCategories?.get(name) || catMap.get(name) || 'general').split('/')[0];
    if (!categories.has(cat)) categories.set(cat, { prefix: [], slash: [] });
    categories.get(cat).prefix.push(name);
  }

  for (const [name, cmd] of slashCmds) {
    const cat = (catMap.get(name) || 'general').split('/')[0];
    if (!categories.has(cat)) categories.set(cat, { prefix: [], slash: [] });
    categories.get(cat).slash.push(name);
  }

  const catNames = [...categories.keys()].sort((a, b) => {
    const o1 = CATEGORY_ORDER.indexOf(a);
    const o2 = CATEGORY_ORDER.indexOf(b);
    return (o1 === -1 ? 999 : o1) - (o2 === -1 ? 999 : o2);
  });

  const total = [...categories.values()].reduce((s, c) => s + c.prefix.length + c.slash.length, 0);

  if (arg) {
    const catKey = catNames.find(c => c === arg || (CATEGORY_LABELS[c]?.toLowerCase().includes(arg)));
    if (catKey) {
      const group = categories.get(catKey);
      const lines = [];
      if (group.prefix.length) lines.push(`**Prefix**\`\`\`${group.prefix.sort().join(', ')}\`\`\``);
      if (group.slash.length) lines.push(`**Slash**\`\`\`/${group.slash.sort().join(', /')}\`\`\``);
      const embed = new EmbedBuilder()
        .setTitle(`${CATEGORY_EMOJI[catKey] || ''} ${CATEGORY_LABELS[catKey] || catKey} — ${group.prefix.length + group.slash.length} commands`)
        .setDescription(`${USAGE_NOTE}\n${lines.join('\n')}`)
        .setColor(0x2B2D31)
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter({ text: `Prefix: ${prefix}  •  Use ${prefix}help <command> for details` })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }

    const cmd = cmds.get(arg) || slashCmds.get(arg);
    if (cmd) {
      const isSlash = slashCmds.has(arg);
      const parts = [`Name: ${arg}`];
      if (cmd.description) parts.push(`Description: ${cmd.description}`);
      if (!isSlash && cmd.aliases?.length) parts.push(`Aliases: ${cmd.aliases.map(a => `\`${a}\``).join(', ')}`);
      const cat = !isSlash
        ? (message.client.prefixCategories?.get(arg) || catMap.get(arg) || 'general').split('/')[0]
        : (catMap.get(arg) || 'general').split('/')[0];
      parts.push(`Category: ${CATEGORY_LABELS[cat] || 'General'}`);
      parts.push(`Usage: \`${isSlash ? '/' : prefix}${cmd.usage || arg}\``);

      const embed = new EmbedBuilder()
        .setDescription(`${USAGE_NOTE}\n\`\`\`${parts.join('\n')}\`\`\``)
        .setColor(0x2B2D31)
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter({ text: `Prefix: ${prefix}` })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      return;
    }

    await message.reply(`Command or category \`${arg}\` not found.`);
    return;
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('help_category')
    .setPlaceholder('Select a category...')
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Home')
        .setDescription(`All categories — ${total} total commands`)
        .setValue('home'),
      ...catNames.map(cat => {
        const option = new StringSelectMenuOptionBuilder()
          .setLabel(CATEGORY_LABELS[cat] || cat)
          .setDescription(`${categories.get(cat).prefix.length + categories.get(cat).slash.length} commands`)
          .setValue(cat);
        const emoji = CATEGORY_EMOJI[cat];
        if (emoji) option.setEmoji(emoji);
        return option;
      })
    );

  const { author } = message;
  let embed = buildHomeEmbed(categories, catNames, total, prefix, author);
  const msg = await message.reply({
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(selectMenu)],
  });

  const filter = i => i.user.id === message.author.id;
  const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

  collector.on('collect', async (i) => {
    if (i.customId !== 'help_category') return;
    const value = i.values[0];

    if (value === 'home') {
      embed = buildHomeEmbed(categories, catNames, total, prefix, author);
    } else {
      const group = categories.get(value);
      const lines = [];
      if (group.prefix.length) lines.push(`**Prefix**\`\`\`${group.prefix.sort().join(', ')}\`\`\``);
      if (group.slash.length) lines.push(`**Slash**\`\`\`/${group.slash.sort().join(', /')}\`\`\``);
      embed = new EmbedBuilder()
        .setTitle(`${CATEGORY_EMOJI[value] || ''} ${CATEGORY_LABELS[value] || value} — ${group.prefix.length + group.slash.length} commands`)
        .setDescription(`${USAGE_NOTE}\n${lines.join('\n')}`)
        .setColor(0x2B2D31)
        .setAuthor({ name: author.tag, iconURL: author.displayAvatarURL() })
        .setThumbnail(author.displayAvatarURL())
        .setFooter({ text: `Prefix: ${prefix}  •  Use ${prefix}help <command> for details` })
        .setTimestamp();
    }

    await i.update({ embeds: [embed] });
  });

  collector.on('end', async () => {
    await msg.edit({ components: [] }).catch(() => {});
  });
}

function buildHomeEmbed(categories, catNames, total, prefix, author) {
  const lines = catNames.map(cat => {
    const group = categories.get(cat);
    const count = group.prefix.length + group.slash.length;
    return `${CATEGORY_EMOJI[cat] || ''} ${CATEGORY_LABELS[cat] || cat}  —  ${count} commands`;
  });

  return new EmbedBuilder()
    .setTitle('Help Menu')
    .setDescription(
      lines.join('\n') +
      `\n\nUse \`${prefix}help <category>\` to view commands in a category.\n` +
      `Use \`${prefix}help <command>\` for details on a specific command.\n` +
      `${USAGE_NOTE}`
    )
    .setColor(0x2B2D31)
    .setAuthor({ name: author.tag, iconURL: author.displayAvatarURL() })
    .setThumbnail(author.displayAvatarURL())
    .setFooter({ text: `${total} total commands  •  Prefix: ${prefix}` })
    .setTimestamp();
}

async function getPrefix(message) {
  const { getDb } = await import('../../../database/index.js');
  const config = await import('../../../util/config.js').then(m => m.default);
  const row = getDb('guilds').query('SELECT prefix FROM guild_config WHERE guild_id = ?').get(message.guild.id);
  return row?.prefix ?? config.initialPrefix;
}
