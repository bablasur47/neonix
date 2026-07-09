import { getDb } from '../database/index.js';

export function initTables() {}

export function getAppConfig(guildId) {
  const db = getDb('applications');
  return db.query('SELECT * FROM mod_app_config WHERE guild_id = ?').get(guildId);
}

export function upsertAppConfig(guildId, data) {
  const db = getDb('applications');
  db.run(
    `INSERT OR REPLACE INTO mod_app_config (guild_id, enabled, questions) VALUES (?, ?, ?)`,
    [guildId, data.enabled ?? 0, JSON.stringify(data.questions ?? [])]
  );
}

export function toggleAppEnabled(guildId) {
  const db = getDb('applications');
  const row = db.query('SELECT enabled FROM mod_app_config WHERE guild_id = ?').get(guildId);
  const current = row?.enabled ?? 0;
  const next = current ? 0 : 1;
  db.run(
    `INSERT OR REPLACE INTO mod_app_config (guild_id, enabled, questions) VALUES (?, ?, ?)`,
    [guildId, next, row?.questions || '[]']
  );
  return next;
}

export function setAppQuestions(guildId, questions) {
  const db = getDb('applications');
  const json = JSON.stringify(questions);
  const row = db.query('SELECT guild_id FROM mod_app_config WHERE guild_id = ?').get(guildId);
  if (row) {
    db.run('UPDATE mod_app_config SET questions = ? WHERE guild_id = ?', [json, guildId]);
  } else {
    db.run('INSERT INTO mod_app_config (guild_id, questions) VALUES (?, ?)', [guildId, json]);
  }
}

export function getSubmissions(guildId) {
  const db = getDb('applications');
  return db.query('SELECT * FROM mod_app_submissions WHERE guild_id = ? ORDER BY created_at DESC').all(guildId);
}

export function getUserSubmission(guildId, userId) {
  const db = getDb('applications');
  return db.query("SELECT * FROM mod_app_submissions WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1").get(guildId, userId);
}

export function addSubmission(guildId, userId, answers) {
  const db = getDb('applications');
  db.run('INSERT INTO mod_app_submissions (guild_id, user_id, answers) VALUES (?, ?, ?)',
    [guildId, userId, JSON.stringify(answers)]);
}

export function clearSubmissions(guildId) {
  const db = getDb('applications');
  db.run('DELETE FROM mod_app_submissions WHERE guild_id = ?', [guildId]);
}

export function reviewSubmission(subId, status, reviewerId) {
  const db = getDb('applications');
  db.run('UPDATE mod_app_submissions SET status = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?',
    [status, reviewerId, 'now', subId]);
  return db.query('SELECT * FROM mod_app_submissions WHERE id = ?').get(subId);
}
