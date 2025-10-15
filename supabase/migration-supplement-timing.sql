-- =====================================================
-- SUPPLEMENT TIMING APP - DATABASE MIGRATION
-- =====================================================
-- Creates tables for user supplement selection, daily tracking, and settings
-- Part of Testograph Apps ecosystem
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: user_supplements_app
-- Stores which supplements each user has selected
-- =====================================================
CREATE TABLE IF NOT EXISTS user_supplements_app (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id INTEGER NOT NULL,
  supplement_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  custom_dosage TEXT, -- Allow user to override default dosage
  custom_timing TEXT, -- Allow user to override default timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure user can't select same supplement twice
  UNIQUE(user_id, supplement_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_supplements_user_id ON user_supplements_app(user_id);
CREATE INDEX IF NOT EXISTS idx_user_supplements_enabled ON user_supplements_app(user_id, enabled) WHERE enabled = true;

-- Row Level Security
ALTER TABLE user_supplements_app ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own supplements"
  ON user_supplements_app
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own supplements"
  ON user_supplements_app
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplements"
  ON user_supplements_app
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplements"
  ON user_supplements_app
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: supplement_logs_app
-- Daily tracking of supplement intake
-- =====================================================
CREATE TABLE IF NOT EXISTS supplement_logs_app (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  supplement_id INTEGER NOT NULL,
  supplement_name TEXT NOT NULL,
  taken BOOLEAN DEFAULT FALSE,
  taken_time TIME, -- When user actually took it
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One log per supplement per day
  UNIQUE(user_id, log_date, supplement_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_supplement_logs_user_date ON supplement_logs_app(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_supplement_logs_user_taken ON supplement_logs_app(user_id, log_date) WHERE taken = true;

-- Row Level Security
ALTER TABLE supplement_logs_app ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs"
  ON supplement_logs_app
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs"
  ON supplement_logs_app
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs"
  ON supplement_logs_app
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
  ON supplement_logs_app
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: supplement_settings_app
-- User schedule settings (wake time, workout time)
-- =====================================================
CREATE TABLE IF NOT EXISTS supplement_settings_app (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wake_time TIME NOT NULL DEFAULT '07:00',
  workout_time TEXT NOT NULL DEFAULT 'evening', -- 'morning'|'lunch'|'evening'|'none'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE supplement_settings_app ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON supplement_settings_app
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON supplement_settings_app
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON supplement_settings_app
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_supplements_updated_at
  BEFORE UPDATE ON user_supplements_app
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplement_settings_updated_at
  BEFORE UPDATE ON supplement_settings_app
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE user_supplements_app IS 'Stores user-selected supplements for personalized tracking';
COMMENT ON TABLE supplement_logs_app IS 'Daily logs of supplement intake for adherence tracking';
COMMENT ON TABLE supplement_settings_app IS 'User schedule settings for supplement timing optimization';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Supplement Timing tables created successfully!';
  RAISE NOTICE 'Tables: user_supplements_app, supplement_logs_app, supplement_settings_app';
  RAISE NOTICE 'RLS policies enabled for all tables';
END $$;
