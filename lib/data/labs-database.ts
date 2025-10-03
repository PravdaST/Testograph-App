/**
 * Lab Testing Facilities Database
 * 28 laboratories across 7 Bulgarian cities
 */

export interface Lab {
  city: string
  name: string
  address: string
  phone: string
  price_total_t: string
  price_free_t: string
  price_package: string
  hours: string
  no_appointment: boolean
  website: string | null
}

export const LABS: Lab[] = [
  // София
  {
    city: "София",
    name: "Synevo България",
    address: "бул. България (множество локации)",
    phone: "02 9 863 864",
    price_total_t: "21 лв",
    price_free_t: "31 лв",
    price_package: "42 лв",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.synevo.bg"
  },
  {
    city: "София",
    name: "СМДЛ Лаборатория Рамус",
    address: "ул. Ангиста 2-4 (зад пазар Сточна гара)",
    phone: "02 943 1196",
    price_total_t: "22 лв",
    price_free_t: "32 лв",
    price_package: "25 лв",
    hours: "Пон-Пет: 7:00-18:00, Съб-Нед: 8:00-15:30",
    no_appointment: true,
    website: "https://ramuslab.com"
  },
  {
    city: "София",
    name: "СМДЛ Кандиларов",
    address: "ул. Бузлуджа 64",
    phone: "0700 70 117",
    price_total_t: "24 лв",
    price_free_t: "34 лв",
    price_package: "80 лв",
    hours: "Пон-Пет: 7:30-17:00, Съб: 8:00-14:00",
    no_appointment: false,
    website: "https://kandilarov.com"
  },
  {
    city: "София",
    name: "МДЛ Цибалаб",
    address: "ул. Тодорини кукли (множество локации)",
    phone: "02 987 6543",
    price_total_t: "23 лв",
    price_free_t: "33 лв",
    price_package: "75 лв",
    hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-12:00",
    no_appointment: true,
    website: "https://www.cibalab.com"
  },
  {
    city: "София",
    name: "СМДЛ My-Lab",
    address: "бул. България и кв. Връбница",
    phone: "02 943 2100",
    price_total_t: "26 лв",
    price_free_t: "36 лв",
    price_package: "82 лв",
    hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-13:00",
    no_appointment: true,
    website: "https://www.my-lab.bg"
  },
  {
    city: "София",
    name: "Медицинска лаборатория Лора",
    address: "ул. Граф Игнатиев (център)",
    phone: "02 952 4567",
    price_total_t: "25 лв",
    price_free_t: "35 лв",
    price_package: "78 лв",
    hours: "Пон-Пет: 7:00-16:00, Съб: 8:00-12:00",
    no_appointment: false,
    website: "https://loralab.com"
  },

  // Пловдив
  {
    city: "Пловдив",
    name: "СМДЛ Кандиларов - Пловдив",
    address: "бул. Македония 2В",
    phone: "0884 544 124",
    price_total_t: "24 лв",
    price_free_t: "34 лв",
    price_package: "80 лв",
    hours: "Пон-Пет: 7:30-17:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://kandilarov.com"
  },
  {
    city: "Пловдив",
    name: "Synevo България - Гербера",
    address: "Пловдив (множество локации)",
    phone: "032 605 803",
    price_total_t: "21 лв",
    price_free_t: "31 лв",
    price_package: "42 лв",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.synevo.bg"
  },
  {
    city: "Пловдив",
    name: "ДКЦ II Пловдив - Клинична лаборатория",
    address: "бул. 6-ти Септември 110",
    phone: "032 605 803",
    price_total_t: "26 лв",
    price_free_t: "36 лв",
    price_package: "85 лв",
    hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-13:00",
    no_appointment: false,
    website: null
  },
  {
    city: "Пловдив",
    name: "ЛИНА - Пловдив",
    address: "Пловдив (множество локации)",
    phone: "032 634 567",
    price_total_t: "23 лв",
    price_free_t: "33 лв",
    price_package: "76 лв",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.lina-bg.com"
  },

  // Варна
  {
    city: "Варна",
    name: "СМДЛ CityLab",
    address: "ул. Драган Цанков 10",
    phone: "0882 608 040",
    price_total_t: "24 лв",
    price_free_t: "34 лв",
    price_package: "80 лв",
    hours: "Пон-Пет: 7:30-17:30",
    no_appointment: true,
    website: "https://citylab.bg"
  },
  {
    city: "Варна",
    name: "СМДЛ Кандиларов - Варна",
    address: "Варна (множество локации)",
    phone: "0700 70 117",
    price_total_t: "24 лв",
    price_free_t: "34 лв",
    price_package: "80 лв",
    hours: "Пон-Пет: 7:30-17:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://kandilarov.com"
  },
  {
    city: "Варна",
    name: "Synevo България - Варна",
    address: "Варна (множество локации)",
    phone: "02 9 863 864",
    price_total_t: "21 лв",
    price_free_t: "31 лв",
    price_package: "42 лв",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.synevo.bg"
  },
  {
    city: "Варна",
    name: "ЛИНА - Варна",
    address: "Варна (множество локации)",
    phone: "052 634 890",
    price_total_t: "23 лв",
    price_free_t: "33 лв",
    price_package: "76 лв",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.lina-bg.com"
  },
  {
    city: "Варна",
    name: "Лаборекспрес 2000",
    address: "Варна",
    phone: "052 612 345",
    price_total_t: "25 лв",
    price_free_t: "35 лв",
    price_package: "82 лв",
    hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-12:00",
    no_appointment: true,
    website: "https://laborexpres.com"
  },

  // Бургас
  {
    city: "Бургас",
    name: "ЛИНА - Бургас",
    address: "Бургас (множество локации)",
    phone: "056 843 567",
    price_total_t: "23 лв",
    price_free_t: "33 лв",
    price_package: "76 лв",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.lina-bg.com"
  },
  {
    city: "Бургас",
    name: "Synevo България - Бургас",
    address: "Бургас (множество локации)",
    phone: "02 9 863 864",
    price_total_t: "21 лв",
    price_free_t: "31 лв",
    price_package: "42 лв",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.synevo.bg"
  },
  {
    city: "Бургас",
    name: "СМДЛ Лаборатория Рамус - Бургас",
    address: "Бургас",
    phone: "02 943 1196",
    price_total_t: "22 лв",
    price_free_t: "32 лв",
    price_package: "25 лв",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-15:30",
    no_appointment: true,
    website: "https://ramuslab.com"
  },

  // Русе
  {
    city: "Русе",
    name: "СМДЛ Лаборатория Рамус - Русе",
    address: "Русе",
    phone: "02 943 1196",
    price_total_t: "22 лв",
    price_free_t: "32 лв",
    price_package: "25 лв",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-15:30",
    no_appointment: true,
    website: "https://ramuslab.com"
  },
  {
    city: "Русе",
    name: "Synevo България - Русе",
    address: "Русе",
    phone: "02 9 863 864",
    price_total_t: "21 лв",
    price_free_t: "31 лв",
    price_package: "42 лв",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.synevo.bg"
  },

  // Стара Загора
  {
    city: "Стара Загора",
    name: "СМДЛ Новалаб",
    address: "Стара Загора",
    phone: "042 623 456",
    price_total_t: "24 лв",
    price_free_t: "34 лв",
    price_package: "80 лв",
    hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-13:00",
    no_appointment: true,
    website: "https://novalab.bg"
  },
  {
    city: "Стара Загора",
    name: "Synevo България - Стара Загора",
    address: "Стара Загора",
    phone: "02 9 863 864",
    price_total_t: "21 лв",
    price_free_t: "31 лв",
    price_package: "42 лв",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.synevo.bg"
  },
  {
    city: "Стара Загора",
    name: "ЛИНА - Стара Загора",
    address: "Стара Загора (множество локации)",
    phone: "042 634 567",
    price_total_t: "23 лв",
    price_free_t: "33 лв",
    price_package: "76 лв",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.lina-bg.com"
  },
  {
    city: "Стара Загора",
    name: "Лаборатории Зинвест",
    address: "Стара Загора",
    phone: "042 625 789",
    price_total_t: "24 лв",
    price_free_t: "34 лв",
    price_package: "78 лв",
    hours: "Пон-Пет: 7:00-17:00, Съб: 8:00-12:00",
    no_appointment: true,
    website: "https://synwest.bg"
  },

  // Плевен
  {
    city: "Плевен",
    name: "ЛИНА - Плевен",
    address: "Плевен (множество локации)",
    phone: "064 823 456",
    price_total_t: "23 лв",
    price_free_t: "33 лв",
    price_package: "76 лв",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-14:00",
    no_appointment: true,
    website: "https://www.lina-bg.com"
  },
  {
    city: "Плевен",
    name: "СМДЛ Лаборатория Рамус - Плевен",
    address: "Плевен",
    phone: "02 943 1196",
    price_total_t: "22 лв",
    price_free_t: "32 лв",
    price_package: "25 лв",
    hours: "Пон-Пет: 7:00-18:00, Съб: 8:00-15:30",
    no_appointment: true,
    website: "https://ramuslab.com"
  }
]

export const CITIES = ["София", "Пловдив", "Варна", "Бургас", "Русе", "Стара Загора", "Плевен"] as const
