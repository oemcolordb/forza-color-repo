-- Migration: 006_community_and_stats.sql
-- Description: Create tables for aggregated stats and community posts

CREATE TABLE IF NOT EXISTS aggregated_stats (
    id INTEGER PRIMARY KEY,
    type TEXT NOT NULL, -- 'trending_colors', 'top_tuners', etc.
    data TEXT NOT NULL, -- JSON string
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community_posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    car_name TEXT,
    tune_code TEXT,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_likes (
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
);
