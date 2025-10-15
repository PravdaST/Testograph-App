# 🗺️ Lab Locations Scraper - Quick Start

## What This Does

This scraper collects **real laboratory location data** from Google Places API and saves it to your Supabase database.

**Results:**
- ✅ Accurate addresses with GPS coordinates
- ✅ Real phone numbers
- ✅ Google ratings and reviews
- ✅ Working hours (if available)
- ✅ Google Maps URLs

---

## 🚀 Quick Setup (5 Minutes)

### 1. Get Google Places API Key (FREE)

```bash
# Visit: https://console.cloud.google.com/
# 1. Create new project: "Testograph"
# 2. Enable "Places API"
# 3. Create API key
# 4. Copy the key (starts with AIza...)
```

**Cost:** ✅ FREE (25,000 requests/month, we need ~56)

### 2. Set Environment Variables

Create/edit `.env.local`:

```bash
# Google Places API (required)
GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Supabase (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Get SUPABASE_SERVICE_ROLE_KEY:**
- Supabase Dashboard → Settings → API → `service_role` key (secret)

### 3. Run Supabase Migration

```bash
# Option 1: Run in Supabase SQL Editor
# Copy contents of: supabase/migration-lab-locations.sql
# Paste into: Supabase Dashboard → SQL Editor → Run

# Option 2: Use Supabase CLI (if installed)
supabase db push
```

### 4. Run the Scraper

```bash
node scripts/scrape-lab-locations.mjs
```

**Expected output:**

```
🚀 Starting Google Places API Scraper
📊 Total labs to process: 28
⏱️  Rate limit: 200ms delay between requests
============================================================

🔍 Searching: Synevo България (София)
   ✅ Found: Synevo Lab
   📍 Address: бул. България 102, София 1404
   ⭐ Rating: 4.5 (234 reviews)
   📞 Phone: 02 9 863 864
   💾 Saved to database

   Progress: 1/28 (✅ 1 | ❌ 0)

[... continues for all 28 labs ...]

============================================================
✨ SCRAPING COMPLETE!
✅ Success: 26
❌ Failed: 2
📊 Total: 28
```

---

## 📊 Verify Results in Supabase

1. Go to: Supabase Dashboard → Table Editor
2. Open table: `lab_locations_app`
3. Review the scraped data:
   - ✅ Addresses are accurate?
   - ✅ Phone numbers correct?
   - ✅ GPS coordinates present?

**Mark verified labs:**

```sql
-- Mark all as verified (if data looks good)
UPDATE lab_locations_app
SET verified = true, last_verified_at = NOW()
WHERE google_rating IS NOT NULL; -- Only verified ones with ratings

-- Or mark individually
UPDATE lab_locations_app
SET verified = true, last_verified_at = NOW()
WHERE id = 'abc-123-xyz';
```

---

## 🔄 Update Frontend (Optional)

To use Supabase data instead of hardcoded labs:

**Option 1: Replace hardcoded LABS (Recommended)**

```typescript
// In LabTestingClient.tsx
const [labs, setLabs] = useState<Lab[]>([])
const [isLoadingLabs, setIsLoadingLabs] = useState(true)

useEffect(() => {
  async function loadLabs() {
    const supabase = createClient()
    const { data } = await supabase
      .from('lab_locations_app')
      .select('*')
      .eq('verified', true) // Only show verified labs
      .order('city, name')

    if (data) {
      // Transform to match Lab interface
      const transformed = data.map(lab => ({
        city: lab.city,
        name: lab.name,
        address: lab.address,
        phone: lab.phone,
        hours: lab.working_hours ? formatHours(lab.working_hours) : 'Обадете се за часове',
        no_appointment: lab.no_appointment_needed,
        website: lab.website
      }))
      setLabs(transformed)
    }
    setIsLoadingLabs(false)
  }

  loadLabs()
}, [])

// Use labs instead of LABS
const filteredLabs = useMemo(() => {
  return searchLabs(
    filterLabsByCity(labs, selectedCity),
    debouncedSearch
  )
}, [labs, selectedCity, debouncedSearch])
```

**Option 2: Hybrid (Fallback to hardcoded)**

Keep `LABS` from `labs-database.ts` as fallback, but fetch fresh data from Supabase:

```typescript
const [labs, setLabs] = useState<Lab[]>(LABS) // Fallback to hardcoded

useEffect(() => {
  async function loadLabs() {
    const { data } = await supabase
      .from('lab_locations_app')
      .select('*')
      .eq('verified', true)

    if (data && data.length > 0) {
      setLabs(transformSupabaseData(data))
    }
    // If no data or error, keep using LABS fallback
  }

  loadLabs()
}, [])
```

---

## 🛡️ Troubleshooting

### Error: `GOOGLE_PLACES_API_KEY not set`

**Fix:**
```bash
# Check if set
echo $GOOGLE_PLACES_API_KEY

# If empty, export it
export GOOGLE_PLACES_API_KEY="AIza..."

# Or add to .env.local (recommended)
```

### Error: `REQUEST_DENIED` or `API_KEY_INVALID`

**Fix:**
1. Go to Google Cloud Console
2. Verify **Places API** is enabled
3. Check API key restrictions (should allow Places API)
4. Regenerate API key if needed

### Error: Supabase connection failed

**Fix:**
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Make sure you're using service_role key, not anon key
# Get it from: Supabase Dashboard → Settings → API
```

### Some labs not found

**Cause:** Lab name doesn't match Google's database

**Fix:**
1. Search lab on Google Maps manually
2. Copy exact name from Google
3. Update `LABS` array in scraper
4. Re-run for that specific lab

---

## 📅 Recommended Schedule

### Initial Setup (Now)
1. ✅ Run scraper once
2. ✅ Verify data in Supabase
3. ✅ Mark accurate labs as `verified = true`
4. ✅ Update frontend to use Supabase

### Monthly Updates (Automated)
Set up a cron job to refresh data:

```bash
# Add to crontab (runs 1st of every month at 3am)
0 3 1 * * cd /path/to/testograph-app && node scripts/scrape-lab-locations.mjs
```

Or use **Supabase Edge Functions** for serverless cron:
```typescript
// supabase/functions/refresh-labs/index.ts
Deno.cron("Refresh lab data", "0 3 1 * *", async () => {
  // Run scraper logic
})
```

### User Contributions (Long-term)
Allow users to report errors:
- Add "Report error" button (already exists!)
- Store in `lab_locations_app` with `verified = false`
- Admin reviews and approves

---

## 💰 Cost Analysis

| Operation | Requests | Cost per 1000 | Total Cost |
|-----------|----------|---------------|------------|
| Text Search (find lab) | 28 | FREE (first 25k) | $0 |
| Place Details (get info) | 28 | FREE (first 25k) | $0 |
| **TOTAL** | **56** | | **$0** ✅ |

**Monthly refresh:** 56 requests/month = Still FREE

---

## 🎯 Next Steps

1. ✅ Run scraper now
2. ✅ Verify data quality
3. ✅ Update frontend (optional)
4. 📅 Schedule monthly refresh
5. 🤝 Contact lab chains for partnerships (Synevo, Kandilarov, LINA)
6. 💰 Propose affiliate program (earn commission on referrals)

---

## 📚 Related Files

- `scripts/scrape-lab-locations.mjs` - Main scraper script
- `scripts/GOOGLE_PLACES_SETUP.md` - Detailed setup guide
- `supabase/migration-lab-locations.sql` - Database schema
- `lib/data/labs-database.ts` - Hardcoded lab data (fallback)

---

**Questions?** Check the detailed guide: `scripts/GOOGLE_PLACES_SETUP.md`
