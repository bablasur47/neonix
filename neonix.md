# Neonix - Discord Bot Context & Architecture

**Version:** 1.0.0  
**Framework:** discord.js v14  
**Runtime:** Bun (Fast Node.js alternative)  
**Database:** SQLite (WAL mode)  
**Last Updated:** May 14, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Architecture & Core Systems](#architecture--core-systems)
4. [Database Schema](#database-schema)
5. [Feature Modules](#feature-modules)
6. [Command System](#command-system)
7. [Event System](#event-system)
8. [Utility Functions](#utility-functions)
9. [Configuration](#configuration)
10. [Recent Updates](#recent-updates)

---

## Overview

**Neonix** is a comprehensive Discord bot built with discord.js v14 and running on Bun runtime. It provides a wide range of features including:

- **Music Streaming** (via Riffy/Lavalink)
- **Giveaway Management** (button-based)
- **Automod System** (keyword, spam, mention, link, invite filters)
- **Modmail Ticketing** (ticket-based support system)
- **Starboard** (message popularity tracking)
- **Moderation Tools** (warnings, kicks, bans)
- **Social Features** (AFK status, social commands)
- **Extra Features** (auto-responder, invite role assignment, no-prefix mode)
- **Fun Commands** (games, entertainment)

### Key Features

- **Multi-Shard Support** - Handles large guilds efficiently
- **Multiple Database Instances** - Organized data storage by feature
- **Permission System** - Role-based access control
- **Event-Driven Architecture** - Clean event handlers
- **Comprehensive Logging** - Webhook-based event logging

---

## Project Structure

```
neonix/
├── index.js                    # Main bot entry point
├── package.json               # Dependencies and scripts
├── config.json                # Guild-specific configurations
├── .env                       # Environment variables (not tracked)
│
├── commands/
│   ├── prefix/               # Prefix-based commands (e.g., !command)
│   │   ├── general/          # General commands (help, stats, etc)
│   │   ├── giveaways/        # Giveaway commands (gstart, gend, etc)
│   │   ├── moderation/       # Mod commands (warn, kick, ban)
│   │   ├── music/            # Music player commands
│   │   ├── modmail/          # Ticket/modmail commands
│   │   ├── automod/          # Automod configuration
│   │   ├── starboard/        # Starboard configuration
│   │   ├── social/           # Social commands
│   │   ├── extra/            # Extra features
│   │   ├── fun/              # Fun/entertainment
│   │   ├── voice/            # Voice channel commands
│   │   └── owner/            # Owner-only commands
│   │
│   └── slash/                # Slash commands (/)
│       ├── general/
│       └── [other categories]/
│
├── events/
│   ├── client/               # Client-level events
│   │   └── ready.js         # Bot ready event + initialization
│   ├── guild/               # Guild-level events
│   │   ├── guildCreate.js  # New guild joined
│   │   └── modmailInteraction.js  # Modmail interactions
│   ├── message/             # Message events
│   │   ├── automodMessageCreate.js  # Message filtering
│   │   └── starboardReactionAdd.js  # Message popularity
│   ├── interaction/         # Button/select interactions
│   │   └── giveawayButtonClick.js  # Giveaway entries
│   └── [other event categories]/
│
├── database/                 # SQLite database files
│   ├── guilds.db            # Guild configuration
│   ├── giveaways.db         # Giveaway data
│   ├── modmail.db           # Modmail tickets
│   ├── automod.db           # Automod rules
│   ├── starboard.db         # Starboard config
│   ├── music.db             # Music playlists
│   ├── moderation.db        # Warn/mod logs
│   ├── afk.db               # AFK status
│   ├── media.db             # Media restrictions
│   ├── extra.db             # Extra features
│   ├── noprefix.db          # No-prefix users
│   └── playlists.db         # User playlists
│
├── util/
│   ├── config.js            # Bot configuration (env vars)
│   ├── emoji.js             # Emoji constants
│   ├── components.js        # Message/embed builders
│   ├── logger.js            # Webhook logging
│   ├── permissions.js       # Permission checks
│   ├── riffy.js             # Music player setup
│   ├── shard.js             # Sharding manager
│   ├── guildMember.js       # Member utilities
│   └── fetchmeta.js         # Metadata fetching
│
└── plugins/                  # Plugin system (if any)
```

---

## Architecture & Core Systems

### 1. Bot Initialization (index.js)

The main entry point handles:

```javascript
// Core responsibilities:
1. Load all prefix and slash commands
2. Load all event handlers
3. Register slash commands globally
4. Initialize music system (Riffy)
5. Login to Discord
```

**Key Functions:**
- `loadCommands(client)` - Recursively loads all commands from directories
- `loadEvents(client)` - Loads all event handlers
- `registerSlashCommands(client)` - Registers slash commands via REST API

### 2. Event System

Events are organized in categories and automatically loaded:

**Structure:**
- Each event file exports: `name`, `execute()` function
- Optional `once` property for one-time events
- Events pass `client` as final parameter

**Key Events:**
- `ClientReady` - Database initialization, music setup, giveaway loop
- `MessageCreate` - Automod filtering, prefix command handling
- `InteractionCreate` - Slash commands, buttons, modals
- `GuildCreate` - Log new guild joins

### 3. Command System

**Prefix Commands:**
- Pattern: `!command arg1 arg2`
- Files export: `name`, `description`, `usage`, `aliases`, `execute(message, args)`
- Prefix configurable per guild (default: `!`)

**Slash Commands:**
- Pattern: `/command option1:value1`
- Uses discord.js `SlashCommandBuilder`
- Registered globally for all guilds

**Permission System:**
- `canModerate(member)` - Checks mod/admin roles
- `canBan(member)` - Checks ban permissions
- Owner-only checks for sensitive commands

---

## Database Schema

Neonix uses **12 SQLite databases**, organized by feature:

### giveaways.db

```sql
-- Giveaway events
CREATE TABLE giveaways (
  id INTEGER PRIMARY KEY,
  guild_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  message_id TEXT NOT NULL UNIQUE,
  prize TEXT NOT NULL,
  winners INTEGER DEFAULT 1,
  ends_at TEXT NOT NULL,
  host_id TEXT NOT NULL,
  ended INTEGER DEFAULT 0,
  required_role TEXT,
  bypass_role TEXT,
  image_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Giveaway entries (button-based)
CREATE TABLE giveaway_entries (
  id INTEGER PRIMARY KEY,
  message_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  entered_at TEXT DEFAULT (datetime('now')),
  UNIQUE(message_id, user_id)
);
```

**Features:**
- Button-based entry system (more secure than reactions)
- Role-based requirements (required_role, bypass_role)
- Custom giveaway prizes with image support
- Automatic winner selection on expiry

### automod.db

```sql
-- Automod rules (keyword, spam, mention, link, invite filters)
CREATE TABLE automod_rules (
  id INTEGER PRIMARY KEY,
  guild_id TEXT NOT NULL,
  rule_type TEXT NOT NULL,  -- 'keyword', 'spam', 'mention', 'link', 'invite'
  rule_name TEXT NOT NULL,
  content TEXT,
  enabled INTEGER DEFAULT 1,
  custom_message TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- User/role exceptions
CREATE TABLE automod_rule_exceptions (
  guild_id TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'role',  -- 'role' or 'user'
  PRIMARY KEY (guild_id, rule_type, target_id)
);

-- Link whitelist
CREATE TABLE automod_link_whitelist (
  guild_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  UNIQUE(guild_id, domain)
);

-- Link bypass roles
CREATE TABLE automod_link_bypass_roles (
  guild_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  PRIMARY KEY (guild_id, role_id)
);
```

### modmail.db

```sql
-- Modmail configuration per guild
CREATE TABLE modmail_config (
  guild_id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,      -- Response channel
  log_channel_id TEXT NOT NULL,  -- Logging channel
  created_at TEXT DEFAULT (datetime('now'))
);

-- Staff roles for modmail
CREATE TABLE modmail_roles (
  guild_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  PRIMARY KEY (guild_id, role_id)
);

-- Modmail tickets
CREATE TABLE modmail_tickets (
  id INTEGER PRIMARY KEY,
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  thread_id TEXT,  -- Private thread for conversation
  status TEXT DEFAULT 'open',  -- 'open', 'closed', 'solved', 'dismissed'
  message TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Blocked users/roles
CREATE TABLE modmail_blocked (
  guild_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  type TEXT DEFAULT 'user',  -- 'user' or 'role'
  PRIMARY KEY (guild_id, target_id)
);
```

### starboard.db

```sql
-- Starboard configuration
CREATE TABLE starboard_config (
  guild_id TEXT PRIMARY KEY,
  channel_id TEXT,
  emoji TEXT DEFAULT '⭐',
  threshold INTEGER DEFAULT 3,     -- Reactions needed to post
  color TEXT DEFAULT '#FFD700',
  self_star INTEGER DEFAULT 0,    -- Can authors star own messages?
  jump_url INTEGER DEFAULT 1,     -- Include jump URL?
  timestamp INTEGER DEFAULT 1,    -- Include timestamp?
  attachments INTEGER DEFAULT 1,  -- Include attachments?
  locked INTEGER DEFAULT 0
);

-- Tracked messages
CREATE TABLE starboard_messages (
  guild_id TEXT NOT NULL,
  original_msg_id TEXT NOT NULL,
  starboard_msg_id TEXT,
  channel_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  star_count INTEGER DEFAULT 0,
  PRIMARY KEY (guild_id, original_msg_id)
);

-- Ignored channels
CREATE TABLE starboard_ignored (
  guild_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  PRIMARY KEY (guild_id, channel_id)
);
```

### moderation.db

```sql
-- Mod-only roles
CREATE TABLE guild_roles (
  guild_id TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'mod', 'admin'
  role_id TEXT NOT NULL,
  PRIMARY KEY (guild_id, type, role_id)
);

-- Warn logs
CREATE TABLE warns (
  id INTEGER PRIMARY KEY,
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  moderator_id TEXT NOT NULL,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### Other Databases

- **guilds.db** - Guild config (prefix, volume)
- **music.db** - Favorites, playlists
- **afk.db** - AFK status per user
- **media.db** - Media channels, bypass roles
- **extra.db** - Auto-responders, invite roles
- **noprefix.db** - Users with no-prefix mode
- **playlists.db** - User playlists

---

## Feature Modules

### 1. Giveaway System (Button-Based)

**Security Improvements over Reactions:**
- Users can't spam multiple reactions
- Clear entry/exit flow via buttons
- Database tracking for audit trail
- Role-based access control

**Commands:**
- `gstart <duration> [winners] <prize> [--reqr @role] [--byp @role]` - Start giveaway
- `gend <message_id>` - End early and pick winners
- `greroll <message_id>` - Re-select winners
- `glist` - Show active giveaways

**Database Operations:**
- Inserts entry when button clicked
- Deduplicates entries (unique constraint)
- Cleans up entries on giveaway end

### 2. Automod System

**Filters:**
1. **Keyword Filter** - JSON array of forbidden words
2. **Spam Filter** - Detects character repetition (`aaaa...`)
3. **Mention Filter** - Limits mentions per message
4. **Link Filter** - Blocks external URLs with whitelist
5. **Invite Filter** - Blocks Discord invites

**Exception System:**
- Per-rule role/user exceptions
- Link bypass roles
- Global whitelist bypass

### 3. Modmail System

**Flow:**
1. User clicks "Open Modmail" button
2. Modal for issue description
3. Private thread created
4. Staff responds in thread
5. User DM'd updates

**Statuses:**
- `open` - Awaiting response
- `solved` - Issue resolved
- `dismissed` - Rejected
- `closed` - Thread ended

### 4. Starboard System

**Features:**
- Configurable emoji (default: ⭐)
- Reaction threshold to post
- Ignore specific channels
- Optional self-starring
- Auto-update count

**Configuration:**
```
!starboard config emoji 🌟
!starboard config threshold 5
!starboard config channel #starboard
!starboard ignore #spam
```

### 5. Music System (via Riffy + Lavalink)

**Integration:**
- Riffy client for Lavalink connection
- Queue management
- Playlist support
- Favorite tracks

**Lavalink Configuration:**
- Default: `lavalink.jirayu.net:13592`
- Configurable via env vars
- Supports multiple nodes

---

## Command System

### Prefix Commands Structure

Each prefix command file exports:

```javascript
export const name = 'commandname';
export const description = 'What it does';
export const usage = '!commandname <args>';
export const aliases = ['cmd'];  // Optional

export async function execute(message, args) {
  // Command logic
}
```

### Slash Commands Structure

```javascript
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('commandname')
  .setDescription('What it does')
  .addStringOption(option =>
    option.setName('arg')
      .setDescription('Argument')
      .setRequired(true)
  );

export async function execute(interaction) {
  await interaction.reply('Response');
}
```

### Available Command Categories

| Category | Purpose | Prefix | Slash |
|----------|---------|--------|-------|
| general | Help, stats, info | ✓ | ✓ |
| giveaways | Giveaway management | ✓ | ✗ |
| moderation | Warnings, kicks, bans | ✓ | ✓ |
| music | Music player control | ✓ | ✓ |
| modmail | Ticket system | ✓ | ✗ |
| automod | Filter configuration | ✓ | ✗ |
| starboard | Starboard config | ✓ | ✗ |
| social | AFK, social features | ✓ | ✓ |
| extra | Responder, roles | ✓ | ✗ |
| fun | Games, entertainment | ✓ | ✓ |
| voice | Voice channel tools | ✓ | ✗ |
| owner | Owner-only tools | ✓ | ✗ |

---

## Event System

### Event Organization

Events are automatically discovered from directories:

```
events/
├── client/     # ClientReady, ClientError
├── guild/      # GuildCreate, GuildDelete, GuildUpdate
├── message/    # MessageCreate, MessageUpdate
└── interaction/ # InteractionCreate, ButtonClick, etc
```

### Event Handler Template

```javascript
import { Events } from 'discord.js';

export const name = Events.MessageCreate;
export const once = false;  // true = one-time event

export async function execute(message, client) {
  // Event logic
}
```

### Key Events

| Event | Location | Purpose |
|-------|----------|---------|
| ClientReady | client/ready.js | Database init, loops |
| MessageCreate | message/automodMessageCreate.js | Filtering, commands |
| InteractionCreate | guild/modmailInteraction.js | Buttons, modals |
| MessageReactionAdd | message/starboardReactionAdd.js | Track starboard |
| InteractionCreate | interaction/giveawayButtonClick.js | Giveaway entries |

---

## Utility Functions

### Permission System (util/permissions.js)

```javascript
canModerate(member)      // Has mod/admin role?
canBan(member)          // Can ban users?
canKick(member)         // Can kick users?
```

### Components (util/components.js)

```javascript
reply(message, content)  // Safe message reply
```

### Logger (util/logger.js)

```javascript
sendLog(embeds)         // Webhook logging
makeEmbed(options)      // Create embeds
```

### Emoji (util/emoji.js)

```javascript
emojis.success   // ✅
emojis.error     // ❌
emojis.warning   // ⚠️
emojis.info      // ℹ️
```

---

## Configuration

### Environment Variables (.env)

```env
# Discord
TOKEN=your_bot_token
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
OWNER_ID=your_user_id

# Bot Settings
INITIAL_PREFIX=!

# Logging
WEBHOOK_URL=your_webhook_url

# Lavalink (Music)
LAVALINK_HOST=lavalink.jirayu.net
LAVALINK_PORT=13592
LAVALINK_PASSWORD=youshallnotpass
LAVALINK_SECURE=false

# Emoji (Optional)
EMOJI_ERROR=❌
```

### Guild Configuration (config.json)

```json
{
  "guild_id": {
    "prefix": "!",
    "volume": 50
  }
}
```

---

## Recent Updates

### May 14, 2026 - Giveaway System Upgrade

**Changes:**
1. ✅ **Converted from reaction-based to button-based** for improved security
   - Prevents reaction spam/manipulation
   - Clear entry/exit flow
   - Better audit trail

2. ✅ **Fixed critical bugs:**
   - starboardReactionAdd.js: `db.exec()` → `db.run()` (lines 47, 56, 60, 73)
   - guildCreate.js: Added `await` to `createInvite()` promise
   - automodMessageCreate.js: Fixed role cache access (`.cache.has()` → `.has()`)
   - modmailInteraction.js: Wrapped parameters in arrays for `db.run()`
   - Removed duplicate `ready.js` event handler

3. ✅ **Improved giveaway logic:**
   - Fixed bypass role + required role combination
   - Better role permission handling
   - Cleaner entry validation

**New Table:**
```sql
CREATE TABLE giveaway_entries (
  id INTEGER PRIMARY KEY,
  message_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  entered_at TEXT DEFAULT (datetime('now')),
  UNIQUE(message_id, user_id)
);
```

**New Event Handler:**
- `events/interaction/giveawayButtonClick.js` - Handles button clicks

**Updated Files:**
- `commands/prefix/giveaways/gstart.js` - Button UI
- `commands/prefix/giveaways/gend.js` - Database entries
- `commands/prefix/giveaways/greroll.js` - Database entries
- `events/client/ready.js` - Giveaway loop + table init
- `events/guild/modmailInteraction.js` - Parameter fixes

---

## Development Guidelines

### Adding New Commands

1. Create file in `commands/prefix/category/` or `commands/slash/category/`
2. Export: `name`, `description`, `usage`, `execute()`
3. Use utilities: `reply()`, `makeEmbed()`, permission checks
4. Test with actual Discord bot

### Adding New Events

1. Create file in `events/category/`
2. Export: `name`, optional `once`, `execute()`
3. Use discord.js `Events` constants
4. Handlers automatically loaded on bot start

### Database Operations

```javascript
import { getDb } from '../../database/index.js';

const db = getDb('giveaways');

// Query (read)
db.query('SELECT * FROM table WHERE id = ?').get(id);
db.query('SELECT * FROM table').all();

// Run (write)
db.run('INSERT INTO table VALUES (?, ?)', [val1, val2]);
db.run('UPDATE table SET col = ? WHERE id = ?', [newVal, id]);
db.run('DELETE FROM table WHERE id = ?', [id]);
```

### Permission Checks

```javascript
import { canModerate } from '../../../util/permissions.js';

if (!canModerate(message.member)) {
  return reply(message, '❌ You lack permissions');
}
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Bot not responding to commands | Check bot has `Send Messages` permission |
| Database errors | Ensure `.db` files exist in `database/` folder |
| Music not playing | Check Lavalink connection status |
| Slash commands not showing | Run `/update-commands` or restart bot |
| Giveaway button not working | Ensure `giveaway_entries` table exists |

### Logs & Debugging

- Check console for `[READY]`, `[EVENT]`, `[LOAD]` logs
- Webhook logs available at webhook URL
- Database files in `database/` folder

---

## Support & Contact

- **Repository:** Discord Bot - Neonix
- **Author:** Suraj Kumar
- **Runtime:** Bun (for speed and efficiency)
- **Framework:** discord.js v14

---

**This documentation reflects the bot state as of May 14, 2026 with the latest giveaway system upgrade and critical bug fixes applied.**
