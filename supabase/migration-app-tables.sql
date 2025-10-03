-- =====================================================
-- TESTOGRAPH APP - DATABASE MIGRATION
-- =====================================================
-- Date: 2025-10-02
-- Purpose: Add tables for app.testograph.eu (Mini Apps HUB)
--
-- ⚠️  SAFE MIGRATION - Only ADDS new tables, does NOT modify existing ones
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. UPDATE PROFILES TABLE
-- =====================================================
-- Add columns for app.testograph.eu (IF NOT EXISTS to be safe)
DO $$
BEGIN
  -- Age column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'age'
  ) THEN
    ALTER TABLE profiles ADD COLUMN age INTEGER;
  END IF;

  -- Weight column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'weight'
  ) THEN
    ALTER TABLE profiles ADD COLUMN weight DECIMAL(5,2);
  END IF;

  -- Goal column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'goal'
  ) THEN
    ALTER TABLE profiles ADD COLUMN goal TEXT;
  END IF;

  -- Shopify customer ID
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'shopify_customer_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN shopify_customer_id TEXT;
  END IF;

  -- Total spent
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'total_spent'
  ) THEN
    ALTER TABLE profiles ADD COLUMN total_spent DECIMAL(10,2) DEFAULT 0;
  END IF;

  -- Onboarding completed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
  END IF;

  -- Last login
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ;
  END IF;
END $$;

-- =====================================================
-- 2. PURCHASES TABLE (Shopify Integration)
-- =====================================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shopify_order_id TEXT UNIQUE NOT NULL,
  product_type TEXT NOT NULL, -- 'starter' | 'complete' | 'maximum' | individual product
  product_name TEXT NOT NULL,
  apps_included TEXT[] NOT NULL DEFAULT '{}', -- Array of app slugs
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BGN',
  status TEXT DEFAULT 'completed', -- 'completed' | 'refunded' | 'expired'
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- For subscription model (if needed)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_shopify_order_id ON purchases(shopify_order_id);

-- RLS Policies
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. MEAL_PLANS_APP TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS meal_plans_app (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT,
  plan_data JSONB NOT NULL, -- Full meal plan data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meal_plans_app_user_id ON meal_plans_app(user_id);

-- RLS Policies
ALTER TABLE meal_plans_app ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own meal plans" ON meal_plans_app;
CREATE POLICY "Users can view own meal plans"
  ON meal_plans_app FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own meal plans" ON meal_plans_app;
CREATE POLICY "Users can insert own meal plans"
  ON meal_plans_app FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own meal plans" ON meal_plans_app;
CREATE POLICY "Users can update own meal plans"
  ON meal_plans_app FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own meal plans" ON meal_plans_app;
CREATE POLICY "Users can delete own meal plans"
  ON meal_plans_app FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. SLEEP_LOGS_APP TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sleep_logs_app (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  bedtime TIME,
  waketime TIME,
  quality INTEGER CHECK (quality >= 1 AND quality <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sleep_logs_app_user_id ON sleep_logs_app(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_app_date ON sleep_logs_app(log_date DESC);

-- RLS Policies
ALTER TABLE sleep_logs_app ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sleep logs" ON sleep_logs_app;
CREATE POLICY "Users can view own sleep logs"
  ON sleep_logs_app FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sleep logs" ON sleep_logs_app;
CREATE POLICY "Users can insert own sleep logs"
  ON sleep_logs_app FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sleep logs" ON sleep_logs_app;
CREATE POLICY "Users can update own sleep logs"
  ON sleep_logs_app FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sleep logs" ON sleep_logs_app;
CREATE POLICY "Users can delete own sleep logs"
  ON sleep_logs_app FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. LAB_RESULTS_APP TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS lab_results_app (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_date DATE NOT NULL,
  total_testosterone DECIMAL(8,2), -- ng/dL
  free_testosterone DECIMAL(8,2),
  shbg DECIMAL(8,2),
  estradiol DECIMAL(8,2),
  lh DECIMAL(8,2),
  notes TEXT,
  lab_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lab_results_app_user_id ON lab_results_app(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_app_date ON lab_results_app(test_date DESC);

-- RLS Policies
ALTER TABLE lab_results_app ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own lab results" ON lab_results_app;
CREATE POLICY "Users can view own lab results"
  ON lab_results_app FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own lab results" ON lab_results_app;
CREATE POLICY "Users can insert own lab results"
  ON lab_results_app FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own lab results" ON lab_results_app;
CREATE POLICY "Users can update own lab results"
  ON lab_results_app FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own lab results" ON lab_results_app;
CREATE POLICY "Users can delete own lab results"
  ON lab_results_app FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. ANALYTICS_EVENTS_APP TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_events_app (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_app_user_id ON analytics_events_app(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_app_type ON analytics_events_app(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_app_created ON analytics_events_app(created_at DESC);

-- RLS Policies
ALTER TABLE analytics_events_app ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own analytics" ON analytics_events_app;
CREATE POLICY "Users can view own analytics"
  ON analytics_events_app FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analytics" ON analytics_events_app;
CREATE POLICY "Users can insert own analytics"
  ON analytics_events_app FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to check if user has access to a specific app
CREATE OR REPLACE FUNCTION has_app_access(
  p_user_id UUID,
  p_app_slug TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM purchases
    WHERE user_id = p_user_id
      AND status = 'completed'
      AND p_app_slug = ANY(apps_included)
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all apps user has access to
CREATE OR REPLACE FUNCTION get_user_apps(p_user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  apps TEXT[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT unnest(apps_included))
  INTO apps
  FROM purchases
  WHERE user_id = p_user_id
    AND status = 'completed'
    AND (expires_at IS NULL OR expires_at > NOW());

  RETURN COALESCE(apps, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_purchases_updated_at ON purchases;
CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meal_plans_app_updated_at ON meal_plans_app;
CREATE TRIGGER update_meal_plans_app_updated_at
  BEFORE UPDATE ON meal_plans_app
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sleep_logs_app_updated_at ON sleep_logs_app;
CREATE TRIGGER update_sleep_logs_app_updated_at
  BEFORE UPDATE ON sleep_logs_app
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lab_results_app_updated_at ON lab_results_app;
CREATE TRIGGER update_lab_results_app_updated_at
  BEFORE UPDATE ON lab_results_app
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables created:
--   ✅ purchases
--   ✅ meal_plans_app
--   ✅ sleep_logs_app
--   ✅ lab_results_app
--   ✅ analytics_events_app
--
-- Profiles table updated with:
--   ✅ age, weight, goal
--   ✅ shopify_customer_id, total_spent
--   ✅ onboarding_completed, last_login_at
--
-- Helper functions created:
--   ✅ has_app_access(user_id, app_slug)
--   ✅ get_user_apps(user_id)
--
-- All tables have RLS enabled
-- =====================================================
