-- Database Migration: Create favorites analytics and map progress tables
-- Run this SQL in your Turso database

-- Favorites analytics table (tracks all user favorites for dev analytics)
CREATE TABLE IF NOT EXISTS favorites_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  colorId TEXT NOT NULL,
  colorName TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT,
  colorType TEXT,
  userId TEXT,
  sessionId TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('add', 'remove')),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_favorites_color ON favorites_analytics(colorId);
CREATE INDEX IF NOT EXISTS idx_favorites_created ON favorites_analytics(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_action ON favorites_analytics(action);

-- Aggregated favorites count (for ranking graph)
CREATE TABLE IF NOT EXISTS favorites_ranking (
  colorId TEXT PRIMARY KEY,
  colorName TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT,
  colorType TEXT,
  totalFavorites INTEGER DEFAULT 0,
  currentFavorites INTEGER DEFAULT 0,
  lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ranking_total ON favorites_ranking(totalFavorites DESC);
CREATE INDEX IF NOT EXISTS idx_ranking_current ON favorites_ranking(currentFavorites DESC);

-- Map progress table (tracks visited locations per user)
CREATE TABLE IF NOT EXISTS map_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sessionId TEXT NOT NULL,
  userId TEXT,
  visitedLocations TEXT NOT NULL,
  favoriteLocations TEXT NOT NULL,
  activeFilters TEXT NOT NULL,
  lastViewedLocation TEXT,
  zoomLevel REAL DEFAULT 1,
  lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sessionId)
);

CREATE INDEX IF NOT EXISTS idx_progress_session ON map_progress(sessionId);
CREATE INDEX IF NOT EXISTS idx_progress_user ON map_progress(userId);

-- User favorites sync table (for cloud backup of user favorites)
CREATE TABLE IF NOT EXISTS user_favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sessionId TEXT NOT NULL,
  userId TEXT,
  favorites TEXT NOT NULL,
  lastSynced DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sessionId)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_session ON user_favorites(sessionId);
