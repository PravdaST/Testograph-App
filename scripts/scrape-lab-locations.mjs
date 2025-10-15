/**
 * Google Places API Scraper for Lab Locations
 *
 * This script fetches real location data from Google Places API
 * and populates the lab_locations_app table in Supabase.
 *
 * Setup Instructions:
 * 1. Get a FREE Google Places API key:
 * - Go to: https://console.cloud.google.com/
 * - Enable "Places API"
 * - Create API key
 * - FREE tier: 25,000 requests/month
 *
 * 2. Set environment variable:
 * export GOOGLE_PLACES_API_KEY="your-api-key-here"
 *
 * 3. Run script:
 * node scripts/scrape-lab-locations.mjs
 */

import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// ===================================
// КОНФИГУРАЦИЯ НА DOTENV
// ===================================
// Зарежда променливите от .env.local (в testograph-app директорията)
dotenv.config({ path: '.env.local' })


// ===================================
// LAB DATA
// ===================================

// Note: This data is copied from lib/data/labs-database.ts
// Update this if you modify the source data
const LABS = [
  // София
  { city: "София", name: "Synevo България", address: "бул. България (множество локации)", phone: "02 9 863 864", hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00", no_appointment: true, website: "https://www.synevo.bg" },
  { city: "София", name: "СМДЛ Лаборатория Рамус", address: "ул. Ангиста 2-4 (зад пазар Сточна гара)", phone: "02 943 1196", hours: "Пон-Пет: 7:00-18:00, Съб-Нед: 8:00-15:30", no_appointment: true, website: "https://ramuslab.com" },
  { city: "София", name: "СМДЛ Кандиларов", address: "ул. Бузлуджа 64", phone: "0700 70 117", hours: "Пон-Пет: 7:30-17:00, Съб: 8:00-14:00", no_appointment: false, website: "https://kandilarov.com" },
  { city: "София", name: "МДЛ Цибалаб", address: "ул. Тодорини кукли (множество локации)", phone: "02 987 6543", hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-12:00", no_appointment: true, website: "https://www.cibalab.com" },
  { city: "София", name: "СМДЛ My-Lab", address: "бул. България и кв. Връбница", phone: "02 943 2100", hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-13:00", no_appointment: true, website: "https://www.my-lab.bg" },
  { city: "София", name: "Медицинска лаборатория Лора", address: "ул. Граф Игнатиев (център)", phone: "02 952 4567", hours: "Пон-Пет: 7:00-16:00, Съб: 8:00-12:00", no_appointment: false, website: "https://loralab.com" },

  // Пловдив
  { city: "Пловдив", name: "СМДЛ Кандиларов - Пловдив", address: "бул. Македония 2В", phone: "0884 544 124", hours: "Пон-Пет: 7:30-17:00, Съб: 8:00-14:00", no_appointment: true, website: "https://kandilarov.com" },
  { city: "Пловдив", name: "Synevo България - Гербера", address: "Пловдив (множество локации)", phone: "032 605 803", hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00", no_appointment: true, website: "https://www.synevo.bg" },
  { city: "Пловдив", name: "ДКЦ II Пловдив - Клинична лаборатория", address: "бул. 6-ти Септември 110", phone: "032 605 803", hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-13:00", no_appointment: false, website: null },
  { city: "Пловдив", name: "ЛИНА - Пловдив", address: "Пловдив (множество локации)", phone: "032 634 567", hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00", no_appointment: true, website: "https://www.lina-bg.com" },

  // Варна
  { city: "Варна", name: "СМДЛ CityLab", address: "ул. Драган Цанков 10", phone: "0882 608 040", hours: "Пон-Пет: 7:30-17:30", no_appointment: true, website: "https://citylab.bg" },
  { city: "Варна", name: "СМДЛ Кандиларов - Варна", address: "Варна (множество локации)", phone: "0700 70 117", hours: "Пон-Пет: 7:30-17:00, Съб: 8:00-14:00", no_appointment: true, website: "https://kandilarov.com" },
  { city: "Варна", name: "Synevo България - Варна", address: "Варна (множество локации)", phone: "02 9 863 864", hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00", no_appointment: true, website: "https://www.synevo.bg" },
  { city: "Варна", name: "ЛИНА - Варна", address: "Варна (множество локации)", phone: "052 634 890", hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00", no_appointment: true, website: "https://www.lina-bg.com" },
  { city: "Варна", name: "Лаборекспрес 2000", address: "Варна", phone: "052 612 345", hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-12:00", no_appointment: true, website: "https://laborexpres.com" },

  // Бургас
  { city: "Бургас", name: "ЛИНА - Бургас", address: "Бургас (множество локации)", phone: "056 843 567", hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00", no_appointment: true, website: "https://www.lina-bg.com" },
  { city: "Бургас", name: "Synevo България - Бургас", address: "Бургас (множество локации)", phone: "02 9 863 864", hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00", no_appointment: true, website: "https://www.synevo.bg" },
  { city: "Бургас", name: "СМДЛ Лаборатория Рамус - Бургас", address: "Бургас", phone: "02 943 1196", hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-15:30", no_appointment: true, website: "https://ramuslab.com" },

  // Русе
  { city: "Русе", name: "СМДЛ Лаборатория Рамус - Русе", address: "Русе", phone: "02 943 1196", hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-15:30", no_appointment: true, website: "https://ramuslab.com" },
  { city: "Русе", name: "Synevo България - Русе", address: "Русе", phone: "02 9 863 864", hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00", no_appointment: true, website: "https://www.synevo.bg" },

  // Стара Загора
  { city: "Стара Загора", name: "СМДЛ Новалаб", address: "Стара Загора", phone: "042 623 456", hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-13:00", no_appointment: true, website: "https://novalab.bg" },
  { city: "Стара Загора", name: "Synevo България - Стара Загора", address: "Стара Загора", phone: "02 9 863 864", hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00", no_appointment: true, website: "https://www.synevo.bg" },
  { city: "Стара Загора", name: "ЛИНА - Стара Загора", address: "Стара Загора (множество локации)", phone: "042 634 567", hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00", no_appointment: true, website: "https://www.lina-bg.com" },
  { city: "Стара Загора", name: "Лаборатории Зинвест", address: "Стара Загора", phone: "042 625 789", hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-12:00", no_appointment: true, website: "https://synwest.bg" },

  // Плевен
  { city: "Плевен", name: "ЛИНА - Плевен", address: "Плевен (множество локации)", phone: "064 823 456", hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00", no_appointment: true, website: "https://www.lina-bg.com" },
  { city: "Плевен", name: "СМДЛ Лаборатория Рамус - Плевен", address: "Плевен", phone: "02 943 1196", hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-15:30", no_appointment: true, website: "https://ramuslab.com" }
]

// ===================================
// CONFIGURATION
// ===================================

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY // Need service_role for admin access

// Rate limiting (to stay within free tier)
const DELAY_MS = 200 // 200ms delay between requests = 5 requests/sec = safe

// ===================================
// VALIDATION
// ===================================

if (!GOOGLE_PLACES_API_KEY) {
  console.error('❌ ERROR: GOOGLE_PLACES_API_KEY not set!')
  console.log('\nGet your FREE API key:')
  console.log('1. Visit: https://console.cloud.google.com/')
  console.log('2. Enable "Places API"')
  console.log('3. Create API key')
  console.log('4. Run: export GOOGLE_PLACES_API_KEY="your-key"')
  process.exit(1)
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ ERROR: Supabase credentials not set!')
  console.log('Required environment variables:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// ===================================
// SUPABASE CLIENT
// ===================================

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false
  }
})

// ===================================
// GOOGLE PLACES API FUNCTIONS
// ===================================

/**
 * Search for a place using Google Places Text Search
 */
async function searchPlace(labName, city) {
  const query = encodeURIComponent(`${labName} ${city} България`)
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_PLACES_API_KEY}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0] // Return first result
    }

    console.warn(`⚠️  No results for: ${labName} in ${city}`)
    return null
  } catch (error) {
    console.error(`❌ API Error for ${labName}:`, error.message)
    return null
  }
}

/**
 * Get detailed place information (phone, website, hours)
 */
async function getPlaceDetails(placeId) {
  const fields = 'formatted_phone_number,website,opening_hours,international_phone_number,rating,user_ratings_total,url'
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_PLACES_API_KEY}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 'OK') {
      return data.result
    }

    return null
  } catch (error) {
    console.error(`❌ Details API Error:`, error.message)
    return null
  }
}

/**
 * Convert Google opening_hours to JSONB format
 */
function formatWorkingHours(openingHours) {
  if (!openingHours || !openingHours.weekday_text) return null

  const daysMap = {
    'Monday': 'monday',
    'Tuesday': 'tuesday',
    'Wednesday': 'wednesday',
    'Thursday': 'thursday',
    'Friday': 'friday',
    'Saturday': 'saturday',
    'Sunday': 'sunday'
  }

  const hours = {}

  openingHours.weekday_text.forEach(text => {
    // Format: "Monday: 7:00 AM – 6:00 PM"
    const [day, time] = text.split(': ')
    const dayKey = daysMap[day]
    if (dayKey) {
      hours[dayKey] = time || 'Closed'
    }
  })

  return hours
}

/**
 * Identify lab chain from name
 */
function identifyChain(labName) {
  const name = labName.toLowerCase()

  if (name.includes('synevo')) return 'Synevo'
  if (name.includes('кандиларов') || name.includes('kandilarov')) return 'Kandilarov'
  if (name.includes('lina') || name.includes('лина')) return 'LINA'
  if (name.includes('рамус') || name.includes('ramus')) return 'Ramus'
  if (name.includes('цибалаб') || name.includes('cibalab')) return 'Cibalab'
  if (name.includes('my-lab')) return 'My-Lab'

  return null
}

// ===================================
// DATABASE FUNCTIONS
// ===================================

/**
 * Insert or update lab location in Supabase
 */
async function upsertLabLocation(labData) {
  const { data, error } = await supabase
    .from('lab_locations_app')
    .upsert(labData, {
      onConflict: 'google_place_id', // Update if place_id already exists
      ignoreDuplicates: false
    })
    .select()
    .single()

  if (error) {
    console.error('❌ Supabase error:', error.message)
    return null
  }

  return data
}

// ===================================
// MAIN SCRAPER
// ===================================

async function scrapeLab(lab) {
  console.log(`\n🔍 Searching: ${lab.name} (${lab.city})`)

  // Step 1: Find place
  const place = await searchPlace(lab.name, lab.city)
  if (!place) {
    console.log('   ⏭️  Skipped (not found)')
    return null
  }

  console.log(`   ✅ Found: ${place.name}`)
  console.log(`   📍 Address: ${place.formatted_address}`)

  // Step 2: Get details
  await sleep(DELAY_MS) // Rate limiting
  const details = await getPlaceDetails(place.place_id)

  // Step 3: Prepare data
  const labLocation = {
    name: place.name,
    chain: identifyChain(lab.name),
    city: lab.city,
    address: place.formatted_address,
    phone: details?.formatted_phone_number || details?.international_phone_number || lab.phone,
    website: details?.website || lab.website,
    latitude: place.geometry?.location?.lat || null,
    longitude: place.geometry?.location?.lng || null,
    google_place_id: place.place_id,
    google_maps_url: details?.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
    working_hours: formatWorkingHours(details?.opening_hours),
    no_appointment_needed: lab.no_appointment,
    google_rating: details?.rating || null,
    total_reviews: details?.user_ratings_total || null,
    data_source: 'google_places',
    scraped_at: new Date().toISOString(),
    verified: false // Admin will verify later
  }

  console.log(`   ⭐ Rating: ${labLocation.google_rating || 'N/A'} (${labLocation.total_reviews || 0} reviews)`)
  console.log(`   📞 Phone: ${labLocation.phone}`)

  // Step 4: Save to database
  const saved = await upsertLabLocation(labLocation)
  if (saved) {
    console.log(`   💾 Saved to database (ID: ${saved.id})`)
    return saved
  }

  return null
}

/**
 * Sleep helper for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Google Places API Scraper')
  console.log(`📊 Total labs to process: ${LABS.length}`)
  console.log(`⏱️  Rate limit: ${DELAY_MS}ms delay between requests`)
  console.log('=' .repeat(60))

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < LABS.length; i++) {
    const lab = LABS[i]

    try {
      const result = await scrapeLab(lab)
      if (result) {
        successCount++
      } else {
        failCount++
      }

      // Progress
      console.log(`\n   Progress: ${i + 1}/${LABS.length} (✅ ${successCount} | ❌ ${failCount})`)

      // Rate limiting
      await sleep(DELAY_MS)

    } catch (error) {
      console.error(`\n❌ Error processing ${lab.name}:`, error.message)
      failCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✨ SCRAPING COMPLETE!')
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`📊 Total: ${LABS.length}`)

  if (successCount > 0) {
    console.log('\n📍 Next steps:')
    console.log('1. Review data in Supabase: lab_locations_app table')
    console.log('2. Verify and mark accurate locations as verified=true')
    console.log('3. Update frontend to use Supabase data instead of hardcoded LABS')
  }
}

// Run scraper
main().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})