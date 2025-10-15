/**
 * Scrape ALL laboratories in Bulgarian cities
 *
 * This scraper finds ALL labs in major cities using Google Places API
 * Search query: "medical laboratory" + city name
 */

import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Bulgarian cities to search
const CITIES = [
  "София",
  "Пловдив",
  "Варна",
  "Бургас",
  "Русе",
  "Стара Загора",
  "Плевен",
  "Сливен",
  "Добрич",
  "Перник",
  "Хасково",
  "Ямбол",
  "Пазарджик",
  "Благоевград",
  "Велико Търново",
  "Враца",
  "Габрово",
  "Асеновград",
  "Видин",
  "Казанлък"
]

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * Search for ALL labs in a city using Google Places Nearby Search
 */
async function searchLabsInCity(city) {
  // Search query: "лаборатория" + city name
  const query = encodeURIComponent(`медицинска лаборатория ${city} България`)
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_PLACES_API_KEY}&language=bg`

  const response = await fetch(url)
  const data = await response.json()

  if (data.status === 'OK') {
    return data.results
  }

  console.warn(`⚠️  No results for ${city}`)
  return []
}

/**
 * Get place details
 */
async function getPlaceDetails(placeId) {
  const fields = 'formatted_phone_number,website,opening_hours,international_phone_number,rating,user_ratings_total,url'
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_PLACES_API_KEY}&language=bg`

  const response = await fetch(url)
  const data = await response.json()

  if (data.status === 'OK') {
    return data.result
  }
  return null
}

/**
 * Format working hours to JSONB
 */
function formatWorkingHours(openingHours) {
  if (!openingHours || !openingHours.weekday_text) return null

  const daysMap = {
    'понеделник': 'monday',
    'вторник': 'tuesday',
    'сряда': 'wednesday',
    'четвъртък': 'thursday',
    'петък': 'friday',
    'събота': 'saturday',
    'неделя': 'sunday'
  }

  const hours = {}

  openingHours.weekday_text.forEach(text => {
    const lowerText = text.toLowerCase()
    for (const [bgDay, enDay] of Object.entries(daysMap)) {
      if (lowerText.includes(bgDay)) {
        const time = text.split(':').slice(1).join(':').trim()
        hours[enDay] = time || 'Затворено'
        break
      }
    }
  })

  return Object.keys(hours).length > 0 ? hours : null
}

/**
 * Identify lab chain
 */
function identifyChain(name) {
  const nameLower = name.toLowerCase()

  if (nameLower.includes('synevo') || nameLower.includes('синево')) return 'Synevo'
  if (nameLower.includes('кандиларов') || nameLower.includes('kandilarov')) return 'Kandilarov'
  if (nameLower.includes('lina') || nameLower.includes('лина')) return 'LINA'
  if (nameLower.includes('рамус') || nameLower.includes('ramus')) return 'Ramus'
  if (nameLower.includes('цибалаб') || nameLower.includes('cibalab')) return 'Cibalab'
  if (nameLower.includes('my-lab')) return 'My-Lab'

  return null
}

/**
 * Save lab to Supabase
 */
async function upsertLabLocation(labData) {
  const { data, error } = await supabase
    .from('lab_locations_app')
    .upsert(labData, {
      onConflict: 'google_place_id',
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

/**
 * Process a single lab
 */
async function processLab(place, city) {
  console.log(`   ✅ Found: ${place.name}`)

  // Get details
  await sleep(200) // Rate limiting
  const details = await getPlaceDetails(place.place_id)

  const labData = {
    name: place.name,
    chain: identifyChain(place.name),
    city: city,
    address: place.formatted_address,
    phone: details?.formatted_phone_number || details?.international_phone_number || null,
    website: details?.website || null,
    latitude: place.geometry?.location?.lat || null,
    longitude: place.geometry?.location?.lng || null,
    google_place_id: place.place_id,
    google_maps_url: details?.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
    working_hours: formatWorkingHours(details?.opening_hours),
    no_appointment_needed: false, // Default
    google_rating: details?.rating || null,
    total_reviews: details?.user_ratings_total || null,
    data_source: 'google_places',
    scraped_at: new Date().toISOString(),
    verified: false
  }

  console.log(`      📍 ${labData.address}`)
  console.log(`      ⭐ Rating: ${labData.google_rating || 'N/A'} (${labData.total_reviews || 0} reviews)`)

  const saved = await upsertLabLocation(labData)
  if (saved) {
    console.log(`      💾 Saved (ID: ${saved.id})`)
    return true
  }

  return false
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Scraping ALL labs in Bulgaria')
  console.log(`📊 Cities to search: ${CITIES.length}`)
  console.log('=' .repeat(60))

  let totalSuccess = 0
  let totalFailed = 0

  for (const city of CITIES) {
    console.log(`\n🔍 Searching labs in: ${city}`)

    try {
      const places = await searchLabsInCity(city)
      console.log(`   Found ${places.length} labs`)

      for (const place of places) {
        try {
          const success = await processLab(place, city)
          if (success) {
            totalSuccess++
          } else {
            totalFailed++
          }

          await sleep(200) // Rate limiting
        } catch (error) {
          console.error(`   ❌ Error processing ${place.name}:`, error.message)
          totalFailed++
        }
      }

      // Longer delay between cities
      await sleep(500)

    } catch (error) {
      console.error(`❌ Error searching ${city}:`, error.message)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✨ SCRAPING COMPLETE!')
  console.log(`✅ Success: ${totalSuccess}`)
  console.log(`❌ Failed: ${totalFailed}`)
  console.log(`📊 Total processed: ${totalSuccess + totalFailed}`)
  console.log('\n📍 Next: Review data in Supabase → lab_locations_app')
}

main().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
