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
  'starter-bundle': {
    price: 97,
    apps: ['meal-planner'],
    nameBg: 'Starter Bundle',
  },
  'complete-bundle': {
    price: 197,
    apps: ['meal-planner', 'sleep-protocol', 'supplement-timing'],
    nameBg: 'Complete Bundle',
  },
  'maximum-bundle': {
    price: 267,
    apps: [
      'meal-planner',
      'sleep-protocol',
      'supplement-timing',
      'exercise-guide',
      'lab-testing',
    ],
    nameBg: 'Maximum Bundle',
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
