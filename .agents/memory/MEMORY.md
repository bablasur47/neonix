# Memory Index

- [Custom SQL-over-Mongo run() params](sql-emulation-run-params.md) — `.run(sql, params)` requires params as an array; passing scalars silently corrupts data via string-spread.
- [Riffy node-level vs Riffy-level options](riffy-options-scope.md) — reconnect/resume settings must go on the Riffy constructor's global options object, not per-node config.
