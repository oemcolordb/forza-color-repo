-- Database Migration: Add IP Address to favorites and community_tunes
-- Run this SQL in your Turso database to associate data with user IPs (anonymized/hashed ideally, but stored via route)

-- Add ip_address column to user_favorites
ALTER TABLE user_favorites ADD COLUMN ip_address TEXT;

-- Add ip_address column to favorites_analytics
ALTER TABLE favorites_analytics ADD COLUMN ip_address TEXT;

-- Add ip_address column to community_tunes
ALTER TABLE community_tunes ADD COLUMN ip_address TEXT;

CREATE INDEX IF NOT EXISTS idx_user_favorites_ip ON user_favorites(ip_address);
CREATE INDEX IF NOT EXISTS idx_community_tunes_ip ON community_tunes(ip_address);