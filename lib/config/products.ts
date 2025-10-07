/**
 * Product mappings for Shopify webhook
 * Maps product identifiers to their included apps
 */

export interface ProductMapping {
  price: number
  apps: string[]
  nameBg: string
}

export const PRODUCT_MAPPINGS: Record<string, ProductMapping> = {
  // Individual Products
  'testograph-pro': {
    price: 97,
    apps: ['testograph-pro'],
    nameBg: 'Testograph PRO',
  },
  'testograph_pro': {
    price: 97,
    apps: ['testograph-pro'],
    nameBg: 'Testograph PRO',
  },
  'meal-planner': {
    price: 67,
    apps: ['meal-planner'],
    nameBg: 'Meal Planner',
  },
  'sleep-protocol': {
    price: 67,
    apps: ['sleep-protocol'],
    nameBg: 'Sleep Protocol',
  },
  'supplement-timing': {
    price: 67,
    apps: ['supplement-timing'],
    nameBg: 'Supplement Timing',
  },
  'exercise-guide': {
    price: 67,
    apps: ['exercise-guide'],
    nameBg: 'Exercise Guide',
  },
  'lab-testing': {
    price: 67,
    apps: ['lab-testing'],
    nameBg: 'Lab Testing',
  },

  // Bundles
  'maximum-bundle': {
    price: 297,
    apps: [
      'meal-planner',
      'sleep-protocol',
      'supplement-timing',
      'exercise-guide',
      'lab-testing',
      'testograph-pro',
    ],
    nameBg: 'Maximum Bundle',
  },
  'testograph-pro-bundle': {
    price: 267,
    apps: [
      'testograph-pro',
      'meal-planner',
      'sleep-protocol',
      'lab-testing',
      'exercise-guide',
      'supplement-timing',
    ],
    nameBg: 'Testograph PRO Bundle',
  },
  'bundle': {
    price: 97,
    apps: ['testograph-pro'],
    nameBg: 'Bundle',
  },
}

/**
 * Get product mapping by product name or variant
 * Supports flexible matching for Shopify product names
 */
export function getProductMapping(productName: string): ProductMapping | null {
  const normalized = productName.toLowerCase().trim()

  // Direct match
  if (PRODUCT_MAPPINGS[normalized]) {
    return PRODUCT_MAPPINGS[normalized]
  }

  // Fuzzy match - check if any key is contained in the product name
  for (const [key, mapping] of Object.entries(PRODUCT_MAPPINGS)) {
    if (normalized.includes(key) || normalized.includes(key.replace('-', ' '))) {
      return mapping
    }
  }

  return null
}
