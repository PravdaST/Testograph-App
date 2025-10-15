-- Mark all scraped labs as verified
-- This makes them visible in the app (frontend fetches only verified=true)

UPDATE lab_locations_app
SET
  verified = true,
  last_verified_at = NOW()
WHERE
  google_rating IS NOT NULL  -- Only labs with Google ratings (real labs)
  AND verified = false;      -- Only unverified ones

-- Summary of verified labs
SELECT
  city,
  COUNT(*) as total_labs,
  ROUND(AVG(google_rating), 1) as avg_rating
FROM lab_locations_app
WHERE verified = true
GROUP BY city
ORDER BY total_labs DESC;
