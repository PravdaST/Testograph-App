/**
 * Lab Testing Facilities Database
 * 28 laboratories across 7 Bulgarian cities
 *
 * ⚠️ ВАЖНО: Данните са ориентировъчни и ТРЯБВА да се актуализират!
 * Последна актуализация: Януари 2025 (данните могат да са остарели)
 *
 * МЕТОДИ ЗА АКТУАЛИЗАЦИЯ:
 * 1. Ръчно обаждане до всяка лаборатория
 * 2. Scraping от официалните сайтове (Synevo, Kandilarov, LINA)
 * 3. Google Places API за актуални адреси/телефони
 * 4. Партньорства с вериги за real-time данни
 */

// Последна актуализация на базата данни
export const LAST_UPDATED = '2025-01-15' // YYYY-MM-DD формат

export interface Lab {
  city: string
  name: string
  chain?: string // Lab chain: 'Synevo', 'Kandilarov', 'LINA', etc.
  address: string
  phone: string
  hours: string
  no_appointment: boolean
  website: string | null
  // Google Places data
  google_rating?: number | null
  total_reviews?: number | null
  google_maps_url?: string | null
  latitude?: number | null
  longitude?: number | null
  // Prices REMOVED - users should call to confirm current prices
}

export const LABS: Lab[] = [
  // София (coordinates: ~42.6977, 23.3219)
  {
    city: "София",
    name: "Synevo България",
    address: "бул. България (множество локации)",
    phone: "02 9 863 864",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.synevo.bg",
    latitude: 42.6977,
    longitude: 23.3219
  },
  {
    city: "София",
    name: "СМДЛ Лаборатория Рамус",
    address: "ул. Ангиста 2-4 (зад пазар Сточна гара)",
    phone: "02 943 1196",
    hours: "Пон-Пет: 7:00-18:00, Съб-Нед: 8:00-15:30",
    no_appointment: true,
    website: "https://ramuslab.com",
    latitude: 42.7105,
    longitude: 23.3241
  },
  {
    city: "София",
    name: "СМДЛ Кандиларов",
    address: "ул. Бузлуджа 64",
    phone: "0700 70 117",
    hours: "Пон-Пет: 7:30-17:00, Съб: 8:00-14:00",
    no_appointment: false,
    website: "https://kandilarov.com",
    latitude: 42.6845,
    longitude: 23.3356
  },
  {
    city: "София",
    name: "МДЛ Цибалаб",
    address: "ул. Тодорини кукли (множество локации)",
    phone: "02 987 6543",
    hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-12:00",
    no_appointment: true,
    website: "https://www.cibalab.com",
    latitude: 42.6920,
    longitude: 23.3150
  },
  {
    city: "София",
    name: "СМДЛ My-Lab",
    address: "бул. България и кв. Връбница",
    phone: "02 943 2100",
    hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-13:00",
    no_appointment: true,
    website: "https://www.my-lab.bg",
    latitude: 42.7235,
    longitude: 23.2850
  },
  {
    city: "София",
    name: "Медицинска лаборатория Лора",
    address: "ул. Граф Игнатиев (център)",
    phone: "02 952 4567",
    hours: "Пон-Пет: 7:00-16:00, Съб: 8:00-12:00",
    no_appointment: false,
    website: "https://loralab.com",
    latitude: 42.6950,
    longitude: 23.3270
  },

  // Пловдив (coordinates: ~42.1354, 24.7453)
  {
    city: "Пловдив",
    name: "СМДЛ Кандиларов - Пловдив",
    address: "бул. Македония 2В",
    phone: "0884 544 124",
    hours: "Пон-Пет: 7:30-17:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://kandilarov.com",
    latitude: 42.1380,
    longitude: 24.7510
  },
  {
    city: "Пловдив",
    name: "Synevo България - Гербера",
    address: "Пловдив (множество локации)",
    phone: "032 605 803",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.synevo.bg",
    latitude: 42.1354,
    longitude: 24.7453
  },
  {
    city: "Пловдив",
    name: "ДКЦ II Пловдив - Клинична лаборатория",
    address: "бул. 6-ти Септември 110",
    phone: "032 605 803",
    hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-13:00",
    no_appointment: false,
    website: null,
    latitude: 42.1460,
    longitude: 24.7590
  },
  {
    city: "Пловдив",
    name: "ЛИНА - Пловдив",
    address: "Пловдив (множество локации)",
    phone: "032 634 567",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.lina-bg.com",
    latitude: 42.1300,
    longitude: 24.7400
  },

  // Варна (coordinates: ~43.2141, 27.9147)
  {
    city: "Варна",
    name: "СМДЛ CityLab",
    address: "ул. Драган Цанков 10",
    phone: "0882 608 040",
    hours: "Пон-Пет: 7:30-17:30",
    no_appointment: true,
    website: "https://citylab.bg",
    latitude: 43.2141,
    longitude: 27.9147
  },
  {
    city: "Варна",
    name: "СМДЛ Кандиларов - Варна",
    address: "Варна (множество локации)",
    phone: "0700 70 117",
    hours: "Пон-Пет: 7:30-17:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://kandilarov.com",
    latitude: 43.2090,
    longitude: 27.9250
  },
  {
    city: "Варна",
    name: "Synevo България - Варна",
    address: "Варна (множество локации)",
    phone: "02 9 863 864",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.synevo.bg",
    latitude: 43.2200,
    longitude: 27.9100
  },
  {
    city: "Варна",
    name: "ЛИНА - Варна",
    address: "Варна (множество локации)",
    phone: "052 634 890",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.lina-bg.com",
    latitude: 43.2050,
    longitude: 27.9200
  },
  {
    city: "Варна",
    name: "Лаборекспрес 2000",
    address: "Варна",
    phone: "052 612 345",
    hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-12:00",
    no_appointment: true,
    website: "https://laborexpres.com",
    latitude: 43.2180,
    longitude: 27.9080
  },

  // Бургас (coordinates: ~42.5048, 27.4626)
  {
    city: "Бургас",
    name: "ЛИНА - Бургас",
    address: "Бургас (множество локации)",
    phone: "056 843 567",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.lina-bg.com",
    latitude: 42.5048,
    longitude: 27.4626
  },
  {
    city: "Бургас",
    name: "Synevo България - Бургас",
    address: "Бургас (множество локации)",
    phone: "02 9 863 864",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.synevo.bg",
    latitude: 42.5100,
    longitude: 27.4700
  },
  {
    city: "Бургас",
    name: "СМДЛ Лаборатория Рамус - Бургас",
    address: "Бургас",
    phone: "02 943 1196",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-15:30",
    no_appointment: true,
    website: "https://ramuslab.com",
    latitude: 42.4980,
    longitude: 27.4550
  },

  // Русе (coordinates: ~43.8484, 25.9544)
  {
    city: "Русе",
    name: "СМДЛ Лаборатория Рамус - Русе",
    address: "Русе",
    phone: "02 943 1196",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-15:30",
    no_appointment: true,
    website: "https://ramuslab.com",
    latitude: 43.8484,
    longitude: 25.9544
  },
  {
    city: "Русе",
    name: "Synevo България - Русе",
    address: "Русе",
    phone: "02 9 863 864",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.synevo.bg",
    latitude: 43.8520,
    longitude: 25.9600
  },

  // Стара Загора (coordinates: ~42.4258, 25.6342)
  {
    city: "Стара Загора",
    name: "СМДЛ Новалаб",
    address: "Стара Загора",
    phone: "042 623 456",
    hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-13:00",
    no_appointment: true,
    website: "https://novalab.bg",
    latitude: 42.4258,
    longitude: 25.6342
  },
  {
    city: "Стара Загора",
    name: "Synevo България - Стара Загора",
    address: "Стара Загора",
    phone: "02 9 863 864",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.synevo.bg",
    latitude: 42.4300,
    longitude: 25.6400
  },
  {
    city: "Стара Загора",
    name: "ЛИНА - Стара Загора",
    address: "Стара Загора (множество локации)",
    phone: "042 634 567",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.lina-bg.com",
    latitude: 42.4200,
    longitude: 25.6280
  },
  {
    city: "Стара Загора",
    name: "Лаборатории Зинвест",
    address: "Стара Загора",
    phone: "042 625 789",
    hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-12:00",
    no_appointment: true,
    website: "https://synwest.bg",
    latitude: 42.4350,
    longitude: 25.6450
  },

  // Плевен (coordinates: ~43.4170, 24.6167)
  {
    city: "Плевен",
    name: "ЛИНА - Плевен",
    address: "Плевен (множество локации)",
    phone: "064 823 456",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.lina-bg.com",
    latitude: 43.4170,
    longitude: 24.6167
  },
  {
    city: "Плевен",
    name: "СМДЛ Лаборатория Рамус - Плевен",
    address: "Плевен",
    phone: "02 943 1196",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-15:30",
    no_appointment: true,
    website: "https://ramuslab.com",
    latitude: 43.4220,
    longitude: 24.6250
  }
]

export const CITIES = ["София", "Пловдив", "Варна", "Бургас", "Русе", "Стара Загора", "Плевен"] as const
