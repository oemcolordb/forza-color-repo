-- Database Migration: Create scans table for image scan history
-- Run this SQL in your Turso database

CREATE TABLE IF NOT EXISTS scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  imageName TEXT NOT NULL,
  extractedColors TEXT NOT NULL,
  matches TEXT NOT NULL,
  imageData TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scans_user ON scans(userId);
CREATE INDEX IF NOT EXISTS idx_scans_created ON scans(createdAt DESC);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT NOT NULL,
  avatar TEXT,
  provider TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
