---
name: Custom SQL-over-Mongo run() params
description: Calling convention pitfall in hand-rolled SQL-emulation-over-MongoDB layers (database/index.js style) where .run() takes an array but .query().get()/.all() take rest args.
---

In codebases with a custom SQL-emulation layer over MongoDB (e.g. `database/index.js` implementing `run(sql, params)` and `query(sql).get(...params)/.all(...params)`), the two APIs commonly have **different calling conventions**:

- `.query(sql).get(...params)` / `.all(...params)` — take variadic/rest scalar arguments.
- `.run(sql, params)` — takes a single **array** as the second argument.

**Why:** If `.run()` internally does `const bound = [...params]` and a caller passes a bare string/number instead of an array, `[...params]` silently spreads a string into individual characters (or throws on a number), corrupting the bound values used for INSERT/UPDATE/DELETE — with no error thrown, just wrong data (e.g. only the first character of a Discord snowflake ID gets stored/matched).

**How to apply:** When adding or auditing any `.run(...)` call in such a codebase, always wrap parameters in `[...]`, even for a single value: `db.run('DELETE FROM t WHERE id = ?', [id])`. Grep for `\.run\('[^']*',\s*[a-zA-Z]` (scalar arg immediately after the SQL string, no leading `[`) to find violations — this pattern found ~20 broken call sites across a real codebase, causing features like "no-prefix mode" allowlists to silently fail.
