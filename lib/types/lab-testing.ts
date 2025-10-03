/**
 * Lab Testing Types
 */

export interface LabResult {
  id?: string
  test_date: string // YYYY-MM-DD
  total_t: number // ng/dL
  free_t?: number // pg/mL
  shbg?: number // nmol/L
  estradiol?: number // pg/mL
  lh?: number // mIU/mL
  notes?: string
}

export interface InterpretationInput {
  age: number
  total_t: number
  free_t?: number
  shbg?: number
  estradiol?: number
}

export interface InterpretationResult {
  status: 'optimal' | 'suboptimal' | 'low'
  statusLabel: string
  totalTStatus: string
  freeTStatus?: string
  shbgStatus?: string
  estradiolStatus?: string
  ageRange: string
  optimalRange: [number, number]
  recommendations: string[]
}

export type AgeRange = '20-30' | '30-40' | '40-50' | '50+'
