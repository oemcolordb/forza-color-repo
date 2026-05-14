/**
 * db.ts — shared libsql client
 *
 * Priority:
 *   1. TURSO_DATABASE_URL env var (cloud Turso instance)
 *   2. Local file-based SQLite  (file:./data/local.db)
 *
 * The local fallback means community tunes, saved tunes, and all DB-backed
 * features work out of the box in development with zero external services.
 */

import { createClient, type Client } from '@libsql/client'
import fs from 'fs'
import path from 'path'

function makeClient(): Client {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN || ''

  if (url && url !== 'your_turso_database_url_here' && url !== 'your_turso_database_url') {
    // Cloud Turso (or any remote libsql server)
    return createClient({ url, authToken: token })
  }

  // Local SQLite fallback — ensure the data directory exists
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

  return createClient({ url: 'file:./data/local.db' })
}

// Module-level singleton so the file handle is reused across requests
let _client: Client | null = null

export function getDb(): Client {
  if (!_client) _client = makeClient()
  return _client
}

// ─── Auto-migration ───────────────────────────────────────────────────────────
// Called once by any route on first use. Creates tables if they don't exist.
// Safe to call multiple times (all statements use IF NOT EXISTS).

let _migrated = false

export async function ensureTables(): Promise<void> {
  if (_migrated) return
  _migrated = true
  const db = getDb()

  await db.batch([
    `CREATE TABLE IF NOT EXISTS tunes (
      id           TEXT    PRIMARY KEY,
      name         TEXT    NOT NULL,
      car_make     TEXT    NOT NULL,
      car_model    TEXT    NOT NULL,
      tune_data    TEXT    NOT NULL,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS community_tunes (
      id           TEXT    PRIMARY KEY,
      car_make     TEXT    NOT NULL,
      car_model    TEXT    NOT NULL,
      tune_name    TEXT    NOT NULL,
      tuner_name   TEXT    NOT NULL DEFAULT 'Anonymous',
      share_code   TEXT,
      discipline   TEXT    NOT NULL DEFAULT 'General',
      pi_class     TEXT,
      pi_value     INTEGER,
      tune_data    TEXT    NOT NULL,
      votes        INTEGER NOT NULL DEFAULT 0,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS idx_community_tunes_car   ON community_tunes (car_make, car_model)`,
    `CREATE INDEX IF NOT EXISTS idx_community_tunes_votes ON community_tunes (votes DESC)`,
    `CREATE TABLE IF NOT EXISTS favorites (
      id           TEXT    PRIMARY KEY,
      car_id       TEXT    NOT NULL,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS color_analytics (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      color_id     TEXT    NOT NULL,
      action       TEXT    NOT NULL,
      user_id      TEXT,
      ip_hash      TEXT,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS aggregated_stats (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      type         TEXT    NOT NULL,
      data         TEXT    NOT NULL,
      updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS community_posts (
      id           TEXT    PRIMARY KEY,
      user_id      TEXT    NOT NULL,
      username     TEXT    NOT NULL,
      image_url    TEXT    NOT NULL,
      caption      TEXT,
      car_name     TEXT,
      tune_code    TEXT,
      likes        INTEGER DEFAULT 0,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS post_likes (
      post_id      TEXT    NOT NULL,
      user_id      TEXT    NOT NULL,
      PRIMARY KEY (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
    )`
  ], 'deferred')
}
