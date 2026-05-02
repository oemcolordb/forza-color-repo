-- Community Tunes: Player-submitted in-game share codes per car
-- Separate from personal saved tunes (tunes table)
CREATE TABLE IF NOT EXISTS community_tunes (
  id           TEXT    PRIMARY KEY,
  car_make     TEXT    NOT NULL,
  car_model    TEXT    NOT NULL,
  tune_name    TEXT    NOT NULL,
  tuner_name   TEXT    NOT NULL DEFAULT 'Anonymous',
  share_code   TEXT,                          -- 9-digit FH5 share code
  discipline   TEXT    NOT NULL DEFAULT 'General',  -- e.g. Track, Drift, Rally, Drag
  pi_class     TEXT,                          -- E/D/C/B/A/S1/S2/X
  pi_value     INTEGER,
  tune_data    TEXT    NOT NULL,              -- JSON snapshot of tuning values
  votes        INTEGER NOT NULL DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_community_tunes_car
  ON community_tunes (car_make, car_model);

CREATE INDEX IF NOT EXISTS idx_community_tunes_votes
  ON community_tunes (votes DESC);
