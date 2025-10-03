-- =====================================================
-- EXERCISE GUIDE APP - DATABASE MIGRATION
-- =====================================================
-- Date: 2025-10-03
-- Purpose: Add tables for Exercise Guide app
-- =====================================================

-- =====================================================
-- 1. WORKOUT_PROGRAMS_APP TABLE
-- =====================================================
-- Stores custom workout programs created by users
CREATE TABLE IF NOT EXISTS workout_programs_app (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  program_name TEXT NOT NULL,
  description TEXT,
  selected_exercises TEXT[] NOT NULL DEFAULT '{}', -- Array of exercise IDs
  exercises_data JSONB NOT NULL DEFAULT '[]', -- Full exercise details
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workout_programs_app_user_id ON workout_programs_app(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_programs_app_active ON workout_programs_app(is_active);

-- RLS Policies
ALTER TABLE workout_programs_app ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own workout programs" ON workout_programs_app;
CREATE POLICY "Users can view own workout programs"
  ON workout_programs_app FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own workout programs" ON workout_programs_app;
CREATE POLICY "Users can insert own workout programs"
  ON workout_programs_app FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own workout programs" ON workout_programs_app;
CREATE POLICY "Users can update own workout programs"
  ON workout_programs_app FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own workout programs" ON workout_programs_app;
CREATE POLICY "Users can delete own workout programs"
  ON workout_programs_app FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 2. EXERCISE_LOGS_APP TABLE
-- =====================================================
-- Tracks workout sessions and exercise performance
CREATE TABLE IF NOT EXISTS exercise_logs_app (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_program_id UUID REFERENCES workout_programs_app(id) ON DELETE SET NULL,
  workout_date DATE NOT NULL,
  exercise_id TEXT NOT NULL, -- Reference to exercise in exercises-database
  exercise_name TEXT NOT NULL,
  sets_completed INTEGER,
  reps_completed INTEGER,
  weight_used DECIMAL(6,2), -- in kg
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exercise_logs_app_user_id ON exercise_logs_app(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_app_workout_id ON exercise_logs_app(workout_program_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_app_date ON exercise_logs_app(workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_app_exercise_id ON exercise_logs_app(exercise_id);

-- RLS Policies
ALTER TABLE exercise_logs_app ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own exercise logs" ON exercise_logs_app;
CREATE POLICY "Users can view own exercise logs"
  ON exercise_logs_app FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own exercise logs" ON exercise_logs_app;
CREATE POLICY "Users can insert own exercise logs"
  ON exercise_logs_app FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own exercise logs" ON exercise_logs_app;
CREATE POLICY "Users can update own exercise logs"
  ON exercise_logs_app FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own exercise logs" ON exercise_logs_app;
CREATE POLICY "Users can delete own exercise logs"
  ON exercise_logs_app FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. EXERCISE_FAVORITES_APP TABLE
-- =====================================================
-- Stores user's favorite exercises for quick access
CREATE TABLE IF NOT EXISTS exercise_favorites_app (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exercise_favorites_app_user_id ON exercise_favorites_app(user_id);

-- RLS Policies
ALTER TABLE exercise_favorites_app ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON exercise_favorites_app;
CREATE POLICY "Users can view own favorites"
  ON exercise_favorites_app FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON exercise_favorites_app;
CREATE POLICY "Users can insert own favorites"
  ON exercise_favorites_app FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON exercise_favorites_app;
CREATE POLICY "Users can delete own favorites"
  ON exercise_favorites_app FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. TRIGGERS FOR UPDATED_AT
-- =====================================================

DROP TRIGGER IF EXISTS update_workout_programs_app_updated_at ON workout_programs_app;
CREATE TRIGGER update_workout_programs_app_updated_at
  BEFORE UPDATE ON workout_programs_app
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exercise_logs_app_updated_at ON exercise_logs_app;
CREATE TRIGGER update_exercise_logs_app_updated_at
  BEFORE UPDATE ON exercise_logs_app
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Get user's active workout program
CREATE OR REPLACE FUNCTION get_active_workout_program(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  program_name TEXT,
  description TEXT,
  selected_exercises TEXT[],
  exercises_data JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wp.id,
    wp.program_name,
    wp.description,
    wp.selected_exercises,
    wp.exercises_data,
    wp.created_at
  FROM workout_programs_app wp
  WHERE wp.user_id = p_user_id
    AND wp.is_active = TRUE
  ORDER BY wp.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get exercise progress for specific exercise
CREATE OR REPLACE FUNCTION get_exercise_progress(
  p_user_id UUID,
  p_exercise_id TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  workout_date DATE,
  sets_completed INTEGER,
  reps_completed INTEGER,
  weight_used DECIMAL,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    el.workout_date,
    el.sets_completed,
    el.reps_completed,
    el.weight_used,
    el.notes
  FROM exercise_logs_app el
  WHERE el.user_id = p_user_id
    AND el.exercise_id = p_exercise_id
  ORDER BY el.workout_date DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get workout statistics
CREATE OR REPLACE FUNCTION get_workout_stats(p_user_id UUID)
RETURNS TABLE (
  total_workouts BIGINT,
  total_exercises BIGINT,
  favorite_exercise TEXT,
  current_streak INTEGER
) AS $$
DECLARE
  v_current_streak INTEGER := 0;
  v_check_date DATE := CURRENT_DATE;
  v_found BOOLEAN;
BEGIN
  -- Count total workouts
  SELECT COUNT(DISTINCT workout_date)
  INTO total_workouts
  FROM exercise_logs_app
  WHERE user_id = p_user_id;

  -- Count total exercises logged
  SELECT COUNT(*)
  INTO total_exercises
  FROM exercise_logs_app
  WHERE user_id = p_user_id;

  -- Find most logged exercise
  SELECT exercise_name
  INTO favorite_exercise
  FROM exercise_logs_app
  WHERE user_id = p_user_id
  GROUP BY exercise_name
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Calculate current workout streak
  LOOP
    SELECT EXISTS(
      SELECT 1
      FROM exercise_logs_app
      WHERE user_id = p_user_id
        AND workout_date = v_check_date
    ) INTO v_found;

    IF NOT v_found THEN
      EXIT;
    END IF;

    v_current_streak := v_current_streak + 1;
    v_check_date := v_check_date - INTERVAL '1 day';
  END LOOP;

  current_streak := v_current_streak;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables created:
--   ✅ workout_programs_app (user's custom workout programs)
--   ✅ exercise_logs_app (workout session tracking)
--   ✅ exercise_favorites_app (favorite exercises)
--
-- Helper functions created:
--   ✅ get_active_workout_program(user_id)
--   ✅ get_exercise_progress(user_id, exercise_id, limit)
--   ✅ get_workout_stats(user_id)
--
-- All tables have RLS enabled
-- =====================================================
