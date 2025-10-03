/**
 * Bulgarian Retail Pack Sizes Database
 * Reflects actual product packaging in Fantastico, Kaufland, Billa, Lidl
 * Updated: October 2025
 */

export interface PackSize {
  product: string
  standardPack: number // grams or ml
  unit: 'г' | 'мл' | 'бр' | 'л'
  retailName: string // How it's sold in stores
  notes?: string
}

export const BULGARIAN_PACK_SIZES: Record<string, PackSize> = {
  // ===== МЛЕЧНИ ПРОДУКТИ =====
  'кисело мляко': {
    product: 'кисело мляко',
    standardPack: 400,
    unit: 'г',
    retailName: 'кофичка',
    notes: 'Стандартна опаковка 400г (Бор Чвор, Верея, Мандра)'
  },

  'мляко': {
    product: 'мляко',
    standardPack: 1000,
    unit: 'мл',
    retailName: 'кутия',
    notes: '1л кутия е стандарт'
  },

  'извара': {
    product: 'извара',
    standardPack: 250,
    unit: 'г',
    retailName: 'пакет',
    notes: 'Стандартен пакет 250г'
  },

  'сирене': {
    product: 'сирене',
    standardPack: 400,
    unit: 'г',
    retailName: 'пакет',
    notes: 'Често се продава и на кило, но пакетирано = 400г'
  },

  'кашкавал': {
    product: 'кашкавал',
    standardPack: 200,
    unit: 'г',
    retailName: 'парче',
    notes: 'Нарязан ~200г парче е стандарт за household'
  },

  'фета сирене': {
    product: 'фета',
    standardPack: 200,
    unit: 'г',
    retailName: 'пакет',
    notes: 'Гръцка фета обикновено 200г'
  },

  'крема сирене': {
    product: 'крема сирене',
    standardPack: 150,
    unit: 'г',
    retailName: 'кофичка',
    notes: 'Philadelphia style - 150г кофичка'
  },

  // ===== ЯЙЦА =====
  'яйца': {
    product: 'яйца',
    standardPack: 10,
    unit: 'бр',
    retailName: 'картон',
    notes: '10 яйца в картон е стандарт'
  },

  // ===== ПЛОДОВЕ =====
  'банан': {
    product: 'банан',
    standardPack: 1,
    unit: 'бр',
    retailName: 'банан',
    notes: '~120г средно'
  },

  'ябълка': {
    product: 'ябълка',
    standardPack: 1,
    unit: 'бр',
    retailName: 'ябълка',
    notes: '~150г средно'
  },

  'авокадо': {
    product: 'авокадо',
    standardPack: 1,
    unit: 'бр',
    retailName: 'авокадо',
    notes: '~200г средно'
  },

  'боровинки': {
    product: 'боровинки',
    standardPack: 125,
    unit: 'г',
    retailName: 'пакет',
    notes: 'Замразени боровинки - 125г пакет'
  },

  'смокини': {
    product: '',
    standardPack: 1,
    unit: 'бр',
    retailName: 'смокина',
    notes: '~50г средно'
  },

  // ===== ЗЕЛЕНЧУЦИ =====
  'домат': {
    product: 'домат',
    standardPack: 1,
    unit: 'бр',
    retailName: 'домат',
    notes: '~100г средно'
  },

  'краставица': {
    product: 'краставица',
    standardPack: 1,
    unit: 'бр',
    retailName: 'краставица',
    notes: '~150г средно'
  },

  'броколи': {
    product: 'броколи',
    standardPack: 500,
    unit: 'г',
    retailName: 'глава',
    notes: '1 глава броколи ~500г'
  },

  'спанак': {
    product: 'спанак',
    standardPack: 250,
    unit: 'г',
    retailName: 'пакет',
    notes: 'Замразен спанак 250г'
  },

  'тиквички': {
    product: '',
    standardPack: 1,
    unit: 'бр',
    retailName: 'тиквичка',
    notes: '~250г средно'
  },

  'картофи': {
    product: 'картофи',
    standardPack: 2000,
    unit: 'г',
    retailName: 'чувал',
    notes: '2кг чувал е стандарт, но се продават и поединично'
  },

  'батат': {
    product: 'батат',
    standardPack: 1,
    unit: 'бр',
    retailName: 'батат',
    notes: '~200г средно'
  },

  // ===== МЕСО И РИБА =====
  'пилешки гърди': {
    product: 'пилешки гърди',
    standardPack: 500,
    unit: 'г',
    retailName: 'опаковка',
    notes: 'Стандартна опаковка 500г (~2 гърди)'
  },

  'пилешки бут': {
    product: 'пилешки бут',
    standardPack: 1,
    unit: 'бр',
    retailName: 'бут',
    notes: '~250г средно'
  },

  'пилешки крилца': {
    product: 'пилешки крилца',
    standardPack: 500,
    unit: 'г',
    retailName: 'опаковка',
    notes: 'Стандартна опаковка 500г'
  },

  'говеждо месо': {
    product: 'говеждо месо',
    standardPack: 500,
    unit: 'г',
    retailName: 'опаковка',
    notes: 'Нарязано месо 500г опаковка'
  },

  'телешко филе': {
    product: 'телешко филе',
    standardPack: 500,
    unit: 'г',
    retailName: 'опаковка',
    notes: 'Стандартна опаковка 500г'
  },

  'свински врат': {
    product: 'свински врат',
    standardPack: 500,
    unit: 'г',
    retailName: 'опаковка',
    notes: 'Нарязан 500г'
  },

  'кюфтета': {
    product: '',
    standardPack: 1,
    unit: 'бр',
    retailName: 'кюфте',
    notes: '~80г едно кюфте'
  },

  'кебапчета': {
    product: '',
    standardPack: 1,
    unit: 'бр',
    retailName: 'кебапче',
    notes: '~80г едно кебапче'
  },

  'сьомга': {
    product: 'сьомга',
    standardPack: 200,
    unit: 'г',
    retailName: 'филе',
    notes: '1 филе сьомга ~200г'
  },

  'пъстърва': {
    product: 'пъстърва',
    standardPack: 300,
    unit: 'г',
    retailName: 'риба',
    notes: '1 пъстърва ~300г'
  },

  'скумрия': {
    product: 'скумрия',
    standardPack: 1,
    unit: 'бр',
    retailName: 'риба',
    notes: '1 скумрия ~200г'
  },

  'риба тон': {
    product: 'тон консерва',
    standardPack: 160,
    unit: 'г',
    retailName: 'консерва',
    notes: 'Стандартна консерва 160г (Rio Mare стил)'
  },

  'скариди': {
    product: 'скариди',
    standardPack: 250,
    unit: 'г',
    retailName: 'пакет',
    notes: 'Замразени 250г пакет'
  },

  // ===== ЗЪРНЕНИ И ТЕСТЕНИ =====
  'ориз': {
    product: 'ориз',
    standardPack: 500,
    unit: 'г',
    retailName: 'пакет',
    notes: '500г пакет е най-често (Uncle Ben\'s стил)'
  },

  'паста': {
    product: 'паста',
    standardPack: 500,
    unit: 'г',
    retailName: 'пакет',
    notes: '500г стандарт (Barilla стил)'
  },

  'овесени ядки': {
    product: 'овесени ядки',
    standardPack: 500,
    unit: 'г',
    retailName: 'пакет',
    notes: '500г пакет Quaker стил'
  },

  'булгур': {
    product: 'булгур',
    standardPack: 500,
    unit: 'г',
    retailName: 'пакет',
    notes: '500г пакет'
  },

  'киноа': {
    product: 'киноа',
    standardPack: 250,
    unit: 'г',
    retailName: 'пакет',
    notes: '250г пакет (по-скъп продукт)'
  },

  'хляб': {
    product: 'хляб',
    standardPack: 400,
    unit: 'г',
    retailName: 'хляб',
    notes: '1 хляб ~400г (нарязан ~13 филии)'
  },

  'филия хляб': {
    product: 'филия хляб',
    standardPack: 30,
    unit: 'г',
    retailName: 'филия',
    notes: '1 филия ~30г'
  },

  // ===== ДРУГИ =====
  'протеинов прах': {
    product: 'протеинов прах',
    standardPack: 30,
    unit: 'г',
    retailName: 'мерителна лъжица',
    notes: '1 scoop = ~30г'
  },

  'фъстъчено масло': {
    product: 'фъстъчено масло',
    standardPack: 350,
    unit: 'г',
    retailName: 'буркан',
    notes: '350г буркан е стандарт'
  },

  'мед': {
    product: 'мед',
    standardPack: 400,
    unit: 'г',
    retailName: 'буркан',
    notes: '400г буркан е стандарт'
  },

  'зехтин': {
    product: 'зехтин',
    standardPack: 500,
    unit: 'мл',
    retailName: 'бутилка',
    notes: '500мл е често срещан размер'
  },

  'масло': {
    product: 'масло',
    standardPack: 250,
    unit: 'г',
    retailName: 'пакет',
    notes: '250г кубче масло'
  },

  'ядки': {
    product: 'смесени ядки',
    standardPack: 200,
    unit: 'г',
    retailName: 'пакет',
    notes: '200г пакет микс ядки'
  },

  'бадеми': {
    product: 'бадеми',
    standardPack: 200,
    unit: 'г',
    retailName: 'пакет',
    notes: '200г пакет'
  },
}

