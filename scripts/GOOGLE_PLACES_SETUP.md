# 🗺️ Google Places API Setup Guide

## Overview

This guide will help you scrape **real laboratory locations** from Google Places API and save them to Supabase.

**Cost:** ✅ **FREE** (25,000 requests/month)

---

## 📋 Prerequisites

1. **Google Cloud Account** (free)
2. **Supabase Account** (you already have this)
3. **Node.js** installed

---

## 🔑 Step 1: Get Google Places API Key (FREE)

### 1.1 Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click **"Select a project"** → **"New Project"**
3. Name: `Testograph Labs` → Click **"Create"**

### 1.2 Enable Places API

1. In the sidebar, go to: **APIs & Services** → **Library**
2. Search for: `Places API`
3. Click **Places API** → Click **"Enable"**

### 1.3 Create API Key

1. Go to: **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"API Key"**
3. Copy the API key (starts with `AIza...`)

### 1.4 (Optional) Restrict API Key

For security, restrict the key to **Places API only**:
1. Click on the key you just created
2. Under **API restrictions**, select **"Restrict key"**
3. Select: **Places API**
4. Click **"Save"**

---

## 🔐 Step 2: Set Environment Variables

### Option A: `.env.local` (Recommended)

Create/edit `.env.local` in your project root:

```bash
# Google Places API
GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Supabase (you already have these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Get this from Supabase Dashboard → Settings → API
```

### Option B: Export in Terminal

```bash
export GOOGLE_PLACES_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

---

## 🗄️ Step 3: Run Supabase Migration

Create the `lab_locations_app` table:

```bash
# Copy the migration file to Supabase
# Then run it in Supabase SQL Editor:
# Dashboard → SQL Editor → New Query → Paste migration-lab-locations.sql → Run
```

Or use Supabase CLI:

```bash
supabase db push
```

---

## 🚀 Step 4: Run the Scraper

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
   ✅ Found: Synevo Lab Sofia
   📍 Address: бул. България 102, София
   ⭐ Rating: 4.5 (234 reviews)
   📞 Phone: 02 9 863 864
   💾 Saved to database (ID: abc-123...)

   Progress: 1/28 (✅ 1 | ❌ 0)

🔍 Searching: СМДЛ Лаборатория Рамус (София)
   ✅ Found: Ramus Lab
   ...
```

---

## 📊 Step 5: Verify Data in Supabase

1. Go to Supabase Dashboard
2. Click **Table Editor** → `lab_locations_app`
3. Review the scraped data:
   - ✅ Check addresses are correct
   - ✅ Check phone numbers match
   - ✅ Check lat/lng coordinates
4. Mark verified labs:
   ```sql
   UPDATE lab_locations_app
   SET verified = true, last_verified_at = NOW()
   WHERE id = 'some-id';
   ```

---

## 🔄 Step 6: Update Frontend (Optional)

Instead of using hardcoded `LABS`, fetch from Supabase:

```typescript
// In LabTestingClient.tsx
const [labs, setLabs] = useState<Lab[]>([])

useEffect(() => {
  async function loadLabs() {
    const { data } = await supabase
      .from('lab_locations_app')
      .select('*')
      .eq('verified', true) // Only show verified labs
      .order('city, name')

    setLabs(data || [])
  }
  loadLabs()
}, [])
```

---

## 🛡️ Troubleshooting

### Error: `GOOGLE_PLACES_API_KEY not set`

**Solution:** Make sure you exported the variable or added it to `.env.local`

```bash
# Check if set:
echo $GOOGLE_PLACES_API_KEY

# If empty, export it:
export GOOGLE_PLACES_API_KEY="your-key"
```

### Error: `REQUEST_DENIED`

**Cause:** API key not enabled or restricted incorrectly

**Solution:**
1. Go to Google Cloud Console
2. Check Places API is **Enabled**
3. Check API key restrictions allow **Places API**

### Error: `OVER_QUERY_LIMIT`

**Cause:** Exceeded free tier (25,000 requests/month)

**Solution:**
- Wait until next month
- Or upgrade to paid plan (unlikely with 28 labs)

### No results found for a lab

**Cause:** Lab name/address doesn't match Google's database

**Solution:**
1. Manually search lab on Google Maps
2. Note exact name
3. Update `LABS` array with exact name
4. Re-run scraper

---

## 💰 Cost Breakdown

### Google Places API Pricing

| Operation | Cost | Free Tier | Our Usage |
|-----------|------|-----------|-----------|
| Text Search | $32/1000 requests | First 25,000 FREE | 28 requests |
| Place Details | $17/1000 requests | First 25,000 FREE | 28 requests |
| **TOTAL** | | **FREE** | **56 requests** |

**Conclusion:** ✅ Completely FREE for 28 labs!

---

## 🎯 Next Steps

1. ✅ Run scraper once to populate data
2. ✅ Verify data in Supabase (mark `verified = true`)
3. ✅ Schedule monthly re-scraping (cron job) to keep data fresh
4. ✅ Add "Suggest correction" feature for users to report errors
5. ✅ Partner with lab chains for official API access (long-term)

---

## 📞 Support

If you encounter issues:
1. Check API key is correct
2. Check Supabase credentials
3. Check migration was run successfully
4. Check Google Cloud console for API usage/errors

**Google Places API Docs:** https://developers.google.com/maps/documentation/places/web-service
