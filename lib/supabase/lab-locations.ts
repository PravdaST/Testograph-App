/**
 * Lab Locations Supabase Queries
 * Fetches real lab data from lab_locations_app table
 */

import { createClient } from '@/lib/supabase/client'
import type { Lab } from '@/lib/data/labs-database'

/**
 * Lab Location from Supabase (matches lab_locations_app table)
 */
export interface LabLocationDB {
  id: string
  name: string
  chain: string | null
  city: string
  address: string
  phone: string | null
  website: string | null
  email: string | null
  latitude: number | null
  longitude: number | null
  google_place_id: string | null
  google_maps_url: string | null
  working_hours: Record<string, string> | null
  no_appointment_needed: boolean
  verified: boolean
  last_verified_at: string | null
  google_rating: number | null
  total_reviews: number | null
  data_source: string
  scraped_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Format working hours from JSONB to readable string
 */
function formatWorkingHours(workingHours: Record<string, string> | null): string {
  if (!workingHours) return 'Обадете се за часове'

  const days = workingHours as Record<string, string>
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  const weekend = ['saturday', 'sunday']

  // Check if all weekdays have the same hours
  const weekdayHours = weekdays.map(day => days[day]).filter(Boolean)
  const allWeekdaysSame = weekdayHours.length > 0 && weekdayHours.every(h => h === weekdayHours[0])

  if (allWeekdaysSame && weekdayHours.length === 5) {
    const saturdayHours = days['saturday']
    const sundayHours = days['sunday']

    let result = `Пон-Пет: ${weekdayHours[0]}`

    if (saturdayHours && saturdayHours !== 'Затворено') {
      result += `, Съб: ${saturdayHours}`
    }
    if (sundayHours && sundayHours !== 'Затворено') {
      result += `, Нед: ${sundayHours}`
    }

    return result
  }

  // Fallback: show first available day
  return days.monday || days.tuesday || days.wednesday || 'Обадете се за часове'
}

/**
 * Transform Supabase lab to App format
 */
export function transformLabLocation(dbLab: LabLocationDB): Lab {
  return {
    city: dbLab.city,
    name: dbLab.name,
    chain: dbLab.chain || undefined,
    address: dbLab.address,
    phone: dbLab.phone || 'Няма данни',
    hours: formatWorkingHours(dbLab.working_hours),
    no_appointment: dbLab.no_appointment_needed,
    website: dbLab.website,
    google_rating: dbLab.google_rating,
    total_reviews: dbLab.total_reviews,
    google_maps_url: dbLab.google_maps_url,
    latitude: dbLab.latitude,
    longitude: dbLab.longitude
  }
}

/**
 * Fetch all verified labs from Supabase
 */
export async function fetchVerifiedLabs(): Promise<Lab[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('lab_locations_app')
    .select('*')
    .eq('verified', true) // Only verified labs
    .order('city, name')

  if (error) {
    console.error('Error fetching labs:', error)
    return []
  }

  if (!data || data.length === 0) {
    console.warn('No verified labs found in database')
    return []
  }

  return data.map(transformLabLocation)
}

/**
 * Fetch ALL labs (including unverified) - for admin review
 */
export async function fetchAllLabs(): Promise<Lab[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('lab_locations_app')
    .select('*')
    .order('verified DESC, city, name') // Verified first

  if (error) {
    console.error('Error fetching labs:', error)
    return []
  }

  return data ? data.map(transformLabLocation) : []
}

/**
 * Fetch labs by city
 */
export async function fetchLabsByCity(city: string): Promise<Lab[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('lab_locations_app')
    .select('*')
    .eq('city', city)
    .eq('verified', true)
    .order('name')

  if (error) {
    console.error('Error fetching labs by city:', error)
    return []
  }

  return data ? data.map(transformLabLocation) : []
}

/**
 * Get unique cities with lab count
 */
export async function fetchCitiesWithCount(): Promise<{ city: string; count: number }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('lab_locations_app')
    .select('city')
    .eq('verified', true)

  if (error) {
    console.error('Error fetching cities:', error)
    return []
  }

  // Count labs per city
  const cityMap = new Map<string, number>()

  data?.forEach(lab => {
    const count = cityMap.get(lab.city) || 0
    cityMap.set(lab.city, count + 1)
  })

  return Array.from(cityMap.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => a.city.localeCompare(b.city, 'bg'))
}
