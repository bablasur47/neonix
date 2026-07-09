---
name: Riffy (Lavalink client) node-level vs Riffy-level options
description: Where to put reconnect/resume settings when configuring the Riffy Lavalink client for discord.js, and the self-healing pattern for permanently-destroyed nodes.
---

Riffy's `Node` constructor signature is `new Node(riffy, nodeConfig, riffyOptions)`. Settings like `reconnectTries`, `reconnectTimeout`, `resumeKey`, and `resumeTimeout` are read from `riffyOptions` (the **third**, Riffy-wide options object passed to `new Riffy(client, nodes, options)`), NOT from the per-node config objects in the `nodes` array.

**Why:** Setting `reconnectTries: Infinity` on each individual node config object (as one might reasonably do to configure per-node behavior) is silently ignored — Riffy always reads these fields off the shared/global options object. This caused a "no nodes available" bug: after the default `reconnectTries = 3` was exhausted, `Node.reconnect()` calls `this.destroy(true)`, which permanently deletes the node from `riffy.nodeMap` with no automatic re-add, even after the Lavalink server comes back online.

**How to apply:** Put `reconnectTries`, `reconnectTimeout`, `resumeKey`, `resumeTimeout` in the options object passed as the 3rd arg to `new Riffy(...)`, not spread into individual node configs. Additionally, as a safety net, listen for the `nodeDestroy` event and re-add the node later via `riffy.createNode(originalNodeConfig)` (e.g. after a delay) in case a node is ever destroyed by any code path.