/**
 * Get pack information for an ingredient
 */
export function getPackInfo(ingredientName: string): PackSize | null {
  const normalized = ingredientName.toLowerCase().trim()

  // Try exact match first
  if (BULGARIAN_PACK_SIZES[normalized]) {
    return BULGARIAN_PACK_SIZES[normalized]
  }

  // Try partial match
  for (const [key, value] of Object.entries(BULGARIAN_PACK_SIZES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value
    }
  }

  return null
}

/**
 * Convert grams to pack count
 * Examples:
 * - 400g кисело мляко → "1 кофичка"
 * - 650g кисело мляко → "2 кофички" (1.625 rounds up)
 * - 30 яйца → "3 картона"
 */
export function convertToPackFormat(
  ingredientName: string,
  quantity: number,
  unit: string
): string {
  const packInfo = getPackInfo(ingredientName)

  if (!packInfo) {
    // No pack info - return original format
    return `${quantity}${unit} ${ingredientName}`
  }

  // Calculate pack count
  const packCount = Math.ceil(quantity / packInfo.standardPack)

  // Pluralize retail name
  const retailNamePlural = pluralizePackName(packInfo.retailName, packCount)

  // Return formatted string
  // For single items without packaging (like fruits), don't show pack size
  const isSingleItem = packInfo.retailName === ingredientName.toLowerCase()

  if (isSingleItem) {
    // Single items like "5 банана" (not "5 банана банан")
    return `${packCount} ${retailNamePlural}`
  } else if (packCount === 1) {
    const productPart = packInfo.product ? ` ${packInfo.product}` : ''
    return `${packInfo.retailName}${productPart} (${packInfo.standardPack}${packInfo.unit})`
  } else {
    const productPart = packInfo.product ? ` ${packInfo.product}` : ''
    // If product is empty, don't show count prefix (e.g. "кюфтета (4бр)" not "4 кюфтета (4бр)")
    const countPrefix = packInfo.product ? `${packCount} ` : ''
    return `${countPrefix}${retailNamePlural}${productPart} (${packCount * packInfo.standardPack}${packInfo.unit})`
  }
}

/**
 * Bulgarian pluralization for pack names
 */
function pluralizePackName(name: string, count: number): string {
  if (count === 1) return name

  const pluralMap: Record<string, string> = {
    'кофичка': 'кофички',
    'кутия': 'кутии',
    'пакет': 'пакета',
    'парче': 'парчета',
    'картон': 'картона',
    'банан': 'банана',
    'ябълка': 'ябълки',
    'авокадо': 'авокадота',
    'глава': 'глави',
    'домат': 'домата',
    'краставица': 'краставици',
    'тиквичка': 'тиквички',
    'чувал': 'чувала',
    'батат': 'батата',
    'опаковка': 'опаковки',
    'бут': 'бута',
    'кюфте': 'кюфтета',
    'кебапче': 'кебапчета',
    'филе': 'филета',
    'риба': 'риби',
    'консерва': 'консерви',
    'хляб': 'хляба',
    'филия': 'филии',
    'буркан': 'буркана',
    'бутилка': 'бутилки',
    'лъжица': 'лъжици',
  }

  return pluralMap[name] || name
}
