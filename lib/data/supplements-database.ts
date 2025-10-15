/**
 * Supplements Database
 * 15 scientifically-backed supplements for testosterone optimization
 * TestoUP is our flagship product - featured prominently
 */

export interface Supplement {
  id: number
  name: string
  dosage: string
  timing: 'morning' | 'evening' | 'pre-workout' | 'post-workout'
  withFood: string
  withFat: boolean
  category: 'testosterone' | 'sleep' | 'workout' | 'general'
  why: string
  color: string
  isTestoUp?: boolean // Flag for our product
  shopUrl?: string // Link to shop
  benefits?: string[] // Key benefits
}

export interface SupplementInteraction {
  supplements: string[]
  warning: string
  severity: 'low' | 'medium' | 'high'
}

export const SUPPLEMENTS: Supplement[] = [
  // ===== TestoUP - OUR FLAGSHIP PRODUCT (Always first) =====
  {
    id: 1,
    name: 'TestoUP',
    dosage: '2 капсули',
    timing: 'morning',
    withFood: 'С храна',
    withFat: false,
    category: 'testosterone',
    why: 'Научно разработена формула за естествено повишаване на тестостерона. Съдържа 8 активни съставки (D-Aspartic Acid, Tribulus, Fenugreek, Zinc, Magnesium, Vitamin D3, Boron, Black Pepper Extract).',
    color: '#FF6B35',
    isTestoUp: true,
    shopUrl: 'https://shop.testograph.eu/products/testoup',
    benefits: [
      'Повишава тестостерона естествено',
      'Подобрява либидото и енергията',
      'Увеличава мускулната маса',
      'Намалява стреса и кортизола',
      'Подобрява качеството на съня'
    ]
  },
  {
    id: 2,
    name: 'Vitamin D3',
    dosage: '4000 IU',
    timing: 'morning',
    withFood: 'С мазна храна',
    withFat: true,
    category: 'testosterone',
    why: 'Витамин D3 е мастноразтворим и се абсорбира най-добре с мазнини. Подпомага тестостероновото производство.',
    color: '#FFD23F'
  },
  {
    id: 3,
    name: 'Zinc',
    dosage: '15-30 mg',
    timing: 'evening',
    withFood: 'С храна',
    withFat: false,
    category: 'testosterone',
    why: 'Цинкът е критичен за производството на тестостерон. Вечерен прием подобрява качеството на съня.',
    color: '#4ECDC4'
  },
  {
    id: 4,
    name: 'Magnesium',
    dosage: '400 mg',
    timing: 'evening',
    withFood: 'С или без храна',
    withFat: false,
    category: 'sleep',
    why: 'Магнезият подобрява качеството на съня и релаксацията на мускулите. Важен за тестостероновото производство през нощта.',
    color: '#95E1D3'
  },
  {
    id: 5,
    name: 'Omega-3',
    dosage: '2-3 г EPA/DHA',
    timing: 'morning',
    withFood: 'С мазна храна',
    withFat: true,
    category: 'testosterone',
    why: 'Мастните киселини подпомагат хормоналното здраве и намаляват възпалението. Абсорбцията е по-добра с мазнини.',
    color: '#3BADE3'
  },
  {
    id: 6,
    name: 'Creatine',
    dosage: '5 г',
    timing: 'post-workout',
    withFood: 'С или без храна',
    withFat: false,
    category: 'workout',
    why: 'Креатинът подобрява силата и мускулната маса. Най-ефективен след тренировка за възстановяване.',
    color: '#FF6B9D'
  },
  {
    id: 7,
    name: 'Ashwagandha',
    dosage: '300-500 mg',
    timing: 'evening',
    withFood: 'С храна',
    withFat: false,
    category: 'testosterone',
    why: 'Адаптоген, който намалява кортизола и подобрява тестостероновите нива. Вечерен прием подобрява съня.',
    color: '#A8E6CF'
  },
  {
    id: 8,
    name: 'Vitamin C',
    dosage: '1000 mg',
    timing: 'post-workout',
    withFood: 'С или без храна',
    withFat: false,
    category: 'workout',
    why: 'Антиоксидант, който намалява кортизола след тренировка и подпомага възстановяването.',
    color: '#FFD93D'
  },
  {
    id: 9,
    name: 'L-Carnitine',
    dosage: '2 г',
    timing: 'pre-workout',
    withFood: 'На празен стомах',
    withFat: false,
    category: 'workout',
    why: 'Подобрява енергийното производство и изгарянето на мазнини. Най-ефективен преди тренировка.',
    color: '#FF9A76'
  },
  {
    id: 10,
    name: 'Boron',
    dosage: '6-10 mg',
    timing: 'morning',
    withFood: 'С или без храна',
    withFat: false,
    category: 'testosterone',
    why: 'Увеличава свободния тестостерон чрез намаляване на SHBG. Оптимален за сутрешен прием.',
    color: '#FECA57'
  },
  // ===== Additional Popular Supplements =====
  {
    id: 11,
    name: 'Tongkat Ali',
    dosage: '200-400 mg',
    timing: 'morning',
    withFood: 'С храна',
    withFat: false,
    category: 'testosterone',
    why: 'Мощен адаптоген, който повишава свободния тестостерон и намалява кортизола. Подобрява либидото и спортната производителност.',
    color: '#E74C3C'
  },
  {
    id: 12,
    name: 'Fadogia Agrestis',
    dosage: '600 mg',
    timing: 'morning',
    withFood: 'С храна',
    withFat: false,
    category: 'testosterone',
    why: 'Повишава LH (лутеинизиращ хормон), което стимулира продукцията на тестостерон. Комбинира се добре с Tongkat Ali.',
    color: '#C0392B'
  },
  {
    id: 13,
    name: 'Maca Root',
    dosage: '1.5-3 г',
    timing: 'morning',
    withFood: 'С храна',
    withFat: false,
    category: 'testosterone',
    why: 'Перуански суперфуд, който подобрява енергията, либидото и настроението. Балансира хормоните.',
    color: '#F39C12'
  },
  {
    id: 14,
    name: 'Glycine',
    dosage: '3 г',
    timing: 'evening',
    withFood: 'С или без храна',
    withFat: false,
    category: 'sleep',
    why: 'Аминокиселина, която подобрява качеството на съня и намалява температурата на тялото. Синергия с магнезий.',
    color: '#9B59B6'
  },
  {
    id: 15,
    name: 'L-Theanine',
    dosage: '200 mg',
    timing: 'evening',
    withFood: 'С или без храна',
    withFat: false,
    category: 'sleep',
    why: 'Стимулира GABA продукцията за релаксация и качествен сън. Намалява стреса без седативен ефект.',
    color: '#3498DB'
  }
]

export const INTERACTIONS: SupplementInteraction[] = [
  {
    supplements: ['Calcium', 'Zinc'],
    warning: 'Калцият и цинкът се конкурират за абсорбция. Разделете приема им с поне 2 часа.',
    severity: 'high'
  },
  {
    supplements: ['TestoUP', 'Coffee'],
    warning: 'Кафето може да намали абсорбцията на TestoUP. Изчакайте 30-60 минути след приема.',
    severity: 'medium'
  },
  {
    supplements: ['Magnesium', 'Calcium'],
    warning: 'Магнезият и калцият се конкурират за абсорбция. Разделете приема им.',
    severity: 'medium'
  },
  {
    supplements: ['Zinc', 'Iron'],
    warning: 'Желязото и цинкът се конкурират за абсорбция. Не ги комбинирайте.',
    severity: 'high'
  },
  {
    supplements: ['Vitamin D3', 'Vitamin A'],
    warning: 'Високи дози витамин A могат да намалят ефективността на витамин D3.',
    severity: 'low'
  }
]
