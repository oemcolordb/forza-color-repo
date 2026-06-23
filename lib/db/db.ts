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
  const url = process.env.TURSO_DATABASE_URL || process.env.j67j_TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN || process.env.j67j_TURSO_AUTH_TOKEN || ''

  if (url && url !== 'your_turso_database_url_here' && url !== 'your_turso_database_url') {
    // Cloud Turso (or any remote libsql server)
    return createClient({ url, authToken: token })
  }

  // Local SQLite fallback — ensure the data directory exists
  try {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
    return createClient({ url: 'file:./data/local.db' })
  } catch (error) {
    console.warn('Could not create local SQLite file. Falling back to in-memory database.', error)
    return createClient({ url: 'file::memory:?cache=shared' })
  }
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
    `CREATE TABLE IF NOT EXISTS users (
      id           TEXT    PRIMARY KEY,
      name         TEXT,
      email        TEXT    UNIQUE,
      image        TEXT,
      password     TEXT,
      discord_id   TEXT,
      discord_username TEXT,
      xbox_id      TEXT,
      xbox_gamertag TEXT,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS user_connections (
      id           TEXT    PRIMARY KEY,
      user_id      TEXT    NOT NULL,
      provider     TEXT    NOT NULL,
      provider_id  TEXT    NOT NULL,
      username     TEXT,
      email        TEXT,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, provider),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE INDEX IF NOT EXISTS idx_connections_user ON user_connections (user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_connections_provider ON user_connections (provider, provider_id)`,
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
      ip_address   TEXT,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS idx_community_tunes_car   ON community_tunes (car_make, car_model)`,
    `CREATE INDEX IF NOT EXISTS idx_community_tunes_votes ON community_tunes (votes DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_community_tunes_ip    ON community_tunes (ip_address)`,
    `CREATE TABLE IF NOT EXISTS favorites (
      id           TEXT    PRIMARY KEY,
      car_id       TEXT    NOT NULL,
      userId       TEXT,
      sessionId    TEXT,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS user_favorites (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId    TEXT    NOT NULL,
      userId       TEXT,
      favorites    TEXT    NOT NULL,
      lastSynced   DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address   TEXT,
      UNIQUE(sessionId)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_user_favorites_session ON user_favorites(sessionId)`,
    `CREATE INDEX IF NOT EXISTS idx_user_favorites_ip ON user_favorites(ip_address)`,
    `CREATE TABLE IF NOT EXISTS favorites_analytics (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      colorId      TEXT    NOT NULL,
      colorName    TEXT    NOT NULL,
      make         TEXT    NOT NULL,
      model        TEXT,
      colorType    TEXT,
      userId       TEXT,
      sessionId    TEXT    NOT NULL,
      action       TEXT    NOT NULL CHECK(action IN ('add', 'remove')),
      ip_address   TEXT,
      createdAt    DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS idx_favorites_color ON favorites_analytics(colorId)`,
    `CREATE INDEX IF NOT EXISTS idx_favorites_created ON favorites_analytics(createdAt DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_favorites_action ON favorites_analytics(action)`,
    `CREATE TABLE IF NOT EXISTS favorites_ranking (
      colorId      TEXT    PRIMARY KEY,
      colorName    TEXT    NOT NULL,
      make         TEXT    NOT NULL,
      model        TEXT,
      colorType    TEXT,
      totalFavorites INTEGER DEFAULT 0,
      currentFavorites INTEGER DEFAULT 0,
      lastUpdated  DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS idx_ranking_total ON favorites_ranking(totalFavorites DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_ranking_current ON favorites_ranking(currentFavorites DESC)`,
    `CREATE TABLE IF NOT EXISTS map_progress (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId    TEXT    NOT NULL,
      userId       TEXT,
      visitedLocations TEXT NOT NULL,
      favoriteLocations TEXT NOT NULL,
      activeFilters TEXT NOT NULL,
      lastViewedLocation TEXT,
      zoomLevel    REAL DEFAULT 1,
      lastUpdated  DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(sessionId)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_progress_session ON map_progress(sessionId)`,
    `CREATE INDEX IF NOT EXISTS idx_progress_user ON map_progress(userId)`,
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
    )`,
    `CREATE TABLE IF NOT EXISTS palettes (
      id           TEXT    PRIMARY KEY,
      name         TEXT    NOT NULL,
      description  TEXT,
      tags         TEXT,
      colors       TEXT    NOT NULL,
      authorId     TEXT,
      likes        INTEGER DEFAULT 0,
      isPublic     BOOLEAN DEFAULT 1,
      rating_avg   REAL DEFAULT 0.0,
      rating_count INTEGER DEFAULT 0,
      createdAt    DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS palette_likes (
      paletteId    TEXT    NOT NULL,
      sessionId    TEXT    NOT NULL,
      PRIMARY KEY (paletteId, sessionId),
      FOREIGN KEY (paletteId) REFERENCES palettes(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS palette_ratings (
      paletteId    TEXT    NOT NULL,
      sessionId    TEXT    NOT NULL,
      rating       INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (paletteId, sessionId),
      FOREIGN KEY (paletteId) REFERENCES palettes(id) ON DELETE CASCADE
    )`,
    `CREATE INDEX IF NOT EXISTS idx_palettes_created ON palettes(createdAt DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_palettes_likes ON palettes(likes DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_palettes_rating ON palettes(rating_avg DESC)`
  ], 'deferred')

  // Upgrade existing users table with OAuth columns if they don't exist
  try {
    await db.execute('ALTER TABLE users ADD COLUMN discord_id TEXT')
  } catch (_) {}
  try {
    await db.execute('ALTER TABLE users ADD COLUMN discord_username TEXT')
  } catch (_) {}
  try {
    await db.execute('ALTER TABLE users ADD COLUMN xbox_id TEXT')
  } catch (_) {}
  try {
    await db.execute('ALTER TABLE users ADD COLUMN xbox_gamertag TEXT')
  } catch (_) {}
}
