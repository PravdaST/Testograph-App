-- =====================================================
-- LAB_LOCATIONS_APP TABLE
-- =====================================================
-- Date: 2025-01-20
-- Purpose: Store real laboratory locations scraped from Google Places API
-- This table is PUBLIC READ (no RLS for user_id) - all users see all labs
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS lab_locations_app (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Basic Info
  name TEXT NOT NULL,
  chain TEXT, -- 'Synevo', 'Kandilarov', 'LINA', etc.
  city TEXT NOT NULL,
  address TEXT NOT NULL,

  -- Contact Info
  phone TEXT,
  website TEXT,
  email TEXT,

  -- Location Data (from Google Places)
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  google_place_id TEXT UNIQUE, -- Google Places ID for updates
  google_maps_url TEXT,

  -- Operational Info
  working_hours JSONB, -- { "monday": "07:00-18:00", "tuesday": "07:00-18:00", ... }
  no_appointment_needed BOOLEAN DEFAULT false,

  -- Metadata
  verified BOOLEAN DEFAULT false, -- Admin verified this data
  last_verified_at TIMESTAMPTZ,
  google_rating DECIMAL(2,1), -- 4.5 stars
  total_reviews INTEGER,

  -- Data Source
  data_source TEXT DEFAULT 'google_places', -- 'google_places', 'manual', 'user_contribution'
  scraped_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_lab_locations_city ON lab_locations_app(city);
CREATE INDEX IF NOT EXISTS idx_lab_locations_chain ON lab_locations_app(chain);
CREATE INDEX IF NOT EXISTS idx_lab_locations_name ON lab_locations_app(name);
CREATE INDEX IF NOT EXISTS idx_lab_locations_verified ON lab_locations_app(verified);
CREATE INDEX IF NOT EXISTS idx_lab_locations_google_place_id ON lab_locations_app(google_place_id);

-- Geospatial index for location-based searches
CREATE INDEX IF NOT EXISTS idx_lab_locations_coords ON lab_locations_app(latitude, longitude);

-- =====================================================
-- RLS POLICIES (PUBLIC READ)
-- =====================================================
ALTER TABLE lab_locations_app ENABLE ROW LEVEL SECURITY;

-- Anyone can view lab locations (public data)
DROP POLICY IF EXISTS "Anyone can view lab locations" ON lab_locations_app;
CREATE POLICY "Anyone can view lab locations"
  ON lab_locations_app FOR SELECT
  USING (true);

-- Only authenticated users can suggest new locations (user contributions)
DROP POLICY IF EXISTS "Authenticated users can suggest labs" ON lab_locations_app;
CREATE POLICY "Authenticated users can suggest labs"
  ON lab_locations_app FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND data_source = 'user_contribution'
    AND verified = false
  );

-- Only admins can update/delete (via service_role in scripts)
-- No UPDATE/DELETE policies for regular users

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to search labs by city
CREATE OR REPLACE FUNCTION search_labs_by_city(p_city TEXT)
RETURNS SETOF lab_locations_app AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM lab_locations_app
  WHERE city ILIKE p_city
  ORDER BY verified DESC, google_rating DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Function to find nearest labs (requires lat/lng)
CREATE OR REPLACE FUNCTION find_nearest_labs(
  p_latitude DECIMAL(10,8),
  p_longitude DECIMAL(11,8),
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  city TEXT,
  address TEXT,
  phone TEXT,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.name,
    l.city,
    l.address,
    l.phone,
    -- Haversine formula for distance calculation
    ROUND(
      (6371 * acos(
        cos(radians(p_latitude)) *
        cos(radians(l.latitude)) *
        cos(radians(l.longitude) - radians(p_longitude)) +
        sin(radians(p_latitude)) *
        sin(radians(l.latitude))
      ))::numeric,
      2
    ) AS distance_km
  FROM lab_locations_app l
  WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL
  ORDER BY distance_km
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get labs by chain
CREATE OR REPLACE FUNCTION get_labs_by_chain(p_chain TEXT)
RETURNS SETOF lab_locations_app AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM lab_locations_app
  WHERE chain ILIKE p_chain
  ORDER BY city, name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lab_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lab_locations_updated_at ON lab_locations_app;
CREATE TRIGGER trigger_update_lab_locations_updated_at
  BEFORE UPDATE ON lab_locations_app
  FOR EACH ROW
  EXECUTE FUNCTION update_lab_locations_updated_at();

-- =====================================================
-- SAMPLE DATA (Sofia labs for testing)
-- =====================================================
-- Uncomment to insert sample data after running migration

/*
INSERT INTO lab_locations_app (
  name, chain, city, address, phone, website,
  no_appointment_needed, verified, data_source
) VALUES
  ('Synevo България - Люлин', 'Synevo', 'София', 'бул. България 102', '02 9 863 864', 'https://www.synevo.bg', true, false, 'manual'),
  ('СМДЛ Кандиларов - Център', 'Kandilarov', 'София', 'ул. Бузлуджа 64', '0700 70 117', 'https://kandilarov.com', false, false, 'manual'),
  ('ЛИНА - Младост', 'LINA', 'София', 'бул. Александър Малинов', '02 976 5432', 'https://www.lina-bg.com', true, false, 'manual')
ON CONFLICT (google_place_id) DO NOTHING;
*/

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Table created: lab_locations_app
-- Features:
--   ✅ Google Places integration ready
--   ✅ Geospatial search (nearest labs)
--   ✅ Public read access (no auth needed)
--   ✅ User contributions (verified by admin)
--   ✅ Search functions (by city, chain, distance)
--   ✅ Rating/reviews support
-- =====================================================
