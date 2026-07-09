import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const target = join(import.meta.dir, '..', 'node_modules', 'riffy', 'build', 'structures', 'Player.js');

if (!existsSync(target)) {
  console.log('[PATCH] riffy Player.js not found, skipping');
  process.exit(0);
}

let content = readFileSync(target, 'utf-8');

// ── Patch 1: Unknown Lavalink v4 events ──
if (!content.includes('PAT01')) {
  const patchEvents = `
            // PAT01: Suppress unknown Lavalink v4 events
            case "PlayerCreatedEvent":
            case "PlayerConnectedEvent":
            case "PlayerDestroyedEvent":
            case "PlayerDisconnectedEvent":
            case "VolumeChangedEvent":
            case "FiltersChangedEvent":
            case "TrackUpdateEvent":
            case "QueueEvent":
                this.riffy.emit("debug", \`[Player \${this.guildId}] Ignored event: \${payload.type}\`);
                break;

`;

  const searchEvents = `            default:
                const error = new Error(\`Node encountered an unknown event: '\${payload.type}'\`);
                this.riffy.emit("nodeError", this, error);
                break;`;

  if (content.includes(searchEvents)) {
    content = content.replace(searchEvents, patchEvents + searchEvents);
    console.log('[PATCH] Applied Lavalink v4 event suppression');
  } else {
    console.log('[PATCH] WARN: Could not locate event switch default case');
  }
} else {
  console.log('[PATCH] Lavalink v4 event patch already applied');
}

// ── Patch 2: trackEnd calls play() with empty queue after loadfailed/cleanup ──
if (!content.includes('PAT02')) {
  const oldTrackEnd = `        if (["loadfailed", "cleanup"].includes(payload.reason.replace("_", "").toLowerCase())) {
            if (player.queue.length === 0) {
                this.playing = false;
                this.riffy.emit("debug", \`Player (\${player.guildId}) Track-Ended(\${track.info.title}) with reason: \${payload.reason}, emitting queueEnd instead of trackEnd as queue is empty/finished\`);
            }

            this.riffy.emit("trackEnd", player, track, payload);
            return player.play();
        }`;

  const newTrackEnd = `        if (["loadfailed", "cleanup"].includes(payload.reason.replace("_", "").toLowerCase())) {
            this.riffy.emit("trackEnd", player, track, payload);

            // PAT02: Actually emit queueEnd instead of calling play() on empty queue
            if (player.queue.length === 0) {
                this.playing = false;
                this.riffy.emit("debug", \`[Player \${this.guildId}] Track-Ended(\${track.info.title}) with reason: \${payload.reason}, queue empty — emitting queueEnd\`);
                return this.riffy.emit("queueEnd", player);
            }

            return player.play();
        }`;

  if (content.includes(oldTrackEnd)) {
    content = content.replace(oldTrackEnd, newTrackEnd);
    console.log('[PATCH] Fixed trackEnd — now emits queueEnd instead of play() on empty queue');
  } else {
    console.log('[PATCH] WARN: Could not locate trackEnd loadfailed/cleanup block');
  }
} else {
  console.log('[PATCH] trackEnd patch already applied');
}

// ── Patch 3: play() emits queueEnd instead of throwing on empty queue ──
if (!content.includes('PAT03')) {
  const oldPlayCheck = `        if (!this.queue.length) throw new Error(\`Unable to play for Player with Guild Id \${this.guildId}, Queue is empty (length: \${this.queue.length})!\`);`;

  const newPlayCheck = `        // PAT03: Emit queueEnd instead of throwing — prevents crashes from stale/internal calls
        if (!this.queue.length) {
            this.playing = false;
            this.riffy.emit("debug", \`[Player \${this.guildId}] play() called with empty queue — emitting queueEnd\`);
            this.riffy.emit("queueEnd", this);
            return this;
        }`;

  if (content.includes(oldPlayCheck)) {
    content = content.replace(oldPlayCheck, newPlayCheck);
    console.log('[PATCH] Fixed play() — emits queueEnd instead of throwing on empty queue');
  } else {
    console.log('[PATCH] WARN: Could not locate play() empty queue check');
  }
} else {
  console.log('[PATCH] play() patch already applied');
}

writeFileSync(target, content, 'utf-8');
console.log('[PATCH] Done');
